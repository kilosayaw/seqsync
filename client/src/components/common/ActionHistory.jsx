
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faChevronDown, faChevronUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import Button from './Button';

const ActionHistory = ({ history, onClearHistory }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <div className="bg-gray-700/50 border border-gray-600 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-600/50" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faHistory} className="text-gray-400" />
            <h3 className="text-xs font-semibold text-gray-200">Action Log</h3>
          </div>
          <div className="flex items-center gap-3">
             {isOpen && (<Button onClick={(e) => { e.stopPropagation(); onClearHistory(); }} variant="icon" size="xs" className="text-red-400 hover:text-red-300" title="Clear Log"><FontAwesomeIcon icon={faTrash} /></Button>)}
            <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronUp} className="text-gray-400" />
          </div>
        </div>
        {isOpen && (
          <div className="bg-black/30 h-32 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500">
            {history.length > 0 ? (
              history.map((log, index) => (<p key={index} className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words">{log}</p>))
            ) : (<p className="text-xs text-gray-500 italic text-center pt-4">No actions logged yet.</p>)}
          </div>
        )}
      </div>
    </div>
  );
};

ActionHistory.propTypes = {
  history: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClearHistory: PropTypes.func.isRequired,
};

export default ActionHistory;