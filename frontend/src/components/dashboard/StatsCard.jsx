import React from 'react';

const StatsCard = ({ title, value, icon, secondary }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center">
      <div className="w-12 h-12 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red mr-4 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {secondary && <p className="text-xs text-brand-red font-medium mt-1">{secondary}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
