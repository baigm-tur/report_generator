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
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === "textarea" ? (
        <textarea
          id={name}
          rows={rows}
          placeholder={placeholder}
          {...register(name)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            hasError ? "border-red-500" : "border-gray-300"
          }`}
        />
      ) : type === "checkbox" ? (
        <div className="flex items-center">
          <input
            id={name}
            type="checkbox"
            {...register(name)}
            className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
              hasError ? "border-red-500" : ""
            }`}
          />
        </div>
      ) : type === "number" ? (
        <input
          id={name}
          type="number"
          placeholder={placeholder}
          min={min}
          max={max}
          {...register(name)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            hasError ? "border-red-500" : "border-gray-300"
          }`}
        />
      ) : (
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          {...register(name)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            hasError ? "border-red-500" : "border-gray-300"
          }`}
        />
      )}
      
      {hasError && (
        <p className="mt-1 text-xs text-red-600">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
}

export default FormField; 