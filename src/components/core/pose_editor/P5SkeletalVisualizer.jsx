import React from 'react';
import PropTypes from 'prop-types';
import { ReactP5Wrapper } from 'react-p5-wrapper'; // Use the standard wrapper
import { BODY_SEGMENTS, Z_DEPTH_JOINT_SCALES, DEFAULT_JOINT_CIRCLE_RADIUS, POSE_DEFAULT_VECTOR, RIBBON_LIMB_WIDTH } from '../../../utils/constants';
import { calculateLimbPlaneNormal } from '../../../utils/biomechanics';

function sketch(p5) {
  let poseData = {};
  let highlightJoint = null;

  p5.updateWithProps = props => {
    if (props.poseData) {
        // Normalize incoming data, whether it's live or stored
        poseData = props.poseData.jointInfo ? props.poseData.jointInfo : props.poseData;
    }
    if (props.highlightJoint) {
        highlightJoint = props.highlightJoint;
    }
  };

  p5.setup = () => {
    p5.createCanvas(640, 360, p5.WEBGL);
    p5.angleMode(p5.DEGREES);
  };
  
  const drawRibbonLimb = (startPos, endPos, startJoint, endJoint, width, isHighlighted) => {
    const isPassThrough = startJoint.intent === 'PassThrough' || endJoint.intent === 'PassThrough';
    if (isPassThrough) {
        p5.strokeWeight(2);
        p5.drawingContext.setLineDash([5, 5]);
        p5.stroke(isHighlighted ? p5.color(255, 220, 150, 200) : p5.color(200, 220, 255, 150));
        p5.line(startPos.x, startPos.y, startPos.z, endPos.x, endPos.y, endPos.z);
        p5.drawingContext.setLineDash([]);
        return;
    }

    const limbVector = p5.constructor.Vector.sub(endPos, startPos);
    const limbNormalPlain = calculateLimbPlaneNormal(startPos, endPos);
    const limbNormal = p5.createVector(limbNormalPlain.x, limbNormalPlain.y, limbNormalPlain.z);
    const w_half = width / 2;

    const startNormal = limbNormal.copy().rotate(startJoint.rotation || 0, limbVector);
    const endNormal = limbNormal.copy().rotate(endJoint.rotation || 0, limbVector);

    const p1 = p5.constructor.Vector.add(startPos, startNormal.copy().mult(w_half));
    const p2 = p5.constructor.Vector.add(startPos, startNormal.copy().mult(-w_half));
    const p3 = p5.constructor.Vector.add(endPos, endNormal.copy().mult(-w_half));
    const p4 = p5.constructor.Vector.add(endPos, endNormal.copy().mult(w_half));

    p5.noStroke();
    p5.fill(isHighlighted ? p5.color(150, 120, 50, 200) : p5.color(59, 130, 246, 80));
    p5.beginShape();
    p5.vertex(p2.x, p2.y, p2.z); p5.vertex(p1.x, p1.y, p1.z); p5.vertex(p4.x, p4.y, p4.z); p5.vertex(p3.x, p3.y, p3.z);
    p5.endShape(p5.CLOSE);

    p5.fill(isHighlighted ? p5.color(250, 204, 21, 220) : p5.color(147, 197, 253, 150));
    p5.beginShape();
    p5.vertex(p1.x, p1.y, p1.z); p5.vertex(p2.x, p2.y, p2.z); p5.vertex(p3.x, p3.y, p3.z); p5.vertex(p4.x, p4.y, p4.z);
    p5.endShape(p5.CLOSE);
  };
    
  p5.draw = () => {
    p5.clear();
    p5.orbitControl();

    if (!poseData || Object.keys(poseData).length === 0) return;
    
    const spreadFactor = (p5.width + p5.height) / 8;
    const jointPositions = {};
    
    for (const jointAbbrev in poseData) {
        const jointData = poseData[jointAbbrev];
        const vector = jointData?.vector || POSE_DEFAULT_VECTOR;
        jointPositions[jointAbbrev] = p5.createVector(vector.x * spreadFactor, -vector.y * spreadFactor, (vector.z || 0) * spreadFactor);
    }

    BODY_SEGMENTS.forEach((seg) => {
        const p1Data = poseData[seg.from];
        const p2Data = poseData[seg.to];
        if (p1Data && p2Data && jointPositions[seg.from] && jointPositions[seg.to]) {
            const p1Pos = jointPositions[seg.from];
            const p2Pos = jointPositions[seg.to];
            const isHighlighted = highlightJoint === seg.from || highlightJoint === seg.to;
            const startJointWithDefaults = { ...p1Data, rotation: p1Data.rotation || 0 };
            const endJointWithDefaults = { ...p2Data, rotation: p2Data.rotation || 0 };
            drawRibbonLimb(p1Pos, p2Pos, startJointWithDefaults, endJointWithDefaults, RIBBON_LIMB_WIDTH, isHighlighted);
        }
    });

    for (const jointAbbrev in poseData) {
        const jointData = poseData[jointAbbrev];
        const pos = jointPositions[jointAbbrev];
        if (jointData && pos) {
            p5.push();
            p5.translate(pos.x, pos.y, pos.z);
            const isActive = jointAbbrev === highlightJoint;
            const zValue = (jointData.vector ? jointData.vector.z : 0) || 0;
            const zScale = Z_DEPTH_JOINT_SCALES[zValue > 0.1 ? 'FAR' : (zValue < -0.1 ? 'NEAR' : 'NEUTRAL')];
            const radius = DEFAULT_JOINT_CIRCLE_RADIUS * zScale * (isActive ? 1.5 : 1);
            p5.noStroke();
            p5.fill(isActive ? p5.color(250, 204, 21) : p5.color(200, 200, 200));
            p5.sphere(radius);
            p5.pop();
        }
    }
  };
}

const P5SkeletalVisualizer = ({ poseData, highlightJoint, className = "" }) => {
    // Pass all props to the wrapper, which will forward them to the sketch
    return (
        <div className={`w-full h-full ${className}`}>
            <ReactP5Wrapper 
                sketch={sketch} 
                poseData={poseData} 
                highlightJoint={highlightJoint} 
            />
        </div>
    );
};

P5SkeletalVisualizer.propTypes = {
    poseData: PropTypes.object,
    highlightJoint: PropTypes.string,
    className: PropTypes.string,
};

export default React.memo(P5SkeletalVisualizer);