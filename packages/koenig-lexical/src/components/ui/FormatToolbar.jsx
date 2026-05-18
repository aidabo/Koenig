import KoenigComposerContext from '../../context/KoenigComposerContext.jsx';
import React from 'react';
import TextColorIcon from '../../assets/icons/kg-text-color.svg?react';
import {$createAsideNode} from '../../nodes/AsideNode';
import {
    $createHeadingNode,
    $createQuoteNode,
    $isHeadingNode
} from '@lexical/rich-text';
import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    $isTextNode,
    FORMAT_TEXT_COMMAND
} from 'lexical';
import {$getNearestNodeOfType} from '@lexical/utils';
import {$isListNode, ListNode} from '@lexical/list';
import {$setBlocksType} from '@lexical/selection';
import {ColorPickerSetting} from './SettingsPanel';
import {Dropdown} from './Dropdown';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {
    ToolbarMenu,
    ToolbarMenuItem,
    ToolbarMenuSeparator
} from './ToolbarMenu';
import {altOrOption, ctrlOrCmdSymbol, ctrlOrSymbol} from '../../utils/shortcutSymbols';
import {getAccentColor} from '../../utils/getAccentColor';
import {getColorPickerSwatches} from './colorSwatches';
import {getSelectedNode} from '../../utils/getSelectedNode';
import {getStyleProperty, normalizeColorValue, setStyleProperty} from '../../utils/textStyle';

const blockTypeToBlockName = {
    bullet: 'Bulleted List',
    check: 'Check List',
    code: 'Code Block',
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    h4: 'Heading 4',
    h5: 'Heading 5',
    h6: 'Heading 6',
    number: 'Numbered List',
    paragraph: 'Normal',
    quote: 'Quote',
    'extended-quote': 'Quote',
    aside: 'Aside'
};

