// /client/src/components/common/ViewOptionsToggle.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useUIState } from '../../contexts/UIStateContext.jsx';
import { Eye } from 'react-feather';

// --- A self-contained component for the toggle switches ---
const ToggleSwitch = ({ label, isChecked, onToggle }) => (
    <label className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/50 rounded-md cursor-pointer">
        <span>{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only peer" checked={isChecked} onChange={onToggle} />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
    </label>
);

const ViewOptionsToggle = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { 
        toggleLiveCam, isLiveCamActive,
        toggleFeedMirror, isFeedMirrored,
        toggleOverlayMirror, isOverlayMirrored
    } = useUIState();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(p => !p)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-sm text-white"
            >
                <Eye size={16} />
                <span>View Options</span>
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50 p-1">
                    <ul className="space-y-1">
                        <li><ToggleSwitch label="Live Camera" isChecked={isLiveCamActive} onToggle={toggleLiveCam} /></li>
                        <li><ToggleSwitch label="Mirror Feed" isChecked={isFeedMirrored} onToggle={toggleFeedMirror} /></li>
                        <li><ToggleSwitch label="Mirror Overlay" isChecked={isOverlayMirrored} onToggle={toggleOverlayMirror} /></li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ViewOptionsToggle;