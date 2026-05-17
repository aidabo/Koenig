require('../test-utils');
const {JSDOM} = require('jsdom');
const {createHeadlessEditor} = require('@lexical/headless');
const {$getRoot, $insertNodes} = require('lexical');
const {$generateNodesFromDOM} = require('@lexical/html');
const {
    ExtendedTextNode,
    extendedTextNodeReplacement
} = require('../../');
const {createDocument} = require('../test-utils');

const editorNodes = [ExtendedTextNode, extendedTextNodeReplacement];

describe('ExtendedTextNode', function () {
    let editor;

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
        editor = createHeadlessEditor({
            nodes: editorNodes,
            onError: (error) => {
                throw error;
            }
        });

        const {window} = new JSDOM('<!doctype html><html><body></body></html>');
        global.document = window.document;
        global.window = window;
        global.DOMParser = window.DOMParser;
    });

    afterEach(function () {
        delete global.document;
        delete global.window;
        delete global.DOMParser;
    });

    it('imports font family style from span', editorTest(function () {
        const doc = createDocument('<p><span style="font-family: Georgia;">Styled</span></p>');
        const nodes = $generateNodesFromDOM(editor, doc);

        const root = $getRoot();
        root.clear();
        root.select();
        $insertNodes(nodes);

        const paragraph = root.getFirstChild();
        const textNode = paragraph.getFirstChild();

        textNode.getStyle().should.equal('font-family: Georgia;');
    }));
});
