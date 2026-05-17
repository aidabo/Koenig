import React from 'react';
import {$createMultiColumnNode, INSERT_MULTI_COLUMN_COMMAND, MultiColumnNode} from '../nodes/MultiColumnNode';
import {COMMAND_PRIORITY_LOW} from 'lexical';
import {INSERT_CARD_COMMAND} from './KoenigBehaviourPlugin';
import {mergeRegister} from '@lexical/utils';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

export const MultiColumnPlugin = () => {
    const [editor] = useLexicalComposerContext();

    React.useEffect(() => {
        if (!editor.hasNodes([MultiColumnNode])) {
            console.error('MultiColumnPlugin: MultiColumnNode not registered'); // eslint-disable-line no-console
            return;
        }

        return mergeRegister(
            editor.registerCommand(
                INSERT_MULTI_COLUMN_COMMAND,
                async (dataset) => {
                    const cardNode = $createMultiColumnNode(dataset);
                    editor.dispatchCommand(INSERT_CARD_COMMAND, {cardNode, openInEditMode: true});

                    return true;
                },
                COMMAND_PRIORITY_LOW
            )
        );
    }, [editor]);

    return null;
};

export default MultiColumnPlugin;
