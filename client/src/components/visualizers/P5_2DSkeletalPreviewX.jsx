import React from 'react';
import PropTypes from 'prop-types';
import { ReactP5Wrapper } from 'react-p5-wrapper';

function sketch(p5) {
  let poseData = null;
  let highlightJoint = null;
  let isMirrored = false;

  const connections = [
    ['LS', 'RS'], ['LS', 'LE'], ['LE', 'LW'], ['RS', 'RE'], ['RE', 'RW'],
    ['LS', 'LH'], ['RS', 'RH'], ['LH', 'RH'], ['LH', 'LK'], ['LK', 'LA'],
    ['RH', 'RK'], ['RK', 'RA']
  ];

  p5.updateWithProps = props => {
    if (props.poseData) {
      poseData = props.poseData;
    }
    if (props.highlightJoint !== undefined) {
      highlightJoint = props.highlightJoint;
    }
    if (props.isMirrored !== undefined) {
        isMirrored = props.isMirrored;
    }
  };

  p5.setup = () => {
    p5.createCanvas(640, 360);
    p5.noLoop();
    // A one-time redraw to show initial state if data is present
    if (poseData) p5.redraw();
  };
  
  // A separate function to handle redraws, called by updateWithProps
  p5.onPropsChange = () => {
      p5.redraw();
  };

  p5.draw = () => {
    p5.clear();
    if (!poseData || !poseData.jointInfo) return;

    const jointInfo = poseData.jointInfo;
    const width = p5.width;
    const height = p5.height;
    
    const getCoords = (vector) => {
        const x = (vector.x + 1) / 2 * width;
        const y = (-vector.y + 1) / 2 * height;
        return { x, y };
    };

    // Draw bones
    p5.stroke(255, 255, 255, 150);
    p5.strokeWeight(3);
    connections.forEach(([startKey, endKey]) => {
      const startJoint = jointInfo[startKey];
      const endJoint = jointInfo[endKey];
      if (startJoint?.vector && endJoint?.vector) {
        const { x: startX, y: startY } = getCoords(startJoint.vector);
        const { x: endX, y: endY } = getCoords(endJoint.vector);
        p5.line(startX, startY, endX, endY);
      }
    });

    // Draw joints with depth and highlight logic
    for (const key in jointInfo) {
      const joint = jointInfo[key];
      if (joint?.vector) {
        const { x, y } = getCoords(joint.vector);
        
        const isActive = key === highlightJoint;
        const zDisplacement = joint.gridMovement?.z || 0;
        
        // Define base and active sizes
        let baseRadius = 8;
        if (zDisplacement === 1) baseRadius = 12;
        else if (zDisplacement === -1) baseRadius = 4;
        
        const finalRadius = isActive ? baseRadius * 1.5 : baseRadius;

        // Define base and active colors
        const orientation = joint.orientation || 'NEU';
        let baseColor = p5.color(0, 255, 255, 200); // Cyan for neutral
        if (orientation === 'IN') baseColor = p5.color(255, 100, 100, 220); // Red for IN
        else if (orientation === 'OUT') baseColor = p5.color(100, 150, 255, 220); // Blue for OUT
        
        const finalColor = isActive ? p5.color(255, 255, 0, 255) : baseColor; // Yellow for active
        
        p5.stroke(finalColor);
        p5.strokeWeight(finalRadius);
        p5.point(x, y);
      }
    }
  };
}

const P5_2DSkeletalPreview = ({ poseData, highlightJoint, isMirrored }) => {
    // This component now just passes the props to the sketch.
    return <ReactP5Wrapper 
        sketch={sketch} 
        poseData={poseData} 
        highlightJoint={highlightJoint}
        isMirrored={isMirrored}
    />;
};

P5_2DSkeletalPreview.propTypes = {
    poseData: PropTypes.object,
    highlightJoint: PropTypes.string,
    isMirrored: PropTypes.bool,
};

export default React.memo(P5_2DSkeletalPreview);