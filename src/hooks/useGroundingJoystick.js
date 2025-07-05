import { useState, useRef, useCallback } from 'react';
import { useSequence } from '../context/SequenceContext';
import { FOOT_HOTSPOT_COORDINATES } from '../utils/constants';
import { resolveNotationFromPoints } from '../utils/notationUtils';
import { getPointsFromNotation } from '../utils/notationUtils';

export const useGroundingJoystick = (side) => {
    const { updateJointData } = useSequence();
    const joystickRef = useRef(null);
    const [isInteracting, setIsInteracting] = useState(false);
    const [liveNotation, setLiveNotation] = useState(null);
    const [activePoints, setActivePoints] = useState(new Set());

    const getActiveHotspotsForPoint = useCallback((x, y) => {
        const sideKey = side === 'left' ? 'L' : 'R';
        const hotspots = FOOT_HOTSPOT_COORDINATES[sideKey];
        if (!hotspots) return new Set();

        const newActivePoints = new Set();
        hotspots.forEach(spot => {
            const dx = x - spot.cx;
            const dy = y - spot.cy;
            // Using simplified circular collision for all points for now
            const radius = spot.r || spot.rx || 10;
            if (Math.sqrt(dx * dx + dy * dy) < radius) {
                newActivePoints.add(spot.notation);
            }
        });
        return newActivePoints;
    }, [side]);

    const handleInteractionStart = useCallback((e) => {
        e.stopPropagation();
        setIsInteracting(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const currentPoints = getPointsFromNotation(e.currentTarget.dataset.currentNotation);
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;
        setActivePoints(new Set([...currentPoints, ...getActiveHotspotsForPoint(relativeX, relativeY)]));
    }, [getActiveHotspotsForPoint]);

    const handleInteractionMove = useCallback((e) => {
        if (!isInteracting || !joystickRef.current) return;
        const rect = joystickRef.current.getBoundingClientRect();
        const svgPoint = joystickRef.current.ownerSVGElement.createSVGPoint();
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;
        const transformedPoint = svgPoint.matrixTransform(joystickRef.current.getScreenCTM().inverse());
        
        const points = getActiveHotspotsForPoint(transformedPoint.x, transformedPoint.y);
        setActivePoints(points);
        setLiveNotation(resolveNotationFromPoints(points, side));
    }, [isInteracting, side, getActiveHotspotsForPoint]);

    const handleInteractionEnd = useCallback((globalIndex) => {
        if (!isInteracting) return;
        setIsInteracting(false);
        if (globalIndex > -1 && liveNotation) {
            const jointId = side === 'left' ? 'LF' : 'RF';
            updateJointData(globalIndex, jointId, { grounding: liveNotation });
        }
        setLiveNotation(null);
    }, [isInteracting, liveNotation, side, updateJointData]);

    return { 
        joystickRef, 
        liveNotation, 
        activePoints: isInteracting ? activePoints : null,
        handleInteractionStart, 
        handleInteractionMove, 
        handleInteractionEnd 
    };
};