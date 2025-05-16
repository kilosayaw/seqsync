import React from 'react';

const ExportBar = ({ data }) => {
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'notations.json';
    link.click();
  };

  const exportCSV = () => {
    const csvRows = [];
    const headers = ['Timecode', 'Joint', 'Rotation', 'VectorX', 'VectorY', 'VectorZ', 'Ground', 'Intent', 'Energy', 'Created'];
    csvRows.push(headers.join(','));

    data.forEach((n) => {
      const row = [
        n.timecode,
        n.joint,
        n.rotation,
        n.vector_x,
        n.vector_y,
        n.vector_z,
        n.ground_point,
        n.intent,
        n.energy,
        new Date(n.created_at).toISOString()
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'notations.csv';
    link.click();
  };

  return (
    <div className="flex justify-end gap-2 mb-4">
      <button onClick={exportJSON} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
        Export JSON
      </button>
      <button onClick={exportCSV} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
        Export CSV
      </button>
    </div>
  );
};

export default ExportBar;
