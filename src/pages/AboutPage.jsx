// src/pages/AboutPage.jsx
// (Content as provided in the previous "FRESH & COMPLETE - Batch 5 of 8" for Page Components)
// This file should already be complete from that batch.
import React from 'react';
import { Link } from 'react-router-dom'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faLightbulb } from '@fortawesome/free-solid-svg-icons';

const AboutPage = () => {
  return (
    <div className="py-10 sm:py-12 px-4 max-w-4xl mx-auto text-gray-200">
      <header className="text-center mb-10">
        <FontAwesomeIcon icon={faInfoCircle} className="text-5xl text-brand-accent mb-4" />
        <h1 className="text-4xl sm:text-5xl font-orbitron text-gray-100 mb-3">About SĒQsync</h1>
        <p className="text-lg text-gray-400">Unifying Movement, Rhythm, and Technology.</p>
      </header>
      <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl space-y-6 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-brand-accent mb-3">Our Mission</h2>
          <p>SĒQsync is dedicated to revolutionizing how human movement is understood, created, shared, and protected. We provide a universal framework, powered by the poSĒQr™ Biomechanical Notation System, to bridge the gap between physical expression and digital representation.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-brand-accent mb-3">What is poSĒQr™?</h2>
          <p>The poSĒQr™ (Pose Sequencer) system is a standardized symbolic language capable of capturing rotational and positional movement across three-dimensional coordinates, time-based subdivisions, and joint-specific operations. It's designed for choreographers, athletes, coaches, therapists, roboticists, and game developers to precisely sequence and synchronize movement with music, rhythm, and spatial intent.</p>
          <p className="mt-2">Each notation captures precise joint positioning, strike logic, rotational force vectors, grounding, weight distribution, and temporal transitions, enabling a new level of detail in movement analysis and creation.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-brand-accent mb-3">Key Features</h2>
          <ul className="list-disc list-outside space-y-2 pl-5 text-gray-300">
            <li><span className="font-semibold">Universal Notation:</span> A comprehensive symbolic language for any human movement.</li>
            <li><span className="font-semibold">Rhythmic Synchronization:</span> Align movements precisely with musical beats and measures.</li>
            <li><span className="font-semibold">Biomechanical Depth:</span> Capture core dynamics, energy flow, and rotational intent.</li>
            <li><span className="font-semibold">IP Protection:</span> A framework for documenting and registering movement sequences for creators.</li>
            <li><span className="font-semibold">Versatile Application:</span> From dance choreography and combat sports training to physical rehabilitation and avatar animation.</li>
          </ul>
        </section>
        <section className="text-center mt-8">
            <FontAwesomeIcon icon={faLightbulb} className="text-3xl text-yellow-400 mb-3"/>
            <p className="text-gray-400 italic">SĒQsync: Define the rhythm of innovation.</p>
        </section>
      </div>
    </div>
  );
};
export default AboutPage;