import FloatingToolbar from '../../components/ui/FloatingToolbar';
import FormatToolbar from './FormatToolbar';
import KoenigComposerContext from '../../context/KoenigComposerContext.jsx';
import React from 'react';
import TableActionToolbar from './TableActionToolbar';
import debounce from 'lodash/debounce';
import {
    $deleteTableColumn,
    $getElementForTableNode,
    $getTableColumnIndexFromTableCellNode,
    $getTableNodeFromLexicalNodeOrThrow,
    $getTableRowIndexFromTableCellNode,
    $insertTableColumn,
    $insertTableRow,
    $isTableCellNode,
    $isTableSelection,
    $removeTableRowAtIndex
} from '@lexical/table';
import {$findMatchingParent, mergeRegister} from '@lexical/utils';
import {$getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, DELETE_CHARACTER_COMMAND} from 'lexical';
import {LinkActionToolbar} from './LinkActionToolbar.jsx';
import {LinkActionToolbarWithSearch} from './LinkActionToolbarWithSearch.jsx';
import {SnippetActionToolbar} from './SnippetActionToolbar';
import {adjustSelectedTableColumnWidth} from '../../utils/tableWidth';

// don't show the toolbar until the mouse has moved a certain distance,
// avoids accidental toolbar display when clicking buttons that select content
const MOUSE_MOVE_THRESHOLD = 5;

export const toolbarItemTypes = {
    snippet: 'snippet',
    link: 'link',
    text: 'text',
    table: 'table'
};

export function FloatingFormatToolbar({
    editor,
    anchorElem,
    href,
    isSnippetsEnabled,
    toolbarItemType,
    setToolbarItemType,
    hiddenFormats = [],
    targetElem = null
}) {
    const {cardConfig} = React.useContext(KoenigComposerContext);
    const isLinkSearchEnabled = typeof cardConfig?.searchLinks === 'function' || false;

    const toolbarRef = React.useRef(null);

    const isLinkSearchToolbarVisible = toolbarItemType === toolbarItemTypes.link && isLinkSearchEnabled;

    // toolbar opacity is 0 by default
    // shouldn't display until selection via mouse is complete to avoid toolbar re-positioning while dragging
    const showToolbarIfHidden = React.useCallback((e) => {
        if (toolbarItemType && toolbarRef.current?.style.opacity === '0') {
            toolbarRef.current.style.opacity = '1';
        }
    }, [toolbarItemType]);

    React.useEffect(() => {
        const toggle = (e) => {
            editor.getEditorState().read(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const selectedNodeMatchesTarget = selection.getNodes().find((node) => {
                        const element = editor.getElementByKey(node.getKey());
                        return element && (element.contains(e.target) || e.target.contains(element));
                    });

                    if (selectedNodeMatchesTarget) {
                        showToolbarIfHidden(e);
                    }
                }
            });
        };

        document.addEventListener('mouseup', toggle); // desktop
        document.addEventListener('touchend', toggle); // mobile

        return () => {
            document.removeEventListener('mouseup', toggle); // desktop
            document.removeEventListener('touchend', toggle); // mobile
        };
    }, [editor, showToolbarIfHidden]);

    // clear out toolbar when use removes selected content
    React.useEffect(() => {
        return mergeRegister(
            editor.registerCommand(
                DELETE_CHARACTER_COMMAND,
                () => {
                    setToolbarItemType(null);
                    return false;
                },
                COMMAND_PRIORITY_LOW
            )
        );
    }, [editor, setToolbarItemType]);

    React.useEffect(() => {
        let initialPosition = null;

        const onMouseMove = (e) => {
            // ignore drag events
            if (e?.buttons > 0) {
                return;
            }

            // avoid toggling toolbar until mouse has moved a certain distance
            if (!initialPosition) {
                initialPosition = {x: e.clientX, y: e.clientY};
            }

            const distanceMoved = Math.sqrt(
                Math.pow(e.clientX - initialPosition.x, 2) +
                Math.pow(e.clientY - initialPosition.y, 2)
            );

            if (distanceMoved < MOUSE_MOVE_THRESHOLD) {
                return;
            }

            // reset initial position after threshold is met
            initialPosition = null;

            // should not show floating toolbar when we don't have a text selection
            editor.getEditorState().read(() => {
                const selection = $getSelection();
                if (selection === null || !$isRangeSelection(selection)) {
                    return;
                }
                if (selection.getTextContent() !== null) {
                    showToolbarIfHidden();
                }
            });
        };
        const debouncedOnMouseMove = debounce(onMouseMove, 10);
        document.addEventListener('mousemove', debouncedOnMouseMove);
        return () => {
            document.removeEventListener('mousemove', debouncedOnMouseMove);
        };
    }, [editor, showToolbarIfHidden]);

    const handleActionToolbarClose = () => {
        setToolbarItemType(null);
    };

    const isSnippetToolbar = toolbarItemTypes.snippet === toolbarItemType;
    const isLinkToolbar = toolbarItemTypes.link === toolbarItemType;
    const isTextToolbar = toolbarItemTypes.text === toolbarItemType;
    const isTableToolbar = toolbarItemTypes.table === toolbarItemType;

    const showTextToolbar = isTextToolbar || (isLinkSearchEnabled && isLinkToolbar);

    // When link searching is enabled the link toolbar has alternative styling
    // where the search input and results are displayed below the format toolbar.
    //
    // When link searching is disabled the link input toolbar visually replaces
    // the format toolbar.

    return (
        <>
            <FloatingToolbar
                anchorElem={anchorElem}
                // toolbar opacity is 0 by default
                // shouldn't display until selection via mouse is complete to avoid toolbar re-positioning while dragging
                controlOpacity={!isTextToolbar && !isTableToolbar}
                editor={editor}
                isVisible={!!toolbarItemType}
                shouldReposition={toolbarItemType !== toolbarItemTypes.text && toolbarItemType !== toolbarItemTypes.table}
                targetElem={isTableToolbar ? targetElem : null}
                toolbarRef={toolbarRef}
            >
                {isTableToolbar && (
                    <TableActionToolbar
                        onDeleteColumn={() => executeTableAction(editor, 'deleteColumn', setToolbarItemType)}
                        onDeleteRow={() => executeTableAction(editor, 'deleteRow', setToolbarItemType)}
                        onInsertColumnLeft={() => executeTableAction(editor, 'insertColumnLeft', setToolbarItemType)}
                        onInsertColumnRight={() => executeTableAction(editor, 'insertColumnRight', setToolbarItemType)}
                        onInsertRowAbove={() => executeTableAction(editor, 'insertRowAbove', setToolbarItemType)}
                        onInsertRowBelow={() => executeTableAction(editor, 'insertRowBelow', setToolbarItemType)}
                        onNarrowColumn={() => {
                            adjustSelectedTableColumnWidth(editor, 'narrow');
                            setToolbarItemType(null);
                        }}
                        onWidenColumn={() => {
                            adjustSelectedTableColumnWidth(editor, 'widen');
                            setToolbarItemType(null);
                        }}
                    />
                )}

                {isSnippetToolbar && (
                    <SnippetActionToolbar
                        onClose={handleActionToolbarClose}
                    />
                )}

                {(isLinkToolbar && !isLinkSearchEnabled) && (
                    <LinkActionToolbar
                        href={href}
                        onClose={handleActionToolbarClose}
                    />
                )}

                {showTextToolbar && (
                    <FormatToolbar
                        editor={editor}
                        hiddenFormats={hiddenFormats}
                        isLinkSelected={!!href || (isLinkSearchEnabled && isLinkToolbar)}
                        isSnippetsEnabled={isSnippetsEnabled}
                        onLinkClick={() => setToolbarItemType(toolbarItemTypes.link)}
                        onSnippetClick={() => setToolbarItemType(toolbarItemTypes.snippet)}
                    />
                )}

            </FloatingToolbar>

            {isLinkSearchToolbarVisible && (
                <LinkActionToolbarWithSearch
                    anchorElem={anchorElem}
                    href={href}
                    onClose={handleActionToolbarClose}
                />
            )}
        </>
    );
}

