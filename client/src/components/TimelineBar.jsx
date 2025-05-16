const TimelineBar = ({ beatData, activeBeat }) => (
  <div className="flex space-x-1 mb-4">
    {beatData.map((beat, i) => (
      <div
        key={i}
        className={`w-8 h-8 rounded ${i === activeBeat ? 'border-4 border-green-500' : ''}`}
        style={{ backgroundColor: getEnergyColor(beat?.energy) || '#333' }}
      />
    ))}
  </div>
);

const getEnergyColor = (energy) => {
  if (!energy) return null;
  return {
    'Light': 'rgba(0,255,0,0.33)',
    'Medium': 'rgba(0,255,0,0.66)',
    'Strong': 'rgba(0,255,0,1)',
  }[energy];
};

export default TimelineBar;
