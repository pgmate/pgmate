import { useEffect, useState, useRef } from "react";

export const useBecomeVisible = (): [
  boolean,
  React.RefObject<HTMLDivElement>
] => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once the element is visible, you can disconnect the observer
          observer.disconnect();
        }
      },
      {
        threshold: 0.1, // 10% of the component needs to be visible for it to trigger
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return [isVisible, elementRef];
};
