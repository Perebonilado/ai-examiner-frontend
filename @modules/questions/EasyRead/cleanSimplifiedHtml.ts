/**
 * The modified-content API returns each simplified page as a whole HTML document
 * (doctype, <head> with a <style> block and a print-scaling <script>, then
 * <div class="page"><div class="content">…</div></div>). Injected as-is, its <style>
 * rules are global: they set the app's root font size to 14px and give every p / li /
 * h1 a fixed size, so the reader's typography and text size setting cannot apply.
 *
 * This keeps only the page's content: headings, paragraphs, lists and inline marks.
 */
const DROP = "style, script, link, meta, title, base, iframe, object, embed";

const cache = new Map<string, string>();

const cleanSimplifiedHtml = (html: string): string => {
  if (!html) return "";
  const hit = cache.get(html);
  if (hit !== undefined) return hit;

  let out = html;
  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll(DROP).forEach((el) => el.remove());
    const root = doc.body.querySelector(".content") ?? doc.body;
    // Inline styles and classes come from the PDF template, not the reader.
    root.querySelectorAll("[style], [class]").forEach((el) => {
      el.removeAttribute("style");
      el.removeAttribute("class");
    });
    out = root.innerHTML.trim();
  } else {
    // No DOM (never expected: the reader is client-only): strip the risky parts by pattern.
    out = html
      .replace(/<(style|script|title)[\s\S]*?<\/\1>/gi, "")
      .replace(/<\/?(html|head|body|meta|link|base)[^>]*>/gi, "")
      .replace(/<!doctype[^>]*>/gi, "");
  }

  cache.set(html, out);
  return out;
};

export default cleanSimplifiedHtml;
