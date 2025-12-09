import { cn } from "@/lib/utils";

type Step = {
  id: string;
  label: string;
};

type StatusStepperProps = {
  steps: Step[];
  currentStatus: string;
  className?: string;
};

export const StatusStepper = ({ steps, currentStatus, className }: StatusStepperProps) => {
  const currentIndex = steps.findIndex(step => step.id === currentStatus);

  // Si el estado actual no se encuentra, no renderizar nada o mostrar un error.
  // Aquí optamos por no renderizar nada.
  if (currentIndex === -1) {
    return null;
  }

  return (
    <div className={cn("w-full overflow-x-auto py-2", className)}>
      <div className="flex items-center justify-between min-w-max">
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isLastStep = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Círculo y etiqueta del paso */}
              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isCompleted ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-100 border-gray-300",
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold text-gray-500">{index + 1}</span>
                  )}
                </div>
                <p className={cn(
                    "text-xs mt-2 w-20 truncate",
                    isCompleted ? "font-semibold text-blue-700" : "text-gray-500"
                )}>
                  {step.label}
                </p>
              </div>

              {/* Línea de conexión */}
              {!isLastStep && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 transition-colors duration-300",
                    isCompleted ? "bg-blue-600" : "bg-gray-300"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};