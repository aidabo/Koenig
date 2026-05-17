import {$getRoot} from 'lexical';
import {MultiColumnNode} from '../../src/nodes/MultiColumnNode.jsx';
import {createHeadlessEditor} from '@lexical/headless';
import {describe, expect, it} from 'vitest';

describe('MultiColumnNode font-family persistence', function () {
    it('preserves font-family style in nested column HTML', function () {
        const editor = createHeadlessEditor({
            nodes: [MultiColumnNode],
            onError: (error) => {
                throw error;
            }
        });

        const serializedState = JSON.stringify({
            root: {
                children: [{
                    type: 'multi-column',
                    columns: 2,
                    gap: 1.5,
                    column1: '<p><span style="font-family: Georgia;">Styled</span></p>',
                    column2: '<p>Column 2</p>',
                    column3: '',
                    column4: '',
                    version: 1
                }],
                direction: null,
                format: '',
                indent: 0,
                type: 'root',
                version: 1
            }
        });

        const editorState = editor.parseEditorState(serializedState);
        editor.setEditorState(editorState);

        editor.getEditorState().read(() => {
            const [multiColumnNode] = $getRoot().getChildren();
            const json = multiColumnNode.exportJSON();

            expect(json.column1).toContain('font-family: Georgia');
            expect(json.column2).toContain('Column 2');
        });
    });
});
