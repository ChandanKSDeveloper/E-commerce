import React from 'react';
import { Check, MapPin, ClipboardList, CreditCard } from 'lucide-react';

const steps = [
    { label: "Shipping", icon: MapPin },
    { label: "Confirm Order", icon: ClipboardList },
    { label: "Payment", icon: CreditCard },
];

export default function CheckoutSteps({ activeStep }) {
    return (
        <div className="flex items-center justify-center w-full max-w-2xl mx-auto py-8 px-4">
            {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < activeStep;
                const isActive = index === activeStep;

                return (
                    <div key={step.label} className="flex items-center flex-1 last:flex-none">
                        {/* Step circle */}
                        <div className="flex flex-col items-center">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center
                                transition-all duration-300 text-sm font-semibold
                                ${isCompleted
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                    : isActive
                                        ? 'bg-primary text-white ring-4 ring-primary/20 shadow-lg'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                }
                            `}>
                                {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                            </div>
                            <span className={`
                                mt-2 text-xs font-medium whitespace-nowrap
                                ${isCompleted ? 'text-green-600 dark:text-green-400'
                                    : isActive ? 'text-primary font-semibold'
                                        : 'text-gray-400 dark:text-gray-500'}
                            `}>
                                {step.label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div className={`
                                flex-1 h-0.5 mx-2 mb-6 transition-all duration-300
                                ${index < activeStep
                                    ? 'bg-green-500'
                                    : 'bg-gray-200 dark:bg-gray-700'}
                            `} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
