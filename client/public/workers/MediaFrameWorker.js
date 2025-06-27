/**
 * @file mediaFrame.worker.js
 * A Web Worker dedicated to extracting frames from a video file at specific
 * time intervals without blocking the main UI thread.
 */

// This is the main message handler for the worker.
self.onmessage = async (event) => {
    const { type, payload } = event.data;

    if (type !== 'START_PROCESSING') {
        return;
    }

    try {
        const { file, bpm, timeSignature, totalBars, padsPerBar } = payload;

        // --- Step 1: Create a Video Element in Memory ---
        // We use a video element to leverage the browser's native, highly-optimized
        // seeking and decoding capabilities.
        const videoElement = new self.Video(); // 'self.Video' is how you access DOM elements in a worker
        videoElement.src = self.URL.createObjectURL(file);
        
        // Wait until the video's metadata (like duration) is loaded.
        await new Promise((resolve, reject) => {
            videoElement.onloadedmetadata = resolve;
            videoElement.onerror = () => reject(new Error('Worker: Failed to load video metadata.'));
            videoElement.load();
        });

        // --- Step 2: Calculate Timing for Each Frame ---
        const totalSteps = totalBars * padsPerBar;
        const timePerStep = (60 / bpm) / (padsPerBar / (timeSignature?.beatsPerBar || 4));
        if (!isFinite(timePerStep) || timePerStep <= 0) {
            throw new Error("Worker: Invalid timing calculation. Check BPM and time signature.");
        }

        // --- Step 3: Loop Through Each Beat and Extract the Frame ---
        for (let i = 0; i < totalSteps; i++) {
            const timeTarget = i * timePerStep;

            // Stop if we've gone past the end of the video.
            if (timeTarget > videoElement.duration) {
                break;
            }

            // Set the video's current time to the target timestamp.
            videoElement.currentTime = timeTarget;

            // Wait for the browser to finish seeking to that exact frame.
            await new Promise((resolve) => {
                videoElement.onseeked = resolve;
            });
            
            // --- Step 4: Draw the Frame to an OffscreenCanvas and Generate Thumbnail ---
            const canvas = new self.OffscreenCanvas(videoElement.videoWidth, videoElement.videoHeight);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoElement, 0, 0);

            // Convert the canvas to a low-quality JPEG Blob for performance.
            const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });
            
            // Convert the Blob to a Base64 Data URL to send back to the main thread.
            const thumbnail = await new Promise(resolve => {
                const reader = new self.FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });

            // --- Step 5: Post the Result Back to the Main Thread ---
            const barIndex = Math.floor(i / padsPerBar);
            const beatIndexInBar = i % padsPerBar;
            const progress = ((i + 1) / totalSteps) * 100;

            self.postMessage({
                type: 'PROGRESS',
                payload: {
                    progress,
                    thumbnail,
                    bar: barIndex,
                    beat: beatIndexInBar,
                }
            });
        }
        
        // --- Step 6: Signal Completion ---
        self.postMessage({ type: 'COMPLETE' });

    } catch (error) {
        console.error("Error in media frame worker:", error);
        self.postMessage({ type: 'ERROR', payload: { message: error.message } });
    }
};