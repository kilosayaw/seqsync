import React from 'react';
import { ReactP5Wrapper } from 'react-p5-wrapper';
import PropTypes from 'prop-types';

// Using a simpler, more direct sketch function that relies on props.
const sketch = (p5) => {
  let poseData = null;
  let isMirrored = false;

  p5.setup = () => {
    p5.createCanvas(640, 360);
  };
  
  // This is called by the wrapper whenever props change
  p5.updateWithProps = (props) => {
    if (props.poseData) {
        poseData = props.poseData;
    }
    if (props.isMirrored !== undefined) {
        isMirrored = props.isMirrored;
    }
  };

  p5.draw = () => {
    p5.clear();
    if (!poseData || !poseData.jointInfo) return;

    const jointInfo = poseData.jointInfo;
    const width = p5.width;
    const height = p5.height;
    
    const connections = [
        ['LS', 'RS'], ['LS', 'LE'], ['LE', 'LW'], ['RS', 'RE'], ['RE', 'RW'],
        ['LS', 'LH'], ['RS', 'RH'], ['LH', 'RH'], ['LH', 'LK'], ['LK', 'LA'],
        ['RH', 'RK'], ['RK', 'RA']
    ];
    
    const getCoords = (vector) => ({
        x: (vector.x + 1) / 2 * width,
        y: (-vector.y + 1) / 2 * height
    });

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

    // Draw joints with depth sizing
    for (const key in jointInfo) {
      const joint = jointInfo[key];
      if (joint?.vector) {
        const { x, y } = getCoords(joint.vector);
        const zDisplacement = joint.zDisplacement || 0;
        let radius = 8; // Neutral (0Z)

        if (zDisplacement === 1) radius = 12; // Forward (+1Z)
        else if (zDisplacement === -1) radius = 4; // Backward (-1Z)
        
        p5.stroke(0, 255, 255, 200);
        p5.strokeWeight(radius);
        p5.point(x, y);
      }
    }
  };
};

const P5_2DSkeletalPreview = ({ poseData, isMirrored }) => {
  return <ReactP5Wrapper sketch={sketch} poseData={poseData} isMirrored={isMirrored} />;
};

P5_2DSkeletalPreview.propTypes = {
  poseData: PropTypes.object,
  isMirrored: PropTypes.bool,
};

export default React.memo(P5_2DSkeletalPreview);