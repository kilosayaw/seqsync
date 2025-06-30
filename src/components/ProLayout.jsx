import React from 'react';
import Deck from './Deck';
import CenterConsole from './CenterConsole';
import './ProLayout.css';

const ProLayout = () => {
  // The old renderDeck function is now moved into the Deck.jsx component.
  // This component is now much cleaner.

  return (
    <div className="pro-layout-container">
      <Deck side="left" />
      <CenterConsole />
      <Deck side="right" />
    </div>
  );
};

export default ProLayout;