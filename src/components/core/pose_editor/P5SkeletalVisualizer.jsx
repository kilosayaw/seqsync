import React, { useRef, useEffect } from 'react';
import p5 from 'p5';
import PropTypes from 'prop-types';

const P5SkeletalVisualizer = ({ poseData, analysisData, mode = '2D', isMirrored = false, highlightJoint = null }) => {
    const sketchRef = useRef();
    const p5InstanceRef = useRef(null); // Ref to hold the p5 instance

    // --- SETUP EFFECT: Runs only ONCE when the component mounts ---
    useEffect(() => {
        const sketch = (p) => {
            p.setup = () => {
                p.createCanvas(400, 300);
                p.noLoop(); // We will manually call redraw when props change
            };

            // This function will be called from our update effect
            p.updateWithProps = (props) => {
                p.redraw();
            };

            p.draw = () => {
                if (!sketchRef.current) return;
                p.resizeCanvas(sketchRef.current.offsetWidth, sketchRef.current.offsetHeight);
                p.clear();
                p.background(15, 23, 42);

                if (!poseData?.jointInfo) return;

                p.translate(p.width / 2, p.height / 2);
                if (isMirrored) p.scale(-1, 1);
                p.scale(1, -1);
                p.scale(p.height / 2.5);

                const { jointInfo } = poseData;
                const connections = [
                    ['LS', 'RS'], ['LS', 'LE'], ['LE', 'LW'], ['RS', 'RE'], ['RE', 'RW'],
                    ['LS', 'LH'], ['RS', 'RH'], ['LH', 'RH'], ['LH', 'LK'], ['LK', 'LA'],
                    ['RH', 'RK'], ['RK', 'RA']
                ];

                // Draw Base of Support
                if (analysisData?.baseOfSupport) {
                    const bos = analysisData.baseOfSupport;
                    p.stroke('rgba(0, 100, 255, 0.5)');
                    p.fill('rgba(0, 100, 255, 0.1)');
                    p.beginShape();
                    bos.forEach(point => p.vertex(point.x, point.y));
                    p.endShape(p.CLOSE);
                }

                // Draw skeleton lines
                p.stroke(255, 255, 255, 100);
                p.strokeWeight(2 / (p.height / 2.5));
                connections.forEach(([startKey, endKey]) => {
                    const p1 = jointInfo[startKey]?.vector;
                    const p2 = jointInfo[endKey]?.vector;
                    if (p1 && p2) p.line(p1.x, p1.y, p2.x, p2.y);
                });

                // Draw Joints with dynamic colors
                p.strokeWeight(6 / (p.height / 2.5));
                for (const key in jointInfo) {
                    const pVec = jointInfo[key]?.vector;
                    if (pVec) {
                        let jointColor = '#facc15'; // Default
                        if (key === highlightJoint) jointColor = '#f87171'; // Selected
                        else if (key === analysisData?.driver) jointColor = '#f97316'; // Driver
                        else if (analysisData?.rotations?.[key] === 'IN') jointColor = '#38bdf8'; // IN
                        else if (analysisData?.rotations?.[key] === 'OUT') jointColor = '#fb923c'; // OUT
                        
                        p.stroke(jointColor);
                        p.point(pVec.x, pVec.y);
                    }
                }

                // Draw Center of Mass
                if (analysisData?.centerOfMass) {
                    const com = analysisData.centerOfMass;
                    p.noStroke();
                    p.fill(analysisData.stability > 50 ? 'rgba(0, 255, 150, 0.8)' : 'rgba(255, 100, 0, 0.8)');
                    p.ellipse(com.x, com.y, 0.05, 0.05);
                }
            };
        };
        
        // Create the p5 instance and store it in the ref
        p5InstanceRef.current = new p5(sketch, sketchRef.current);

        // Cleanup function to remove the p5 instance when the component unmounts
        return () => {
            p5InstanceRef.current.remove();
        };
    }, []); // Empty dependency array means this runs only once

    // --- UPDATE EFFECT: Runs whenever props change ---
    useEffect(() => {
        // If the p5 instance exists, just pass the new props to it to trigger a redraw.
        if (p5InstanceRef.current) {
            p5InstanceRef.current.updateWithProps({ poseData, analysisData, mode, isMirrored, highlightJoint });
        }
    }, [poseData, analysisData, mode, isMirrored, highlightJoint]);

    return <div ref={sketchRef} style={{ width: '100%', height: '100%' }} />;
};

P5SkeletalVisualizer.propTypes = {
    poseData: PropTypes.object,
    analysisData: PropTypes.object,
    mode: PropTypes.oneOf(['2D', '3D']),
    isMirrored: PropTypes.bool,
    highlightJoint: PropTypes.string,
};

export default React.memo(P5SkeletalVisualizer);