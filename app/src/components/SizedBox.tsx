import React, { useEffect, useRef, useState } from "react";

interface SizedBoxProps {
  children: (size: { width: number; height: number }) => React.ReactNode;
  delay?: number;
  onSizeChange?: (size: { width: number; height: number }) => void;
}

export const SizedBox: React.FC<SizedBoxProps> = ({
  children,
  delay = 0,
  onSizeChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, isReady] = useState(delay > 0 ? false : true);
  const [size, setSize] = useState<null | { width: number; height: number }>(
    null
  );

  const updateSize = () => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      const newSize = { width: offsetWidth, height: offsetHeight };
      // console.log("updateSize", newSize);
      setSize(newSize);

      // Call onSizeChange callback if provided
      if (onSizeChange) {
        onSizeChange(newSize);
      }
    }
  };

  useEffect(() => {
    // updateSize();
    const observer = new ResizeObserver(updateSize);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (delay > 0) {
      const timeout = setTimeout(() => {
        isReady(true);
      }, delay);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [delay]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {ready && size && children(size)}
    </div>
  );
};
