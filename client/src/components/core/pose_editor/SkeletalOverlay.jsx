import React from 'react';
import PropTypes from 'prop-types';
import { ReactP5Wrapper } from 'react-p5-wrapper';

function sketch(p5) {
  let poseData = null;
  let highlightJoint = null;

  const connections = [
    ['LS', 'RS'], ['LS', 'LE'], ['LE', 'LW'], ['RS', 'RE'], ['RE', 'RW'],
    ['LS', 'LH'], ['RS', 'RH'], ['LH', 'RH'], ['LH', 'LK'], ['LK', 'LA'],
    ['RH', 'RK'], ['RK', 'RA']
  ];

  p5.updateWithProps = props => {
    if (props.poseData !== poseData || props.highlightJoint !== highlightJoint) {
      poseData = props.poseData;
      highlightJoint = props.highlightJoint;
      if (p5._setupDone) p5.redraw();
    }
  };

  p5.setup = () => {
    p5.createCanvas(640, 360);
    p5.noLoop();
  };

  p5.draw = () => {
    p5.clear();
    if (!poseData?.jointInfo) return;

    const jointInfo = poseData.jointInfo;
    const getCoords = (vector) => ({
        x: (vector.x + 1) / 2 * p5.width,
        y: (-vector.y + 1) / 2 * p5.height,
    });
    
    // Draw bones
    p5.stroke(255, 255, 255, 120);
    p5.strokeWeight(2);
    connections.forEach(([startKey, endKey]) => {
      const startJoint = jointInfo[startKey];
      const endJoint = jointInfo[endKey];
      if (startJoint?.vector && endJoint?.vector) {
        const { x: startX, y: startY } = getCoords(startJoint.vector);
        const { x: endX, y: endY } = getCoords(endJoint.vector);
        p5.line(startX, startY, endX, endY);
      }
    });

    // Draw joints
    for (const key in jointInfo) {
      const joint = jointInfo[key];
      if (joint?.vector) {
        const { x, y } = getCoords(joint.vector);
        const isActive = key === highlightJoint;
        const radius = isActive ? 12 : 8;
        const color = isActive ? p5.color(255, 255, 0) : p5.color(0, 255, 255);
        p5.noStroke();
        p5.fill(color);
        p5.ellipse(x, y, radius, radius);
      }
    }
  };
}

const SkeletalOverlay = ({ poseData, highlightJoint }) => {
    return <ReactP5Wrapper sketch={sketch} poseData={poseData} highlightJoint={highlightJoint} />;
};

SkeletalOverlay.propTypes = {
    poseData: PropTypes.object,
    highlightJoint: PropTypes.string,
};

export default React.memo(SkeletalOverlay);