// src/components/core/pose_editor/SideJointSelector.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../common/Button';
import Tooltip from '../../common/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronUp, faChevronDown, faChevronLeft, faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import {
  MODE_POS,
  // Z_DEPTH_JOINT_SCALES is not used directly for button, we use Z_BUTTON_SCALES
} from '../../../utils/constants'; // Ensure constants.js has Z_BUTTON_SCALES & Z_FONT_SCALES

const CHEVRON_THRESHOLD = 0.15; // Threshold for showing displacement chevrons

// Z-depth scales for the button element itself and font size
const Z_BUTTON_SCALES = {
  NEAR: 1.15,    // -1Z or -0.5Z, largest button
  NEUTRAL: 1.0,  //  0Z, medium button
  FAR: 0.85,     // +1Z or +0.5Z, smallest button
};

const Z_FONT_SCALES_CLASSES = { // Tailwind scale classes for font
    NEAR: 'scale-[1.05]',
    NEUTRAL: 'scale-[1]',
    FAR: 'scale-[0.95]'
};

const SideJointSelector = ({
  side,
  jointsList, // Expected: [{ abbrev: 'L_SHO', name: 'Left Shoulder' }, ...]
  activeJoint,
  onJointSelect,
  appMode,
  programmedJoints = [],
  currentBeatJointInfo = {},
  className = ""
}) => {

  const getZStyling = (zValue) => {
    let buttonScaleFactor = Z_BUTTON_SCALES.NEUTRAL;
    let fontScaleClass = Z_FONT_SCALES_CLASSES.NEUTRAL;
    let abbrevColorClass = 'text-gray-300'; // Default text color for neutral Z

    if (zValue <= -0.5) { // Near group (-1Z, -0.5Z)
      buttonScaleFactor = Z_BUTTON_SCALES.NEAR;
      fontScaleClass = Z_FONT_SCALES_CLASSES.NEAR;
      abbrevColorClass = 'text-white font-semibold'; // Brighter for nearer
    } else if (zValue >= 0.5) { // Far group (+1Z, +0.5Z)
      buttonScaleFactor = Z_BUTTON_SCALES.FAR;
      fontScaleClass = Z_FONT_SCALES_CLASSES.FAR;
      abbrevColorClass = 'text-gray-500'; // Dimmer for farther
    }
    return { buttonScaleFactor, fontScaleClass, abbrevColorClass };
  };

  const getDisplacementChevrons = (jointAbbrev) => {
    const jointData = currentBeatJointInfo[jointAbbrev];
    const chevrons = [];
    if (jointData?.vector) {
      const { x, y } = jointData.vector;
      const absX = Math.abs(x);
      const absY = Math.abs(y);

      // Determine dominant direction for chevrons
      // Prioritize Y if significantly larger or if X and Y are close and Y is positive (up)
      if (absY > CHEVRON_THRESHOLD && (absY >= absX * 0.9 || y > 0 && absX < absY * 1.1)) {
        chevrons.push(<FontAwesomeIcon key={`${jointAbbrev}-y-chev`} icon={y > 0 ? faChevronUp : faChevronDown} className={`mx-px`} />);
      }
      // Add X if significantly larger or if Y wasn't dominant enough but X is still significant
      if (absX > CHEVRON_THRESHOLD && (absX >= absY * 0.9 || x !== 0 && absY < absX * 1.1)) {
        // Prevent duplicate if Y was already added and they are very similar
        if (!(chevrons.length > 0 && absX < CHEVRON_THRESHOLD * 1.5 && absY < CHEVRON_THRESHOLD * 1.5)) {
            chevrons.push(<FontAwesomeIcon key={`${jointAbbrev}-x-chev`} icon={x < 0 ? faChevronLeft : faChevronRight} className={`mx-px`} />);
        }
      }
      // If no chevrons yet, but one direction is above threshold, show it
      if (chevrons.length === 0) {
        if (absY > CHEVRON_THRESHOLD) chevrons.push(<FontAwesomeIcon key={`${jointAbbrev}-y-chev`} icon={y > 0 ? faChevronUp : faChevronDown} className={`mx-px`} />);
        else if (absX > CHEVRON_THRESHOLD) chevrons.push(<FontAwesomeIcon key={`${jointAbbrev}-x-chev`} icon={x < 0 ? faChevronLeft : faChevronRight} className={`mx-px`} />);
      }
    }
    return chevrons.slice(0, 2); // Max 2 chevrons
  };

  return (
    // Container for the column of joint buttons
    <div className={`flex flex-col items-center space-y-1.5 w-14 sm:w-16 md:w-[70px] ${className}`}>
      {jointsList.map((joint) => {
        const { abbrev, name: jointNameTooltip } = joint;
        const isSelectedForEditing = appMode === MODE_POS && activeJoint === abbrev;
        const isProgrammed = programmedJoints.includes(abbrev);
        const jointDataForBeat = currentBeatJointInfo[abbrev];
        
        const zValue = jointDataForBeat?.vector?.z ?? 0;
        const { buttonScaleFactor, fontScaleClass, abbrevColorClass: zDepthTextColor } = getZStyling(zValue);
        
        const chevrons = getDisplacementChevrons(abbrev);
        
        // Abbreviation formatting (e.g., L_SHO -> LS, L_WRST -> LW)
        let displayAbbrev = abbrev.replace('_', '');
        if (displayAbbrev.length > 2) {
            if (displayAbbrev.endsWith('SHO') || displayAbbrev.endsWith('ELB') || displayAbbrev.endsWith('HIP') || displayAbbrev.endsWith('KNE') || displayAbbrev.endsWith('ANK')) {
                displayAbbrev = displayAbbrev.substring(0,1) + displayAbbrev.substring(displayAbbrev.length-1);
            } else if (displayAbbrev.endsWith('WRST')) {
                 displayAbbrev = displayAbbrev.substring(0,1) + 'W';
            } else {
                displayAbbrev = displayAbbrev.substring(0, 2); // Fallback for others like L_SCAP -> LS
            }
        }
        displayAbbrev = displayAbbrev.toUpperCase();


        let baseBgClass = 'bg-gray-700 hover:bg-gray-600';
        let borderClass = 'border-gray-600 hover:border-gray-500';
        let finalAbbrevColorClass = zDepthTextColor; // Start with Z-depth color
        let title = `${jointNameTooltip} (Z: ${zValue.toFixed(1)})`;
        let shadowClass = 'shadow-md';

        if (appMode === MODE_POS) {
          if (isSelectedForEditing) {
            baseBgClass = 'bg-brand-pos hover:bg-brand-pos/90';
            borderClass = 'border-yellow-300 ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-800';
            finalAbbrevColorClass = 'text-black font-bold'; // Override Z-depth color for selection
            title = `${jointNameTooltip} (Editing, Z: ${zValue.toFixed(1)})`;
            shadowClass = 'shadow-lg shadow-yellow-500/30';
          } else if (isProgrammed) {
            baseBgClass = 'bg-yellow-700/80 hover:bg-yellow-600/90'; // More saturated if programmed
            borderClass = 'border-yellow-600/70';
            finalAbbrevColorClass = 'text-yellow-100'; // Programmed color overrides Z if not selected
            shadowClass = 'shadow-yellow-700/20';
          }
        } else { // SEQ or SYNC mode
          if (isProgrammed) {
            baseBgClass = 'bg-gray-600/70 hover:bg-gray-500/80'; // Slightly darker if programmed
            const orientation = jointDataForBeat?.orientation; // General orientation
            const ankleSagittal = jointDataForBeat?.orientation_sagittal;
            const ankleFrontal = jointDataForBeat?.orientation_frontal;
            const ankleTransverse = jointDataForBeat?.orientation_transverse;

            // Prioritize ankle specifics if available, otherwise general orientation
            if ((abbrev.includes('ANK') && (ankleSagittal?.includes('DORSI') || ankleFrontal?.includes('EVERT') || ankleTransverse?.includes('ABDUCT'))) ||
                (!abbrev.includes('ANK') && orientation === 'OUT')) {
                borderClass = 'border-orange-500/80 shadow-sm shadow-orange-500/40';
            } else if ((abbrev.includes('ANK') && (ankleSagittal?.includes('PLANTAR') || ankleFrontal?.includes('INVER') || ankleTransverse?.includes('ADDUCT'))) ||
                       (!abbrev.includes('ANK') && orientation === 'IN')) {
                borderClass = 'border-blue-500/80 shadow-sm shadow-blue-500/40';
            } else {
                borderClass = 'border-gray-500/80';
            }
            if (!isSelectedForEditing) finalAbbrevColorClass = 'text-gray-100'; // Ensure good contrast if programmed
          }
        }
        
        // Button sizing and fully rounded shape
        const buttonBaseSizeW = 'w-11 sm:w-12 md:w-14';
        const buttonBaseSizeH = 'h-11 sm:h-12 md:h-14';
        const buttonSizeAndShapeClasses = `!p-0 !rounded-full ${buttonBaseSizeW} ${buttonBaseSizeH}`;

        return (
          <Tooltip content={title} placement={side === 'L' ? 'right' : 'left'} key={abbrev} className="w-full flex justify-center">
            <Button
              onClick={() => onJointSelect(abbrev)}
              variant="custom"
              // Apply dynamic scaling to the button itself for Z-depth
              style={{ transform: `scale(${isSelectedForEditing ? buttonScaleFactor * 1.08 : buttonScaleFactor})` }}
              className={`
                ${buttonSizeAndShapeClasses} ${baseBgClass} ${borderClass} ${shadowClass}
                !font-medium transition-all duration-150 ease-out
                !flex !flex-col !items-center !justify-center relative
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-accent
              `}
            >
              {/* Abbreviation with its own subtle Z-depth font scaling */}
              <span
                className={`font-mono transition-colors duration-150 ${finalAbbrevColorClass} ${fontScaleClass}
                           text-[0.7rem] sm:text-[0.75rem] md:text-[0.8rem] leading-none select-none`}
              >
                {displayAbbrev}
              </span>
              {/* Chevrons for displacement */}
              {chevrons.length > 0 && (
                  <div className={`absolute bottom-1 sm:bottom-1.5 flex items-center justify-center text-[0.5rem] sm:text-[0.55rem] opacity-90 
                                  ${isSelectedForEditing ? 'text-black/80' : 
                                    (finalAbbrevColorClass.includes('text-white') || finalAbbrevColorClass.includes('text-gray-100') || finalAbbrevColorClass.includes('text-yellow-100') ? 'text-gray-200' : 'text-gray-400') 
                                  }`}>
                      {chevrons}
                  </div>
              )}
            </Button>
          </Tooltip>
        );
      })}
    </div>
  );
};

SideJointSelector.propTypes = {
  side: PropTypes.oneOf(['L', 'R']).isRequired,
  jointsList: PropTypes.arrayOf(PropTypes.shape({
    abbrev: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired, // Used for tooltip
  })).isRequired,
  activeJoint: PropTypes.string,
  onJointSelect: PropTypes.func.isRequired,
  appMode: PropTypes.string.isRequired,
  programmedJoints: PropTypes.arrayOf(PropTypes.string),
  currentBeatJointInfo: PropTypes.object, // Contains { [jointAbbrev]: { vector: {x,y,z}, orientation, ... } }
  className: PropTypes.string,
};

export default SideJointSelector;