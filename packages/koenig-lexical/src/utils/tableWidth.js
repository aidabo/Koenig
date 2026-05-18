import {$findMatchingParent} from '@lexical/utils';
import {$getSelection, $isRangeSelection} from 'lexical';
import {
    $getTableColumnIndexFromTableCellNode,
    $getTableNodeFromLexicalNodeOrThrow,
    $isTableCellNode,
    $isTableRowNode,
    $isTableSelection
} from '@lexical/table';

export const TABLE_COLUMN_RESIZE_STEP_PX = 24;
export const TABLE_COLUMN_MIN_WIDTH_PX = 80;
export const TABLE_COLUMN_DEFAULT_WIDTH_PX = 160;

export function adjustSelectedTableColumnWidth(editor, direction) {
    editor.update(() => {
        const selection = $getSelection();
        const cellNode = getSelectedTableCellNode(selection);

        if (!cellNode) {
            return;
        }

        const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode);
        const columnIndex = $getTableColumnIndexFromTableCellNode(cellNode);
        const delta = direction === 'widen' ? TABLE_COLUMN_RESIZE_STEP_PX : -TABLE_COLUMN_RESIZE_STEP_PX;
        const nextWidth = getNextTableColumnWidth(tableNode, columnIndex, delta);

        setTableColumnWidth(tableNode, columnIndex, nextWidth);
    });
}

export function getNextTableColumnWidth(tableNode, columnIndex, delta) {
    const currentWidth = getTableColumnWidth(tableNode, columnIndex) ?? TABLE_COLUMN_DEFAULT_WIDTH_PX;
    return Math.max(TABLE_COLUMN_MIN_WIDTH_PX, currentWidth + delta);
}

export function getTableColumnWidth(tableNode, columnIndex) {
    for (const rowNode of tableNode.getChildren()) {
        if (!$isTableRowNode(rowNode)) {
            continue;
        }

        const cellNode = getTableCellNodeAtColumnIndex(rowNode, columnIndex);
        const width = cellNode?.getWidth?.();

        if (typeof width === 'number') {
            return width;
        }
    }

    return undefined;
}

export function setTableColumnWidth(tableNode, columnIndex, width) {
    for (const rowNode of tableNode.getChildren()) {
        if (!$isTableRowNode(rowNode)) {
            continue;
        }

        const cellNode = getTableCellNodeAtColumnIndex(rowNode, columnIndex);
        cellNode?.setWidth(width);
    }
}

function getTableCellNodeAtColumnIndex(rowNode, targetColumnIndex) {
    let currentColumnIndex = 0;

    for (const cellNode of rowNode.getChildren()) {
        if (!$isTableCellNode(cellNode)) {
            continue;
        }

        const colSpan = cellNode.getColSpan?.() ?? 1;
        const spanEndColumnIndex = currentColumnIndex + colSpan - 1;

        if (targetColumnIndex >= currentColumnIndex && targetColumnIndex <= spanEndColumnIndex) {
            return cellNode;
        }

        currentColumnIndex += colSpan;
    }

    return null;
}

function getSelectedTableCellNode(selection) {
    if ($isTableSelection(selection)) {
        const tableCells = selection.getNodes().filter($isTableCellNode);

        if (tableCells.length > 0) {
            return tableCells[0];
        }
    }

    if (!$isRangeSelection(selection)) {
        return null;
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
