const {dom, html} = require('../test-utils');
const {$getRoot} = require('lexical');
const {createHeadlessEditor} = require('@lexical/headless');
const {MultiColumnNode, $createMultiColumnNode, $isMultiColumnNode} = require('../../');

const editorNodes = [MultiColumnNode];

describe('MultiColumnNode', function () {
    let editor;
    let dataset;
    let exportOptions;

    const editorTest = testFn => function (done) {
        editor.update(() => {
            try {
                testFn();
                done();
            } catch (e) {
                done(e);
            }
        });
    };

    beforeEach(function () {
        editor = createHeadlessEditor({nodes: editorNodes});

        dataset = {
            columns: 3,
            gap: 2,
            column1: '<p>Column 1</p>',
            column2: '<p>Column 2</p>',
            column3: '<p>Column 3</p>',
            column4: ''
        };

        exportOptions = {dom};
    });

    it('matches node with $isMultiColumnNode', editorTest(function () {
        const node = $createMultiColumnNode(dataset);
        $isMultiColumnNode(node).should.be.true();
    }));

    describe('data access', function () {
        it('has getters for all properties', editorTest(function () {
            const node = $createMultiColumnNode(dataset);
            node.columns.should.equal(dataset.columns);
            node.gap.should.equal(dataset.gap);
            node.column1.should.equal(dataset.column1);
            node.column2.should.equal(dataset.column2);
            node.column3.should.equal(dataset.column3);
            node.column4.should.equal(dataset.column4);
        }));

        it('has getDataset() convenience method', editorTest(function () {
            const node = $createMultiColumnNode(dataset);
            node.getDataset().should.deepEqual(dataset);
        }));
    });

    describe('exportJSON', function () {
        it('contains all data', editorTest(function () {
            const node = $createMultiColumnNode(dataset);
            node.exportJSON().should.deepEqual({
                type: 'multi-column',
                version: 1,
                columns: 3,
                gap: 2,
                column1: '<p>Column 1</p>',
                column2: '<p>Column 2</p>',
                column3: '<p>Column 3</p>',
                column4: ''
            });
        }));
    });

    describe('exportDOM', function () {
        it('renders a responsive multi-column card', editorTest(function () {
            const node = $createMultiColumnNode(dataset);
            const {element} = node.exportDOM(exportOptions);

            element.outerHTML.should.prettifyTo(html`
                <div
                    class="kg-card kg-multi-column-card kg-width-wide columns-3"
                    data-kg-multi-column-columns="3"
                    data-kg-multi-column-gap="2"
                    style="display: grid; --kg-multi-column-gap: 2rem;"
                >
                    <div class="kg-multi-column-card-column" data-kg-multi-column-column="1">
                        <p>Column 1</p>
                    </div>
                    <div class="kg-multi-column-card-column" data-kg-multi-column-column="2">
                        <p>Column 2</p>
                    </div>
                    <div class="kg-multi-column-card-column" data-kg-multi-column-column="3">
                        <p>Column 3</p>
                    </div>
                </div>
            `);
        }));
    });

    describe('importJSON', function () {
        it('imports all data', function (done) {
            const serializedState = JSON.stringify({
                root: {
                    children: [{
                        type: 'multi-column',
                        ...dataset
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
                try {
                    const [multiColumnNode] = $getRoot(editor).getChildren();
                    multiColumnNode.columns.should.equal(3);
                    multiColumnNode.gap.should.equal(2);
                    multiColumnNode.column1.should.equal('<p>Column 1</p>');
                    multiColumnNode.column2.should.equal('<p>Column 2</p>');
                    multiColumnNode.column3.should.equal('<p>Column 3</p>');
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
    });
});
