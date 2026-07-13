function createSlideId() {
    return `slider-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeSliderSlide(slide) {
    if (!slide || !slide.kind || !slide.src) {
        return null;
    }

    return {
        id: slide.id || createSlideId(),
        kind: slide.kind,
        src: slide.src,
        fileName: slide.fileName || '',
        mimeType: slide.mimeType || '',
        width: slide.width ?? null,
        height: slide.height ?? null,
        duration: slide.duration || 0,
        thumbnailSrc: slide.thumbnailSrc || '',
        alt: slide.alt || '',
        caption: slide.caption || ''
    };
}

export function normalizeSliderSlides(slides = []) {
    if (!Array.isArray(slides)) {
        return [];
    }

    return slides.map(normalizeSliderSlide).filter(Boolean);
}

export function normalizeSliderSelection(selection) {
    if (!selection) {
        return [];
    }

    if (Array.isArray(selection)) {
        return normalizeSliderSlides(selection);
    }

    if (Array.isArray(selection.slides)) {
        return normalizeSliderSlides(selection.slides);
    }

    if (selection.slide) {
        return normalizeSliderSlides([selection.slide]);
    }

    return normalizeSliderSlides([selection]);
}