function executeTableAction(editor, action, setToolbarItemType) {
    editor.update(() => {
        const selection = $getSelection();
        const cellNode = getSelectedTableCellNode(selection);
        if (!cellNode) {
            return;
        }

        const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode);
        const tableElement = $getElementForTableNode(editor, tableNode);
        const rowIndex = $getTableRowIndexFromTableCellNode(cellNode);
        const columnIndex = $getTableColumnIndexFromTableCellNode(cellNode);

        switch (action) {
        case 'insertRowAbove':
            if (tableElement) {
                $insertTableRow(tableNode, rowIndex, false, 1, tableElement);
            }
            break;
        case 'insertRowBelow':
            if (tableElement) {
                $insertTableRow(tableNode, rowIndex, true, 1, tableElement);
            }
            break;
        case 'insertColumnLeft':
            if (tableElement) {
                $insertTableColumn(tableNode, columnIndex, false, 1, tableElement);
            }
            break;
        case 'insertColumnRight':
            if (tableElement) {
                $insertTableColumn(tableNode, columnIndex, true, 1, tableElement);
            }
            break;
        case 'deleteRow':
            $removeTableRowAtIndex(tableNode, rowIndex);
            break;
        case 'deleteColumn':
            $deleteTableColumn(tableNode, columnIndex);
            break;
        default:
            break;
        }
    });
    setToolbarItemType(null);
}

function getSelectedTableCellNode(selection) {
    if (!$isRangeSelection(selection)) {
        return null;
    }

    if ($isTableSelection(selection)) {
        const tableCells = selection.getNodes().filter($isTableCellNode);
        if (tableCells.length > 0) {
            return tableCells[0];
        }
    }

    const anchorCell = $findMatchingParent(selection.anchor.getNode(), $isTableCellNode);
    if ($isTableCellNode(anchorCell)) {
        return anchorCell;
    }

    const focusCell = $findMatchingParent(selection.focus.getNode(), $isTableCellNode);
    if ($isTableCellNode(focusCell)) {
        return focusCell;
    }

    return null;
}
