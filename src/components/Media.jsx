import React from 'react';
import { useSequence } from '../context/SequenceContext';

const Media = () => {
    const { triggerAudioUpload } = useSequence();
    return (
        <div className="bg-gray-700 p-1 rounded-md">
            <button 
                onClick={triggerAudioUpload}
                className="px-3 py-1 rounded-md text-sm bg-blue-600 hover:bg-blue-500"
            >
                Load Audio
            </button>
        </div>
    );
};

export default Media;