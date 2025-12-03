import React from 'react';

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface TimelineProps {
  activities: Activity[];
  title?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ activities, title = 'Actividad Reciente' }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Hace ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays}d`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
        ) : (
          activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                {index < activities.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 mt-1" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
                {activity.user && (
                  <p className="text-xs text-gray-500 mt-1">por {activity.user}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
