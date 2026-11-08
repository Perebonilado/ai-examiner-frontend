/**
 * Document chat helpers with no imports, so they can be tested on their own:
 * reading a server-sent event stream, batching streamed text, and page citation chips.
 */

/**
 * Splits a server-sent event stream into events. Feed it text as it arrives (pieces can split an
 * event anywhere); it calls onEvent once per complete event. Comment lines (": ping") are skipped.
 */
export const createSseParser = (
  onEvent: (event: string, data: string) => void
) => {
  let buffer = "";
  return (chunk: string) => {
    buffer = (buffer + chunk).replace(/\r\n/g, "\n");
    let end: number;
    while ((end = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      let event = "message";
      const data: string[] = [];
      for (const line of block.split("\n")) {
        if (!line || line.startsWith(":")) continue;
        const colon = line.indexOf(":");
        const field = colon === -1 ? line : line.slice(0, colon);
        let value = colon === -1 ? "" : line.slice(colon + 1);
        if (value.startsWith(" ")) value = value.slice(1);
        if (field === "event") event = value;
        else if (field === "data") data.push(value);
      }
      if (data.length) onEvent(event, data.join("\n"));
    }
  };
};

/**
 * Collects streamed text and hands it over at most every `everyMs`, so the reply re-renders a
 * few times a second instead of once per word.
 */
export const createTextBatcher = (
  flushTo: (text: string) => void,
  everyMs = 50
) => {
  let pending = "";
  let timer: ReturnType<typeof setTimeout> | null = null;
  const run = () => {
    timer = null;
    if (!pending) return;
    const text = pending;
    pending = "";
    flushTo(text);
  };
  return {
    push(text: string) {
      pending += text;
      if (!timer) timer = setTimeout(run, everyMs);
    },
    /** Hand over whatever is left now. */
    flush() {
      if (timer) clearTimeout(timer);
      run();
    },
  };
};

const CITATION = /\[(pp?)\.\s*([^\]\n]{1,40})\]/g;
const CITATION_PART = /^(?:pp?\.\s*)?(\d{1,4})(?:\s*[-–—]\s*(\d{1,4}))?$/;

/**
 * Turns page citations in reply HTML ("[p. 4]", "[pp. 4-5]", "[p. 3, 7]") into small chips. With
 * `interactive`, each chip is a button carrying data-page (the reader jumps there); otherwise a
 * plain label. Text that only looks like a citation is left alone. Only digits from the match are
 * written back, so this is safe to run on sanitised HTML.
 */
export const linkPageCitations = (html: string, interactive: boolean) =>
  html.replace(CITATION, (match, _prefix: string, inner: string) => {
    const parts = inner
      .split(/\s*(?:,|;|&|\band\b)\s*/)
      .map((part) => part.trim())
      .filter(Boolean);
    const chips: string[] = [];
    for (const part of parts) {
      const found = part.match(CITATION_PART);
      if (!found) return match;
      const from = Number(found[1]);
      const to = found[2] ? Number(found[2]) : null;
      if (!from) return match;
      const label = to && to !== from ? `pp. ${from}–${to}` : `p. ${from}`;
      chips.push(
        interactive
          ? `<button type="button" class="chat-cite" data-page="${from}" title="Go to page ${from}">${label}</button>`
          : `<span class="chat-cite">${label}</span>`
      );
    }
    return chips.length ? chips.join(" ") : match;
  });

/** "Reading pages 3, 7 and 12" for the status line while a reply starts. */
export const readingLabel = (pages?: number[]) => {
  if (!pages?.length) return "Reading the document";
  if (pages.length === 1) return `Reading page ${pages[0]}`;
  const shown = pages.slice(0, 5);
  const rest = pages.length - shown.length;
  if (rest > 0) return `Reading pages ${shown.join(", ")} and ${rest} more`;
  return `Reading pages ${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
};

/**
 * While a reply is still arriving, its Markdown can stop half-way through a marker ("**Inwa").
 * Close an unfinished bold (and drop a marker that has only partly arrived) so it shows as bold
 * text instead of raw asterisks until the rest comes in.
 */
export const closeOpenMarkdown = (text: string) => {
  let out = text.replace(/\*+$/, "");
  if ((out.match(/\*\*/g) || []).length % 2 === 1) out += "**";
  return out;
};
