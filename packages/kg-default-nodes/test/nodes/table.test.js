require('../test-utils');
const {createHeadlessEditor} = require('@lexical/headless');
const {TableCellNode, TableNode, TableRowNode} = require('@lexical/table');
const {$getRoot} = require('lexical');
const {DEFAULT_CONFIG, DEFAULT_NODES} = require('../../');

describe('table nodes in DEFAULT_NODES', function () {
    let editor;

    beforeEach(function () {
        editor = createHeadlessEditor({nodes: DEFAULT_NODES, html: DEFAULT_CONFIG.html});
    });

    it('registers the table classes in the default node list', function () {
        DEFAULT_NODES.should.containEql(TableNode);
        DEFAULT_NODES.should.containEql(TableRowNode);
        DEFAULT_NODES.should.containEql(TableCellNode);
    });

    it('parses lexical state containing a table without dropping surrounding content', function (done) {
        const serializedState = JSON.stringify({
            root: {
                children: [
                    {
                        children: [
                            {
                                detail: 0,
                                format: 0,
                                mode: 'normal',
                                style: '',
                                text: 'Before table',
                                type: 'text',
                                version: 1
                            }
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'paragraph',
                        version: 1
                    },
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
                                                text: 'Cell 1',
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
                                                text: 'Cell 2',
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
            try {
                const root = $getRoot();
                root.getChildrenSize().should.equal(3);
                root.getFirstChild().getTextContent().should.equal('Before table');
                root.getLastChild().getTextContent().should.equal('After table');
                done();
            } catch (e) {
                done(e);
            }
        });
    });
});
