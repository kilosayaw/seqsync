import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 120px;
  height: 120px;
  background-color: #0f172a;
  border: 1px solid #334155;
  border-radius: 4px;
`;

const GridCell = styled.button`
  border: 1px solid #273142;
  cursor: pointer;
  position: relative;
  background: transparent;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const PositionDot = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  background-color: var(--color-accent-yellow, #FFD700);
  border: 2px solid white;
  transform: translate(-50%, -50%);
  transition: all 0.15s ease-in-out;
  /* Size changes based on Z-depth */
  width: ${({ z }) => (z === 1 ? '24px' : z === -1 ? '10px' : '16px')};
  height: ${({ z }) => (z === 1 ? '24px' : z === -1 ? '10px' : '16px')};
  box-shadow: 0 0 8px var(--color-accent-yellow);
`;

const CoordinateGridEditor = ({ initialVector, onVectorChange }) => {
    const [vector, setVector] = useState(initialVector || { x: 0, y: 0, z: 0 });

    // Ensure the component's internal state updates if the prop changes from outside
    useEffect(() => {
        setVector(initialVector || { x: 0, y: 0, z: 0 });
    }, [initialVector]);

    const handleCellClick = (x, y) => {
        let newVector;
        if (vector.x === x && vector.y === y) {
            // If clicking the same cell, cycle Z: 0 -> 1 -> -1 -> 0
            const nextZ = vector.z === 0 ? 1 : vector.z === 1 ? -1 : 0;
            newVector = { ...vector, z: nextZ };
        } else {
            // If clicking a new cell, set X/Y and reset Z to neutral (0)
            newVector = { x, y, z: 0 };
        }
        setVector(newVector);
        onVectorChange(newVector); // Notify parent component of the change
    };

    const gridCells = [];
    // Y is inverted for screen coordinates (1 is top, -1 is bottom)
    for (let y of [1, 0, -1]) {
        for (let x of [-1, 0, 1]) {
            gridCells.push(
                <GridCell key={`${x},${y}`} onClick={() => handleCellClick(x, y)}>
                    {vector.x === x && vector.y === y && <PositionDot z={vector.z} />}
                </GridCell>
            );
        }
    }

    return <GridContainer>{gridCells}</GridContainer>;
};

CoordinateGridEditor.propTypes = {
    initialVector: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
        z: PropTypes.number,
    }),
    onVectorChange: PropTypes.func.isRequired,
};

export default CoordinateGridEditor;