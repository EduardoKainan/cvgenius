
import React from 'react';
import { Check } from 'lucide-react';

interface Props {
  currentStep: number;
}

const steps = ["Entrada", "Edição", "Foto", "Exportação"];

const StepIndicator: React.FC<Props> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto mb-12">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = currentStep === stepNum;
        const isCompleted = currentStep > stepNum;

        return (
          <div key={label} className="flex flex-col items-center flex-1 relative">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
              ${isActive ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 
                isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                'border-slate-200 bg-white text-slate-400'}
            `}>
              {isCompleted ? <Check size={20} /> : stepNum}
            </div>
            <span className={`text-xs mt-2 font-medium ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
              {label}
            </span>
            {idx < steps.length - 1 && (
              <div className={`absolute left-1/2 top-5 w-full h-[2px] -z-0 ${isCompleted ? 'bg-green-500' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
