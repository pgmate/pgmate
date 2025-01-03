import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useStorage } from "hooks/use-storage";

interface SplitPaneProps {
  storageKey?: string;
  initialSize?: number;
  onSizeChange?: (newSize: number) => void;
  direction?: "vertical" | "horizontal";
  children: React.ReactNode;
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  storageKey,
  initialSize = 50,
  onSizeChange,
  direction = "vertical",
  children,
}) => {
  const storage = useStorage();
  const [currentSize, setCurrentSize] = useState(
    storageKey
      ? storage.getItem(`SplitPane.${storageKey}.size`) || initialSize
      : initialSize
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const isVertical = direction === "vertical";

  const containerStyle = {
    display: "flex",
    flexDirection: isVertical ? "column" : "row",
    height: "100%",
    width: "100%",
  };
  const box1Style = {
    flex: `${currentSize} 1 0%`,
    display: "flex",
    flexDirection: "column",
  };
  const box2Style = {
    flex: `${100 - currentSize} 1 0%`,
    display: "flex",
    flexDirection: "column",
  };
  const dividerStyle = {
    cursor: isVertical ? "row-resize" : "col-resize",
    backgroundColor: "gray",
    [isVertical ? "height" : "width"]: "5px",
    zIndex: 1,
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const offset = isVertical
      ? e.clientY - containerRect.top
      : e.clientX - containerRect.left;

    const newSize = Math.min(
      99, // Avoid exceeding 100%
      Math.max(
        1, // Avoid dropping below 0%
        (offset / (isVertical ? containerRect.height : containerRect.width)) *
          100
      )
    );

    setCurrentSize(newSize);
    onSizeChange?.(newSize);
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      document.body.style.userSelect = ""; // Re-enable text selection
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseDown = () => {
    isDraggingRef.current = true;
    document.body.style.userSelect = "none"; // Prevent text selection
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const [firstChild, secondChild] = React.Children.toArray(children);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const foo = setTimeout(() => {
      if (storageKey) {
        storage.setItem(`SplitPane.${storageKey}.size`, currentSize);
      }
    }, 250);

    return () => clearTimeout(foo);
  }, [currentSize]);

  return (
    <Box ref={containerRef} sx={containerStyle}>
      {/* First Box */}
      <Box sx={box1Style}>{firstChild}</Box>

      {/* Draggable Divider */}
      {secondChild && <Box sx={dividerStyle} onMouseDown={handleMouseDown} />}

      {/* Second Box */}
      {secondChild && <Box sx={box2Style}>{secondChild}</Box>}
    </Box>
  );
};
