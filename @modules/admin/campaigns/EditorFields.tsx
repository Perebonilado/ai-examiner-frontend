import React, { FC, KeyboardEvent, PropsWithChildren, ReactNode, useId, useRef } from "react";
import cn from "classnames";
import { Plus, Trash2 } from "lucide-react";
import { CampaignContent, CampaignField, CampaignTemplate, ColorSet, TemplateKey } from "@/models/admin.model";
import { buttonClass, inputClass } from "../ui";
import { COLOR_SETS } from "./campaignFormat";

type Content = CampaignContent;

/* ---------- Building blocks ---------- */

const Field: FC<
  PropsWithChildren<{ label: string; hint?: ReactNode; small?: boolean; className?: string; warn?: boolean }>
> = ({ label, hint, small = false, className, warn = false, children }) => {
  const hintId = useId();
  const child = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby": hint ? hintId : undefined,
      })
    : children;
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label className={cn("flex flex-col gap-1.5", small ? "text-xs font-semibold text-subtle" : "text-[13px] font-bold text-ink")}>
        {label}
        {child}
      </label>
      {hint && (
        <p id={hintId} className={cn("text-[12.5px]", warn ? "font-semibold text-danger" : "text-muted")}>
          {hint}
        </p>
      )}
    </div>
  );
};

const Text: FC<{
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "url" | "number";
  "aria-describedby"?: string;
}> = ({ value, onChange, placeholder, type = "text", ...rest }) => (
  <input
    type={type}
    value={value ?? ""}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    className={cn(inputClass, "font-normal")}
    {...rest}
  />
);

const Area: FC<{
  value: string | undefined;
  onChange: (value: string) => void;
  rows?: number;
  "aria-describedby"?: string;
}> = ({ value, onChange, rows = 4, ...rest }) => (
  <textarea
    value={value ?? ""}
    rows={rows}
    onChange={(e) => onChange(e.target.value)}
    className={cn(inputClass, "h-auto resize-y py-2.5 font-normal leading-[1.55]")}
    {...rest}
  />
);

const Group: FC<PropsWithChildren<{ title: string; hint?: string }>> = ({ title, hint, children }) => (
  <fieldset className="flex min-w-0 flex-col gap-2.5">
    <legend className="mb-2 text-[13px] font-bold text-ink">{title}</legend>
    {hint && <p className="-mt-1 text-[12.5px] text-muted">{hint}</p>}
    {children}
  </fieldset>
);

const Row: FC<PropsWithChildren> = ({ children }) => <div className="flex flex-wrap gap-2 [&>*]:flex-[1_1_140px]">{children}</div>;

/* ---------- Per-template wording ---------- */

interface Words {
  headline: string;
  headlineHint?: string;
  subhead: string;
  subheadLong?: boolean;
  body: string;
  /** What the email shows over the list when "List heading" is empty. */
  itemsFallback: string;
  items: { group: string; one: string; title: string; text: string };
}

const BOLD_LINES = "Press Enter for a new line: the lines after the first are bold.";

const WORDS: Record<TemplateKey, Words> = {
  announcement: {
    headline: "Headline",
    headlineHint: BOLD_LINES,
    subhead: "Line under the headline",
    body: "Message",
    itemsFallback: "",
    items: { group: "Highlights", one: "highlight", title: "Title", text: "Text" },
  },
  newsletter: {
    headline: "Lead story heading",
    subhead: "Lead story text",
    subheadLong: true,
    body: "Intro above the photo",
    itemsFallback: "",
    items: { group: "Tips", one: "tip", title: "Title", text: "Text" },
  },
  offer: {
    headline: "Line under the big number",
    subhead: "Line under the headline",
    body: "Message",
    itemsFallback: "What you get",
    items: { group: "List", one: "line", title: "Line", text: "Detail (optional)" },
  },
  spotlight: {
    headline: "Headline",
    headlineHint: BOLD_LINES,
    subhead: "Line under the headline",
    body: "Message",
    itemsFallback: "How to try it",
    items: { group: "Steps", one: "step", title: "Title", text: "Text" },
  },
  comeback: {
    headline: "Headline",
    headlineHint: BOLD_LINES,
    subhead: "Line under the headline",
    body: "Message",
    itemsFallback: "New since you were here",
    items: { group: "List", one: "item", title: "Title", text: "Text" },
  },
  live: {
    headline: "Session title",
    subhead: "Line under the headline",
    body: "Message",
    itemsFallback: "In the hour",
    items: { group: "Agenda", one: "agenda line", title: "Time", text: "What happens" },
  },
  letter: {
    headline: "Heading (optional)",
    subhead: "Line under the headline",
    body: "Message",
    itemsFallback: "",
    items: { group: "List", one: "item", title: "Title", text: "Text" },
  },
};

