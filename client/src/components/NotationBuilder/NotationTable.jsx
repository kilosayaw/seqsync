import React from 'react';

const NotationTable = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-200 text-sm">
          <tr>
            <th className="px-2 py-1 border">Timecode</th>
            <th className="px-2 py-1 border">Joint</th>
            <th className="px-2 py-1 border">Rotation</th>
            <th className="px-2 py-1 border">Vector</th>
            <th className="px-2 py-1 border">Ground</th>
            <th className="px-2 py-1 border">Intent</th>
            <th className="px-2 py-1 border">Energy</th>
            <th className="px-2 py-1 border">Created</th>
          </tr>
        </thead>
        <tbody className="text-xs">
          {data.map((n) => (
            <tr key={n.id} className="text-center">
              <td className="border px-2">{n.timecode}</td>
              <td className="border px-2">{n.joint}</td>
              <td className="border px-2">{n.rotation}</td>
              <td className="border px-2">[{n.vector_x},{n.vector_y},{n.vector_z}]</td>
              <td className="border px-2">{n.ground_point}</td>
              <td className="border px-2">{n.intent}</td>
              <td className="border px-2">{n.energy}</td>
              <td className="border px-2 whitespace-nowrap">{new Date(n.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NotationTable;
