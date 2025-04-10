"use client";

import { useFormContext } from "react-hook-form";

interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  rows?: number;
  min?: string;
  max?: string;
}

export function FormField({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  rows = 3,
  min,
  max,
}: FormFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  const hasError = Boolean(errors[name]);

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
        {label}
        {required && <span className="text-destructive text-sm">*</span>}
      </label>
      
      {type === "textarea" ? (
        <textarea
          id={name}
          rows={rows}
          placeholder={placeholder}
          {...register(name)}
          className={`w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors text-sm
            ${hasError 
              ? "border-destructive bg-destructive/5 focus:border-destructive" 
              : "border-input bg-card hover:border-muted-foreground/50 focus:border-primary"
            }`}
        />
      ) : type === "checkbox" ? (
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <input
              id={name}
              type="checkbox"
              {...register(name)}
              className={`h-4 w-4 rounded border text-primary focus:ring-primary/30 transition-colors 
                ${hasError 
                  ? "border-destructive" 
                  : "border-input"
                }`}
            />
          </div>
          <label htmlFor={name} className="text-sm text-muted-foreground cursor-pointer">
            {placeholder}
          </label>
        </div>
      ) : type === "number" ? (
        <div className="relative">
          <input
            id={name}
            type="number"
            placeholder={placeholder}
            min={min}
            max={max}
            {...register(name)}
            className={`w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors text-sm
              ${hasError 
                ? "border-destructive bg-destructive/5 focus:border-destructive" 
                : "border-input bg-card hover:border-muted-foreground/50 focus:border-primary"
              }`}
          />
        </div>
      ) : (
        <div className="relative">
          <input
            id={name}
            type={type}
            placeholder={placeholder}
            {...register(name)}
            className={`w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors text-sm
              ${hasError 
                ? "border-destructive bg-destructive/5 focus:border-destructive" 
                : "border-input bg-card hover:border-muted-foreground/50 focus:border-primary"
              }`}
          />
        </div>
      )}
      
      {hasError && (
        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
}

export default FormField; 