/** The server keeps http(s) and mailto links and adds https:// to a bare address like aiexaminer.app/pricing. */
export const isUsableLink = (url: string | undefined, allowMailto = true) => {
  const value = (url ?? "").trim();
  if (!value) return true;
  if (/^https?:\/\/[^\s]+$/i.test(value)) return true;
  if (allowMailto && /^mailto:[^\s]+$/i.test(value)) return true;
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?([/?#][^\s]*)?$/i.test(value);
};

const LINK_HINT_BAD = "Start the link with https://, or type a web address like aiexaminer.app/pricing.";

/* ---------- Colour sets ---------- */

const ColourSets: FC<{ value: ColorSet; onChange: (value: ColorSet) => void }> = ({ value, onChange }) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const to = (index + step + COLOR_SETS.length) % COLOR_SETS.length;
    onChange(COLOR_SETS[to].key);
    refs.current[to]?.focus();
  };
  return (
    <div className="flex flex-col gap-2">
      <span id="colour-set-label" className="text-[13px] font-bold text-ink">
        Colours
      </span>
      <div role="radiogroup" aria-labelledby="colour-set-label" className="flex flex-wrap gap-2.5">
        {COLOR_SETS.map((set, i) => {
          const on = set.key === value;
          return (
            <button
              key={set.key}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={set.label}
              title={set.label}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(set.key)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "h-11 w-11 rounded-xl bg-surface p-1 transition-colors",
                on ? "border-2 border-accent" : "border border-control hover:border-control-strong"
              )}
            >
              <span aria-hidden="true" className="flex h-full overflow-hidden rounded-[7px] ring-1 ring-inset ring-line">
                <span className="flex-1" style={{ background: set.lead }} />
                <span className="flex-1" style={{ background: set.accent }} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- The form ---------- */

const LinkField: FC<{ label: string; value: string | undefined; onChange: (v: string) => void; small?: boolean; className?: string }> = ({
  label,
  value,
  onChange,
  small = true,
  className,
}) => {
  const bad = !isUsableLink(value);
  return (
    <Field label={label} small={small} className={className} warn={bad} hint={bad ? LINK_HINT_BAD : undefined}>
      <Text type="url" value={value} onChange={onChange} placeholder="https://" />
    </Field>
  );
};

interface Props {
  template: CampaignTemplate | undefined;
  templateKey: TemplateKey;
  content: Content;
  onChange: (content: Content) => void;
}

const FALLBACK_FIELDS: CampaignField[] = ["colorSet", "headline", "body", "button"];

/** The inputs for one campaign: only the parts the template uses (its `fields`), in that order. */
const EditorFields: FC<Props> = ({ template, templateKey, content, onChange }) => {
  const fields: CampaignField[] = template?.fields?.length ? template.fields : FALLBACK_FIELDS;
  const set = <K extends keyof Content>(key: K, value: Content[K]) => onChange({ ...content, [key]: value });
  const defaults = template?.defaults;
  const words = WORDS[templateKey] ?? WORDS.letter;
  const items = content.items ?? [];
  const headline = content.headline ?? "";
  const highlightMissing =
    !!content.highlight?.trim() && !headline.toLowerCase().includes(content.highlight.trim().toLowerCase());

  const offer = content.offer ?? { intro: "", big: "", line: "", deadline: "" };
  const event = content.event ?? { weekday: "", day: "", month: "", time: "", host: "", hostRole: "" };
  const resume = content.resume ?? { title: "", subtitle: "", buttonLabel: "", url: "" };
  const beforeAfter = content.beforeAfter ?? { before: "", after: "" };
  const quote = content.quote ?? { text: "", by: "" };
  const emptyCard = { title: "", text: "", linkLabel: "", url: "" };
  const cards = [content.cards?.[0] ?? emptyCard, content.cards?.[1] ?? emptyCard];
  const button = content.button ?? { label: "", url: "" };
  const imageBad = !isUsableLink(content.imageUrl, false);

  const blocks: Partial<Record<CampaignField, () => ReactNode>> = {
    colorSet: () => <ColourSets value={content.colorSet} onChange={(v) => set("colorSet", v)} />,

    issueLabel: () => (
      <Field label="Masthead line" hint="For example: No. 11 · November 2026. The “Study notes” title stays the same.">
        <Text value={content.issueLabel} onChange={(v) => set("issueLabel", v)} />
      </Field>
    ),

    headline: () => (
      <Field label={words.headline} hint={words.headlineHint}>
        <Area rows={2} value={content.headline} onChange={(v) => set("headline", v)} />
      </Field>
    ),

    highlight: () => (
      <Field
        label="Words to highlight"
        warn={highlightMissing}
        hint={
          highlightMissing
            ? "These words aren't in the headline, so nothing is highlighted."
            : "Optional. Words from the headline to set on the yellow marker."
        }
      >
        <Text value={content.highlight} onChange={(v) => set("highlight", v)} />
      </Field>
    ),

    subhead: () => (
      <Field label={words.subhead} hint={words.subheadLong ? undefined : "Optional."}>
        {words.subheadLong ? (
          <Area rows={3} value={content.subhead} onChange={(v) => set("subhead", v)} />
        ) : (
          <Text value={content.subhead} onChange={(v) => set("subhead", v)} />
        )}
      </Field>
    ),

    imageUrl: () => (
      <Group title="Photo">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-2">
          {content.imageUrl && !imageBad ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.imageUrl} alt="" className="h-12 w-16 shrink-0 rounded-lg bg-hover object-cover" />
          ) : (
            <span aria-hidden="true" className="h-12 w-16 shrink-0 rounded-lg bg-hover" />
          )}
          <span className="min-w-0 flex-1 truncate text-[13px] text-subtle">
            {content.imageUrl ? content.imageUrl.split("/").pop() : "No photo"}
          </span>
          {defaults?.imageUrl && defaults.imageUrl !== content.imageUrl && (
            <button
              type="button"
              className={cn(buttonClass.small, "h-[34px] px-3")}
              onClick={() =>
                onChange({
                  ...content,
                  imageUrl: defaults.imageUrl,
                  imageAlt: content.imageAlt?.trim() ? content.imageAlt : defaults.imageAlt,
                })
              }
            >
              Use the default photo
            </button>
          )}
        </div>
        <Field
          label="Photo link"
          small
          warn={imageBad}
          hint={imageBad ? LINK_HINT_BAD : "A JPG or PNG on the web, at least 1200 px wide. Leave empty for no photo."}
        >
          <Text type="url" value={content.imageUrl} onChange={(v) => set("imageUrl", v)} placeholder="https://" />
        </Field>
      </Group>
    ),

    imageAlt: () => (
      <Field label="Describe the photo" hint="Read aloud to people who can't see it.">
        <Text value={content.imageAlt} onChange={(v) => set("imageAlt", v)} />
      </Field>
    ),

    offer: () => (
      <Group title="Offer">
        <Field label="Small line above" small>
          <Text value={offer.intro} onChange={(v) => set("offer", { ...offer, intro: v })} />
        </Field>
        <Field label="Big number or words" small>
          <Text value={offer.big} onChange={(v) => set("offer", { ...offer, big: v })} />
        </Field>
        <Row>
          <Field label="Deadline" small>
            <Text value={offer.deadline} onChange={(v) => set("offer", { ...offer, deadline: v })} />
          </Field>
          <Field label="Deadline note (optional)" small>
            <Text value={offer.deadlineNote} onChange={(v) => set("offer", { ...offer, deadlineNote: v })} />
          </Field>
        </Row>
        <Field label="Code (optional)" small>
          <Text value={offer.code} onChange={(v) => set("offer", { ...offer, code: v })} />
        </Field>
        <Field label="Small print (optional)" small>
          <Area rows={2} value={offer.fineprint} onChange={(v) => set("offer", { ...offer, fineprint: v })} />
        </Field>
      </Group>
    ),

    event: () => (
      <Group title="Date and host" hint="Shown as a calendar card, e.g. THU · 4 · DEC · 7 pm WAT.">
        <Row>
          <Field label="Weekday" small>
            <Text value={event.weekday} onChange={(v) => set("event", { ...event, weekday: v })} />
          </Field>
          <Field label="Day" small>
            <Text value={event.day} onChange={(v) => set("event", { ...event, day: v })} />
          </Field>
          <Field label="Month" small>
            <Text value={event.month} onChange={(v) => set("event", { ...event, month: v })} />
          </Field>
        </Row>
        <Field label="Time" small>
          <Text value={event.time} onChange={(v) => set("event", { ...event, time: v })} />
        </Field>
        <Row>
          <Field label="Host" small>
            <Text value={event.host} onChange={(v) => set("event", { ...event, host: v })} />
          </Field>
          <Field label="Host's role" small>
            <Text value={event.hostRole} onChange={(v) => set("event", { ...event, hostRole: v })} />
          </Field>
        </Row>
        <LinkField
          label="Add-to-calendar link (optional)"
          value={event.calendarUrl}
          onChange={(v) => set("event", { ...event, calendarUrl: v })}
        />
      </Group>
    ),

    body: () => (
      <Field
        label={words.body}
        hint="Type {first name} to greet each person by name. Leave a blank line between paragraphs."
      >
        <Area rows={6} value={content.body} onChange={(v) => set("body", v)} />
      </Field>
    ),

    beforeAfter: () => (
      <Group title="Before and after">
        <Field label="Before: the original notes" small>
          <Area rows={3} value={beforeAfter.before} onChange={(v) => set("beforeAfter", { ...beforeAfter, before: v })} />
        </Field>
        <Field label="After: in Easy Read" small>
          <Area rows={3} value={beforeAfter.after} onChange={(v) => set("beforeAfter", { ...beforeAfter, after: v })} />
        </Field>
      </Group>
    ),

    resume: () => (
      <Group title="Where they left off">
        <Field label="Document" small>
          <Text value={resume.title} onChange={(v) => set("resume", { ...resume, title: v })} />
        </Field>
        <Field label="Line under it" small>
          <Text value={resume.subtitle} onChange={(v) => set("resume", { ...resume, subtitle: v })} />
        </Field>
        <Field label="Progress, 0 to 100 (optional)" small>
          <Text
            type="number"
            value={resume.progress === undefined ? "" : String(resume.progress)}
            onChange={(v) =>
              set("resume", {
                ...resume,
                progress: v === "" ? undefined : Math.max(0, Math.min(100, Number(v) || 0)),
              })
            }
          />
        </Field>
        <Row>
          <Field label="Button words" small>
            <Text value={resume.buttonLabel} onChange={(v) => set("resume", { ...resume, buttonLabel: v })} />
          </Field>
          <LinkField label="Link" value={resume.url} onChange={(v) => set("resume", { ...resume, url: v })} />
        </Row>
      </Group>
    ),

    itemsTitle: () => (
      <Field
        label="List heading"
        hint={words.itemsFallback ? `Optional. Left empty, it reads “${words.itemsFallback}”.` : "Optional."}
      >
        <Text value={content.itemsTitle} onChange={(v) => set("itemsTitle", v)} placeholder={words.itemsFallback || undefined} />
      </Field>
    ),

    items: () => (
      <Group title={fields.includes("itemsTitle") ? content.itemsTitle?.trim() || words.itemsFallback || words.items.group : words.items.group}>
        {items.length === 0 && <p className="text-[13px] text-subtle">Nothing in the list yet.</p>}
        <ol className="flex flex-col gap-3">
          {items.map((item, i) => (
            <li key={i} className="flex flex-col gap-2 rounded-xl border border-line bg-canvas p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-subtle">
                  {words.items.one[0].toUpperCase() + words.items.one.slice(1)} {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => set("items", items.filter((_, n) => n !== i))}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold text-subtle transition-colors hover:bg-hover hover:text-danger"
                >
                  <Trash2 size={14} strokeWidth={1.8} aria-hidden="true" />
                  Remove<span className="sr-only"> {words.items.one} {i + 1}</span>
                </button>
              </div>
              <Field label={words.items.title} small>
                <Text
                  value={item.title}
                  onChange={(v) => set("items", items.map((it, n) => (n === i ? { ...it, title: v } : it)))}
                />
              </Field>
              <Field label={words.items.text} small>
                <Area
                  rows={2}
                  value={item.text}
                  onChange={(v) => set("items", items.map((it, n) => (n === i ? { ...it, text: v } : it)))}
                />
              </Field>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => set("items", [...items, { title: "", text: "" }])}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-control-strong bg-canvas text-sm font-semibold text-body transition-colors hover:bg-hover hover:text-ink"
        >
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          Add {/^[aeiou]/i.test(words.items.one) ? "an" : "a"} {words.items.one}
        </button>
      </Group>
    ),

    quote: () => (
      <Group title="Quote">
        <Field label="Quote" small>
          <Area rows={3} value={quote.text} onChange={(v) => set("quote", { ...quote, text: v })} />
        </Field>
        <Field label="Who said it" small>
          <Text value={quote.by} onChange={(v) => set("quote", { ...quote, by: v })} />
        </Field>
      </Group>
    ),

    cards: () => (
      <Group title="Two cards">
        {cards.map((card, i) => {
          const update = (patch: Partial<typeof card>) =>
            set(
              "cards",
              cards.map((c, n) => (n === i ? { ...c, ...patch } : c))
            );
          return (
            <div key={i} className="flex flex-col gap-2 rounded-xl border border-line bg-canvas p-3">
              <span className="text-xs font-bold text-subtle">{i === 0 ? "Yellow card" : "Purple card"}</span>
              <Field label="Title" small>
                <Text value={card.title} onChange={(v) => update({ title: v })} />
              </Field>
              <Field label="Text" small>
                <Area rows={2} value={card.text} onChange={(v) => update({ text: v })} />
              </Field>
              <Row>
                <Field label="Link words" small>
                  <Text value={card.linkLabel} onChange={(v) => update({ linkLabel: v })} />
                </Field>
                <LinkField label="Link" value={card.url} onChange={(v) => update({ url: v })} />
              </Row>
            </div>
          );
        })}
      </Group>
    ),

    button: () => (
      <Group title="Button">
        <div className="flex flex-wrap gap-2">
          <Field label="Words" small className="flex-[1_1_120px]">
            <Text value={button.label} onChange={(v) => set("button", { ...button, label: v })} />
          </Field>
          <LinkField
            label="Link"
            className="flex-[1.4_1_160px]"
            value={button.url}
            onChange={(v) => set("button", { ...button, url: v })}
          />
        </div>
      </Group>
    ),

    signoff: () => (
      <Field label="Sign-off" hint="The team name goes on the next line.">
        <Text value={content.signoff} onChange={(v) => set("signoff", v)} />
      </Field>
    ),
  };

  return (
    <div className="flex flex-col gap-[18px]">
      {fields.map((field) => {
        const block = blocks[field];
        return block ? <React.Fragment key={field}>{block()}</React.Fragment> : null;
      })}
    </div>
  );
};

export default EditorFields;
