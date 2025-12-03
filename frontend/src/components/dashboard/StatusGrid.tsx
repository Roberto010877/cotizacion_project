import React from 'react';

interface StatusItem {
  label: string;
  value: number;
  color: string;
  estado: string;
}

interface StatusGridProps {
  items: StatusItem[];
  onFilter?: (estado: string) => void;
}

export const StatusGrid: React.FC<StatusGridProps> = ({ items, onFilter }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map((item) => (
        <div
          key={item.estado}
          onClick={() => onFilter?.(item.estado)}
          className={`bg-white rounded-lg shadow p-4 ${
            onFilter ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${item.color}`}
            >
              <span className="text-2xl font-bold text-white">{item.value}</span>
            </div>
            <p className="text-sm font-medium text-gray-700">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
