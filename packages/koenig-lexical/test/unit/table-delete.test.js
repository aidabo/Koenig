import DEFAULT_NODES from '../../src/nodes/DefaultNodes';
import {$createTableSelection} from '@lexical/table';
import {$getRoot, $getSelection, $setSelection} from 'lexical';
import {createHeadlessEditor} from '@lexical/headless';
import {describe, expect, it} from 'vitest';
import {getWholeSelectedTableNode} from '../../src/plugins/KoenigBehaviourPlugin.jsx';

describe('table deletion', function () {
    it('detects when a whole table is selected', function () {
        const editor = createHeadlessEditor({nodes: DEFAULT_NODES});

        const serializedState = JSON.stringify({
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
                                    text: 'A',
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
                                    text: 'B',
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
        });

        editor.setEditorState(editor.parseEditorState(serializedState));

        editor.update(() => {
            const root = $getRoot();
            const tableNode = root.getFirstChild();
            const rowNode = tableNode.getFirstChild();
            const firstCell = rowNode.getFirstChild();
            const lastCell = rowNode.getLastChild();
            const selection = $createTableSelection();
            selection.set(tableNode.getKey(), firstCell.getKey(), lastCell.getKey());
            $setSelection(selection);

            expect(getWholeSelectedTableNode($getSelection())).toBe(tableNode);
        });
    });

    it('does not treat a single selected cell as the whole table', function () {
        const editor = createHeadlessEditor({nodes: DEFAULT_NODES});

        const serializedState = JSON.stringify({
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
                                    text: 'A',
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
                                    text: 'B',
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
        });

        editor.setEditorState(editor.parseEditorState(serializedState));

        editor.update(() => {
            const root = $getRoot();
            const tableNode = root.getFirstChild();
            const rowNode = tableNode.getFirstChild();
            const firstCell = rowNode.getFirstChild();
            const selection = $createTableSelection();
            selection.set(tableNode.getKey(), firstCell.getKey(), firstCell.getKey());
            $setSelection(selection);

            expect(getWholeSelectedTableNode($getSelection())).toBe(null);
        });
    });
});
