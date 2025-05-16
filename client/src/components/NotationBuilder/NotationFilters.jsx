// client/src/components/NotationBuilder/NotationFilters.jsx
import React from 'react';

const NotationFilters = ({ filters, onChange }) => {
  const inputStyle = 'px-2 py-1 border rounded text-sm';
  const labelStyle = 'text-sm font-medium text-gray-700 mr-2';

  return (
    <div className="flex flex-wrap gap-4 items-end mb-4">
      <div>
        <label className={labelStyle}>Joint</label>
        <select
          name="joint"
          value={filters.joint}
          onChange={onChange}
          className={inputStyle}
        >
          <option value="">All</option>
          <option value="LS">LS</option>
          <option value="RS">RS</option>
          <option value="LE">LE</option>
          <option value="RE">RE</option>
          <option value="LW">LW</option>
          <option value="RW">RW</option>
          <option value="LH">LH</option>
          <option value="RH">RH</option>
          <option value="LK">LK</option>
          <option value="RK">RK</option>
          <option value="LA">LA</option>
          <option value="RA">RA</option>
          <option value="LF">LF</option>
          <option value="RF">RF</option>
        </select>
      </div>

      <div>
        <label className={labelStyle}>Intent</label>
        <select
          name="intent"
          value={filters.intent}
          onChange={onChange}
          className={inputStyle}
        >
          <option value="">All</option>
          <option value="Strike">Strike</option>
          <option value="Hold">Hold</option>
          <option value="Flow">Flow</option>
          <option value="Pause">Pause</option>
          <option value="Pass">Pass</option>
          <option value="Land">Land</option>
          <option value="Coil">Coil</option>
          <option value="Launch">Launch</option>
        </select>
      </div>

      <div>
        <label className={labelStyle}>Energy</label>
        <select
          name="energy"
          value={filters.energy}
          onChange={onChange}
          className={inputStyle}
        >
          <option value="">All</option>
          <option value="Light">Light</option>
          <option value="Medium">Medium</option>
          <option value="Strong">Strong</option>
        </select>
      </div>
    </div>
  );
};

export default NotationFilters;
