import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useMediaProcessing = ({ onProcessingComplete }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const workerRef = useRef(null);

    // This effect ensures the worker is terminated when the component unmounts
    useEffect(() => {
        // Create the worker instance. The URL object is a modern way to do this that works with bundlers like Vite/CRA.
        workerRef.current = new Worker(new URL('../workers/mediaFrame.worker.js', import.meta.url), {
            type: 'module',
        });

        // Listen for messages from the worker
        workerRef.current.onmessage = (event) => {
            const { type, payload } = event.data;
            switch (type) {
                case 'PROGRESS':
                    setProgress(payload.progress);
                    break;
                case 'COMPLETE':
                    setIsProcessing(false);
                    setProgress(100);
                    toast.success('Media analysis complete!');
                    if (onProcessingComplete) {
                        onProcessingComplete(payload.results);
                    }
                    break;
                case 'ERROR':
                    setIsProcessing(false);
                    toast.error(`Worker Error: ${payload.message}`);
                    break;
                default:
                    console.warn('Unknown message type from worker:', type);
            }
        };

        return () => {
            workerRef.current.terminate();
        };
    }, [onProcessingComplete]);

    const startProcessing = useCallback((mediaFile, bpm, timeSignature, totalBars, padsPerBar) => {
        if (!mediaFile) {
            toast.warn('No media file loaded to process.');
            return;
        }
        if (isProcessing) {
            toast.warn('Processing is already in progress.');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        toast.info('Starting media analysis...');

        // Send the file and parameters to the worker to start the job
        workerRef.current.postMessage({
            type: 'START_PROCESSING',
            payload: {
                file: mediaFile,
                bpm,
                timeSignature,
                totalBars,
                padsPerBar,
            }
        });
    }, [isProcessing]);
    
    const cancelProcessing = useCallback(() => {
        if(workerRef.current) {
            workerRef.current.terminate();
            // Re-initialize worker for next use
            workerRef.current = new Worker(new URL('../workers/mediaFrame.worker.js', import.meta.url));
            setIsProcessing(false);
            setProgress(0);
            toast.warn("Processing cancelled.");
        }
    }, [])

    return { isProcessing, progress, startProcessing, cancelProcessing };
};