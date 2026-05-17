import KoenigComposerContext from '../../context/KoenigComposerContext.jsx';
import React from 'react';
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
import {Dropdown} from './Dropdown';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {
    ToolbarMenu,
    ToolbarMenuItem,
    ToolbarMenuSeparator
} from './ToolbarMenu';
import {altOrOption, ctrlOrCmdSymbol, ctrlOrSymbol} from '../../utils/shortcutSymbols';
import {getSelectedNode} from '../../utils/getSelectedNode';

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
    onLinkClick,
    onSnippetClick,
    hiddenFormats = []
}) {
    const {cardConfig} = React.useContext(KoenigComposerContext);
    const [isBold, setIsBold] = React.useState(false);
    const [isItalic, setIsItalic] = React.useState(false);
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

    const setStyleProperty = (styleString, property, value) => {
        const element = document.createElement('span');
        element.style.cssText = styleString || '';

        if (value) {
            element.style.setProperty(property, value);
        } else {
            element.style.removeProperty(property);
        }

        return element.getAttribute('style') || '';
    };

    const getFontFamilyValue = (styleString = '') => {
        const element = document.createElement('span');
        element.style.cssText = styleString || '';
        return element.style.fontFamily || '';
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
            setFontFamily(resolveFontFamilyKey(selection.style));

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

    return (
        <ToolbarMenu>
            <li className="m-0 flex p-0">
                <div className="my-1 w-40">
                    <Dropdown
                        dataTestId="font-family"
                        menu={fontFamilies}
                        value={fontFamily}
                        onChange={applyFontFamily}
                    />
                </div>
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
