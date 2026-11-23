import React, { CSSProperties, FC, ReactNode } from "react";
import { lexend } from "@/@shared/components/site/fonts";
import { CampaignContent, TemplateKey } from "@/models/admin.model";
import { colorSetOf } from "./campaignFormat";
import { useElementWidth } from "./useElementWidth";

/**
 * A small, decorative picture of a template, drawn from its default content in the email's own
 * style (600 px wide, scaled down by the card). The real email is rendered by the server in the
 * next step; this only has to be recognisable.
 */

const INK = "#0e0e10";
const PURPLE = "#5b2ad6";
const YELLOW = "#f4cb5a";
const GREY = "#5c5c65";

const firstParagraph = (body: string) =>
  (body.split(/\n\s*\n/)[0] ?? "").replace(/\{first name\}/gi, "Ada");

const Logo: FC<{ onDark?: boolean; invertMark?: boolean; right?: ReactNode }> = ({ onDark, invertMark, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: invertMark ? "#fff" : PURPLE,
          color: invertMark ? PURPLE : "#fff",
          display: "grid",
          placeItems: "center",
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        AI
      </span>
      <span style={{ fontWeight: 600, fontSize: 17, color: onDark ? "#fff" : INK }}>Examiner</span>
    </span>
    {right}
  </div>
);

/** The headline: line breaks kept (later lines bold where the template does that), the highlight on a marker. */
const Headline: FC<{
  text: string;
  highlight?: string;
  marker: string;
  markerInk: string;
  style: CSSProperties;
  boldAfterBreak?: boolean;
}> = ({ text = "", highlight, marker, markerInk, style, boldAfterBreak = false }) => {
  const hl = (highlight ?? "").trim();
  let marked = false;
  const renderLine = (line: string) => {
    const at = hl && !marked ? line.indexOf(hl) : -1;
    if (at < 0) return line;
    marked = true;
    return (
      <>
        {line.slice(0, at)}
        <span style={{ fontWeight: 700, background: marker, color: markerInk, padding: "0 10px", borderRadius: 6 }}>{hl}</span>
        {line.slice(at + hl.length)}
      </>
    );
  };
  return (
    <p style={style}>
      {text.split("\n").map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {boldAfterBreak && i > 0 ? <span style={{ fontWeight: 700 }}>{renderLine(line)}</span> : renderLine(line)}
        </React.Fragment>
      ))}
    </p>
  );
};

const Photo: FC<{ url?: string; height?: number; inset?: boolean }> = ({ url, height = 300, inset }) => (
  <div
    style={{
      height,
      margin: inset ? "0 36px" : 0,
      borderRadius: inset ? 4 : 0,
      backgroundColor: "#d9d6e4",
      backgroundImage: url ? `url("${url}")` : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center 30%",
    }}
  />
);

const Paragraph: FC<{ text: string; color?: string }> = ({ text, color = "#3f3f47" }) => (
  <p style={{ margin: 0, fontSize: 17, lineHeight: 1.65, color }}>{text}</p>
);

const Numbered: FC<{ items?: CampaignContent["items"]; size?: number }> = ({ items = [], size = 40 }) => (
  <div style={{ padding: "16px 36px 0" }}>
    {items.slice(0, 3).map((item, i) => (
      <div key={i} style={{ display: "flex", gap: 22, padding: "20px 0", borderBottom: "1px solid #ececef" }}>
        <span style={{ width: 60, flex: "none", fontSize: size, lineHeight: 1, fontWeight: 300, color: PURPLE }}>
          {String(i + 1).padStart(2, "0")}
        </span>
        <span style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 19, fontWeight: 600 }}>{item.title}</span>
          <span style={{ fontSize: 15, lineHeight: 1.6, color: GREY }}>{item.text}</span>
        </span>
      </div>
    ))}
  </div>
);

const Button: FC<{ label?: string; bg: string; fg: string }> = ({ label, bg, fg }) =>
  label ? (
    <div style={{ padding: "30px 36px 40px" }}>
      <span style={{ display: "inline-block", padding: "18px 34px", borderRadius: 999, background: bg, color: fg, fontSize: 16, fontWeight: 600 }}>
        {label}
      </span>
    </div>
  ) : null;

