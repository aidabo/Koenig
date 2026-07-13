import CardContext from '../context/CardContext';
import KoenigComposerContext from '../context/KoenigComposerContext';
import React from 'react';
import extractVideoMetadata from '../utils/extractVideoMetadata';
import useFileDragAndDrop from '../hooks/useFileDragAndDrop';
import {$getNodeByKey} from 'lexical';
import {ActionToolbar} from '../components/ui/ActionToolbar.jsx';
import {SliderCard} from '../components/ui/cards/SliderCard';
import {ToolbarMenu, ToolbarMenuItem} from '../components/ui/ToolbarMenu.jsx';
import {getAudioMetadata} from '../utils/getAudioMetadata';
import {getImageDimensions} from '../utils/getImageDimensions';
import {normalizeSliderSelection, normalizeSliderSlide, normalizeSliderSlides} from '../utils/slider-media.js';
import {openFileSelection} from '../utils/openFileSelection';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

async function buildImageSlide(file, upload) {
    const previewUrl = URL.createObjectURL(file);
    let width;
    let height;
    let src = '';

    try {
        ({width, height} = await getImageDimensions(previewUrl));
        const uploadResult = await upload([file]);
        src = uploadResult?.[0]?.url;
    } finally {
        URL.revokeObjectURL(previewUrl);
    }

    if (!src) {
        throw new Error(`Failed to upload image: ${file.name}`);
    }

    return normalizeSliderSlide({
        kind: 'image',
        src,
        fileName: file.name,
        width,
        height,
        alt: ''
    });
}

async function buildVideoSlide(file, upload) {
    const metadata = await extractVideoMetadata(file);
    const uploadResult = await upload([file]);
    const src = uploadResult?.[0]?.url;

    if (!src) {
        throw new Error(`Failed to upload video: ${file.name}`);
    }

    return normalizeSliderSlide({
        kind: 'video',
        src,
        fileName: file.name,
        mimeType: metadata.mimeType,
        width: metadata.width,
        height: metadata.height,
        duration: metadata.duration,
        thumbnailSrc: '',
        alt: ''
    });
}

async function buildAudioSlide(file, upload) {
    const previewUrl = URL.createObjectURL(file);
    let duration = 0;
    let src = '';

    try {
        ({duration} = await getAudioMetadata(previewUrl));
        const uploadResult = await upload([file]);
        src = uploadResult?.[0]?.url;
    } finally {
        URL.revokeObjectURL(previewUrl);
    }

    if (!src) {
        throw new Error(`Failed to upload audio: ${file.name}`);
    }

    return normalizeSliderSlide({
        kind: 'audio',
        src,
        fileName: file.name,
        mimeType: file.type,
        duration,
        caption: ''
    });
}

