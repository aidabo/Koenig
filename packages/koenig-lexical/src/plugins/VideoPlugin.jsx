import React from 'react';
import {$createParagraphNode, $getRoot, $getSelection, $isDecoratorNode, $isNodeSelection, $isRangeSelection} from 'lexical';
import {$createVideoNode, INSERT_VIDEO_COMMAND, VideoNode} from '../nodes/VideoNode';
import {COMMAND_PRIORITY_HIGH, COMMAND_PRIORITY_LOW} from 'lexical';
import {INSERT_CARD_COMMAND} from './KoenigBehaviourPlugin';
import {INSERT_MEDIA_COMMAND} from './DragDropPastePlugin';
import {mergeRegister} from '@lexical/utils';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

export const VideoPlugin = () => {
    const [editor] = useLexicalComposerContext();

    React.useEffect(() => {
        if (!editor.hasNodes([VideoNode])){
            console.error('VideoPlugin: VideoNode not registered'); // eslint-disable-line no-console
            return;
        }
        return mergeRegister(
            editor.registerCommand(
                INSERT_VIDEO_COMMAND,
                async (dataset) => {
                    let inserted = false;

                    editor.update(() => {
                        let selection = $getSelection();

                        if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
                            const root = $getRoot();
                            let paragraphNode = root.getLastChild();

                            if (!paragraphNode || $isDecoratorNode(paragraphNode)) {
                                paragraphNode = $createParagraphNode();
                                root.append(paragraphNode);
                            }

                            paragraphNode.selectEnd();
                            selection = $getSelection();
                        }

                        if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
                            return;
                        }

                        const cardNode = $createVideoNode(dataset);
                        inserted = editor.dispatchCommand(INSERT_CARD_COMMAND, {cardNode});
                    });

                    return inserted;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                INSERT_MEDIA_COMMAND,
                async (dataset) => {
                    if (dataset.type === 'video') {
                        editor.dispatchCommand(INSERT_VIDEO_COMMAND, {initialFile: dataset.file});
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_HIGH
            )
        );
    }, [editor]);

    return null;
};

export default VideoPlugin;
