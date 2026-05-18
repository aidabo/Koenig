import {TableCellNode, TableNode, TableRowNode} from '@lexical/table';
import {$isParagraphNode, type ElementNode} from 'lexical';
import type {ExportChildren} from '..';
import type {RendererOptions} from '@tryghost/kg-default-nodes';

function renderTableCell(node: TableCellNode, options: RendererOptions, exportChildren: ExportChildren): string {
    const tag = node.getTag();
    const attributes: string[] = [];

    if (node.getColSpan() > 1) {
        attributes.push(`colspan="${node.getColSpan()}"`);
    }

    if (node.getRowSpan() > 1) {
        attributes.push(`rowspan="${node.getRowSpan()}"`);
    }

    const width = node.getWidth();
    if (width) {
        attributes.push(`style="width:${width}px"`);
    }

    const attributeString = attributes.length > 0 ? ` ${attributes.join(' ')}` : '';

    const innerHtml = node.getChildren().map((child) => {
        if ($isParagraphNode(child)) {
            return `<p>${exportChildren(child, options)}</p>`;
        }

        return exportChildren(child as ElementNode, options);
    }).join('');

    return `<${tag}${attributeString}>${innerHtml}</${tag}>`;
}

function renderTableRow(node: TableRowNode, options: RendererOptions, exportChildren: ExportChildren): string | null {
    if (!(node instanceof TableRowNode)) {
        return null;
    }

    const cells = node.getChildren().map((child) => {
        if (!(child instanceof TableCellNode)) {
            return '';
        }

        return renderTableCell(child, options, exportChildren);
    }).join('');

    return `<tr>${cells}</tr>`;
}

function renderTable(node: TableNode, options: RendererOptions, exportChildren: ExportChildren): string | null {
    if (!(node instanceof TableNode)) {
        return null;
    }

    const rows = node.getChildren().map((child) => {
        if (!(child instanceof TableRowNode)) {
            return '';
        }

        return renderTableRow(child, options, exportChildren) || '';
    }).join('');

    return `<table><tbody>${rows}</tbody></table>`;
}

module.exports = {
    export(node: ElementNode, options: RendererOptions, exportChildren: ExportChildren) {
        return renderTable(node as TableNode, options, exportChildren);
    }
};
