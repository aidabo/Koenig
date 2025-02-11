import KoenigComposerContext from '../context/KoenigComposerContext';
import React from 'react';
import {$createFloatImageNode, FloatImageNode, INSERT_FLOAT_IMAGE_COMMAND} from '../nodes/FloatImageNode';
import {COMMAND_PRIORITY_HIGH, COMMAND_PRIORITY_LOW} from 'lexical';
import {INSERT_CARD_COMMAND} from './KoenigBehaviourPlugin';
import {INSERT_MEDIA_COMMAND} from './DragDropPastePlugin';
import {imageUploadHandler} from '../utils/imageUploadHandler';
import {mergeRegister} from '@lexical/utils';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

export const FloatImagePlugin = () => {
    const [editor] = useLexicalComposerContext();
    const {fileUploader} = React.useContext(KoenigComposerContext);

    const imageUploader = fileUploader.useFileUpload('image');

    const handleImageUpload = React.useCallback(async (files, imageNodeKey) => {
        if (files?.length > 0) {
            return await imageUploadHandler(files, imageNodeKey, editor, imageUploader.upload);
        }
    }, [imageUploader.upload, editor]);

    React.useEffect(() => {
        if (!editor.hasNodes([FloatImageNode])){
            console.error('FloatImagePlugin: FloatImageNode not registered'); // eslint-disable-line no-console
            return;
        }
        return mergeRegister(
            editor.registerCommand(
                INSERT_FLOAT_IMAGE_COMMAND,
                async (dataset) => {
                    const cardNode = $createFloatImageNode(dataset);
                    editor.dispatchCommand(INSERT_CARD_COMMAND, {cardNode});

                    return true;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                INSERT_MEDIA_COMMAND,
                async (dataset) => {
                    if (dataset.type === 'float-image') {
                        editor.dispatchCommand(INSERT_FLOAT_IMAGE_COMMAND, {initialFile: dataset.file});
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_HIGH
            )
        );
    }, [editor, fileUploader, handleImageUpload]);

    return null;
};

export default FloatImagePlugin;
