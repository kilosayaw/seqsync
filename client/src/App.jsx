// client/src/App.jsx
import React from 'react';
import SequencerPage from './pages/SequencerPage.jsx'; // Make sure this path is correct
// import './index.css'; // Not needed here, already in main.jsx

function App() {
  console.log("App.jsx rendering SequencerPage");
  return (
    <SequencerPage />
  );
}

export default App;