const Announcement: FC<{ c: CampaignContent }> = ({ c }) => {
  const cs = colorSetOf(c.colorSet);
  return (
    <>
      <div style={{ background: cs.lead, color: cs.onLead, padding: "22px 36px 52px" }}>
        <Logo onDark={cs.onLead === "#ffffff"} invertMark={cs.lead === PURPLE} />
        <Headline
          text={c.headline}
          highlight={c.highlight}
          marker={cs.lead === YELLOW ? INK : YELLOW}
          markerInk={cs.lead === YELLOW ? "#fff" : INK}
          style={{ margin: "40px 0 0", fontSize: 60, lineHeight: 1.04, fontWeight: 300, letterSpacing: "-0.035em" }}
          boldAfterBreak
        />
        {c.subhead && (
          <p style={{ margin: "24px 0 0", maxWidth: 430, fontSize: 17, lineHeight: 1.6, fontWeight: 300, opacity: 0.85 }}>
            {c.subhead}
          </p>
        )}
      </div>
      <Photo url={c.imageUrl} height={340} />
      <div style={{ padding: "40px 36px 8px" }}>
        <Paragraph text={firstParagraph(c.body)} />
      </div>
      <Numbered items={c.items} />
      <Button label={c.button?.label} bg={cs.lead === "#ffffff" ? PURPLE : cs.lead} fg={cs.lead === YELLOW ? INK : "#fff"} />
    </>
  );
};

const Newsletter: FC<{ c: CampaignContent }> = ({ c }) => {
  const cs = colorSetOf(c.colorSet);
  const lead = cs.key === "purple_cream" ? cs.accent : cs.lead;
  const onLead = cs.key === "purple_cream" ? INK : cs.onLead;
  return (
    <>
      <div style={{ background: lead, color: onLead, padding: "26px 36px 34px" }}>
        <Logo
          onDark={onLead === "#ffffff"}
          right={<span style={{ fontSize: 12.5, opacity: 0.8 }}>{c.issueLabel}</span>}
        />
        <p style={{ margin: "46px 0 0", fontSize: 84, lineHeight: 0.95, fontWeight: 300, letterSpacing: "-0.05em" }}>
          Study
          <br />
          <span style={{ fontWeight: 700 }}>notes</span>
        </p>
        <p style={{ margin: "18px 0 0", paddingTop: 16, borderTop: `1.5px solid ${onLead}`, fontSize: 15, lineHeight: 1.55 }}>
          {firstParagraph(c.body)}
        </p>
      </div>
      <div style={{ padding: "30px 0 0" }}>
        <Photo url={c.imageUrl} height={280} inset />
      </div>
      <Headline
        text={c.headline}
        highlight={c.highlight}
        marker={YELLOW}
        markerInk={INK}
        style={{ margin: "22px 36px 0", fontSize: 28, lineHeight: 1.15, fontWeight: 600, letterSpacing: "-0.025em" }}
      />
      {c.subhead && (
        <p style={{ margin: "12px 36px 0", fontSize: 15.5, lineHeight: 1.65, color: GREY }}>{c.subhead}</p>
      )}
      <Numbered items={c.items} size={30} />
    </>
  );
};

const Offer: FC<{ c: CampaignContent }> = ({ c }) => {
  const cs = colorSetOf(c.colorSet);
  const o = c.offer;
  return (
    <>
      <div style={{ background: cs.lead, color: cs.onLead, padding: "24px 36px 40px" }}>
        <Logo onDark={cs.onLead === "#ffffff"} invertMark={cs.lead === PURPLE} />
        <p style={{ margin: "44px 0 0", fontSize: 20, fontWeight: 500 }}>{o?.intro}</p>
        <p style={{ margin: "4px 0 0", fontSize: 180, lineHeight: 0.86, fontWeight: 800, letterSpacing: "-0.07em" }}>
          {o?.big}
        </p>
        <Headline
          text={c.headline?.trim() ? c.headline : o?.line ?? ""}
          highlight={c.highlight}
          marker={cs.lead === YELLOW ? INK : YELLOW}
          markerInk={cs.lead === YELLOW ? "#fff" : INK}
          style={{ margin: "10px 0 0", fontSize: 34, lineHeight: 1.1, fontWeight: 300 }}
        />
      </div>
      <div
        style={{
          background: cs.accent,
          color: cs.onAccent,
          padding: "16px 36px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 14,
        }}
      >
        <span>{o?.deadline}</span>
        <span style={{ fontWeight: 600 }}>{o?.deadlineNote}</span>
      </div>
      <div style={{ padding: "36px 36px 0" }}>
        <Paragraph text={firstParagraph(c.body)} />
      </div>
      <div style={{ padding: "20px 36px 0" }}>
        {(c.items ?? []).slice(0, 3).map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid #ececef" }}>
            <span style={{ width: 24, height: 24, flex: "none", borderRadius: 999, background: PURPLE, color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>
              ✓
            </span>
            <span style={{ fontSize: 16, lineHeight: 1.5 }}>{item.title || item.text}</span>
          </div>
        ))}
      </div>
      {o?.code && (
        <div style={{ margin: "28px 36px 0", padding: "18px 20px", border: `2px dashed ${INK}`, borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, color: "#3f3f47" }}>Your code</span>
          <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em" }}>{o.code}</span>
        </div>
      )}
      <Button label={c.button?.label} bg={PURPLE} fg="#fff" />
    </>
  );
};

