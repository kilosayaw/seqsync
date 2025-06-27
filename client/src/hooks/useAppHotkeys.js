// src/hooks/useAppHotkeys.js
import { useHotkeys } from 'react-hotkeys-hook';
import { usePoseStore } from '../stores/poseStore'; // Example using a state manager like Zustand
import { useSequencerStore } from '../stores/sequencerStore';

export const useAppHotkeys = () => {
    const { setActiveJoint, updateGrounding, pivotFoot } = usePoseStore();
    const { nudgeCrossfader } = useSequencerStore();

    // Joint Selection
    useHotkeys('q', () => setActiveJoint('LS'));
    useHotkeys('w', () => setActiveJoint('LE'));
    // ... etc.

    // Grounding
    useHotkeys('a', () => updateGrounding('LF', 'LF1')); // Left foot, section 1
    useHotkeys('s', () => updateGrounding('LF', 'LF2'));
    // ... etc. for j, k, l, ;

    // Pivots
    useHotkeys('shift+a', () => pivotFoot('LF', -45), { preventDefault: true });
    useHotkeys('shift+d', () => pivotFoot('LF', 45), { preventDefault: true });

    // Transport
    useHotkeys('space', () => toneService.play(), { preventDefault: true });

    // Crossfader
    useHotkeys('[', () => nudgeCrossfader(-0.1));
    useHotkeys(']', () => nudgeCrossfader(0.1));
};