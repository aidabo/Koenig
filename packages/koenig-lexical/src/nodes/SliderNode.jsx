import React from 'react';
import SliderCardIcon from '../assets/icons/kg-layout-split.svg?react';
import {SliderNode as BaseSliderNode} from '@tryghost/kg-default-nodes';
import {KoenigCardWrapper} from '../index.js';
import {SliderNodeComponent} from './SliderNodeComponent';
import {createCommand} from 'lexical';

export const INSERT_SLIDER_COMMAND = createCommand();

export class SliderNode extends BaseSliderNode {
    __triggerFileDialog = false;

    static kgMenu = [{
        label: 'Slider',
        desc: 'Create a responsive media slider',
        Icon: SliderCardIcon,
        insertCommand: INSERT_SLIDER_COMMAND,
        insertParams: {
            triggerFileDialog: true
        },
        matches: ['slider', 'carousel'],
        priority: 4.2,
        shortcut: '/slider'
    }];

    getIcon() {
        return SliderCardIcon;
    }

    constructor(dataset = {}, key) {
        super(dataset, key);
        this.__triggerFileDialog = !!dataset.triggerFileDialog;
    }

    set triggerFileDialog(shouldTrigger) {
        const writable = this.getWritable();
        writable.__triggerFileDialog = shouldTrigger;
    }

    decorate() {
        return (
            <KoenigCardWrapper nodeKey={this.getKey()} width="wide">
                <SliderNodeComponent
                    nodeKey={this.getKey()}
                    triggerFileDialog={this.__triggerFileDialog}
                />
            </KoenigCardWrapper>
        );
    }
}

export const $createSliderNode = (dataset) => {
    return new SliderNode(dataset);
};

export function $isSliderNode(node) {
    return node instanceof SliderNode;
}
