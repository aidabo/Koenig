// taken from https://github.com/TryGhost/Ghost/blob/main/ghost/admin/lib/koenig-editor/addon/utils/extract-video-metadata.js
export default function extractVideoMetadata(file) {
    return new Promise((resolve, reject) => {
        const mimeType = file.type;
        let duration, width, height;
        const objectUrl = URL.createObjectURL(file);

        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;

        const cleanup = () => {
            video.pause();
            video.removeAttribute('src');
            video.load();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        };

        video.onerror = (error) => {
            cleanup();
            reject(error);
        };

        video.onloadedmetadata = function () {
            duration = video.duration;
            width = video.videoWidth;
            height = video.videoHeight;
        };

        video.oncanplay = function () {
            video.currentTime = 0.5;
            video.oncanplay = null;
        };

        video.onseeked = function () {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, width, height);

            ctx.canvas.toBlob((thumbnailBlob) => {
                cleanup();
                resolve({
                    duration,
                    width,
                    height,
                    mimeType,
                    thumbnailBlob
                });
            }, 'image/jpeg', 0.75);
        };

        video.src = objectUrl;
        // required for iPhone Safari to load the video contents for the thumbnail
        video.load();
    });
}
