import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useUIState } from '../../../context/UIStateContext';
import { useSequence } from '../../../context/SequenceContext';
import { getPointsFromNotation, resolveNotationFromPoints } from '../../../utils/notationUtils';
import { useTurntableDrag } from '../../../hooks/useTurntableDrag';
import RotarySVG from './RotarySVG';
import XYZGrid from '../XYZGrid';
import { FOOT_HOTSPOT_COORDINATES } from '../../../utils/constants';
import './RotaryController.css';

const BOUNDARY_CENTER = { x: 275, y: 275 };
const BOUNDARY_RADIUS = 165;
const PIVOT_ROTATION_LIMIT = 45;

const getPivotCoords = (pivotId, hotspots) => {
    if (!pivotId) return { x: 175, y: 175 };
    const mainPointId = pivotId.charAt(1);
    const pivotData = hotspots.find(spot => spot.notation === mainPointId);
    return pivotData ? { x: pivotData.cx, y: pivotData.cy } : { x: 175, y: 175 };
};

const rotatePoint = (point, angle, origin) => {
    const angleRad = (angle * Math.PI) / 180;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);
    const x = point.x - origin.x;
    const y = point.y - origin.y;
    const newX = x * cosA - y * sinA + origin.x;
    const newY = x * sinA + y * cosA + origin.y;
    return { x: newX, y: newY };
};

const isMoveLegal = (angle, pivotCoords, offset, boundaryCenter, boundaryRadius) => {
    const footBoundingBox = [
        { x: 35, y: 40 }, { x: 315, y: 40 },
        { x: 315, y: 320 }, { x: 35, y: 320 },
    ];
    for (const point of footBoundingBox) {
        const rotatedPoint = rotatePoint(point, angle, pivotCoords);
        const finalX = rotatedPoint.x + 100 + offset.x;
        const finalY = rotatedPoint.y + 100 + offset.y;
        const distSq = (finalX - boundaryCenter.x)**2 + (finalY - boundaryCenter.y)**2;
        if (distSq > boundaryRadius**2) return false;
    }
    return true;
};

