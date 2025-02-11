import GIFIcon from '../assets/icons/kg-card-type-gif.svg?react';
import ImageCardIcon from '../assets/icons/kg-card-type-image.svg?react';
import React from 'react';
import UnsplashIcon from '../assets/icons/kg-card-type-unsplash.svg?react';
import cleanBasicHtml from '@tryghost/kg-clean-basic-html';
import {$generateHtmlFromNodes} from '@lexical/html';
import {ImageNode as BaseImageNode} from '@tryghost/kg-default-nodes';
import {ImageNodeComponent} from './ImageNodeComponent';
import {KoenigCardWrapper, MINIMAL_NODES} from '../index.js';
import {OPEN_TENOR_SELECTOR_COMMAND, OPEN_UNSPLASH_SELECTOR_COMMAND} from '../plugins/KoenigSelectorPlugin.jsx';
import {createCommand} from 'lexical';
import {populateNestedEditor, setupNestedEditor} from '../utils/nested-editors';

export const INSERT_FLOAT_IMAGE_COMMAND = createCommand();

export class FloatImageNode extends BaseImageNode {
    // transient properties used to control node behaviour
    __triggerFileDialog = false;
    __previewSrc = null;
    __captionEditor;
    __captionEditorInitialState;
    __floatDirection = 'none';

    static kgMenu = [{
        label: 'Float Image',
        desc: 'Upload, or embed with /floatimage [url]',
        Icon: ImageCardIcon,
        insertCommand: INSERT_FLOAT_IMAGE_COMMAND,
        insertParams: {
            triggerFileDialog: true
        },
        matches: ['image', 'img'],
        queryParams: ['src', 'floatDirection'],
        priority: 1,
        shortcut: '/floatimage'
    },
    {
        section: 'Embeds',
        label: 'Unsplash',
        desc: '/unsplash [search term or url]',
        Icon: UnsplashIcon,
        insertCommand: OPEN_UNSPLASH_SELECTOR_COMMAND,
        insertParams: {
            triggerFileDialog: false
        },
        isHidden: ({config}) => !config?.unsplash,
        matches: ['unsplash', 'uns'],
        queryParams: ['src'],
        priority: 3,
        shortcut: '/unsplash'
    },
    {
        label: 'GIF',
        desc: 'Search and embed gifs',
        Icon: GIFIcon,
        insertCommand: OPEN_TENOR_SELECTOR_COMMAND,
        insertParams: {
            triggerFileDialog: false
        },
        matches: ['gif', 'giphy', 'tenor'],
        queryParams: ['src'],
        isHidden: ({config}) => !config?.tenor,
        shortcut: '/gif'
    }];

    static uploadType = 'image';

    static getType() {
        return 'float-image';
    }

    constructor(dataset = {}, key) {
        super(dataset, key);

        const {previewSrc, triggerFileDialog, initialFile, selector, isImageHidden, floatDirection} = dataset;

        //Floating layout
        this.__floatDirection = floatDirection || 'left';

        this.__previewSrc = previewSrc || '';
        // don't trigger the file dialog when rendering if we've already been given a url
        this.__triggerFileDialog = (!dataset.src && triggerFileDialog) || false;

        // passed via INSERT_MEDIA_COMMAND on drag+drop or paste
        this.__initialFile = initialFile || null;

        this.__selector = selector;
        this.__isImageHidden = isImageHidden;

        setupNestedEditor(this, '__captionEditor', {editor: dataset.captionEditor, nodes: MINIMAL_NODES});

        // populate nested editors on initial construction
        if (!dataset.captionEditor && dataset.caption) {
            populateNestedEditor(this, '__captionEditor', `${dataset.caption}`); // we serialize with no wrapper
        }
    }

    getIcon() {
        return ImageCardIcon;
    }

    getDataset() {
        const dataset = super.getDataset();

        //added custom style
        dataset.__floatDirection = this.__floatDirection;

        dataset.__previewSrc = this.__previewSrc;
        dataset.__triggerFileDialog = this.__triggerFileDialog;

        // client-side only data properties such as nested editors
        const self = this.getLatest();
        dataset.captionEditor = self.__captionEditor;
        dataset.captionEditorInitialState = self.__captionEditorInitialState;

        return dataset;
    }

    get previewSrc() {
        const self = this.getLatest();
        return self.__previewSrc;
    }

    set previewSrc(previewSrc) {
        const writable = this.getWritable();
        writable.__previewSrc = previewSrc;
    }

    set triggerFileDialog(shouldTrigger) {
        const writable = this.getWritable();
        writable.__triggerFileDialog = shouldTrigger;
    }

    get floatDirection() {
        const self = this.getLatest();
        return self.__floatDirection;
    }

    set floatDirection(float) {
        const writable = this.getWritable();
        writable.__floatDirection = float;
    }

    // static importJSON(serializedNode) {
    //   return new FloatImageNode(
    //     serializedNode.src,
    //     serializedNode.floatDirection
    //   );
    // }

    createDOM() {
        const div = document.createElement('div');
        //div.className = `kg-float-image kg-float-${this.__floatDirection}`;
        return div;
    }

    exportJSON() {
        const json = super.exportJSON();

        //added
        json.type = 'float-image';
        json.floatDirection = this.__floatDirection;

        // convert nested editor instances back into HTML because their content may not
        // be automatically updated when the nested editor changes
        if (this.__captionEditor) {
            this.__captionEditor.getEditorState().read(() => {
                const html = $generateHtmlFromNodes(this.__captionEditor, null);
                const cleanedHtml = cleanBasicHtml(html, {firstChildInnerContent: true});
                json.caption = cleanedHtml;
            });
        }

        return json;
    }

    updateDOM(prevNode) {
        if (prevNode.__floatDirection !== this.__floatDirection) {
            //const element = this.getDOM();
            //element.className = `kg-float-image kg-float-${this.__floatDirection}`;
            return true;
        }
        return false;
    }

    decorate() {
        const Selector = this.__selector;

        return (
            <div className={`kg-float-image kg-float-${this.__floatDirection}`}>

                <KoenigCardWrapper nodeKey={this.getKey()} width={this.__cardWidth}>
                    {this.__selector && <Selector nodeKey={this.getKey()} />}
                    {
                        !this.__isImageHidden && (
                            <ImageNodeComponent
                                altText={this.__alt}
                                captionEditor={this.__captionEditor}
                                captionEditorInitialState={this.__captionEditorInitialState}
                                href={this.href}
                                initialFile={this.__initialFile}
                                nodeKey={this.getKey()}
                                previewSrc={this.previewSrc}
                                src={this.src}
                                triggerFileDialog={this.__triggerFileDialog}
                            />
                        )
                    }
                </KoenigCardWrapper>
        
            </div>

        );
    }
}

export function $createFloatImageNode(src, floatDirection) {
    return new FloatImageNode(src, floatDirection);
}

export function $isFloatImageNode(node) {
    return node instanceof FloatImageNode;
}