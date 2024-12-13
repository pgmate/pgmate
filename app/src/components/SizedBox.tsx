import React, { useEffect, useRef, useState } from "react";

interface SizedBoxProps {
  children: (size: { width: number; height: number }) => React.ReactNode;
  onSizeChange?: (size: { width: number; height: number }) => void;
}

export const SizedBox: React.FC<SizedBoxProps> = ({
  children,
  onSizeChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const updateSize = () => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      const newSize = { width: offsetWidth, height: offsetHeight };
      setSize(newSize);

      // Call onSizeChange callback if provided
      if (onSizeChange) {
        onSizeChange(newSize);
      }
    }
  };

  useEffect(() => {
    updateSize();
    const observer = new ResizeObserver(updateSize);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {children(size)}
    </div>
  );
};