export function SliderNodeComponent({nodeKey, triggerFileDialog = false}) {
    const [editor] = useLexicalComposerContext();
    const {fileUploader, cardConfig = {}} = React.useContext(KoenigComposerContext);
    const {isSelected} = React.useContext(CardContext);
    const fileInputRef = React.useRef();
    const [slides, setSlides] = React.useState(() => {
        return editor.getEditorState().read(() => {
            const node = $getNodeByKey(nodeKey);
            return normalizeSliderSlides(node.slides || []);
        });
    });
    const slidesRef = React.useRef(slides);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [isUploading, setIsUploading] = React.useState(false);
    const [isPickingMedia, setIsPickingMedia] = React.useState(false);

    const mediaUploader = fileUploader.useFileUpload('image');
    const videoUploader = fileUploader.useFileUpload('video');
    const audioUploader = fileUploader.useFileUpload('audio');
    const hasSliderPicker = typeof cardConfig?.sliderMediaPicker === 'function';
    const mediaDropHandler = useFileDragAndDrop({handleDrop: handleMediaDrop});

    React.useEffect(() => {
        slidesRef.current = slides;
    }, [slides]);

    function commitSlides(nextSlides) {
        const normalized = normalizeSliderSlides(nextSlides);
        slidesRef.current = normalized;
        setSlides(normalized);

        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            node.slides = normalized;
        });
    }

    function addSlides(nextSlides) {
        commitSlides([...slidesRef.current, ...nextSlides]);
    }

    function updateSlide(index, patch) {
        const nextSlides = slidesRef.current.map((slide, currentIndex) => {
            if (currentIndex !== index) {
                return slide;
            }

            return {
                ...slide,
                ...patch
            };
        });

        commitSlides(nextSlides);
    }

    function removeSlide(index) {
        const nextSlides = slidesRef.current.filter((_, currentIndex) => currentIndex !== index);
        commitSlides(nextSlides);
    }

    async function addFile(file) {
        if (file.type.startsWith('image/')) {
            const slide = await buildImageSlide(file, mediaUploader.upload);
            addSlides([slide]);
            return;
        }

        if (file.type.startsWith('video/')) {
            const slide = await buildVideoSlide(file, videoUploader.upload);
            addSlides([slide]);
            return;
        }

        if (file.type.startsWith('audio/')) {
            const slide = await buildAudioSlide(file, audioUploader.upload);
            addSlides([slide]);
            return;
        }

        throw new Error(`Unsupported media type: ${file.type || file.name}`);
    }

    async function handleMediaFiles(files) {
        if (!files || !files.length) {
            return;
        }

        setErrorMessage('');
        setIsUploading(true);

        try {
            for (const file of files) {
                await addFile(file);
            }
        } catch (error) {
            setErrorMessage(error?.message || 'Failed to add media');
        } finally {
            setIsUploading(false);
        }
    }

    async function handleMediaDrop(files) {
        await handleMediaFiles(files);
    }

    async function handlePickMedia(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!hasSliderPicker) {
            return;
        }

        setErrorMessage('');
        setIsPickingMedia(true);

        try {
            const selection = await cardConfig.sliderMediaPicker({
                selectedSlides: slidesRef.current
            });
            const pickedSlides = normalizeSliderSelection(selection);

            if (pickedSlides.length) {
                addSlides(pickedSlides);
            }
        } catch (error) {
            setErrorMessage(error?.message || 'Failed to add media');
        } finally {
            setIsPickingMedia(false);
        }
    }

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files || []);
        await handleMediaFiles(files);
        event.target.value = '';
    };

    const handleAddMedia = (event) => {
        event.preventDefault();
        event.stopPropagation();
        openFileSelection({fileInputRef});
    };

    React.useEffect(() => {
        if (!triggerFileDialog) {
            return;
        }

        const renderTimeout = setTimeout(() => {
            openFileSelection({fileInputRef});

            editor.update(() => {
                const node = $getNodeByKey(nodeKey);
                node.triggerFileDialog = false;
            });
        });

        return () => clearTimeout(renderTimeout);
    }, [editor, nodeKey, triggerFileDialog]);

    return (
        <>
            <SliderCard
                captionError={errorMessage}
                fileInputRef={fileInputRef}
                filesDropper={mediaDropHandler}
                isDraggedOver={mediaDropHandler.isDraggedOver}
                isLoading={isUploading || isPickingMedia || mediaUploader.isLoading || videoUploader.isLoading || audioUploader.isLoading}
                isSelected={isSelected}
                slides={slides}
                onCaptionChange={(index, caption) => updateSlide(index, {caption})}
                onFileChange={handleFileChange}
                onRemoveSlide={removeSlide}
            />

            <ActionToolbar data-kg-card-toolbar="slider" isVisible={isSelected}>
                <ToolbarMenu>
                    <ToolbarMenuItem dataTestId="slider-add-media" icon="add" isActive={false} label="Add media" onClick={handleAddMedia} />
                    {hasSliderPicker ? (
                        <ToolbarMenuItem dataTestId="slider-pick-media" icon="gallery" isActive={false} label="Pick from gallery" onClick={handlePickMedia} />
                    ) : null}
                </ToolbarMenu>
            </ActionToolbar>
        </>
    );
}
