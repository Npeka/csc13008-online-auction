import React from "react";

/**
 * FormMessage
 * Displays a success or error message.
 */
export const FormMessage: React.FC<{
  type: "success" | "error";
  text: string;
}> = ({ type, text }) => {
  const bgClass =
    type === "success"
      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
  return <div className={`rounded-lg p-3 text-sm ${bgClass}`}>{text}</div>;
};
