const {createDocument, dom, html} = require('../test-utils');
const {$getRoot} = require('lexical');
const {createHeadlessEditor} = require('@lexical/headless');
const {$generateNodesFromDOM} = require('@lexical/html');
const {SliderNode, $createSliderNode, $isSliderNode} = require('../../');

const editorNodes = [SliderNode];

describe('SliderNode', function () {
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
            slides: [
                {
                    id: 'slide-1',
                    kind: 'image',
                    src: '/content/images/2024/01/slider-image.jpg',
                    fileName: 'slider-image.jpg',
                    mimeType: '',
                    width: 1600,
                    height: 900,
                    duration: 0,
                    thumbnailSrc: '',
                    alt: 'Slider image',
                    caption: 'Image caption'
                },
                {
                    id: 'slide-2',
                    kind: 'video',
                    src: '/content/videos/slider-video.mp4',
                    fileName: 'slider-video.mp4',
                    mimeType: 'video/mp4',
                    width: 1280,
                    height: 720,
                    duration: 42,
                    thumbnailSrc: '/content/videos/slider-video.jpg',
                    alt: '',
                    caption: 'Video caption'
                },
                {
                    id: 'slide-3',
                    kind: 'audio',
                    src: '/content/audio/slider-audio.mp3',
                    fileName: 'slider-audio.mp3',
                    mimeType: 'audio/mpeg',
                    width: null,
                    height: null,
                    duration: 132,
                    thumbnailSrc: '',
                    alt: '',
                    caption: 'Audio caption'
                }
            ]
        };

        exportOptions = {
            dom
        };
    });

    it('matches node with $isSliderNode', editorTest(function () {
        const sliderNode = $createSliderNode(dataset);
        $isSliderNode(sliderNode).should.be.true();
    }));

    describe('data access', function () {
        it('has getters for all properties', editorTest(function () {
            const sliderNode = $createSliderNode(dataset);

            sliderNode.slides.should.deepEqual(dataset.slides);
        }));

        it('has setters for all properties', editorTest(function () {
            const sliderNode = $createSliderNode();

            sliderNode.slides.should.deepEqual([]);
            sliderNode.slides = dataset.slides;
            sliderNode.slides.should.deepEqual(dataset.slides);
        }));

        it('has getDataset() convenience method', editorTest(function () {
            const sliderNode = $createSliderNode(dataset);

            sliderNode.getDataset().should.deepEqual(dataset);
        }));
    });

    describe('getType', function () {
        it('returns the correct node type', editorTest(function () {
            SliderNode.getType().should.equal('slider');
        }));
    });

    describe('clone', function () {
        it('returns a copy of the current node', editorTest(function () {
            const sliderNode = $createSliderNode(dataset);
            const sliderNodeDataset = sliderNode.getDataset();
            const clone = SliderNode.clone(sliderNode);
            const cloneDataset = clone.getDataset();

            cloneDataset.should.deepEqual({...sliderNodeDataset});
        }));
    });

    describe('exportJSON', function () {
        it('contains all data', editorTest(function () {
            const sliderNode = $createSliderNode(dataset);
            const json = sliderNode.exportJSON();

            json.should.deepEqual({
                type: 'slider',
                version: 1,
                slides: dataset.slides
            });
        }));
    });

    describe('importJSON', function () {
        it('imports all data', function (done) {
            const serializedState = JSON.stringify({
                root: {
                    children: [{
                        type: 'slider',
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
                    const [sliderNode] = $getRoot().getChildren();

                    sliderNode.slides.should.deepEqual(dataset.slides);

                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
    });

    describe('importDOM', function () {
        it('imports slider HTML', editorTest(function () {
            const sliderHtml = html`
                <figure class="kg-card kg-slider-card kg-width-wide">
                    <div class="kg-slider-track">
                        <figure class="kg-slider-slide" data-id="slide-1" data-kind="image">
                            <img src="/content/images/2024/01/slider-image.jpg" width="1600" height="900" alt="Slider image">
                            <figcaption>Image caption</figcaption>
                        </figure>
                        <figure class="kg-slider-slide" data-id="slide-2" data-kind="video" data-file-name="slider-video.mp4" data-duration="42" data-mime-type="video/mp4" data-thumbnail-src="/content/videos/slider-video.jpg">
                            <video src="/content/videos/slider-video.mp4" poster="/content/videos/slider-video.jpg" width="1280" height="720" controls></video>
                            <figcaption>Video caption</figcaption>
                        </figure>
                        <figure class="kg-slider-slide" data-id="slide-3" data-kind="audio" data-file-name="slider-audio.mp3" data-duration="132" data-mime-type="audio/mpeg">
                            <audio src="/content/audio/slider-audio.mp3" controls preload="metadata"></audio>
                            <figcaption>Audio caption</figcaption>
                        </figure>
                    </div>
                </figure>
            `;
            const document = createDocument(sliderHtml);
            const nodes = $generateNodesFromDOM(editor, document);

            nodes.length.should.equal(1);
            nodes[0].slides.should.deepEqual(dataset.slides.slice(0, 2));
        }));
    });

    describe('exportDOM', function () {
        it('contains all data', editorTest(function () {
            const sliderNode = $createSliderNode(dataset);
            const {element} = sliderNode.exportDOM(exportOptions);

            element.outerHTML.should.containEql('kg-slider-card');
            element.outerHTML.should.containEql('slider-image.jpg');
            element.outerHTML.should.containEql('slider-video.mp4');
            element.outerHTML.should.containEql('poster="/content/videos/slider-video.jpg"');
            element.outerHTML.should.containEql('slider-audio.mp3');
        }));
    });
});
