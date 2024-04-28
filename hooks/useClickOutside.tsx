import { useRef, useEffect } from "react";

const useClickOutside = <T extends HTMLElement>(callback: () => void) => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    window.addEventListener("mousedown", (e) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    });
  }, []);

  return ref;
};

export default useClickOutside;
