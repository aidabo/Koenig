import React from 'react';
import {
    ToolbarMenu,
    ToolbarMenuItem,
    ToolbarMenuSeparator
} from './ToolbarMenu';

export default function TableActionToolbar({
    onInsertRowAbove,
    onInsertRowBelow,
    onInsertColumnLeft,
    onInsertColumnRight,
    onWidenColumn,
    onNarrowColumn,
    onDeleteRow,
    onDeleteColumn
}) {
    return (
        <ToolbarMenu data-kg-table-toolbar="true">
            <ToolbarMenuItem
                dataTestId="table-insert-row-above"
                icon="arrowDown"
                iconClassName="rotate-180"
                label="Insert row above"
                onClick={onInsertRowAbove}
            />
            <ToolbarMenuItem
                dataTestId="table-insert-row-below"
                icon="arrowDown"
                label="Insert row below"
                onClick={onInsertRowBelow}
            />
            <ToolbarMenuSeparator />
            <ToolbarMenuItem
                dataTestId="table-insert-column-left"
                icon="arrowDown"
                iconClassName="rotate-90"
                label="Insert column left"
                onClick={onInsertColumnLeft}
            />
            <ToolbarMenuItem
                dataTestId="table-insert-column-right"
                icon="arrowDown"
                iconClassName="-rotate-90"
                label="Insert column right"
                onClick={onInsertColumnRight}
            />
            <ToolbarMenuSeparator />
            <ToolbarMenuItem
                dataTestId="table-widen-column"
                icon="tableWidenColumn"
                label="Widen column"
                onClick={onWidenColumn}
            />
            <ToolbarMenuItem
                dataTestId="table-narrow-column"
                icon="tableNarrowColumn"
                label="Narrow column"
                onClick={onNarrowColumn}
            />
            <ToolbarMenuSeparator />
            <ToolbarMenuItem
                dataTestId="table-delete-row"
                icon="tableDeleteRow"
                label="Delete row"
                onClick={onDeleteRow}
            />
            <ToolbarMenuItem
                dataTestId="table-delete-column"
                icon="tableDeleteColumn"
                label="Delete column"
                onClick={onDeleteColumn}
            />
        </ToolbarMenu>
    );
}
