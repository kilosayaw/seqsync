const BeatDataRenderer = ({ currentBeatData }) => {
  if (!currentBeatData) return <div className="text-gray-500">No data for current beat</div>;

  return (
    <div className="mt-4 p-2 bg-gray-800 rounded">
      <h3 className="font-bold">Live Beat Info</h3>
      <pre className="text-xs">{JSON.stringify(currentBeatData, null, 2)}</pre>
    </div>
  );
};

export default BeatDataRenderer;