const DEFAULT_FONT_FAMILIES = [
    {label: 'Default', name: 'default', value: ''},
    {label: 'Sans', name: 'sans', value: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, "Droid Sans", "Helvetica Neue", sans-serif'},
    {label: 'Serif', name: 'serif', value: 'Georgia, Times, serif'},
    {label: 'Mono', name: 'mono', value: 'Consolas, Liberation Mono, Menlo, Courier, monospace'}
];

function quoteIcon(blockType = '') {
    if (blockType.endsWith?.('quote')) {
        return 'quoteOne';
    } else if (blockType.endsWith?.('aside')) {
        return 'quoteTwo';
    } else {
        return 'quote';
    }
}

export default function FormatToolbar({
    editor,
    isSnippetsEnabled,
    isLinkSelected,
    isTextColorPanelOpen,
    onLinkClick,
    onSnippetClick,
    onTextColorClose,
    onTextColorToggle,
    hiddenFormats = []
}) {
    const {cardConfig} = React.useContext(KoenigComposerContext);
    const [isBold, setIsBold] = React.useState(false);
    const [isItalic, setIsItalic] = React.useState(false);
    const [isSuperscript, setIsSuperscript] = React.useState(false);
    const [isSubscript, setIsSubscript] = React.useState(false);
    const [textColor, setTextColor] = React.useState('');
    const [blockType, setBlockType] = React.useState('paragraph');
    const [fontFamily, setFontFamily] = React.useState('default');

    let hideHeading = false;
    if (!editor.hasNodes([HeadingNode])){
        hideHeading = true;
    }

    let hideQuotes = false;
    if (!editor.hasNodes([QuoteNode])){
        hideQuotes = true;
    }

    let hideSnippets = !isSnippetsEnabled;
    if (editor._parentEditor) {
        hideSnippets = true;
    }

    let hideBold = false;
    if (hiddenFormats.includes('bold')) {
        hideBold = true;
    }

    const fontFamilies = cardConfig?.fontFamilies?.length ? cardConfig.fontFamilies : DEFAULT_FONT_FAMILIES;

    const getFontFamilyValue = (styleString = '') => {
        return getStyleProperty(styleString, 'font-family');
    };

    const getTextColorValue = (styleString = '') => {
        const currentColor = getStyleProperty(styleString, 'color');
        if (!currentColor) {
            return '';
        }

        const accentColor = normalizeColorValue(getAccentColor());
        const currentHex = normalizeColorValue(currentColor);

        return currentHex === accentColor ? 'accent' : currentHex;
    };

    const normalizeFontFamilyValue = (value = '') => {
        return `${value}`.replace(/['"]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    };

    const resolveFontFamilyKey = React.useCallback((styleString = '') => {
        const currentValue = normalizeFontFamilyValue(getFontFamilyValue(styleString));
        if (!currentValue) {
            return 'default';
        }

        const matchedFamily = fontFamilies.find((family) => {
            return normalizeFontFamilyValue(family.value) === currentValue;
        });

        if (matchedFamily) {
            return matchedFamily.name;
        }

        return fontFamilies.find((family) => {
            const familyValue = normalizeFontFamilyValue(family.value);
            return familyValue && currentValue.includes(familyValue);
        })?.name || 'default';
    }, [fontFamilies]);

    const applyFontFamily = (familyName) => {
        const selectedFamily = fontFamilies.find(item => item.name === familyName)?.value || '';

        editor.update(() => {
            const selection = $getSelection();

            if (!$isRangeSelection(selection)) {
                return;
            }

            selection.getNodes().forEach((node) => {
                if ($isTextNode(node)) {
                    node.setStyle(setStyleProperty(node.getStyle(), 'font-family', selectedFamily));
                }
            });

            selection.style = setStyleProperty(selection.style || '', 'font-family', selectedFamily);
        });

        setFontFamily(familyName);
    };

    const applyTextColor = (color) => {
        const selectedColor = color === 'accent'
            ? getAccentColor()
            : color === 'transparent'
                ? ''
                : color;

        editor.update(() => {
            const selection = $getSelection();

            if (!$isRangeSelection(selection)) {
                return;
            }

            selection.getNodes().forEach((node) => {
                if ($isTextNode(node)) {
                    node.setStyle(setStyleProperty(node.getStyle(), 'color', selectedColor));
                }
            });

            selection.style = setStyleProperty(selection.style || '', 'color', selectedColor);
        });

        setTextColor(color === 'transparent' ? '' : color);
    };

    const updateState = React.useCallback(() => {
        editor.getEditorState().read(() => {
            // Should not to pop up the floating toolbar when using IME input
            if (editor.isComposing()) {
                return;
            }

            const selection = $getSelection();
            if (!$isRangeSelection(selection)) {
                return;
            }
            // update text format
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsSuperscript(selection.hasFormat('superscript'));
            setIsSubscript(selection.hasFormat('subscript'));
            setFontFamily(resolveFontFamilyKey(selection.style));
            setTextColor(getTextColorValue(selection.style));

            const anchorNode = getSelectedNode(selection);
            const element = anchorNode.getKey() === 'root'
                ? anchorNode
                : anchorNode.getTopLevelElementOrThrow();
            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);

            if (elementDOM !== null) {
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType(anchorNode, ListNode);
                    const type = parentList
                        ? parentList.getListType()
                        : element.getListType();
                    setBlockType(type);
                } else {
                    const type = $isHeadingNode(element)
                        ? element.getTag()
                        : element.getType();

                    if (type in blockTypeToBlockName) {
                        setBlockType(type);
                    }
                }
            }
        });
    }, [editor, resolveFontFamilyKey]);

    React.useEffect(() => {
        updateState();

        return editor.registerUpdateListener(() => {
            updateState();
        });
    }, [editor, updateState]);

    const formatParagraph = () => {
        if (blockType !== 'paragraph') {
            editor.update(() => {
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createParagraphNode());
                }
            });
        }
    };

    const formatHeading = (headingSize) => {
        if (blockType !== headingSize) {
            editor.update(() => {
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createHeadingNode(headingSize));
                }
            });
        }
    };

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
                if (blockType?.endsWith('quote')) {
                    $setBlocksType(selection, () => $createAsideNode());
                } else if (blockType?.endsWith?.('aside')) {
                    $setBlocksType(selection, () => $createParagraphNode());
                } else {
                    $setBlocksType(selection, () => $createQuoteNode());
                }
            }
        });
    };

    const toggleTextFormat = (format) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    return (
        <ToolbarMenu>
            <li className="m-0 flex p-0">
                <div className="my-1 w-40">
                    <Dropdown
                        dataTestId="font-family"
                        menu={fontFamilies}
                        placeholder="font"
                        value={fontFamily}
                        onChange={applyFontFamily}
                    />
                </div>
            </li>
            <li className="relative m-0 flex p-0">
                <button
                    aria-label="Text color"
                    className={`my-1 flex h-8 w-9 cursor-pointer items-center justify-center rounded-md transition hover:bg-grey-200/80 dark:bg-grey-950 dark:hover:bg-grey-900 ${textColor ? 'bg-grey-200/80' : 'bg-white'}`}
                    data-kg-active={!!textColor}
                    data-testid="text-color"
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                    onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onTextColorToggle?.();
                    }}
                >
                    <TextColorIcon className="size-4 overflow-visible stroke-[2.5] text-black dark:text-white" />
                </button>
                {isTextColorPanelOpen && (
                    <div
                        className="absolute left-0 top-full z-50 mt-2 w-[18rem] rounded-lg bg-white p-3 shadow-lg dark:bg-grey-950"
                        onClick={event => event.stopPropagation()}
                        onMouseDown={event => event.stopPropagation()}
                    >
                        <ColorPickerSetting
                            dataTestId="text-color"
                            eyedropper={true}
                            hasTransparentOption={true}
                            isExpanded={isTextColorPanelOpen}
                            label="Text color"
                            swatches={getColorPickerSwatches({includeAccent: false, includeTransparent: false})}
                            value={textColor}
                            onPickerChange={applyTextColor}
                            onSwatchChange={(color) => {
                                applyTextColor(color);
                                onTextColorClose?.();
                            }}
                            onTogglePicker={(isExpanded) => {
                                if (!isExpanded) {
                                    onTextColorClose?.();
                                }
                            }}
                        />
                    </div>
                )}
            </li>
            <ToolbarMenuItem
                data-kg-toolbar-button="bold"
                hide={hideBold}
                icon="bold"
                isActive={isBold}
                label="Bold"
                shortcutKeys={[ctrlOrCmdSymbol(), 'B']}
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
            />
            <ToolbarMenuItem
                data-kg-toolbar-button="italic"
                icon="italic"
                isActive={isItalic}
                label="Emphasize"
                shortcutKeys={[ctrlOrCmdSymbol(), 'I']}
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
            />
            <ToolbarMenuItem
                data-kg-toolbar-button="superscript"
                icon="superscript"
                isActive={isSuperscript}
                label="Superscript"
                onClick={() => toggleTextFormat('superscript')}
            />
            <ToolbarMenuItem
                data-kg-toolbar-button="subscript"
                icon="subscript"
                isActive={isSubscript}
                label="Subscript"
                onClick={() => toggleTextFormat('subscript')}
            />
            <ToolbarMenuItem
                data-kg-toolbar-button="h2"
                hide={hideHeading}
                icon="headingTwo"
                isActive={blockType === 'h2'}
                label="Heading 2"
                shortcutKeys={[ctrlOrSymbol(), altOrOption(), '2']}
                onClick={() => (blockType === 'h2' ? formatParagraph() : formatHeading('h2'))}
            />
            <ToolbarMenuItem
                data-kg-toolbar-button="h3"
                hide={hideHeading}
                icon="headingThree"
                isActive={blockType === 'h3'}
                label="Heading 3"
                shortcutKeys={[ctrlOrSymbol(), altOrOption(), '3']}
                onClick={() => (blockType === 'h3' ? formatParagraph() : formatHeading('h3'))}
            />
            <ToolbarMenuSeparator hide={hideQuotes} />
            <ToolbarMenuItem
                data-kg-toolbar-button="quote"
                hide={hideQuotes}
                icon={quoteIcon(blockType)}
                isActive={blockType.endsWith?.('quote') || blockType.endsWith?.('aside')}
                label="Quote"
                shortcutKeys={[ctrlOrSymbol(), 'Q']}
                onClick={formatQuote}
            />

            <ToolbarMenuItem
                data-kg-toolbar-button="link"
                icon="link"
                isActive={!!isLinkSelected}
                label="Link"
                shortcutKeys={[ctrlOrCmdSymbol(), 'K']}
                onClick={onLinkClick}
            />

            <ToolbarMenuSeparator hide={hideSnippets} />
            <ToolbarMenuItem
                data-kg-toolbar-button="snippet"
                hide={hideSnippets}
                icon="snippet"
                isActive={false}
                label="Save as snippet"
                onClick={onSnippetClick}
            />
        </ToolbarMenu>
    );
}
