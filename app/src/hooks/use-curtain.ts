import { useEffect } from "react";

export const useCurtain = (delay = 800) => {
  useEffect(() => {
    const _delay = delay - (Date.now() - window.__START__);
    setTimeout(
      () => {
        const curtain = document.getElementById("curtain");
        curtain && curtain.classList.add("hide-curtain");
      },
      _delay > 0 ? _delay : 0
    );
  }, []);
};
