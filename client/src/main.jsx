// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // This imports your Tailwind styles

// Log to ensure this file is even running
console.log("main.jsx IS EXECUTING");

const rootElement = document.getElementById('root');
if (rootElement) {
  console.log("Found #root element, attempting to render React app...");
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("#root element NOT FOUND in the DOM. React cannot mount.");
  // Optionally, display an error message directly in the body for visibility
  document.body.innerHTML = '<h1 style="color:red;">Error: #root element not found for React. Check index.html.</h1>';
}