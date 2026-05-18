// @vitest-environment jsdom
import {$createTableSelection, TableCellNode, TableNode, TableRowNode} from '@lexical/table';
import {$getRoot, $setSelection, ParagraphNode, TextNode} from 'lexical';
import {adjustSelectedTableColumnWidth, getNextTableColumnWidth, getTableColumnWidth} from '../../src/utils/tableWidth';
import {createHeadlessEditor} from '@lexical/headless';
import {describe, expect, it} from 'vitest';

describe('table width controls', function () {
    it('widens and narrows the selected table column without affecting other columns', async function () {
        const editor = createHeadlessEditor({
            nodes: [ParagraphNode, TableNode, TableRowNode, TableCellNode, TextNode]
        });

        editor.setEditorState(editor.parseEditorState(JSON.stringify({
            root: {
                children: [{
                    children: [{
                        children: [{
                            children: [{
                                children: [{
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: 'A1',
                                    type: 'text',
                                    version: 1
                                }],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                type: 'paragraph',
                                version: 1
                            }],
                            direction: null,
                            format: '',
                            indent: 0,
                            type: 'tablecell',
                            version: 1
                        }, {
                            children: [{
                                children: [{
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: 'B1',
                                    type: 'text',
                                    version: 1
                                }],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                type: 'paragraph',
                                version: 1
                            }],
                            direction: null,
                            format: '',
                            indent: 0,
                            type: 'tablecell',
                            version: 1
                        }],
                        direction: null,
                        format: '',
                        indent: 0,
                        type: 'tablerow',
                        version: 1
                    }, {
                        children: [{
                            children: [{
                                children: [{
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: 'A2',
                                    type: 'text',
                                    version: 1
                                }],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                type: 'paragraph',
                                version: 1
                            }],
                            direction: null,
                            format: '',
                            indent: 0,
                            type: 'tablecell',
                            version: 1
                        }, {
                            children: [{
                                children: [{
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: 'B2',
                                    type: 'text',
                                    version: 1
                                }],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                type: 'paragraph',
                                version: 1
                            }],
                            direction: null,
                            format: '',
                            indent: 0,
                            type: 'tablecell',
                            version: 1
                        }],
                        direction: null,
                        format: '',
                        indent: 0,
                        type: 'tablerow',
                        version: 1
                    }],
                    direction: null,
                    format: '',
                    indent: 0,
                    type: 'table',
                    version: 1
                }],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'root',
                version: 1
            }
        })));

        editor.update(() => {
            const root = $getRoot();
            const tableNode = root.getFirstChild();
            const firstRow = tableNode.getFirstChild();
            const firstCell = firstRow.getFirstChild();
            const lastCell = firstRow.getLastChild();
            const selection = $createTableSelection();
            selection.set(tableNode.getKey(), firstCell.getKey(), lastCell.getKey());
            $setSelection(selection);

            expect(getTableColumnWidth(tableNode, 0)).toBe(undefined);
            expect(getNextTableColumnWidth(tableNode, 0, 24)).toBe(184);
        });

        adjustSelectedTableColumnWidth(editor, 'widen');
        await Promise.resolve();

        editor.getEditorState().read(() => {
            const root = $getRoot();
            const tableNode = root.getFirstChild();
            expect(getTableColumnWidth(tableNode, 0)).toBe(184);
            expect(getTableColumnWidth(tableNode, 1)).toBe(undefined);
        });

        adjustSelectedTableColumnWidth(editor, 'narrow');
        await Promise.resolve();

        editor.getEditorState().read(() => {
            const root = $getRoot();
            const tableNode = root.getFirstChild();
            expect(getTableColumnWidth(tableNode, 0)).toBe(160);
        });
    });
});
