import DEFAULT_NODES from '../../src/nodes/DefaultNodes';
import {$generateHtmlFromNodes} from '@lexical/html';
import {INSERT_TABLE_COMMAND, TableNode} from '../../src/nodes/TableNode';
import {JSDOM} from 'jsdom';
import {TableCellNode, TableRowNode} from '@lexical/table';
import {buildCardMenu} from '../../src/utils/buildCardMenu';
import {createHeadlessEditor} from '@lexical/headless';
import {describe, expect, it} from 'vitest';

describe('table support', function () {
    it('registers table node in the default registry', function () {
        expect(DEFAULT_NODES).to.include(TableNode);
        expect(DEFAULT_NODES).to.include(TableRowNode);
        expect(DEFAULT_NODES).to.include(TableCellNode);
    });

    it('exposes a table card-menu entry for insertion', function () {
        const cardMenu = buildCardMenu(new Map([
            ['table', TableNode]
        ]));

        expect(cardMenu.menu.get('Primary')).to.deep.equal([
            {
                label: 'Table',
                desc: 'Insert a table',
                Icon: TableNode.kgMenu.Icon,
                insertCommand: INSERT_TABLE_COMMAND,
                insertParams: {
                    rows: 2,
                    columns: 2,
                    includeHeaders: false
                },
                matches: ['table', 'grid', 'matrix'],
                nodeType: 'table',
                priority: 4,
                shortcut: '/table'
            }
        ]);
    });

    it('exports table content as a real table element in editor HTML', function () {
        const editor = createHeadlessEditor({nodes: DEFAULT_NODES});
        const {window} = new JSDOM('<!doctype html><html><body></body></html>');

        global.window = window;
        global.document = window.document;
        global.DOMParser = window.DOMParser;
        global.navigator = window.navigator;

        const serializedState = JSON.stringify({
            root: {
                children: [
                    {
                        children: [
                            {
                                children: [
                                    {
                                        children: [
                                            {
                                                children: [
                                                    {
                                                        detail: 0,
                                                        format: 0,
                                                        mode: 'normal',
                                                        style: '',
                                                        text: 'Cell A',
                                                        type: 'text',
                                                        version: 1
                                                    }
                                                ],
                                                direction: 'ltr',
                                                format: '',
                                                indent: 0,
                                                type: 'paragraph',
                                                version: 1
                                            }
                                        ],
                                        direction: null,
                                        format: '',
                                        indent: 0,
                                        type: 'tablecell',
                                        version: 1
                                    },
                                    {
                                        children: [
                                            {
                                                children: [
                                                    {
                                                        detail: 0,
                                                        format: 0,
                                                        mode: 'normal',
                                                        style: '',
                                                        text: 'Cell B',
                                                        type: 'text',
                                                        version: 1
                                                    }
                                                ],
                                                direction: 'ltr',
                                                format: '',
                                                indent: 0,
                                                type: 'paragraph',
                                                version: 1
                                            }
                                        ],
                                        direction: null,
                                        format: '',
                                        indent: 0,
                                        type: 'tablecell',
                                        version: 1
                                    }
                                ],
                                direction: null,
                                format: '',
                                indent: 0,
                                type: 'tablerow',
                                version: 1
                            }
                        ],
                        direction: null,
                        format: '',
                        indent: 0,
                        type: 'table',
                        version: 1
                    },
                    {
                        children: [
                            {
                                children: [
                                    {
                                        detail: 0,
                                        format: 0,
                                        mode: 'normal',
                                        style: '',
                                        text: 'After table',
                                        type: 'text',
                                        version: 1
                                    }
                                ],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                type: 'paragraph',
                                version: 1
                            }
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'paragraph',
                        version: 1
                    }
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'root',
                version: 1
            }
        });

        const editorState = editor.parseEditorState(serializedState);
        editor.setEditorState(editorState);

        editor.getEditorState().read(() => {
            const html = $generateHtmlFromNodes(editor, null);
            expect(html).toContain('<table');
            expect(html).toContain('Cell A');
        });
    });
});
