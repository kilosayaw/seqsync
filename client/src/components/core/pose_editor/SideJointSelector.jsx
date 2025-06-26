// src/components/core/pose_editor/SideJointSelector.jsx
import React, { useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
    MODES, 
    UI_LEFT_JOINTS_ABBREVS_NEW, 
    UI_RIGHT_JOINTS_ABBREVS_NEW, 
    Z_RENDER_ORDER,
    SIDE_JOINT_JOYSTICK_MAX_DISPLACEMENT // Used for normalizing joystick drag
} from '../../../utils/constants'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDotCircle } from '@fortawesome/free-solid-svg-icons'; // Example for joystick indicator

const SideJointSelector = ({
  side, // 'L' or 'R'
  onJointSelect,
  activeEditingJoint = null,
  viewMode, // Current application mode (POS, SEQ)
  onJointJoystickUpdate, // Callback to update joint vector: (jointAbbrev, {x, y, z}) => {}
  activeBeatVector = null, // Current vector {x,y,z} of the activeEditingJoint
  className = "",
  logToConsole,
}) => {
  const dragHappenedRef = useRef(false);
  const joystickButtonRef = useRef(null); // To get rect of the button being dragged

  const jointsToDisplay = useMemo(() => {
    const list = side === 'L' ? UI_LEFT_JOINTS_ABBREVS_NEW : UI_RIGHT_JOINTS_ABBREVS_NEW;
    logToConsole?.(`[SideSelector-${side}] Populating with ${list.length} joints.`);
    return list;
  }, [side, logToConsole]);

  const handleJoystickPointerDown = useCallback((e, jointAbbrev) => {
    // This function is only active if the clicked joint button IS the activeEditingJoint AND in POS mode
    if (viewMode !== MODES.POS || jointAbbrev !== activeEditingJoint) return;

    logToConsole?.(`[SideSelector-${side}] PointerDown on ACTIVE joint: ${jointAbbrev}. Initiating joystick.`);
    dragHappenedRef.current = false; // Reset drag flag
    joystickButtonRef.current = e.currentTarget; // The button itself
    
    const rect = joystickButtonRef.current.getBoundingClientRect();
    // Initialize with the current vector of the active joint, or default if none
    const initialVector = activeBeatVector || { x: 0, y: 0, z: Z_RENDER_ORDER[0], x_base_direction:0, y_base_direction:0 };

    const dragContext = {
      startX: e.clientX,
      startY: e.clientY,
      buttonRect: rect,
      initialVector: { ...initialVector }, // Store a copy
      movedSignificantly: false,
    };

    const handleJoystickPointerMove = (moveEvent) => {
      if (moveEvent.cancelable) moveEvent.preventDefault(); // Prevent scrolling on touch

      const dx = moveEvent.clientX - dragContext.startX;
      const dy = moveEvent.clientY - dragContext.startY;

      if (!dragContext.movedSignificantly && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        dragContext.movedSignificantly = true;
        dragHappenedRef.current = true; // Mark that a drag occurred for the click handler
        logToConsole?.(`[SideSelector-${side}] Joystick Drag Started for ${activeEditingJoint}`);
      }

      if (!dragContext.movedSignificantly) return; // Don't process minor movements as drags yet
      
      // Calculate relative position within the button, normalized to -1 to +1 range
      const halfWidth = dragContext.buttonRect.width / 2;
      const halfHeight = dragContext.buttonRect.height / 2;
      
      let relativeX = moveEvent.clientX - dragContext.buttonRect.left - halfWidth;
      let relativeY = moveEvent.clientY - dragContext.buttonRect.top - halfHeight;

      // Clamp relative positions to button bounds
      relativeX = Math.max(-halfWidth, Math.min(halfWidth, relativeX));
      relativeY = Math.max(-halfHeight, Math.min(halfHeight, relativeY));

      // Normalize to -1 to +1 (or a defined max displacement)
      const normalizedX = halfWidth === 0 ? 0 : (relativeX / halfWidth) * SIDE_JOINT_JOYSTICK_MAX_DISPLACEMENT;
      const normalizedY = halfHeight === 0 ? 0 : -(relativeY / halfHeight) * SIDE_JOINT_JOYSTICK_MAX_DISPLACEMENT; // Y is inverted for screen coords
      
      onJointJoystickUpdate(activeEditingJoint, { 
        x: parseFloat(normalizedX.toFixed(3)), // Use more precision for vectors
        y: parseFloat(normalizedY.toFixed(3)), 
        z: dragContext.initialVector.z, // Z doesn't change during XY drag on this joystick
        x_base_direction: dragContext.initialVector.x_base_direction, // Keep original base
        y_base_direction: dragContext.initialVector.y_base_direction,
      });
    };

    const handleJoystickPointerUp = () => {
      logToConsole?.(`[SideSelector-${side}] PointerUp for joystick on ${activeEditingJoint}. Drag happened: ${dragHappenedRef.current}`);
      document.removeEventListener('pointermove', handleJoystickPointerMove);
      document.removeEventListener('pointerup', handleJoystickPointerUp);
      document.removeEventListener('pointercancel', handleJoystickPointerUp); // Also cleanup cancel
      joystickButtonRef.current = null;
      // dragHappenedRef is reset by the click handler if no drag occurred
    };

    document.addEventListener('pointermove', handleJoystickPointerMove, { passive: false });
    document.addEventListener('pointerup', handleJoystickPointerUp);
    document.addEventListener('pointercancel', handleJoystickPointerUp);
    
    // Prevent default for touch to avoid page scroll when dragging on the button
    if (e.pointerType === 'touch' && e.cancelable) {
      e.preventDefault();
    }
    e.stopPropagation(); // Prevent click event from firing immediately after if it's a drag start

  }, [viewMode, activeEditingJoint, onJointJoystickUpdate, activeBeatVector, side, logToConsole]);

  const handleJointButtonClick = useCallback((jointAbbrev) => {
    if (dragHappenedRef.current) {
      logToConsole?.(`[SideSelector-${side}] Click on ${jointAbbrev} ignored due to prior drag.`);
      dragHappenedRef.current = false; // Reset for next interaction
      return;
    }
    
    logToConsole?.(`[SideSelector-${side}] Button Clicked: ${jointAbbrev}. Current active: ${activeEditingJoint}`);
    
    if (viewMode === MODES.POS) {
      if (jointAbbrev === activeEditingJoint) {
        // Clicking the ALREADY active joint: Cycle Z-depth
        const currentVec = activeBeatVector || { x: 0, y: 0, z: Z_RENDER_ORDER[0], x_base_direction:0, y_base_direction:0 };
        let currentZIndex = Z_RENDER_ORDER.indexOf(currentVec.z);
        if (currentZIndex === -1) currentZIndex = 0; // Default to Middle if Z is weird
        
        const nextZIndex = (currentZIndex + 1) % Z_RENDER_ORDER.length;
        const newZ = Z_RENDER_ORDER[nextZIndex];
        
        logToConsole?.(`[SideSelector-${side}] Cycling Z for active joint ${activeEditingJoint} from ${currentVec.z} to ${newZ}`);
        onJointJoystickUpdate(activeEditingJoint, { 
            x: currentVec.x, 
            y: currentVec.y, 
            z: newZ,
            x_base_direction: currentVec.x_base_direction,
            y_base_direction: currentVec.y_base_direction,
        });
      } else {
        // Clicking a new joint: Select it
        logToConsole?.(`[SideSelector-${side}] Selecting new joint: ${jointAbbrev}. Previous: ${activeEditingJoint}`);
        onJointSelect(jointAbbrev);
      }
    } else {
      // If not in POS mode, perhaps just log or do nothing.
      // Or, if you want selection capability in other modes too, call onJointSelect.
      logToConsole?.(`[SideSelector-${side}] Click on ${jointAbbrev} in non-POS mode (${viewMode}). Selecting.`);
      onJointSelect(jointAbbrev); // Allow selection even if not in POS for general inspection
    }
  }, [viewMode, activeEditingJoint, onJointSelect, onJointJoystickUpdate, activeBeatVector, side, logToConsole]);

  return (
    <div className={`p-2 bg-gray-800 rounded-lg shadow-md w-full md:min-w-[12rem] md:w-auto flex flex-col space-y-1 ${className}`}>
      <h3 className="text-xs text-center text-gray-400 mb-1 uppercase tracking-wider font-semibold">
        {side === 'L' ? 'Left Body' : 'Right Body'}
      </h3>
      {jointsToDisplay.map((joint) => {
        const isSelectedForEditing = joint.abbrev === activeEditingJoint;
        // Joystick mode is active if this button's joint is the active joint AND in POS mode
        const isJoystickModeActiveForThisButton = isSelectedForEditing && viewMode === MODES.POS;
        
        let buttonClasses = `w-full p-2 text-xs rounded transition-colors duration-150 ease-in-out focus:outline-none relative overflow-hidden text-left flex items-center justify-between`;

        if (isJoystickModeActiveForThisButton) {
          buttonClasses += ' bg-pos-yellow text-black border-2 border-yellow-300 cursor-grab active:cursor-grabbing ring-2 ring-pos-yellow/50';
        } else if (isSelectedForEditing && viewMode === MODES.POS) {
          // Selected but not the one being "joysticked" (e.g., if another side's joint is active)
          // Or if simply selected in POS mode without joystick interaction yet.
          buttonClasses += ' bg-purple-600 text-white hover:bg-purple-500';
        } else {
          buttonClasses += ' bg-gray-700 text-gray-300 hover:bg-gray-600';
        }
        
        // Determine current vector for the indicator dot, only if this button is the active joystick
        const indicatorVector = isJoystickModeActiveForThisButton && activeBeatVector 
            ? activeBeatVector 
            : { x: 0, y: 0, z: Z_RENDER_ORDER[0] }; // Default non-active joystick to center

        return (
          <button
            key={`${side}-${joint.abbrev}`}
            type="button"
            className={buttonClasses}
            onClick={() => handleJointButtonClick(joint.abbrev)}
            onPointerDown={
              isJoystickModeActiveForThisButton 
                ? (e) => handleJoystickPointerDown(e, joint.abbrev) 
                : undefined // Only attach pointerdown for joystick if it's the active joint for joystick
            }
            style={{ touchAction: isJoystickModeActiveForThisButton ? 'none' : 'auto' }} // Prevent scroll on drag
            aria-pressed={isSelectedForEditing}
            title={`${joint.name} (${joint.abbrev})${isSelectedForEditing && viewMode === MODES.POS ? '. Click to cycle Z. Click & Drag to move XY.' : '. Click to select.'}`}
          >
            <span>{joint.name} <span className="text-gray-500">({joint.abbrev})</span></span>
            {isJoystickModeActiveForThisButton && (
              <div 
                className="absolute bg-black/70 w-2 h-2 rounded-full pointer-events-none ring-1 ring-black/50"
                style={{
                  left: `calc(50% + ${indicatorVector.x * 40}% )`, // 40% gives good travel within button padding
                  top: `calc(50% - ${indicatorVector.y * 40}% )`,  // Y is inverted
                  transform: 'translate(-50%, -50%)',
                  // Opacity based on Z might be nice too
                  opacity: indicatorVector.z === Z_RENDER_ORDER[0] ? 1 : (indicatorVector.z === Z_RENDER_ORDER[1] ? 0.7 : 0.4),
                }}
              >
                <FontAwesomeIcon icon={faDotCircle} className="w-full h-full text-white text-opacity-70" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

SideJointSelector.propTypes = {
  side: PropTypes.oneOf(['L', 'R']).isRequired,
  onJointSelect: PropTypes.func.isRequired,
  activeEditingJoint: PropTypes.string,
  viewMode: PropTypes.string.isRequired,
  onJointJoystickUpdate: PropTypes.func.isRequired,
  activeBeatVector: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
    x_base_direction: PropTypes.number, // Though not directly used by this joystick type
    y_base_direction: PropTypes.number, // Though not directly used by this joystick type
  }),
  className: PropTypes.string,
  logToConsole: PropTypes.func,
};

export default React.memo(SideJointSelector);