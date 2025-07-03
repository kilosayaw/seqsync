import React from 'react';
import { useUIState } from '../context/UIStateContext';
import './DeckFooter.css';

const DeckFooter = ({ side }) => {
    const { selectedJoint, noteDivision, setNoteDivision, padPlayMode, setPadPlayMode } = useUIState();

    const isDisabled = selectedJoint !== null;

    const handleCycleClick = () => {
        console.log(`[DeckFooter-${side}] Cycle clicked.`);
        const cycles = [16, 8, 4];
        const currentIndex = cycles.indexOf(noteDivision);
        const nextIndex = (currentIndex + 1) % cycles.length;
        setNoteDivision(cycles[nextIndex]);
    };

    const handlePlayModeClick = () => {
        console.log(`[DeckFooter-${side}] Play Mode clicked.`);
        setPadPlayMode(prev => prev === 'TRIGGER' ? 'GATE' : 'TRIGGER');
    };

    const handleOptionClick = (optNum) => {
        console.log(`[DeckFooter-${side}] Option ${optNum} clicked.`);
    };

    return (
        <div className="deck-footer-container">
            {side === 'left' ? (
                <>
                    <div className="footer-control-group">
                        <span className="footer-label">CYCLE</span>
                        <button onClick={handleCycleClick} disabled={isDisabled} className="footer-button">
                            {noteDivision === 16 ? '1/16' : `1/${noteDivision}`}
                        </button>
                    </div>
                    <div className="footer-control-group">
                        <span className="footer-label">PLAY MODE</span>
                        <button onClick={handlePlayModeClick} disabled={isDisabled} className="footer-button">
                            {padPlayMode}
                        </button>
                    </div>
                    <div className="footer-control-group">
                        <span className="footer-label">OPT 3</span>
                        <button onClick={() => handleOptionClick(3)} disabled={isDisabled} className="footer-button"></button>
                    </div>
                    <div className="footer-control-group">
                        <span className="footer-label">OPT 4</span>
                        <button onClick={() => handleOptionClick(4)} disabled={isDisabled} className="footer-button"></button>
                    </div>
                </>
            ) : (
                <>
                    <div className="footer-control-group">
                        <span className="footer-label">OPT 1</span>
                        <button onClick={() => handleOptionClick(1)} disabled={isDisabled} className="footer-button"></button>
                    </div>
                    <div className="footer-control-group">
                        <span className="footer-label">OPT 2</span>
                        <button onClick={() => handleOptionClick(2)} disabled={isDisabled} className="footer-button"></button>
                    </div>
                    <div className="footer-control-group">
                        <span className="footer-label">OPT 3</span>
                        <button onClick={() => handleOptionClick(3)} disabled={isDisabled} className="footer-button"></button>
                    </div>
                    <div className="footer-control-group">
                        <span className="footer-label">OPT 4</span>
                        <button onClick={() => handleOptionClick(4)} disabled={isDisabled} className="footer-button"></button>
                    </div>
                </>
            )}
        </div>
    );
};

export default DeckFooter;