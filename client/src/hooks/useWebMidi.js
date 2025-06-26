// src/hooks/useWebMidi.js
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useWebMidi = (handlers) => {
  const [devices, setDevices] = useState([]);
  const [activeDevice, setActiveDevice] = useState(null);

  const handleMidiMessage = useCallback((event) => {
    const [command, note, velocity] = event.data;
    // command 144 = note on, 128 = note off, 176 = control change (CC)
    
    if (command >= 176 && command <= 191) { // Control Change
      const ccNumber = note;
      const ccValue = velocity;
      if (handlers.onControlChange) {
        handlers.onControlChange(ccNumber, ccValue);
      }
    } else if (command >= 144 && command <= 159) { // Note On
      if (handlers.onNoteOn) {
        handlers.onNoteOn(note, velocity);
      }
    }
  }, [handlers]);

  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then(midiAccess => {
          const inputs = [];
          midiAccess.inputs.forEach(input => {
            inputs.push(input);
            input.onmidimessage = handleMidiMessage;
          });
          setDevices(inputs);
          if (inputs.length > 0) {
              toast.success(`MIDI devices found: ${inputs.map(d => d.name).join(', ')}`);
          }
        })
        .catch(error => {
          console.error("Could not access your MIDI devices.", error);
          toast.error("Could not access MIDI devices.");
        });
    } else {
      console.warn("Web MIDI API is not supported in this browser.");
    }
  }, [handleMidiMessage]);

  return { devices, activeDevice, setActiveDevice };
};