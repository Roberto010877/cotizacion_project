import { cn } from "@/lib/utils";

interface StatusTimelineProps {
  statuses: readonly string[];
  currentStatus: string;
  statusTranslations: Record<string, string>;
}

export function StatusTimeline({ statuses, currentStatus, statusTranslations }: StatusTimelineProps) {
  const currentIndex = statuses.indexOf(currentStatus);

  if (currentIndex === -1) {
    // Si el estado actual no está en la lista, no mostrar nada o un fallback
    return null;
  }

  return (
    <div className="w-full px-4 sm:px-0">
      <div className="flex items-center justify-between">
        {statuses.map((status, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={status} className="flex-1 flex items-center last:flex-none">
              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border-2",
                    isActive ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-200 border-gray-300",
                    isCurrent && "ring-4 ring-blue-200"
                  )}
                >
                  <span className="text-xs font-bold">{index + 1}</span>
                </div>
                <p
                  className={cn(
                    "text-xs mt-2 w-20 truncate",
                    isActive ? "font-semibold text-gray-800" : "text-gray-500",
                    isCurrent && "text-blue-600"
                  )}
                >
                  {statusTranslations[status] || status}
                </p>
              </div>

              {/* Connector Line */}
              {index < statuses.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2",
                    isActive ? "bg-blue-600" : "bg-gray-300"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}