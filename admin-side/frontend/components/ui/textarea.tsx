import React from "react";

// Forward ref allows you to pass refs from parent components (optional but good practice)
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={
          `block w-full rounded-md border border-gray-300 bg-white p-2 text-sm 
          dark:bg-input/30
          outline-0
          border-input
          focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
          shadow-sm placeholder-gray-400 
          focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ` +
          (className || "")
        }
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
