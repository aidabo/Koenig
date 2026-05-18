import TableGridIcon from '../assets/icons/kg-layout-grid.svg?react';
import {
    TableNode as BaseTableNode,
    INSERT_TABLE_COMMAND
} from '@lexical/table';

export class TableNode extends BaseTableNode {
    exportDOM(options = {}) {
        return {
            element: document.createElement('table')
        };
    }
}

TableNode.kgMenu = {
    label: 'Table',
    desc: 'Insert a table',
    Icon: TableGridIcon,
    insertCommand: INSERT_TABLE_COMMAND,
    insertParams: {
        rows: 2,
        columns: 2,
        includeHeaders: false
    },
    matches: ['table', 'grid', 'matrix'],
    priority: 4,
    shortcut: '/table'
};

export {INSERT_TABLE_COMMAND};

export function $createTableNode() {
    return new TableNode();
}

export function $isTableNode(node) {
    return node instanceof TableNode;
}
