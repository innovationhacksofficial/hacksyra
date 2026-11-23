"use client";

import { forwardRef, useId, type ReactNode } from "react";

export type FieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
};

export function Field({ label, hint, error, required, htmlFor, className = "", children }: FieldProps) {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="label flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-red-500" aria-hidden>*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, leftAdornment, rightAdornment, className = "", id, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const descId = error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="form-field">
      {label && (
        <label htmlFor={inputId} className="label flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-red-500" aria-hidden>*</span>}
        </label>
      )}
      <div className="relative">
        {leftAdornment && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {leftAdornment}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={descId}
          required={required}
          className={`input ${leftAdornment ? "pl-10" : ""} ${rightAdornment ? "pr-10" : ""} ${error ? "input-error" : ""} ${className}`}
          {...rest}
        />
        {rightAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightAdornment}</div>
        )}
      </div>
      {error ? (
        <p id={descId} className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={descId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, className = "", id, rows = 4, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const descId = error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="form-field">
      {label && (
        <label htmlFor={inputId} className="label flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-red-500" aria-hidden>*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={descId}
        required={required}
        className={`input min-h-[100px] resize-y ${error ? "input-error" : ""} ${className}`}
        {...rest}
      />
      {error ? (
        <p id={descId} className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={descId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, required, className = "", id, children, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const descId = error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="form-field">
      {label && (
        <label htmlFor={inputId} className="label flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-red-500" aria-hidden>*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={descId}
        required={required}
        className={`input ${error ? "input-error" : ""} ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error ? (
        <p id={descId} className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={descId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

