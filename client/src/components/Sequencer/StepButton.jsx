// client/src/components/Sequencer/StepButton.jsx
import React from 'react';

const StepButton = ({ stepData, onClick, isSelected, isActiveStep }) => {
  const hasSound = stepData?.sound;
  const hasGrounding = stepData?.grounding;
  const hasJointInfo = stepData?.jointInfo;

  let contentDisplay = '';
  if (hasSound) contentDisplay = stepData.sound.substring(0, 3).toUpperCase();
  else if (hasJointInfo) contentDisplay = "JNT";
  else if (hasGrounding) contentDisplay = "GRD";
  else contentDisplay = (stepData?.id !== undefined ? stepData.id + 1 : '?').toString();


  // Using Tailwind for borders directly on the button with outline for selection
  // The multi-border effect with boxShadow was a bit complex to manage with responsiveness
  // Let's try single prominent borders for now, color-coded.
  // Or, use pseudo-elements if strict multi-borders are needed.
  // For simplicity, let's use one main border and ring for selection.

  let borderColorClass = 'border-gray-600'; // Default
  if (hasJointInfo) borderColorClass = 'border-red-500'; // Joint info takes precedence
  else if (hasGrounding) borderColorClass = 'border-yellow-500';
  else if (hasSound) borderColorClass = 'border-green-500';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative w-16 h-16 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 xl:w-20 xl:h-20 /* Increased & Responsive Size */
        flex items-center justify-center 
        text-xs font-mono text-white
        bg-gray-700 hover:bg-gray-600
        border-2 ${borderColorClass}
        ${isSelected ? 'ring-4 ring-sky-400 ring-offset-2 ring-offset-black' : ''}
        ${isActiveStep && !isSelected ? 'bg-orange-500 animate-pulse' : ''}
        focus:outline-none transition-all duration-100 ease-in-out
        p-0 leading-tight rounded-md /* Rounded corners for buttons */
      `}
      title={`Step ${stepData?.id !== undefined ? stepData.id + 1 : 'N/A'}${hasSound ? ' - Sound: ' + stepData.sound : ''}${hasJointInfo ? ' - Has Joint Info' : ''}${hasGrounding ? ' - Has Grounding' : ''}`}
    >
      <span className="relative z-10 truncate px-0.5 text-[10px] sm:text-xs">{contentDisplay.trim()}</span>
    </button>
  );
};

export default StepButton;