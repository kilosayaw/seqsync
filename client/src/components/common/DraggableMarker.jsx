import React from 'react';
import { useDraggable } from '@dnd-kit/core';

const DraggableMarker = ({ id, label, position, z_depth = 0 }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : {};
    
    // Scale the marker based on Z-depth
    const scale = 1 + (z_depth * 0.25); // e.g., z:-1 -> 0.75x, z:0 -> 1x, z:1 -> 1.25x

    return (
        <div
            ref={setNodeRef}
            style={{ 
                ...style, 
                position: 'absolute', 
                left: `${position.x}%`, 
                top: `${position.y}%`,
                transform: `${style.transform || ''} translate(-50%, -50%)`, // Center the marker
            }}
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing z-10"
        >
            <div 
                className="w-5 h-5 rounded-full bg-pos-yellow/50 border-2 border-pos-yellow flex items-center justify-center transition-transform duration-150"
                style={{ transform: `scale(${scale})` }}
            >
                <span className="text-xs font-bold text-black select-none">{label}</span>
            </div>
        </div>
    );
};

export default DraggableMarker;