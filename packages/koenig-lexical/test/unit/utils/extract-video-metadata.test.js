import extractVideoMetadata from '../../../src/utils/extractVideoMetadata';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

describe('extractVideoMetadata', () => {
    let video;
    let canvas;
    let createElementSpy;
    let createObjectUrlMock;
    let revokeObjectUrlMock;

    beforeEach(() => {
        vi.useFakeTimers();
        video = {
            duration: 12,
            videoWidth: 1280,
            videoHeight: 720,
            pause: vi.fn(),
            removeAttribute: vi.fn(),
            load: vi.fn()
        };
        canvas = {
            getContext: vi.fn(() => ({
                drawImage: vi.fn(),
                canvas: {
                    toBlob: callback => callback(new Blob(['thumbnail'], {type: 'image/jpeg'}))
                }
            }))
        };
        createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
            return tagName === 'video' ? video : canvas;
        });
        createObjectUrlMock = vi.fn(() => 'blob:test-video');
        revokeObjectUrlMock = vi.fn();
        Object.defineProperty(URL, 'createObjectURL', {configurable: true, value: createObjectUrlMock});
        Object.defineProperty(URL, 'revokeObjectURL', {configurable: true, value: revokeObjectUrlMock});
    });

    afterEach(() => {
        createElementSpy.mockRestore();
        delete URL.createObjectURL;
        delete URL.revokeObjectURL;
        vi.useRealTimers();
    });

    it('detaches the video before revoking its object URL', async () => {
        const resultPromise = extractVideoMetadata(new File(['video'], 'video.mp4', {type: 'video/mp4'}));

        video.onloadedmetadata();
        video.oncanplay();
        video.onseeked();

        await expect(resultPromise).resolves.toMatchObject({
            duration: 12,
            width: 1280,
            height: 720,
            mimeType: 'video/mp4'
        });
        expect(video.removeAttribute).toHaveBeenCalledWith('src');
        expect(revokeObjectUrlMock).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1000);
        expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:test-video');
    });
});
