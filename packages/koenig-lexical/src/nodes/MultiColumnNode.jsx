import BASIC_NODES from './BasicNodes';
import GridLayoutIcon from '../assets/icons/kg-layout-grid.svg?react';
import React from 'react';
import {$generateHtmlFromNodes} from '@lexical/html';
import {ExtendedTextNode, extendedTextNodeReplacement, utils as kgDefaultNodeUtils} from '@tryghost/kg-default-nodes';
import {ImageNode} from './ImageNode';
import {KoenigCardWrapper} from '../index.js';
import {MultiColumnNodeComponent} from './MultiColumnNodeComponent';
import {createCommand} from 'lexical';
import {populateNestedEditor, setupNestedEditor} from '../utils/nested-editors';

export const INSERT_MULTI_COLUMN_COMMAND = createCommand();

const COLUMN_NODES = [...BASIC_NODES, ExtendedTextNode, extendedTextNodeReplacement, ImageNode];
const BaseMultiColumnNode = kgDefaultNodeUtils.generateDecoratorNode({
    nodeType: 'multi-column',
    properties: [
        {name: 'columns', default: 2},
        {name: 'gap', default: 1.5},
        {name: 'column1', default: ''},
        {name: 'column2', default: ''},
        {name: 'column3', default: ''},
        {name: 'column4', default: ''}
    ]
});

export class MultiColumnNode extends BaseMultiColumnNode {
    __column1Editor;
    __column1EditorInitialState;
    __column2Editor;
    __column2EditorInitialState;
    __column3Editor;
    __column3EditorInitialState;
    __column4Editor;
    __column4EditorInitialState;

    static kgMenu = [{
        label: 'Columns',
        desc: 'Lay out text and images in 2 or 3 columns',
        Icon: GridLayoutIcon,
        insertCommand: INSERT_MULTI_COLUMN_COMMAND,
        matches: ['column', 'columns', 'layout'],
        priority: 12,
        shortcut: '/columns',
        insertParams: () => ({columns: 2}),
        isHidden: ({config}) => config?.feature?.multiColumnCard === false
    }];

    constructor(dataset = {}, key) {
        super(dataset, key);

        setupNestedEditor(this, '__column1Editor', {editor: dataset.column1Editor, initialEditorState: dataset.column1EditorInitialState, nodes: COLUMN_NODES});
        setupNestedEditor(this, '__column2Editor', {editor: dataset.column2Editor, initialEditorState: dataset.column2EditorInitialState, nodes: COLUMN_NODES});
        setupNestedEditor(this, '__column3Editor', {editor: dataset.column3Editor, initialEditorState: dataset.column3EditorInitialState, nodes: COLUMN_NODES});
        setupNestedEditor(this, '__column4Editor', {editor: dataset.column4Editor, initialEditorState: dataset.column4EditorInitialState, nodes: COLUMN_NODES});

        if (!dataset.column1Editor && dataset.column1) {
            populateNestedEditor(this, '__column1Editor', `${dataset.column1}`);
        }

        if (!dataset.column2Editor && dataset.column2) {
            populateNestedEditor(this, '__column2Editor', `${dataset.column2}`);
        }

        if (!dataset.column3Editor && dataset.column3) {
            populateNestedEditor(this, '__column3Editor', `${dataset.column3}`);
        }

        if (!dataset.column4Editor && dataset.column4) {
            populateNestedEditor(this, '__column4Editor', `${dataset.column4}`);
        }
    }

    getIcon() {
        return GridLayoutIcon;
    }

    getDataset() {
        const dataset = super.getDataset();
        const self = this.getLatest();

        dataset.column1Editor = self.__column1Editor;
        dataset.column1EditorInitialState = self.__column1EditorInitialState;
        dataset.column2Editor = self.__column2Editor;
        dataset.column2EditorInitialState = self.__column2EditorInitialState;
        dataset.column3Editor = self.__column3Editor;
        dataset.column3EditorInitialState = self.__column3EditorInitialState;
        dataset.column4Editor = self.__column4Editor;
        dataset.column4EditorInitialState = self.__column4EditorInitialState;

        return dataset;
    }

    exportJSON() {
        const json = super.exportJSON();

        if (this.__column1Editor) {
            this.__column1Editor.getEditorState().read(() => {
                json.column1 = $generateHtmlFromNodes(this.__column1Editor, null).trim();
            });
        }

        if (this.__column2Editor) {
            this.__column2Editor.getEditorState().read(() => {
                json.column2 = $generateHtmlFromNodes(this.__column2Editor, null).trim();
            });
        }

        if (this.__column3Editor) {
            this.__column3Editor.getEditorState().read(() => {
                json.column3 = $generateHtmlFromNodes(this.__column3Editor, null).trim();
            });
        }

        if (this.__column4Editor) {
            this.__column4Editor.getEditorState().read(() => {
                json.column4 = $generateHtmlFromNodes(this.__column4Editor, null).trim();
            });
        }

        return json;
    }

    decorate() {
        return (
            <KoenigCardWrapper
                nodeKey={this.getKey()}
                width={'wide'}
            >
                <MultiColumnNodeComponent
                    column1Editor={this.__column1Editor}
                    column1EditorInitialState={this.__column1EditorInitialState}
                    column2Editor={this.__column2Editor}
                    column2EditorInitialState={this.__column2EditorInitialState}
                    column3Editor={this.__column3Editor}
                    column3EditorInitialState={this.__column3EditorInitialState}
                    column4Editor={this.__column4Editor}
                    column4EditorInitialState={this.__column4EditorInitialState}
                    columns={this.columns}
                    gap={this.gap}
                    nodeKey={this.getKey()}
                />
            </KoenigCardWrapper>
        );
    }
}

export const $createMultiColumnNode = (dataset) => {
    return new MultiColumnNode(dataset);
};

export function $isMultiColumnNode(node) {
    return node instanceof MultiColumnNode;
}
