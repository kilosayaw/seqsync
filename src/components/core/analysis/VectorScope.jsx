import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ScopeContainer = styled.div`
  width: 150px;
  height: 150px;
  background-color: #111;
  border: 1px solid #444;
  border-radius: 50%; /* Make it a circle */
  position: relative;
  margin-top: 1rem;
`;

const SvgOverlay = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible; /* Allow elements to draw outside the circle if needed */
`;

const GridLine = styled.line`
  stroke: #333;
  stroke-width: 1;
`;

const VectorLine = styled.line`
  stroke: var(--color-accent, #00AACC);
  stroke-width: 2;
  transition: all 0.05s linear;
`;

const VectorHead = styled.circle`
  fill: var(--color-highlight-strong, #00FFFF);
  transition: all 0.05s linear;
`;

const VectorScope = ({ vector = { x: 0, y: 0, z: 0 } }) => {
    const size = 150;
    const center = size / 2;
    
    // Convert the -1 to 1 vector to pixel coordinates
    const endX = center + (vector.x * (center * 0.9));
    const endY = center - (vector.y * (center * 0.9)); // Y is inverted in screen space
    
    // Use the Z coordinate to scale the size of the vector head
    // Closer (negative z) is bigger, farther (positive z) is smaller
    const zScale = 1 + (-vector.z * 0.5); 
    const headRadius = 5 * zScale;

    return (
        <ScopeContainer>
            <SvgOverlay viewBox={`0 0 ${size} ${size}`}>
                {/* Background Grid */}
                <GridLine x1={center} y1="0" x2={center} y2={size} />
                <GridLine x1="0" y1={center} x2={size} y2={center} />

                {/* The Vector */}
                <VectorLine x1={center} y1={center} x2={endX} y2={endY} />
                <VectorHead cx={endX} cy={endY} r={headRadius} />
            </SvgOverlay>
        </ScopeContainer>
    );
};

VectorScope.propTypes = {
    vector: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
        z: PropTypes.number,
    }),
};

export default VectorScope;