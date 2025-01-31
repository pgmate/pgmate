import React from "react";

interface CoalesceProps {
  element: React.ReactNode;
  fallback?: React.ReactNode | null;
}

export const coalesce = (
  element: React.ReactNode,
  fallback?: React.ReactNode
) => {
  if (!element) return fallback;

  // Ensure element is a valid React element before checking type
  if (React.isValidElement(element) && typeof element.type === "function") {
    const rendered = (element.type as Function)(); // Call functional component
    return rendered === null ? fallback : element;
  }

  return element;
};

export const Coalesce: React.FC<CoalesceProps> = ({
  element,
  fallback = null,
}) => coalesce(element, fallback);
