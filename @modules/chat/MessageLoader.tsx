import React, { useEffect, useRef } from "react";

// Typing indicator: three quiet dots.
export default function MessageLoader() {
  const dotRefs = [
    useRef<HTMLSpanElement>(null),
    useRef<HTMLSpanElement>(null),
    useRef<HTMLSpanElement>(null),
  ];

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const animations = dotRefs.map((ref, i) =>
      ref.current?.animate(
        [{ opacity: 0.35 }, { opacity: 1 }, { opacity: 0.35 }],
        { duration: 1000, delay: i * 160, iterations: Infinity, easing: "ease-in-out" }
      )
    );

    return () => {
      animations.forEach((anim) => anim?.cancel());
    };
  }, []);

  return (
    <span
      role="status"
      aria-label="Assistant is typing"
      className="self-start inline-flex gap-[5px] py-1.5"
    >
      {[1, 0.6, 0.35].map((opacity, i) => (
        <span
          key={i}
          ref={dotRefs[i]}
          style={{ opacity }}
          className="w-[7px] h-[7px] rounded-full bg-faint"
        />
      ))}
    </span>
  );
}
