import React from 'react';
import { useUIState } from '../context/UIStateContext';
import './DeckFooter.css';

const DeckFooter = ({ side }) => {
    const { selectedJoint, noteDivision, setNoteDivision, padPlayMode, setPadPlayMode } = useUIState();
    const isDisabled = selectedJoint !== null;

    const handleCycleClick = () => { console.log(`[DeckFooter-${side}] Cycle clicked.`); setNoteDivision(n => (n === 16 ? 8 : n === 8 ? 4 : 16)); };
    const handlePlayModeClick = () => { console.log(`[DeckFooter-${side}] Play Mode clicked.`); setPadPlayMode(p => p === 'TRIGGER' ? 'GATE' : 'TRIGGER'); };
    const handleOptionClick = (opt) => console.log(`[DeckFooter-${side}] Opt ${opt} clicked.`);

    return (
        <div className="deck-footer-container">
            {side === 'left' ? (
                <>
                    <div className="footer-control-group"><span className="footer-label">CYCLE</span><button onClick={handleCycleClick} disabled={isDisabled}>{noteDivision}/16</button></div>
                    <div className="footer-control-group"><span className="footer-label">PLAY MODE</span><button onClick={handlePlayModeClick} disabled={isDisabled}>{padPlayMode}</button></div>
                    <div className="footer-control-group"><span className="footer-label">OPT 3</span><button onClick={() => handleOptionClick(3)} disabled={isDisabled}></button></div>
                    <div className="footer-control-group"><span className="footer-label">OPT 4</span><button onClick={() => handleOptionClick(4)} disabled={isDisabled}></button></div>
                </>
            ) : (
                <>
                    <div className="footer-control-group"><span className="footer-label">OPT 1</span><button onClick={() => handleOptionClick(1)} disabled={isDisabled}></button></div>
                    <div className="footer-control-group"><span className="footer-label">OPT 2</span><button onClick={() => handleOptionClick(2)} disabled={isDisabled}></button></div>
                    <div className="footer-control-group"><span className="footer-label">OPT 3</span><button onClick={() => handleOptionClick(3)} disabled={isDisabled}></button></div>
                    <div className="footer-control-group"><span className="footer-label">OPT 4</span><button onClick={() => handleOptionClick(4)} disabled={isDisabled}></button></div>
                </>
            )}
        </div>
    );
};
export default DeckFooter;