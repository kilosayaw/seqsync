import React from 'react';

// Import the new, architecturally sound main component
import Studio from './components/core/studio/Studio'; 

// Import ToastContainer to handle all notifications globally
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  // We no longer render the old StepSequencerControls.
  // We now render the Studio component, which handles everything.
  return (
    <>
      {/* The Studio component contains all providers and the main layout */}
      <Studio />

      {/* Place the ToastContainer here at the root of your app */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;