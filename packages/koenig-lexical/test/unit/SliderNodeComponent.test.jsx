import CardContext from '../../src/context/CardContext';
import KoenigComposerContext from '../../src/context/KoenigComposerContext';
import React from 'react';
import {$getNodeByKey} from 'lexical';
import {KoenigSelectedCardContext} from '../../src/context/KoenigSelectedCardContext';
import {SliderNodeComponent} from '../../src/nodes/SliderNodeComponent';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {openFileSelection} from '../../src/utils/openFileSelection';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

vi.mock('@lexical/react/LexicalComposerContext', () => ({
    useLexicalComposerContext: vi.fn()
}));

vi.mock('lexical', () => ({
    $getNodeByKey: vi.fn()
}));

vi.mock('../../src/hooks/useFileDragAndDrop', () => ({
    default: vi.fn(() => ({
        isDraggedOver: false,
        setRef: vi.fn()
    }))
}));

vi.mock('../../src/components/ui/cards/SliderCard', () => ({
    SliderCard: () => <div data-testid="slider-card" />
}));

vi.mock('../../src/utils/openFileSelection', () => ({
    openFileSelection: vi.fn()
}));

describe('SliderNodeComponent', function () {
    let editor;
    let node;
    let fileUploader;

    beforeEach(function () {
        node = {
            slides: [
                {
                    id: 'slide-1',
                    kind: 'image',
                    src: '/content/images/existing.jpg'
                }
            ]
        };

        editor = {
            update: vi.fn(callback => callback()),
            getEditorState: vi.fn(() => ({
                read: vi.fn(callback => callback())
            }))
        };

        fileUploader = {
            useFileUpload: vi.fn(() => ({
                upload: vi.fn().mockResolvedValue([{url: '/content/images/uploaded.jpg'}]),
                isLoading: false
            }))
        };

        useLexicalComposerContext.mockReturnValue([editor]);
        $getNodeByKey.mockReturnValue(node);
    });

    afterEach(function () {
        vi.clearAllMocks();
    });

    function renderComponent(cardConfig = {}) {
        return render(
            <KoenigComposerContext.Provider value={{fileUploader, cardConfig}}>
                <KoenigSelectedCardContext>
                    <CardContext.Provider value={{isSelected: true}}>
                        <SliderNodeComponent nodeKey="slider-node-key" />
                    </CardContext.Provider>
                </KoenigSelectedCardContext>
            </KoenigComposerContext.Provider>
        );
    }

    it('keeps the gallery adapter action hidden when no adapter is provided', function () {
        renderComponent();

        expect(screen.getByTestId('slider-add-media')).toBeInTheDocument();
        expect(screen.queryByTestId('slider-pick-media')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('slider-add-media'));

        expect(openFileSelection).toHaveBeenCalledTimes(1);
        expect(openFileSelection).toHaveBeenCalledWith({
            fileInputRef: expect.objectContaining({current: undefined})
        });
    });

    it('invokes the gallery adapter when one is provided', async function () {
        const sliderMediaPicker = vi.fn().mockResolvedValue({
            slides: [
                {
                    kind: 'video',
                    src: '/content/videos/adapter.mp4',
                    fileName: 'adapter.mp4',
                    mimeType: 'video/mp4',
                    width: 1280,
                    height: 720
                }
            ]
        });

        renderComponent({sliderMediaPicker});

        expect(screen.getByTestId('slider-pick-media')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('slider-pick-media'));

        await waitFor(() => {
            expect(sliderMediaPicker).toHaveBeenCalledTimes(1);
        });

        expect(sliderMediaPicker).toHaveBeenCalledWith({
            selectedSlides: [
                expect.objectContaining({
                    id: 'slide-1',
                    kind: 'image',
                    src: '/content/images/existing.jpg'
                })
            ]
        });

        await waitFor(() => {
            expect(node.slides).toHaveLength(2);
        });

        expect(node.slides[1]).toMatchObject({
            kind: 'video',
            src: '/content/videos/adapter.mp4',
            fileName: 'adapter.mp4',
            mimeType: 'video/mp4',
            width: 1280,
            height: 720
        });
    });
});