const RotaryController = ({ deckId }) => {
    const { activePad, selectedJoints, showNotification, activeDirection, movementFaderValue } = useUIState(); 
    const { songData, updateJointData } = useSequence();
    
    const side = deckId === 'deck1' ? 'left' : 'right';
    const sidePrefix = side.charAt(0).toUpperCase();
    const hotspots = FOOT_HOTSPOT_COORDINATES[sidePrefix] || [];

    const relevantSelectedJoints = selectedJoints.filter(j => j.startsWith(sidePrefix));
    const isEditing = relevantSelectedJoints.length > 0;
    const activeJointId = isEditing ? relevantSelectedJoints[0] : null;
    const isFootMode = isEditing && activeJointId && activeJointId.endsWith('F');

    const sourceData = (activePad !== null && activeJointId && songData[activePad]?.joints?.[activeJointId]) || {};
    
    const initialAngle = sourceData.rotation || 0;
    const initialPosition = sourceData.position || [0, 0, 0];
    const pivotPointId = sourceData.pivotPoint;

    const [footOffset, setFootOffset] = useState({ x: 0, y: 0 });
    const prevPivotRef = useRef(pivotPointId);

    // PHOENIX PROTOCOL FIX: The handleDrag callback must be declared BEFORE it is used in the useTurntableDrag hook.
    const handleDrag = useCallback((finalAngle, delta) => {
        if (!isEditing || activePad === null || !activeJointId) return;

        let angleToApply = finalAngle;
        const updatePayload = {};

        if (isFootMode) {
            angleToApply = Math.max(-PIVOT_ROTATION_LIMIT, Math.min(PIVOT_ROTATION_LIMIT, finalAngle));
            const currentPivotCoords = getPivotCoords(pivotPointId, hotspots);

            if (isMoveLegal(angleToApply, currentPivotCoords, footOffset, BOUNDARY_CENTER, BOUNDARY_RADIUS)) {
                updatePayload.rotation = angleToApply;
            } else {
                 console.log("Boundary reached. Rotation blocked.");
                 return;
            }
        } else {
             updatePayload.rotation = angleToApply;
        }

        if (!isFootMode) {
            const FADER_MIN = 0.001;
            const FADER_MAX = 0.02;
            const sensitivity = FADER_MIN + (movementFaderValue * (FADER_MAX - FADER_MIN));
            const dragAmount = delta * sensitivity;
            
            const currentPos = songData[activePad].joints[activeJointId].position || [0, 0, 0];
            const newPos = [...currentPos];

            if (activeDirection === 'l_r') newPos[0] = Math.max(-1, Math.min(1, newPos[0] - dragAmount));
            else if (activeDirection === 'up_down') newPos[1] = Math.max(-1, Math.min(1, newPos[1] - dragAmount));
            else if (activeDirection === 'fwd_bwd') newPos[2] = Math.max(-1, Math.min(1, newPos[2] + dragAmount));
            
            updatePayload.position = newPos;
        }
        
        if (Object.keys(updatePayload).length > 0) {
            updateJointData(activePad, activeJointId, updatePayload);
        }
        
    }, [activePad, activeJointId, isEditing, isFootMode, activeDirection, movementFaderValue, songData, updateJointData, pivotPointId, hotspots, footOffset]);

    const { angle, handleMouseDown, setAngle } = useTurntableDrag(initialAngle, handleDrag);

    useEffect(() => {
        if (isFootMode) {
             if (prevPivotRef.current && prevPivotRef.current !== pivotPointId) {
                const oldPivotCoords = getPivotCoords(prevPivotRef.current, hotspots);
                const newPivotCoords = getPivotCoords(pivotPointId, hotspots);
                const rotatedOldPivot = rotatePoint(oldPivotCoords, angle, oldPivotCoords);
                const rotatedNewPivot = rotatePoint(newPivotCoords, angle, newPivotCoords);
                const dx = rotatedOldPivot.x - rotatedNewPivot.x;
                const dy = rotatedOldPivot.y - rotatedNewPivot.y;
                setFootOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            }
        } else {
            setFootOffset({x: 0, y: 0});
        }
        prevPivotRef.current = pivotPointId;
    }, [pivotPointId, isFootMode, hotspots, angle]);

    useEffect(() => {
         setFootOffset({ x: 0, y: 0 });
    }, [activePad]);
    
    useEffect(() => {
        setAngle(initialAngle);
    }, [initialAngle, setAngle]);
    
    const handlePositionChange = useCallback((newPosition) => {
        if (!isEditing || !activePad || !activeJointId) return;
        updateJointData(activePad, activeJointId, { position: newPosition });
    }, [activePad, isEditing, activeJointId, updateJointData]);

    const handleHotspotClick = useCallback((shortNotation) => {
        if (!isFootMode || activePad === null) {
            showNotification("Select a pad to edit contact points.");
            return;
        }
        const currentGrounding = songData[activePad]?.joints?.[activeJointId]?.grounding;
        const currentPoints = getPointsFromNotation(currentGrounding);
        const newActivePoints = new Set(currentPoints);

        if (newActivePoints.has(shortNotation)) newActivePoints.delete(shortNotation);
        else newActivePoints.add(shortNotation);
        
        const newGroundingNotation = resolveNotationFromPoints(newActivePoints, side);
        updateJointData(activePad, activeJointId, { grounding: newGroundingNotation });
    }, [isFootMode, activePad, showNotification, songData, activeJointId, side, updateJointData]);

    return (
        <div className="rotary-controller-container">
            <RotarySVG
                side={side}
                angle={angle}
                activePoints={getPointsFromNotation(sourceData.grounding)}
                pivotPoint={pivotPointId}
                onHotspotClick={handleHotspotClick}
                isFootMode={isFootMode}
                handleWheelMouseDown={handleMouseDown}
                footOffset={footOffset}
            />
            <div className="editor-overlays">
                {(!isFootMode && isEditing) ? (
                    <XYZGrid 
                        position={initialPosition} 
                        onPositionChange={handlePositionChange}
                    />
                ) : (isFootMode && activePad === null) ? (
                    <div className="placeholder-text-small">
                        Select a pad to edit contact points.
                    </div>
                ) : null}
            </div>
        </div>
    );
};
export default RotaryController;