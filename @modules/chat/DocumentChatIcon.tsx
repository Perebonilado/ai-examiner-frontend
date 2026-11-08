import React, { ElementRef, FC, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { MessageCircle } from "lucide-react";

interface Props {
  handleOpenChat: () => void;
}

// Launcher: aubergine rounded square, 52px (48px on phones), bottom-right, draggable.
const PHONE_MAX = 767; // the app's md breakpoint
const isPhone = () => window.innerWidth <= PHONE_MAX;
const getSize = () => (isPhone() ? 48 : 52);
const getPadding = () => (isPhone() ? 16 : 24);

// Easy read (route, or body[data-reader] while the reader is mounted) keeps its topics panel (340px)
// on the right on desktop and a bottom dock on phones, so the launcher starts beside / above them there.
const isReader = (pathname: string) =>
  pathname.includes("easy-read") || document.body.hasAttribute("data-reader");

const getStartOffset = (pathname: string) => {
  if (!isReader(pathname)) return { right: 0, bottom: 0 };
  if (isPhone()) return { right: 0, bottom: 62 };
  // Topics folded to its slim tab (body[data-topics-hidden]): beside the 30px tab instead.
  return { right: document.body.hasAttribute("data-topics-hidden") ? 30 : 340, bottom: 0 };
};

// Phones: pages with a sticky bottom bar (and the test progress pill) lift the launcher above them.
// styles/globals.css sets --chat-fab-bottom on <body> from [data-phone-bottom-bar] / [data-phone-pill].
const getPhoneBottom = () =>
  parseFloat(getComputedStyle(document.body).getPropertyValue("--chat-fab-bottom")) || 16;

// Safeguard: a tagged bar that isn't pinned to the viewport bottom (e.g. sticky on a short page)
// still gets cleared. Returns the top of the highest visible bar/pill in the lower half, if any.
const getPhoneBarsTop = () => {
  let top = Infinity;
  document
    .querySelectorAll<HTMLElement>("[data-phone-bottom-bar], [data-phone-pill]")
    .forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.top > window.innerHeight / 2) {
        top = Math.min(top, r.top);
      }
    });
  return top;
};

const getHomePosition = (pathname: string) => {
  const s = getSize();
  const pad = getPadding();
  const offset = getStartOffset(pathname);
  const x = window.innerWidth - s - pad - offset.right;

  if (isPhone() && !isReader(pathname)) {
    const y = window.innerHeight - s - getPhoneBottom();
    return { x, y: Math.min(y, getPhoneBarsTop() - s - 12) };
  }

  return { x, y: window.innerHeight - s - pad - offset.bottom };
};

const DocumentChatIcon: FC<Props> = ({ handleOpenChat }) => {
  const hasDragged = useRef(false);
  // Once the user has moved the launcher, it stays where they put it (only kept inside the viewport).
  const userMoved = useRef(false);
  const ref = useRef<ElementRef<"div">>(null);
  const { pathname } = useRouter();
  const [size, setSize] = useState(52);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(value, max));

  const adjustPositionWithinBounds = (pos = position) => {
    const s = getSize();
    const pad = getPadding();
    return {
      x: clamp(pos.x, pad, window.innerWidth - s - pad),
      y: clamp(pos.y, pad, window.innerHeight - s - pad),
    };
  };

  // Back to the default bottom-right spot (unless the user has dragged it somewhere).
  const goHome = useCallback(() => {
    if (userMoved.current) return;
    const home = getHomePosition(pathname);
    setSize(getSize());
    setPosition((prev) =>
      prev.x === home.x && prev.y === home.y ? prev : home
    );
  }, [pathname]);

  const handleClick = () => {
    if (!hasDragged.current) {
      handleOpenChat();
    }
  };

  // Set initial position to the bottom-right corner, then re-check while the page fills in
  // (bottom bars render after their data arrives).
  useEffect(() => {
    userMoved.current = false;
    goHome();
    setReady(true);

    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver(() => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = undefined;
        goHome();
      }, 150);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-reader", "data-topics-hidden"],
    });
    const rechecks = [400, 1200].map((ms) => setTimeout(goHome, ms));

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
      rechecks.forEach(clearTimeout);
    };
  }, [goHome]);

  // On resize: back home if untouched, otherwise just keep it inside the viewport.
  useEffect(() => {
    const handleResize = () => {
      if (!userMoved.current) {
        goHome();
        return;
      }
      setSize(getSize());
      setPosition((prevPos) => adjustPositionWithinBounds(prevPos));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [goHome]);

  const handleDragEnd = () => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    if (hasDragged.current) userMoved.current = true;
    setPosition(adjustPositionWithinBounds({ x: rect.left, y: rect.top }));

    setTimeout(() => {
      hasDragged.current = false;
    }, 50);
  };

  // Render once the start position is known, so it doesn't fly in from the corner.
  if (!ready) return null;

  return (
    <motion.div
      ref={ref}
      drag
      dragMomentum={false}
      whileDrag={{ cursor: "grabbing" }}
      initial={false}
      animate={position}
      style={{ top: 0, left: 0, width: size, height: size }}
      // below app modals (Modal.tsx is z-[1000]) and the chat panel
      className="fixed z-[900] cursor-grab touch-none"
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
        aria-label="Chat with this document"
        title="Chat with this document"
        className="w-full h-full grid place-items-center rounded-2xl bg-brand text-white hover:bg-brand-hover transition-colors shadow-[0_12px_28px_-12px_rgba(16,12,40,0.45),0_2px_6px_-2px_rgba(16,12,40,0.16)]"
      >
        <MessageCircle size={22} strokeWidth={1.75} aria-hidden />
      </button>
    </motion.div>
  );
};

export default DocumentChatIcon;
