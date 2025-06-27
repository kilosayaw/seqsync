import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import Select from './Select';

const SoundBank = ({ soundKits, selectedKitName, onKitSelect, currentSoundInKit, onSoundInKitSelect }) => {
    const selectedKit = soundKits[selectedKitName];

    return (
        <div className="flex items-center gap-2">
            <Select
                value={selectedKitName}
                onChange={(e) => onKitSelect(e.target.value)}
                options={Object.values(soundKits).map(kit => ({ value: kit.name, label: kit.displayName }))}
                className="bg-gray-700 text-white min-w-[200px]"
            />
            <div className="flex items-center gap-1 p-1 bg-gray-900/50 rounded-md">
                {selectedKit?.sounds.slice(0, 4).map(sound => (
                    <Button
                        key={sound.name}
                        onClick={() => onSoundInKitSelect(sound.name)}
                        variant="secondary"
                        size="xs" // FIX: Changed from 'custom' to a valid size
                        className={`!px-2 !py-1 ${currentSoundInKit === sound.name ? '!bg-pos-yellow !text-black' : ''}`}
                    >
                        {sound.name}
                    </Button>
                ))}
            </div>
        </div>
    );
};

SoundBank.propTypes = {
    soundKits: PropTypes.object.isRequired,
    selectedKitName: PropTypes.string.isRequired,
    onKitSelect: PropTypes.func.isRequired,
    currentSoundInKit: PropTypes.string,
    onSoundInKitSelect: PropTypes.func.isRequired,
};

export default SoundBank;