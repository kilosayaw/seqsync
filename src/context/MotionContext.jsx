// src/context/MotionContext.jsx

import React, { createContext, useContext, useState } from 'react';

const MotionContext = createContext(null);
export const useMotion = () => useContext(MotionContext);

export const MotionProvider = ({ children }) => {
    // This state will hold the live pose data from TensorFlow.js in the future
    const [livePoseData, setLivePoseData] = useState(null);

    const value = {
        livePoseData,
        setLivePoseData,
    };

    return (
        <MotionContext.Provider value={value}>
            {children}
        </MotionContext.Provider>
    );
};