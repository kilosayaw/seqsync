import React, { createContext, useContext, useState } from 'react';

const MotionContext = createContext(null);

export const useMotion = () => useContext(MotionContext);

export const MotionProvider = ({ children }) => {
    const [livePoseData, setLivePoseData] = useState(null);

    const value = {
        livePoseData,
        setLivePoseData
    };

    return (
        <MotionContext.Provider value={value}>
            {children}
        </MotionContext.Provider>
    );
};