const Spotlight: FC<{ c: CampaignContent }> = ({ c }) => {
  const cs = colorSetOf(c.colorSet);
  return (
    <>
      <div style={{ background: cs.lead, color: cs.onLead, padding: "24px 36px 46px" }}>
        <Logo onDark={cs.onLead === "#ffffff"} invertMark={cs.lead === PURPLE} />
        <Headline
          text={c.headline}
          highlight={c.highlight}
          marker={cs.accent}
          markerInk={cs.onAccent}
          style={{ margin: "48px 0 0", fontSize: 62, lineHeight: 1, fontWeight: 300, letterSpacing: "-0.045em" }}
          boldAfterBreak
        />
        {c.subhead && (
          <p style={{ margin: "20px 0 0", maxWidth: 420, fontSize: 17, lineHeight: 1.6, fontWeight: 300, opacity: 0.88 }}>
            {c.subhead}
          </p>
        )}
      </div>
      <div style={{ padding: "36px 36px 6px" }}>
        <Paragraph text={firstParagraph(c.body)} />
      </div>
      <div style={{ padding: "20px 36px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ border: "1px solid #ececef", borderRadius: 6, padding: "20px 22px", background: "#fbfbfc" }}>
          <p style={{ margin: "0 0 10px", fontSize: 12.5, fontWeight: 600, color: "#6b6b74" }}>Your lecture notes</p>
          <p style={{ margin: 0, fontFamily: "'Times New Roman', Times, serif", fontSize: 16, lineHeight: 1.55, color: "#1d1d22" }}>
            {c.beforeAfter?.before}
          </p>
        </div>
        <div style={{ border: `2px solid ${PURPLE}`, borderRadius: 6, padding: "20px 22px" }}>
          <p style={{ margin: "0 0 10px", fontSize: 12.5, fontWeight: 600, color: PURPLE }}>Easy Read</p>
          <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: "#33333b" }}>{c.beforeAfter?.after}</p>
        </div>
      </div>
      <Numbered items={c.items} size={30} />
    </>
  );
};

const ComeBack: FC<{ c: CampaignContent }> = ({ c }) => {
  const cs = colorSetOf(c.colorSet);
  const r = c.resume;
  const card = cs.lead === "#ffffff" ? INK : cs.lead;
  const cardInk = card === YELLOW ? INK : "#fff";
  return (
    <>
      <div style={{ padding: "24px 36px 0" }}>
        <Logo />
        <Headline
          text={c.headline}
          highlight={c.highlight}
          marker={YELLOW}
          markerInk={INK}
          style={{ margin: "40px 0 0", fontSize: 54, lineHeight: 1.04, fontWeight: 300, letterSpacing: "-0.04em" }}
          boldAfterBreak
        />
        <div style={{ marginTop: 26 }}>
          <Paragraph text={firstParagraph(c.body)} />
        </div>
      </div>
      {r && (
        <div style={{ margin: "32px 36px 0", padding: 24, borderRadius: 6, background: card, color: cardInk, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span style={{ width: 44, height: 54, flex: "none", borderRadius: 6, background: "#fff", color: "#c8371f", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800 }}>
              PDF
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>{r.title}</span>
              <span style={{ fontSize: 13.5, opacity: 0.75 }}>{r.subtitle}</span>
            </span>
          </div>
          {typeof r.progress === "number" && (
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.18)" }}>
              <div style={{ width: `${r.progress}%`, height: 8, borderRadius: 999, background: YELLOW }} />
            </div>
          )}
          <span style={{ alignSelf: "flex-start", padding: "14px 24px", borderRadius: 999, background: YELLOW, color: INK, fontSize: 15, fontWeight: 600 }}>
            {r.buttonLabel}
          </span>
        </div>
      )}
      <div style={{ padding: "30px 36px 0" }}>
        {(c.items ?? []).slice(0, 3).map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 16, padding: "16px 0", borderBottom: "1px solid #ececef" }}>
            <span style={{ width: 10, height: 10, flex: "none", marginTop: 7, borderRadius: 999, background: PURPLE }} />
            <span style={{ fontSize: 16.5, fontWeight: 600 }}>{item.title}</span>
          </div>
        ))}
      </div>
    </>
  );
};

