import {describe, expect, it} from 'vitest';
import {
    normalizeSliderSelection,
    normalizeSliderSlide,
    normalizeSliderSlides
} from '../../src/utils/slider-media.js';

describe('slider-media helpers', function () {
    it('normalizes a single slide payload', function () {
        const slide = normalizeSliderSlide({
            kind: 'image',
            src: '/content/images/slider.jpg',
            fileName: 'slider.jpg',
            width: 1600,
            height: 900,
            caption: 'Caption'
        });

        expect(slide).toMatchObject({
            kind: 'image',
            src: '/content/images/slider.jpg',
            fileName: 'slider.jpg',
            width: 1600,
            height: 900,
            caption: 'Caption'
        });
        expect(slide.id).toMatch(/^slider-/);
    });

    it('normalizes arrays of slides and ignores invalid entries', function () {
        const slides = normalizeSliderSlides([
            {kind: 'image', src: '/content/images/one.jpg'},
            null,
            {kind: 'video', src: '/content/videos/two.mp4'}
        ]);

        expect(slides).toHaveLength(2);
        expect(slides[0]).toMatchObject({kind: 'image', src: '/content/images/one.jpg'});
        expect(slides[1]).toMatchObject({kind: 'video', src: '/content/videos/two.mp4'});
    });

    it('normalizes a selection object from the gallery adapter', function () {
        const slides = normalizeSliderSelection({
            slides: [
                {kind: 'image', src: '/content/images/adapter.jpg'},
                {kind: 'video', src: '/content/videos/adapter.mp4'}
            ]
        });

        expect(slides).toHaveLength(2);
        expect(slides[0]).toMatchObject({kind: 'image', src: '/content/images/adapter.jpg'});
        expect(slides[1]).toMatchObject({kind: 'video', src: '/content/videos/adapter.mp4'});
    });

    it('keeps audio slides intact', function () {
        const slide = normalizeSliderSlide({
            kind: 'audio',
            src: '/content/audio/slider.mp3',
            fileName: 'slider.mp3',
            mimeType: 'audio/mpeg',
            duration: 132,
            caption: 'Audio caption'
        });

        expect(slide).toMatchObject({
            kind: 'audio',
            src: '/content/audio/slider.mp3',
            fileName: 'slider.mp3',
            mimeType: 'audio/mpeg',
            duration: 132,
            caption: 'Audio caption'
        });
    });
});
