import React, { ElementRef, FC, useEffect, useRef, useState } from "react";
import FloatingChatIcon from "@/icons/FloatingChatIcon";
import { motion } from "framer-motion";

interface Props {
  handleOpenChat: () => void;
}

const ICON_SIZE = 50;
const PADDING = 16;

// interface Props {
//   handleOpenChat: () => void;
// }

// const DocumentChatIcon: FC<Props> = ({ handleOpenChat }) => {
//   return (
//     <div className="fixed bottom-4 right-4 z-[1000] w-[50px] h-[50px]">
//       <button
//         onClick={handleOpenChat}
//         className="bg-purple-500 rounded-full w-full h-full flex items-center justify-center shadow-lg focus:outline-none"
//       >
//         <FloatingChatIcon />
//       </button>
//     </div>
//   );
// };

// export default DocumentChatIcon;

/** might revert to the moveable icon later */

const DocumentChatIcon: FC<Props> = ({ handleOpenChat }) => {
  const hasDragged = useRef(false);
  const ref = useRef<ElementRef<"div">>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(value, max));

  const adjustPositionWithinBounds = (pos = position) => {
    const maxX = window.innerWidth - ICON_SIZE - PADDING;
    const maxY = window.innerHeight - ICON_SIZE - PADDING;
    const minX = PADDING;
    const minY = PADDING;
    return {
      x: clamp(pos.x, minX, maxX),
      y: clamp(pos.y, minY, maxY),
    };
  };

  const handleClick = () => {
    if (!hasDragged.current) {
      handleOpenChat();
    }
  };

  // Set initial position to bottom-right corner
  useEffect(() => {
    const initX = window.innerWidth - ICON_SIZE - PADDING;
    const initY = window.innerHeight - ICON_SIZE - PADDING;
    setPosition({ x: initX, y: initY });
  }, []);

  // Adjust position on resize so that the icon never leaves the viewport.
  useEffect(() => {
    const handleResize = () => {
      setPosition((prevPos) => adjustPositionWithinBounds(prevPos));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [position]);

  const handleDragEnd = () => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const maxX = window.innerWidth - ICON_SIZE - PADDING;
    const maxY = window.innerHeight - ICON_SIZE - PADDING;
    const minX = PADDING;
    const minY = PADDING;

    const clampedX = clamp(rect.left, minX, maxX);
    const clampedY = clamp(rect.top, minY, maxY);

    setPosition({ x: clampedX, y: clampedY });

    setTimeout(() => {
      hasDragged.current = false;
    }, 50);
  };

  return (
    <motion.div
      ref={ref}
      drag
      dragMomentum={false}
      whileDrag={{ cursor: "grabbing" }}
      animate={position}
      style={{ top: 0, left: 0 }}
      className="fixed z-[1000] w-[50px] h-[50px] cursor-grab"
      onDragStart={() => {
        hasDragged.current = false;
      }}
      onDrag={() => {
        hasDragged.current = true;
      }}
      onDragEnd={handleDragEnd}
    >
      <button
        onClick={handleClick}
        className="bg-purple-500 rounded-full w-full h-full flex items-center justify-center shadow-lg"
      >
        <FloatingChatIcon />
      </button>
    </motion.div>
  );
};

export default DocumentChatIcon;