const Live: FC<{ c: CampaignContent }> = ({ c }) => {
  const cs = colorSetOf(c.colorSet);
  const e = c.event;
  const lead = cs.lead === "#ffffff" ? INK : cs.lead;
  const onLead = lead === YELLOW ? INK : "#fff";
  const date = lead === YELLOW ? INK : cs.lead === "#ffffff" ? YELLOW : cs.accent;
  const onDate = date === INK ? "#fff" : INK;
  return (
    <div style={{ background: lead, color: onLead, minHeight: 1400 }}>
      <div style={{ padding: "24px 36px" }}>
        <Logo onDark={onLead === "#fff"} invertMark={lead === PURPLE} />
      </div>
      <div style={{ padding: "24px 36px 0", display: "flex", gap: 22 }}>
        <div style={{ width: 132, flex: "none", background: date, color: onDate, borderRadius: 6, padding: "16px 14px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{e?.weekday}</span>
          <span style={{ fontSize: 64, lineHeight: 1, fontWeight: 700 }}>{e?.day}</span>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{e?.month}</span>
          <span style={{ marginTop: 8, paddingTop: 8, borderTop: `1.5px solid ${onDate}`, width: "100%", fontSize: 13, fontWeight: 600 }}>
            {e?.time}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: date === INK ? INK : YELLOW }}>Live online · free</p>
          <p style={{ margin: 0, fontSize: 40, lineHeight: 1.05, fontWeight: 600, letterSpacing: "-0.035em", whiteSpace: "pre-line" }}>{c.headline}</p>
        </div>
      </div>
      <div style={{ padding: "30px 36px 0" }}>
        <Paragraph text={firstParagraph(c.body)} color={onLead === "#fff" ? "#d9d9de" : "#3f3f47"} />
      </div>
      {e?.host && (
        <div style={{ margin: "30px 36px 0", padding: 18, borderRadius: 6, background: "rgba(255,255,255,0.08)", display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ width: 52, height: 52, borderRadius: 999, background: PURPLE, color: "#fff", display: "grid", placeItems: "center", fontSize: 17, fontWeight: 700 }}>
            {e.host
              .replace(/[^A-Za-z ]/g, "")
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0])
              .join("") || "H"}
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{e.host}</span>
            <span style={{ fontSize: 13.5, opacity: 0.7 }}>{e.hostRole}</span>
          </span>
        </div>
      )}
    </div>
  );
};

/** Plain letter: a quiet sketch of lines, as in the design. */
const Letter: FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "26px 22px" }}>
    {[
      ["46%", 10, INK, 0],
      ["92%", 7, "#dcdce0", 14],
      ["86%", 7, "#dcdce0", 0],
      ["90%", 7, "#dcdce0", 0],
      ["60%", 7, "#dcdce0", 0],
      ["88%", 7, "#dcdce0", 12],
      ["70%", 7, "#dcdce0", 0],
      ["30%", 7, "#6d28d9", 12],
    ].map(([width, height, background, marginTop], i) => (
      <span
        key={i}
        style={{ display: "block", width: width as string, height: height as number, borderRadius: 3, background: background as string, marginTop: marginTop as number }}
      />
    ))}
  </div>
);

const BODIES: Record<Exclude<TemplateKey, "letter">, FC<{ c: CampaignContent }>> = {
  announcement: Announcement,
  newsletter: Newsletter,
  offer: Offer,
  spotlight: Spotlight,
  comeback: ComeBack,
  live: Live,
};

interface Props {
  templateKey: TemplateKey;
  content: CampaignContent;
}

const TemplateMiniature: FC<Props> = ({ templateKey, content }) => {
  // Drawn at 600 px and scaled to the card's width.
  const { ref, width } = useElementWidth<HTMLSpanElement>();
  const scale = width ? width / 600 : 0.42;

  if (templateKey === "letter")
    return (
      <span aria-hidden="true" className="block h-full rounded-[10px] border border-dashed border-control bg-white">
        <Letter />
      </span>
    );

  const Body = BODIES[templateKey];
  return (
    <span ref={ref} aria-hidden="true" className="relative block h-full overflow-hidden rounded-[10px] bg-white">
      <span
        className={lexend.className}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 600,
          minHeight: 1600,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
          background: "#ffffff",
          color: INK,
          display: "block",
        }}
      >
        {Body ? <Body c={content} /> : null}
      </span>
    </span>
  );
};

export default TemplateMiniature;
