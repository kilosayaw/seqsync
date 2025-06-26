import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Button from '../../common/Button';
import VectorInputGrid from '../../common/VectorInputGrid';
import DirectionalChevron from '../../common/DirectionalChevron';
import { POSE_DEFAULT_VECTOR, GENERAL_ORIENTATION_OPTIONS, INTENT_OPTIONS, ALL_JOINTS_MAP } from '../../../utils/constants';

// --- Contexts needed to read the current state ---
import { useSequence } from '../../../contexts/SequenceContext.jsx';
import { useUIState } from '../../../contexts/UIStateContext.jsx';

const NumberInput = ({ label, value, onChange, min, max, step }) => (
  <div className="flex flex-col">
    <label className="text-xs text-text-muted mb-1">{label}</label>
    <input type="number" value={value} onChange={onChange} min={min} max={max} step={step} className="bg-gray-900 border border-border-color text-text-primary rounded-md p-1 text-sm focus:ring-2 focus:ring-pos-yellow focus:border-pos-yellow" />
  </div>
);

const SelectInput = ({ label, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="text-xs text-text-muted mb-1">{label}</label>
    <select value={value} onChange={onChange} className="bg-gray-900 border border-border-color text-text-primary rounded-md p-1 text-sm focus:ring-2 focus:ring-pos-yellow focus:border-pos-yellow">
      {options.map(opt => ( <option key={opt.value} value={opt.value}>{opt.label}</option> ))}
    </select>
  </div>
);

export const JointInputPanel = ({ jointAbbrev, onUpdate, onClose }) => {
    // 1. Consume contexts to get the current state for this joint
    const { songData } = useSequence();
    const { activeBeatData } = useUIState();

    if (!jointAbbrev) return null;

    // 2. Get the specific data for the selected joint from the active beat
    const jointData = activeBeatData?.jointInfo?.[jointAbbrev];

    // 3. Create a safe, complete data object with defaults for rendering
    const safeData = {
        vector: jointData?.vector || { ...POSE_DEFAULT_VECTOR },
        rotation: jointData?.rotation || 0,
        orientation: jointData?.orientation || 'NEU',
        intent: jointData?.intent || 'Transition',
    };

    // 4. Create handlers that call the onUpdate prop passed down from Studio.jsx
    const handleUpdate = (property, value) => {
        onUpdate(jointAbbrev, { [property]: value });
    };

    return (
        <div className="bg-gray-800 border border-pos-yellow/50 rounded-lg p-3 w-full animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-pos-yellow">{ALL_JOINTS_MAP[jointAbbrev]?.name || jointAbbrev}</h3>
                {onClose && <Button onClick={onClose} variant="icon" size="sm" title="Close Panel" iconLeft={faTimes} />}
            </div>

            <div className="flex justify-center items-center gap-4 p-2 bg-black/20 rounded-lg">
                <VectorInputGrid 
                    vector={safeData.vector} 
                    onVectorChange={(newVector) => handleUpdate('vector', newVector)} 
                />
                <DirectionalChevron 
                    jointAbbrev={jointAbbrev} 
                    vector={safeData.vector} 
                />
            </div>
                
            <div className="p-2 border-t border-gray-700">
                <NumberInput 
                    label="Rotation (Degrees)" 
                    value={safeData.rotation} 
                    onChange={(e) => handleUpdate('rotation', parseInt(e.target.value, 10) || 0)} 
                    min={-180} max={180} step={5} 
                />
            </div>

            <div className="p-2 border-t border-gray-700 space-y-3">
                <SelectInput 
                    label="Orientation" 
                    value={safeData.orientation} 
                    onChange={(e) => handleUpdate('orientation', e.target.value)} 
                    options={GENERAL_ORIENTATION_OPTIONS} 
                />
                <SelectInput 
                    label="Intent" 
                    value={safeData.intent} 
                    onChange={(e) => handleUpdate('intent', e.target.value)} 
                    options={INTENT_OPTIONS} 
                />
            </div>
        </div>
    );
};

JointInputPanel.propTypes = {
  jointAbbrev: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};