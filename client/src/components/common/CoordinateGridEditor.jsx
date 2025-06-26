// /client/src/components/common/CoordinateGridEditor.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

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
  width: ${({ z }) => (z === 1 ? '20px' : z === -1 ? '8px' : '14px')};
  height: ${({ z }) => (z === 1 ? '20px' : z === -1 ? '8px' : '14px')};
`;

const CoordinateGridEditor = ({ initialVector, onVectorChange }) => {
    const [vector, setVector] = useState(initialVector || { x: 0, y: 0, z: 0 });

    useEffect(() => {
        setVector(initialVector || { x: 0, y: 0, z: 0 });
    }, [initialVector]);

    const handleCellClick = (x, y) => {
        let newVector;
        if (vector.x === x && vector.y === y) {
            // Clicked the same cell, cycle Z: 0 -> 1 -> -1 -> 0
            const nextZ = vector.z === 0 ? 1 : vector.z === 1 ? -1 : 0;
            newVector = { ...vector, z: nextZ };
        } else {
            newVector = { x, y, z: 0 };
        }
        setVector(newVector);
        onVectorChange(newVector);
    };

    const gridCells = [];
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