// src/components/ui/ChevronIcon.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './ChevronIcon.css';

// Reusable SVG Path Building Blocks
const Top = () => <path d="M 20 45 L 50 30 L 80 45" className="chevron-stroke" />;
const Bottom = () => <path d="M 20 55 L 50 70 L 80 55" className="chevron-stroke" />;
const Left = () => <path d="M 45 20 L 30 50 L 45 80" className="chevron-stroke" />;
const Right = () => <path d="M 55 20 L 70 50 L 55 80" className="chevron-stroke" />;
const BracketFrame = () => (
    <>
        <path d="M 25 10 L 25 90" className="chevron-stroke" />
        <path d="M 75 10 L 75 90" className="chevron-stroke" />
    </>
);

const ChevronIcon = ({ position }) => {
    // Sanitize the input vector to ensure it's always -1, 0, or 1.
    const x = Math.round(position?.[0] || 0);
    const y = Math.round(position?.[1] || 0);
    const z = Math.round(position?.[2] || 0);

    const getSymbol = () => {
        // Handle no movement (0,0,0) - returns nothing to keep the pad clean
        if (x === 0 && y === 0 && z === 0) {
            return null;
        }

        // Handle pure Forward/Backward (x=0, y=0) with Brackets
        if (x === 0 && y === 0) {
            return (
                <>
                    <BracketFrame />
                    {z > 0 && <Bottom />} 
                    {z < 0 && <Top />}
                </>
            );
        }

        // General Case: Build the symbol from parts
        const parts = [];
        if (y > 0) parts.push(<Top key="y" />);
        if (y < 0) parts.push(<Bottom key="y" />);
        if (x > 0) parts.push(<Left key="x" />);
        if (x < 0) parts.push(<Right key="x" />);
        
        // Add depth indicators (the second chevron)
        if (z > 0) parts.push(<Bottom key="z" />);
        if (z < 0) parts.push(<Top key="z" />);

        return <>{parts}</>;
    };

    return (
        <div className="chevron-container">
            <svg viewBox="0 0 100 100" className="chevron-svg">
                {getSymbol()}
            </svg>
        </div>
    );
};

ChevronIcon.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
};

export default React.memo(ChevronIcon);