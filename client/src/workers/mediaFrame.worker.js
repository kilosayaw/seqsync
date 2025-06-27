/**
 * @file mediaFrame.worker.js
 * This Web Worker is responsible for the heavy task of "analyzing" a video file.
 * It iterates through the video's timeline based on the sequencer's BPM and steps,
 * and for each step, it generates a complete poSĒQr pose data object.
 * 
 * NOTE: This is a DUMMY/SIMULATED implementation. It does not perform real
 * ML-based pose estimation. It creates procedurally generated, but structurally correct,
 * data to allow for the development and testing of the main application's UI/UX.
 */


// --- CONSTANTS & HELPERS ---

// A complete list of all joint abbreviations the system needs to track.
const ALL_JOINTS = [
    'H',  // Head
    'LS', 'LE', 'LW', // Left Shoulder, Elbow, Wrist
    'RS', 'RE', 'RW', // Right Shoulder, Elbow, Wrist
    'LH', 'LK', 'LA', // Left Hip, Knee, Ankle
    'RH', 'RK', 'RA'  // Right Hip, Knee, Ankle
];

// A helper function to generate a random discrete direction: -1, 0, or 1.
// This is the core of the poSĒQr vector system.
const randomDirection = () => Math.floor(Math.random() * 3) - 1;

// A list of possible grounding points for randomization. Includes null for a lifted foot.
const GROUNDING_POINTS = ['12', '13', '23', '12T345', '1', '2', '3', '1T2', null];

// --- WORKER MESSAGE HANDLER ---

self.onmessage = async (event) => {
    const { type, payload } = event.data;

    if (type === 'START_PROCESSING') {
        try {
            const { file, bpm, timeSignature, totalBars, padsPerBar } = payload;
            const totalSteps = totalBars * padsPerBar;

            const results = [];

            for (let i = 0; i < totalSteps; i++) {
                // Simulate a small delay to mimic real processing work and keep the main thread responsive.
                await new Promise(resolve => setTimeout(resolve, 5));

                const barIndex = Math.floor(i / padsPerBar);
                const beatIndexInBar = i % padsPerBar;

                // --- GENERATE COMPLETE DUMMY POSE DATA ---

                const jointInfo = {};
                ALL_JOINTS.forEach(joint => {
                    jointInfo[joint] = {
                        // Each joint gets a vector with discrete -1, 0, or 1 values.
                        // This directly maps to the 3x3 grid + Z-depth concept.
                        vector: {
                            x: randomDirection(),
                            y: randomDirection(),
                            z: randomDirection()
                        },
                        // Add rotation for joints that can have it (e.g., ankles)
                        rotation: (joint.endsWith('A')) ? (Math.random() * 90 - 45) : 0,
                    };
                });
                
                // --- GENERATE COMPLETE DUMMY GROUNDING DATA ---

                const leftGroundingPoint = GROUNDING_POINTS[Math.floor(Math.random() * GROUNDING_POINTS.length)];
                const rightGroundingPoint = GROUNDING_POINTS[Math.floor(Math.random() * GROUNDING_POINTS.length)];

                const grounding = {
                    L: leftGroundingPoint ? `L${leftGroundingPoint}` : null,
                    R: rightGroundingPoint ? `R${rightGroundingPoint}` : null,
                    L_weight: Math.round(Math.random() * 100)
                };
                
                // Assemble the final poseData object for this beat.
                const poseData = { jointInfo, grounding };


                // --- GENERATE DUMMY THUMBNAIL ---
                // This remains a placeholder for real frame-grabbing and skeleton-overlay rendering.
                const canvas = new OffscreenCanvas(64, 36);
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = `hsl(${(i * 15) % 360}, 60%, 40%)`; // Use a different color scheme
                ctx.fillRect(0, 0, 64, 36);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`B${barIndex+1}`, 32, 12);
                ctx.fillText(`S${beatIndexInBar+1}`, 32, 24);
                
                const thumbnail = await canvas.convertToBlob().then(blob => new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                }));

                // Push the complete result for this step.
                results.push({
                    bar: barIndex,
                    beat: beatIndexInBar,
                    thumbnail,
                    poseData,
                });
                
                // Post progress back to the main thread.
                self.postMessage({ type: 'PROGRESS', payload: { progress: ((i + 1) / totalSteps) * 100 } });
            }

            // Send the final results back.
            self.postMessage({ type: 'COMPLETE', payload: { results } });

        } catch (error) {
            console.error("Error in media frame worker:", error);
            self.postMessage({ type: 'ERROR', payload: { message: error.message } });
        }
    }
};