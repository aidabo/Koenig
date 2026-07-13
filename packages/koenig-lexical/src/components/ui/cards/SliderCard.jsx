import PropTypes from 'prop-types';
import React from 'react';
import DeleteIcon from '../../../assets/icons/kg-trash.svg?react';
import {IconButton} from '../IconButton';
import {MediaPlaceholder} from '../MediaPlaceholder';
import {ProgressBar} from '../ProgressBar';
import {openFileSelection} from '../../../utils/openFileSelection';

function SliderSlide({
    slide,
    index,
    isSelected,
    onCaptionChange,
    onRemoveSlide
}) {
    const isVideo = slide.kind === 'video';
    const isAudio = slide.kind === 'audio';
    const mediaSrc = slide.previewSrc || slide.src;

    return (
        <article
            className="group/slide relative flex w-full min-w-0 flex-col overflow-hidden rounded-xl border border-grey-200 bg-white shadow-sm dark:border-grey-900 dark:bg-grey-950 md:min-w-[320px] md:max-w-[460px]"
            data-kind={slide.kind}
            data-testid="slider-slide"
        >
            <div className="kg-slider-media group/image relative bg-black">
                {isVideo ? (
                    <video
                        className="block bg-black object-cover"
                        preload="metadata"
                        src={mediaSrc}
                        controls
                    />
                ) : isAudio ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 bg-grey-100 px-4 py-8 text-center dark:bg-grey-900">
                        <div className="flex size-20 items-center justify-center rounded-full bg-black text-white">
                            <span className="text-sm font-semibold uppercase tracking-[0.3em]">Audio</span>
                        </div>
                        <audio
                            className="block"
                            preload="metadata"
                            src={mediaSrc}
                            controls
                        />
                    </div>
                ) : (
                    <img
                        alt={slide.alt || ''}
                        className="block object-cover"
                        loading="lazy"
                        src={mediaSrc}
                    />
                )}

                <div className="pointer-events-none invisible absolute inset-0 bg-gradient-to-t from-black/0 via-black/5 to-black/30 p-3 opacity-0 transition-all group-hover/image:visible group-hover/image:opacity-100">
                    <div className="flex flex-row-reverse">
                        <IconButton Icon={DeleteIcon} label={`Remove slide ${index + 1}`} onClick={() => onRemoveSlide(index)} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2 p-3">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-grey-500">
                        {slide.kind}
                    </span>
                    {slide.fileName && (
                        <span className="max-w-[65%] truncate text-xs text-grey-500">
                            {slide.fileName}
                        </span>
                    )}
                </div>

                <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-grey-600">
                        Caption
                    </span>
                    <textarea
                        className="min-h-[72px] w-full resize-y rounded-md border border-grey-300 bg-white p-2 text-sm text-black outline-none transition placeholder:text-grey-400 focus:border-green-600 dark:border-grey-800 dark:bg-grey-950 dark:text-white"
                        placeholder="Enter slide caption"
                        readOnly={!isSelected}
                        value={slide.caption || ''}
                        onChange={event => onCaptionChange(index, event.target.value)}
                    />
                </label>
            </div>
        </article>
    );
}

export function SliderCard({
    captionError,
    fileInputRef,
    filesDropper,
    isDraggedOver,
    isLoading,
    isSelected,
    slides,
    onCaptionChange,
    onFileChange,
    onRemoveSlide
}) {
    const openPicker = () => {
        openFileSelection({fileInputRef});
    };

    const placeholder = (
        <MediaPlaceholder
            desc="Click to add images, videos, or audio"
            filePicker={openPicker}
            icon="gallery"
            isDraggedOver={isDraggedOver}
            multiple={true}
            placeholderRef={filesDropper?.setRef}
            size="large"
        />
    );

    return (
        <figure className="not-kg-prose">
            <div ref={filesDropper?.setRef} className="relative" data-testid="slider-container">
                {slides.length > 0 ? (
                    <div
                        className="kg-slider-track-editor flex flex-col gap-4 overflow-visible md:flex-row md:overflow-x-auto md:overflow-y-hidden md:pb-4"
                        data-testid="slider-track"
                    >
                        {slides.map((slide, index) => (
                            <SliderSlide
                                key={slide.id || `${slide.kind}-${index}`}
                                index={index}
                                isSelected={isSelected}
                                slide={slide}
                                onCaptionChange={onCaptionChange}
                                onRemoveSlide={onRemoveSlide}
                            />
                        ))}
                    </div>
                ) : (
                    placeholder
                )}

                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50" data-testid="slider-progress">
                        <div className="w-full max-w-md rounded-full bg-white/80 p-4 shadow">
                            <ProgressBar bgStyle="transparent" fullWidth={true} style={{width: '100%'}} />
                        </div>
                    </div>
                ) : null}

                {captionError ? (
                    <div className="absolute inset-x-3 bottom-3 rounded-md bg-black/80 px-3 py-2 text-sm font-medium text-white" data-testid="slider-error">
                        {captionError}
                    </div>
                ) : null}

                <form onChange={onFileChange}>
                    <input
                        ref={fileInputRef}
                        accept="image/*"
                        hidden={true}
                        multiple={true}
                        name="slider-media-input"
                        type="file"
                    />
                </form>
            </div>
        </figure>
    );
}

SliderSlide.propTypes = {
    slide: PropTypes.object,
    index: PropTypes.number,
    isSelected: PropTypes.bool,
    onCaptionChange: PropTypes.func,
    onRemoveSlide: PropTypes.func
};

SliderCard.propTypes = {
    captionError: PropTypes.string,
    fileInputRef: PropTypes.object,
    filesDropper: PropTypes.object,
    isDraggedOver: PropTypes.bool,
    isLoading: PropTypes.bool,
    isSelected: PropTypes.bool,
    slides: PropTypes.array,
    onCaptionChange: PropTypes.func,
    onFileChange: PropTypes.func,
    onRemoveSlide: PropTypes.func
};
