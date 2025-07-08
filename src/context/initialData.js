// src/context/initialData.js
export const initialSongData = {
    title: "Untitled Sequence",
    artist: "New Artist",
    bpm: 120,
    bars: [
        {
            id: 'bar_1',
            beats: Array.from({ length: 16 }, (_, i) => ({
                id: `beat_${i + 1}`,
                pose: null, 
                sound: null,
            })),
        },
    ],
    barStartTimes: [0],
};