import { RefObject, useEffect, useState } from "react";

/**
 * True while `target` is within `margin` of the visible part of the scroll container `root`.
 * Used to render PDF pages and thumbnails only when they are about to be seen.
 */
const useNearViewport = (
  target: RefObject<Element>,
  root: RefObject<Element>,
  margin = "800px 0px"
) => {
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const el = target.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsNear(entry.isIntersecting),
      { root: root.current, rootMargin: margin, threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, root, margin]);

  return isNear;
};

export default useNearViewport;
