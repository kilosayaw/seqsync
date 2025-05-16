// client/src/components/Sequencer/StepSequencerControls.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import StepButton from './StepButton';
import SoundBank from '../SoundBank/SoundBank';
import PlaybackControls from '../PlaybackControls/PlaybackControls';
import FootDisplay from '../FootDisplay/FootDisplay';
import JointMatrix from '../JointMatrix/JointMatrix';
import JointInputPanel from '../JointInputPanel/JointInputPanel';
import FileUploader from '../UI/FileUploader';

const initialStepData = () => ({
  // id will be set by map index
  sound: null,
  grounding: null, // e.g., { type: 'LF123', side: 'L' }
  jointInfo: null, // e.g., { joint: 'LS', rotation: 'IN', ... }
});

const TOTAL_STEPS = 16;
const SIXTEENTHS_PER_BEAT = 4; // Assuming each step is a 16th note in a 4/4 context

const StepSequencerControls = ({ onFullSequenceDataChange }) => {
  const [stepsData, setStepsData] = useState(() =>
    Array(TOTAL_STEPS).fill(null).map((_, index) => ({ id: index, ...initialStepData() }))
  );

  const [selectedStepIndex, setSelectedStepIndex] = useState(null); // For editing
  const [currentSelectedSoundFromBank, setCurrentSelectedSoundFromBank] = useState(null);
  const [activeEditingJoint, setActiveEditingJoint] = useState(null); // Joint selected from JointMatrix

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayStep, setCurrentPlayStep] = useState(0); // 0-15 index of the currently playing step
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState(4); // Beats per bar (e.g., 4 for 4/4)
  const [stepResolution, setStepResolution] = useState(4); // 4 = 16ths, 2 = 8ths, 1 = quarters per step
  
  const [audioFile, setAudioFile] = useState(null); // For uploaded MP3

  // Callbacks
  const handleStepClick = useCallback((index) => {
    setSelectedStepIndex(index);
    setActiveEditingJoint(stepsData[index]?.jointInfo?.joint || null);
    if (currentSelectedSoundFromBank && stepsData[index]?.sound !== currentSelectedSoundFromBank) {
      setStepsData(prev => prev.map((s, i) => i === index ? { ...s, sound: currentSelectedSoundFromBank } : s));
    }
  }, [currentSelectedSoundFromBank, stepsData]);

  const handleSoundSelectedFromBank = useCallback((soundName) => {
    setCurrentSelectedSoundFromBank(soundName);
    if (selectedStepIndex !== null && soundName !== null) {
      setStepsData(prev => prev.map((s, i) => i === selectedStepIndex ? { ...s, sound: soundName } : s));
    } else if (soundName === null) {
         setCurrentSelectedSoundFromBank(null);
    }
  }, [selectedStepIndex]);

  const handleJointMatrixSelect = useCallback((jointAbbrev) => {
    setActiveEditingJoint(jointAbbrev);
  }, []);

  const handleSaveJointInfoToStep = useCallback((jointInfoData) => {
    if (selectedStepIndex !== null && jointInfoData.joint) {
      setStepsData(prev => prev.map((s, i) => i === selectedStepIndex ? { ...s, jointInfo: jointInfoData } : s));
    }
  }, [selectedStepIndex]);

  const handleSaveGroundingToStep = useCallback((groundingData) => {
    if (selectedStepIndex !== null) {
      setStepsData(prev => prev.map((s, i) => i === selectedStepIndex ? { ...s, grounding: groundingData } : s));
    }
  }, [selectedStepIndex]);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleStop = useCallback(() => { setIsPlaying(false); setCurrentPlayStep(0); }, []);
  const handleTapTempo = useCallback(() => { console.log("TAP TEMPO Logic Needed"); /* TODO */ }, []);
  const handleRewind = useCallback(() => { setIsPlaying(false); setCurrentPlayStep(prev => (prev - 1 + TOTAL_STEPS) % TOTAL_STEPS);}, []);
  const handleForward = useCallback(() => { setIsPlaying(false); setCurrentPlayStep(prev => (prev + 1) % TOTAL_STEPS);}, []);
  const handleBpmChange = useCallback((newBpm) => setBpm(Math.max(30, Math.min(300, Number(newBpm) || 120))), []);
  const handleStepResolutionChange = useCallback((newRes) => {
    setStepResolution(Number(newRes) || 4);
    // When resolution changes, might need to adjust currentPlayStep or bar/beat interpretation if it's complex
  }, []);

  // Sequencer Playback Timer
  useEffect(() => {
    let timerId;
    if (isPlaying && bpm > 0 && stepResolution > 0) {
      // intervalDuration is time PER STEP. How many steps per beat depends on stepResolution.
      // If stepResolution is 4 (16ths), there are 4 steps per beat.
      const intervalDuration = (60000 / bpm) / stepResolution; 
      timerId = setInterval(() => {
        setCurrentPlayStep(prev => (prev + 1) % TOTAL_STEPS);
      }, intervalDuration);
    }
    return () => clearInterval(timerId);
  }, [isPlaying, bpm, stepResolution]);

  // Derived Bar/Beat for PlaybackControls display
  const { currentBarDisplay, currentBeatDisplay } = useMemo(() => {
    if (stepResolution === 0) return { currentBarDisplay: 1, currentBeatDisplay: 1 };
    // How many "resolution units" (e.g., 16ths) make up one main beat of the time signature
    // For now, assume stepResolution directly maps to subdivisions of a quarter note (main beat)
    // e.g. if stepResolution is 4, it means 4 steps = 1 quarter note.
    // If stepResolution is 1, it means 1 step = 1 quarter note.
    const stepsPerMainBeat = stepResolution; // This interpretation needs to be consistent.
                                            // If your mock-up's 1/16 means each of the 16 buttons IS a 16th note, then stepResolution should be fixed at 4 for a 4/4 bar
                                            // Let's assume stepResolution means "how many of these steps make up one beat"

    const beatsEquivalentPassed = currentPlayStep / stepsPerMainBeat; 
    const bar = Math.floor(beatsEquivalentPassed / timeSignature) + 1;
    const beat = Math.floor(beatsEquivalentPassed % timeSignature) + 1;
    return { currentBarDisplay: bar, currentBeatDisplay: beat };
  }, [currentPlayStep, timeSignature, stepResolution]);

  // Effect for onFullSequenceDataChange
  useEffect(() => {
    if (onFullSequenceDataChange) {
      onFullSequenceDataChange({ 
        bpm, 
        bar: currentBarDisplay, 
        beat: currentBeatDisplay, 
        timeSignature, 
        stepResolution, 
        steps: stepsData 
      });
    }
  }, [stepsData, bpm, currentBarDisplay, currentBeatDisplay, timeSignature, stepResolution, onFullSequenceDataChange]);

  // Derived state for what's shown in FootDisplay and Info Box
  const activeStepForDisplay = useMemo(() => {
    return selectedStepIndex !== null && !isPlaying 
           ? stepsData[selectedStepIndex] 
           : (currentPlayStep !== null ? stepsData[currentPlayStep] : null);
  }, [selectedStepIndex, isPlaying, currentPlayStep, stepsData]);
  
  const leftGroundPoint = useMemo(() => activeStepForDisplay?.grounding?.type?.startsWith('L') ? activeStepForDisplay.grounding.type : '', [activeStepForDisplay]);
  const rightGroundPoint = useMemo(() => activeStepForDisplay?.grounding?.type?.startsWith('R') ? activeStepForDisplay.grounding.type : '', [activeStepForDisplay]);
  const intentDisplay = useMemo(() => activeStepForDisplay?.jointInfo?.intent || '', [activeStepForDisplay]);
  const energyDisplay = useMemo(() => activeStepForDisplay?.jointInfo?.energy || '', [activeStepForDisplay]);

  return (
    <div className="p-2 sm:p-3 md:p-4 bg-black text-white w-full max-w-5xl mx-auto rounded-lg shadow-xl font-mono flex flex-col gap-3 md:gap-4">
      {/* Row 1: MP3 Uploader */}
      <div className="text-center">
        <FileUploader onFileSelect={(file) => { setAudioFile(file); console.log("Audio file selected:", file.name); }} />
        {audioFile && <span className="text-xs text-gray-400 ml-2">{audioFile.name}</span>}
      </div>

      {/* Row 2: Step Sequencer Buttons */}
      <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 sm:gap-1.5 bg-gray-900 p-1 sm:p-2 rounded place-items-center">
        {stepsData.map((step, index) => (
          <StepButton
            key={index} // Using index as key
            stepData={{...step, id: index}} // Ensuring stepData has an id for display if StepButton uses it
            onClick={() => handleStepClick(index)}
            isSelected={selectedStepIndex === index && !isPlaying}
            isActiveStep={isPlaying && currentPlayStep === index}
          />
        ))}
      </div>

      {/* Row 3: Playback Controls */}
      <div>
        <PlaybackControls
          bpm={bpm}
          onBpmChange={handleBpmChange}
          bar={currentBarDisplay}
          beat={currentBeatDisplay}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onRewind={handleRewind}
          onForward={handleForward}
          onTapTempo={handleTapTempo}
          stepResolution={stepResolution}
          onStepResolutionChange={handleStepResolutionChange}
        />
      </div>

      {/* Row 4: Main Interaction Area (Foot Displays, Center Controls) */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-stretch gap-3 md:gap-4 min-h-[220px] sm:min-h-[250px]"> {/* Adjusted min-height */}
        {/* Left Foot Display Column */}
        <div className="w-full md:w-1/4 flex justify-center md:justify-start p-1">
          <FootDisplay groundPoint={leftGroundPoint} side="L" />
        </div>

        {/* Center Column */}
        <div className="w-full md:w-1/2 flex flex-col items-center gap-2 md:gap-3 p-1">
          <SoundBank 
            onSoundSelect={handleSoundSelectedFromBank} 
            currentSelectedSoundName={currentSelectedSoundFromBank} 
          />
          <div className="bg-gray-800 p-3 rounded-md w-full max-w-xs text-center text-xs md:text-sm min-h-[70px]">
            <p className="text-pink-400 font-semibold mb-1">
              🧠 Step {(activeStepForDisplay ? activeStepForDisplay.id + 1 : '--')} Info
            </p>
            <p>Intent: <span className="text-yellow-400">{intentDisplay || '-'}</span></p>
            <p>Energy: <span className="text-green-400">{energyDisplay || '-'}</span></p>
          </div>
          <div className="p-1 bg-gray-800 rounded w-full max-w-xs mt-1">
            <JointMatrix 
              onJointSelect={handleJointMatrixSelect} 
              activeEditingJoint={activeEditingJoint} 
            />
          </div>
        </div>

        {/* Right Foot Display Column */}
        <div className="w-full md:w-1/4 flex justify-center md:justify-end p-1">
          <FootDisplay groundPoint={rightGroundPoint} side="R" />
        </div>
      </div>

      {/* Row 5: Joint Input Panel (Conditional) */}
      {selectedStepIndex !== null && !isPlaying && (
        <div className="mt-2 flex justify-center">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
            <JointInputPanel
              activeStepData={stepsData[selectedStepIndex]}
              selectedJointForEdit={activeEditingJoint}
              onSaveJointInfo={handleSaveJointInfoToStep}
              onSaveGroundingInfo={handleSaveGroundingToStep}
            />
          </div>
        </div>
      )}
    </div>
  );
// NO EXTRA BRACE OR SEMICOLON HERE
} // This is the correct closing brace for the StepSequencerControls function component

export default StepSequencerControls;