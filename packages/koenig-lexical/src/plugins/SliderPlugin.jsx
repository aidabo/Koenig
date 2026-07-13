import React from 'react';
import {$createSliderNode, INSERT_SLIDER_COMMAND, SliderNode} from '../nodes/SliderNode';
import {COMMAND_PRIORITY_LOW} from 'lexical';
import {INSERT_CARD_COMMAND} from './KoenigBehaviourPlugin';
import {mergeRegister} from '@lexical/utils';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

export const SliderPlugin = () => {
    const [editor] = useLexicalComposerContext();

    React.useEffect(() => {
        if (!editor.hasNodes([SliderNode])) {
            console.error('SliderPlugin: SliderNode not registered'); // eslint-disable-line no-console
            return;
        }

        return mergeRegister(
            editor.registerCommand(
                INSERT_SLIDER_COMMAND,
                async (dataset) => {
                    const cardNode = $createSliderNode(dataset);
                    editor.dispatchCommand(INSERT_CARD_COMMAND, {cardNode});
                    return true;
                },
                COMMAND_PRIORITY_LOW
            )
        );
    }, [editor]);

    return null;
};

export default SliderPlugin;
