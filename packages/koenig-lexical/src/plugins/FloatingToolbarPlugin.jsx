import React from 'react';
import {$findMatchingParent} from '@lexical/utils';
import {$getSelection, $isParagraphNode, $isRangeSelection, $isTextNode, COMMAND_PRIORITY_LOW, KEY_MODIFIER_COMMAND} from 'lexical';
import {$isAtLinkSearchNode} from '@tryghost/kg-default-nodes';
import {$isLinkNode} from '@lexical/link';
import {$isTableCellNode, $isTableSelection, TableCellNode, TableNode, TableRowNode} from '@lexical/table';
import {FloatingFormatToolbar, toolbarItemTypes} from '../components/ui/FloatingFormatToolbar';
import {FloatingLinkToolbar} from '../components/ui/FloatingLinkToolbar';
import {getSelectedNode} from '../utils/getSelectedNode';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

export default function FloatingToolbarPlugin({anchorElem = document.body, isSnippetsEnabled, hiddenFormats = []}) {
    const [editor] = useLexicalComposerContext();
    return useFloatingFormatToolbar(editor, anchorElem, isSnippetsEnabled, hiddenFormats);
}

export function getToolbarItemTypeFromSelectionState({
    hasRangeSelection,
    isAtLinkSearchNode,
    isTableSelection,
    hasSelectedTableCell,
    isCollapsed,
    canShowTextToolbar
}) {
    if (!hasRangeSelection || isAtLinkSearchNode) {
        return null;
    }

    if (isTableSelection || (hasSelectedTableCell && isCollapsed)) {
        return toolbarItemTypes.table;
    }

    if (!isCollapsed && canShowTextToolbar) {
        return toolbarItemTypes.text;
    }

    return null;
}

function useFloatingFormatToolbar(editor, anchorElem, isSnippetsEnabled, hiddenFormats = []) {
    const [toolbarItemType, setToolbarItemType] = React.useState(null);
    const [href, setHref] = React.useState(null);
    const [tableTargetElem, setTableTargetElem] = React.useState(null);
    const [isTextColorPanelOpen, setIsTextColorPanelOpen] = React.useState(false);

    const setToolbarType = React.useCallback(() => {
        editor.getEditorState().read(() => {
            if (editor.isComposing()) {
                return;
            }

            const selection = $getSelection();
            const nativeSelection = window.getSelection();
            const rootElement = editor.getRootElement();

            const preserveTextToolbar = isTextColorPanelOpen && toolbarItemType === toolbarItemTypes.text;

            if (
                nativeSelection !== null &&
                (
                    !$isRangeSelection(selection) ||
                    rootElement === null ||
                    !rootElement.contains(nativeSelection.anchorNode)
                )
            ) {
                if (!preserveTextToolbar) {
                    setToolbarItemType(null);
                    setTableTargetElem(null);
                    setIsTextColorPanelOpen(false);
                }
                return;
            }

            if (editor.hasNodes([TableNode, TableRowNode, TableCellNode])) {
                const tableCellNode = getSelectedTableCellNode(selection);
                const isTableSelection = $isTableSelection(selection);
                const toolbarType = getToolbarItemTypeFromSelectionState({
                    hasRangeSelection: true,
                    isAtLinkSearchNode: false,
                    isTableSelection,
                    hasSelectedTableCell: !!tableCellNode,
                    isCollapsed: selection.isCollapsed(),
                    canShowTextToolbar: false
                });

                if (toolbarType === toolbarItemTypes.table) {
                    const tableNode = tableCellNode ? $getTableNodeFromSelectionNode(tableCellNode) : null;
                    const tableElement = tableNode ? editor.getElementByKey(tableNode.getKey()) : null;
                    setHref('');
                    setTableTargetElem(tableElement);
                    setToolbarItemType(toolbarItemTypes.table);
                    setIsTextColorPanelOpen(false);
                    return;
                }
            }

            if (!$isRangeSelection(selection) || $isAtLinkSearchNode(selection.anchor.getNode())) {
                if (!preserveTextToolbar) {
                    if (toolbarItemType) {
                        setToolbarItemType(null);
                    }
                    setTableTargetElem(null);
                    setIsTextColorPanelOpen(false);
                }
                return;
            }

            const anchorNode = getSelectedNode(selection);
            const parent = anchorNode.getParent();

            if ($isLinkNode(parent)) {
                setHref(parent.getURL());
            } else if ($isLinkNode(anchorNode)) {
                setHref(anchorNode.getURL());
            } else {
                setHref('');
            }

            const canShowTextToolbar = $isTextNode(anchorNode) || $isParagraphNode(anchorNode) || !!$findMatchingParent(anchorNode, $isTableCellNode);
            const toolbarType = getToolbarItemTypeFromSelectionState({
                hasRangeSelection: true,
                isAtLinkSearchNode: false,
                isTableSelection: false,
                hasSelectedTableCell: false,
                isCollapsed: selection.isCollapsed(),
                canShowTextToolbar
            });

            if (toolbarType === toolbarItemTypes.text) {
                setToolbarItemType(toolbarItemTypes.text);
                setTableTargetElem(null);
                return;
            }

            if (!preserveTextToolbar) {
                setToolbarItemType(null);
                setTableTargetElem(null);
                setIsTextColorPanelOpen(false);
            }
        });
    }, [editor, isTextColorPanelOpen, toolbarItemType]);

    React.useEffect(() => {
        document.addEventListener('selectionchange', setToolbarType);
        return () => {
            document.removeEventListener('selectionchange', setToolbarType);
        };
    }, [setToolbarType]);

    React.useEffect(() => {
        editor.registerCommand(
            KEY_MODIFIER_COMMAND,
            (event) => {
                const {keyCode, ctrlKey, metaKey, shiftKey} = event;
                if (!shiftKey && keyCode === 75 && (ctrlKey || metaKey)) {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
                        setToolbarItemType(toolbarItemTypes.link);
                        event.preventDefault();
                        return true;
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }, [editor]);

    React.useEffect(() => {
        const handleMousedown = (event) => {
            if (!anchorElem.contains(event.target)) {
                setToolbarItemType(null);
                setTableTargetElem(null);
                setIsTextColorPanelOpen(false);
            }
        };

        document.addEventListener('mousedown', handleMousedown);

        return () => {
            document.removeEventListener('mousedown', handleMousedown);
        };
    });

    const handleLinkEdit = (data) => {
        setToolbarItemType(toolbarItemTypes.link);
        setHref(data?.href);
    };

    return (
        <>
            <FloatingFormatToolbar
                anchorElem={anchorElem}
                editor={editor}
                hiddenFormats={hiddenFormats}
                href={href}
                isSnippetsEnabled={isSnippetsEnabled}
                isTextColorPanelOpen={isTextColorPanelOpen}
                setIsTextColorPanelOpen={setIsTextColorPanelOpen}
                setToolbarItemType={setToolbarItemType}
                targetElem={tableTargetElem}
                toolbarItemType={toolbarItemType}
            />

            <FloatingLinkToolbar
                anchorElem={anchorElem}
                disabled={!!toolbarItemType}
                onEditLink={handleLinkEdit}
            />
        </>
    );
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

function $getTableNodeFromSelectionNode(node) {
    if (!node) {
        return null;
    }

    let parent = node;
    while (parent && parent.getType?.() !== 'table') {
        parent = parent.getParent?.();
    }

    return parent && parent.getType?.() === 'table' ? parent : null;
}
