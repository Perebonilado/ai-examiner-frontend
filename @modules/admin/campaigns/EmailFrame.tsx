import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Props {
  html: string;
  /** The email's width in px: 600 desktop, 375 phone. */
  width?: number;
  title: string;
  /** Shrinks the whole email (review and report thumbnails). */
  scale?: number;
  /** A thumbnail: hidden from screen readers and skipped by Tab (the full preview is elsewhere). */
  decorative?: boolean;
  className?: string;
}

/** Links in the preview open in a new tab instead of inside the frame. */
const withBaseTarget = (html: string) =>
  /<head[^>]*>/i.test(html)
    ? html.replace(/<head([^>]*)>/i, '<head$1><base target="_blank">')
    : `<base target="_blank">${html}`;

/**
 * The server-rendered email in a sandboxed frame (no scripts). The frame grows to the email's
 * height so the page, not the frame, scrolls.
 */
const EmailFrame: FC<Props> = ({ html, width = 600, title, scale = 1, decorative = false, className }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);
  const srcDoc = useMemo(() => withBaseTarget(html), [html]);

  const measure = useCallback(() => {
    const doc = ref.current?.contentDocument;
    if (!doc?.documentElement) return;
    const next = Math.max(doc.documentElement.scrollHeight, doc.body?.scrollHeight ?? 0);
    if (next > 0) setHeight(next);
  }, []);

  // Images load after the frame does, and the phone width reflows the text.
  useEffect(() => {
    const timers = [150, 600, 1500].map((ms) => setTimeout(measure, ms));
    return () => timers.forEach(clearTimeout);
  }, [srcDoc, width, measure]);

  const frame = (
    <iframe
      ref={ref}
      title={title}
      srcDoc={srcDoc}
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      onLoad={measure}
      tabIndex={decorative ? -1 : undefined}
      aria-hidden={decorative || undefined}
      // The email in its light version (what most inboxes show), even in the app's dark theme.
      style={{ width, height, border: 0, display: "block", background: "#ffffff", colorScheme: "light" }}
    />
  );

  if (scale === 1) return <div className={className}>{frame}</div>;
  return (
    <div className={className} style={{ width: width * scale, height: height * scale, overflow: "hidden" }}>
      <div style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}>{frame}</div>
    </div>
  );
};

export default EmailFrame;
