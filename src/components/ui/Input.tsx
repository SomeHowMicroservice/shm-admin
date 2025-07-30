"use client";

import { forwardRef, ReactNode, InputHTMLAttributes, useId } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/config/utils";
import { useFormContext } from "react-hook-form";

const inputVariants = cva(
  "w-full py-3 text-dark-800 placeholder-dark-400 outline-none disabled:pointer-events-none disabled:cursor-none disabled:opacity-70",
  {
    variants: {
      variant: {
        outlined:
          "border px-3 rounded-[10px] focus-visible:border-primary border-dark-300 focus-outline:border-primary hover:border-primary",
        standard:
          "border-b-[1px] border-b-dark-300  py-2 focus:border-b-primary hover:border-b-primary focus-outline:border-b-primary ",
        filled: "px-3 shadow-md rounded-[10px]",
      },
    },
    defaultVariants: {
      variant: "outlined",
    },
  }
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const InputElement = forwardRef<HTMLInputElement, InputProps>(
  ({ variant, className, icon, ...props }, ref) => (
    <div className="w-full relative">
      <input
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
      {icon && (
        <div
          className={cn(
            "absolute left-3 top-[50%] translate-y-[-50%]",
            variant === "standard" && "right-0"
          )}
        >
          {icon}
        </div>
      )}
    </div>
  )
);

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, variant = "outlined", name, ...props }, ref) => {
    const form = useFormContext();
    const inputId = useId();

    if (form && name) {
      return (
        <InputElement
          variant={variant}
          className={className}
          ref={ref}
          id={inputId}
          name={name}
          error={error}
          {...props}
        />
      );
    }

    return (
      <InputElement
        variant={variant}
        className={className}
        ref={ref}
        id={inputId}
        name={name}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
InputElement.displayName = "InputElement";

export default Input;
