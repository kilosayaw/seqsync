// This worker's sole job is to take an ImageBitmap and convert it to a JPEG Blob.
// This offloads a potentially blocking operation from the main thread.

self.onmessage = async (event) => {
    const { type, payload } = event.data;

    if (type !== 'PROCESS_FRAME') {
        console.warn(`[MediaFrameWorker] Unknown message type: ${type}`);
        return;
    }

    try {
        const { imageBitmap, bar, beat } = payload;
        
        // The core work: create a canvas, draw the bitmap, and convert to a blob.
        const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageBitmap, 0, 0);

        // Convert to a blob. JPEG is efficient for photographic content.
        const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });

        // Post the result back to the main thread.
        self.postMessage({
            type: 'THUMBNAIL_RESULT',
            payload: { thumbnailBlob: blob, bar, beat }
        });

    } catch (error) {
        console.error('[MediaFrameWorker] Error processing frame:', error);
        self.postMessage({ type: 'ERROR', payload: { message: error.message } });
    } finally {
        // Workers are single-use for this task, so we can close it to free up memory.
        // For a more advanced implementation that processes a stream, you would not close it here.
        // self.close(); // Optional: depending on final implementation
    }
};