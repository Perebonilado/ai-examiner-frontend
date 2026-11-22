import React, { FC } from "react";
import cn from "classnames";
import { FileText, Image as ImageIcon, LucideIcon, Presentation, Type } from "lucide-react";

/* A white paper card with a folded corner, a brand-coloured glyph and a type label.
   Used by the upload box (fan + file chip) and the Preparing test dialog.
   Brand colours as on today's upload icons; flat fills only. */

export type FileTypeTileExt = "PDF" | "DOCX" | "PPTX" | "PPT" | "JPG" | "PNG" | "TXT";

const BRAND: Record<FileTypeTileExt, { color: string; icon?: LucideIcon }> = {
  PDF: { color: "#c8371f", icon: FileText },
  DOCX: { color: "#2b62c9", icon: Type },
  PPTX: { color: "#b5441a", icon: Presentation },
  PPT: { color: "#b5441a", icon: Presentation },
  JPG: { color: "#24774a" },
  PNG: { color: "#24774a" },
  TXT: { color: "#5c5c65", icon: FileText },
};

/** Map a file name / mime type to the tile's label. */
export const getFileTypeTileExt = (
  name?: string,
  mimeType?: string
): FileTypeTileExt => {
  const ext = (name?.match(/\.([a-z0-9]+)$/i)?.[1] || "").toLowerCase();
  if (ext === "pdf" || (!ext && mimeType?.includes("pdf"))) return "PDF";
  if (ext === "doc" || ext === "docx") return "DOCX";
  if (ext === "ppt" || ext === "pptx") return "PPTX";
  if (["png", "jpg", "jpeg", "heic", "webp"].includes(ext)) return "JPG";
  if (ext === "txt" || mimeType?.startsWith("text/")) return "TXT";
  return "PDF";
};

const PhotoGlyph: FC<{ size: number; className?: string }> = ({
  size,
  className,
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    aria-hidden="true"
    className={className}
  >
    <rect x="2.5" y="4" width="19" height="16" rx="3" fill="#dcecff" />
    <circle cx="16.5" cy="8.6" r="2.2" fill="#f6b928" />
    <path
      d="M2.5 16.2 8 10.8l4.2 4.1 2.6-2.4 6.7 6.1V17c0 1.66-1.34 3-3 3h-13a3 3 0 0 1-3-3Z"
      fill="#2fa564"
    />
    <path d="M2.5 17.4 8 12.6l5.6 5.2.2 2.2H5.5a3 3 0 0 1-3-3Z" fill="#1d7f49" />
  </svg>
);

type Size = "sm" | "fan" | "lg" | "hero";

const SIZES: Record<
  Size,
  {
    box: string;
    corner: number;
    glyph: number;
    glyphShift: string;
    label: string;
    stroke: number;
  }
> = {
  sm: {
    box: "w-[30px] h-9 rounded-md",
    corner: 9,
    glyph: 13,
    glyphShift: "-mt-2",
    label: "bottom-1 text-[7px]",
    stroke: 1.75,
  },
  fan: {
    box: "w-[50px] h-[62px] max-md:w-11 max-md:h-14 rounded-[9px]",
    corner: 14,
    glyph: 19,
    glyphShift: "-mt-[11px]",
    label: "bottom-[7px] text-[8px]",
    stroke: 2,
  },
  hero: {
    box: "w-16 h-[84px] max-lg:w-[50px] max-lg:h-[66px] rounded-[10px] max-lg:rounded-[8px]",
    corner: 16,
    glyph: 24,
    glyphShift: "-mt-[16px] max-lg:-mt-[13px] max-lg:scale-[0.82]",
    label: "bottom-[11px] max-lg:bottom-[8px] text-[11px] max-lg:text-[9px]",
    stroke: 2,
  },
  lg: {
    box: "w-14 h-[68px] rounded-[11px]",
    corner: 16,
    glyph: 22,
    glyphShift: "-mt-3",
    label: "bottom-[9px] text-[11px]",
    stroke: 1.75,
  },
};

interface Props {
  ext: FileTypeTileExt;
  size?: Size;
  className?: string;
  /** Extra classes for the type label (the home hero sets its rounded face here). */
  labelClassName?: string;
}

const FileTypeTile: FC<Props> = ({
  ext,
  size = "sm",
  className,
  labelClassName,
}) => {
  const { color, icon: Icon } = BRAND[ext];
  const s = SIZES[size];
  const c = s.corner;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid place-items-center flex-shrink-0 bg-white shadow-[inset_0_0_0_1px_rgba(16,12,40,0.08)]",
        s.box,
        className
      )}
      style={{
        color,
        clipPath: `polygon(0 0, calc(100% - ${c}px) 0, 100% ${c}px, 100% 100%, 0 100%)`,
      }}
    >
      {/* folded corner */}
      <span
        className="absolute top-0 right-0 bg-[#e8e8ec]"
        style={{
          width: c,
          height: c,
          borderBottomLeftRadius: Math.round(c / 4),
          clipPath: "polygon(0 0, 100% 100%, 0 100%)",
        }}
      />
      {size === "hero" && !Icon ? (
        <ImageIcon size={s.glyph} strokeWidth={s.stroke} className={s.glyphShift} />
      ) : Icon ? (
        <Icon size={s.glyph} strokeWidth={s.stroke} className={s.glyphShift} />
      ) : (
        <PhotoGlyph size={s.glyph + 3} className={s.glyphShift} />
      )}
      {size === "fan" || size === "hero" ? (
        <b
          className={cn(
            "absolute left-1/2 -translate-x-1/2 px-[5px] pt-[2px] pb-[1.5px] rounded font-extrabold leading-none tracking-[0.06em] text-white",
            size === "hero" && "px-[7px] pt-[4px] pb-[3px] rounded-[5px]",
            s.label,
            labelClassName
          )}
          style={{ background: color }}
        >
          {ext}
        </b>
      ) : (
        <b
          className={cn(
            "absolute inset-x-0 text-center font-extrabold leading-none tracking-[0.04em]",
            s.label
          )}
        >
          {ext}
        </b>
      )}
    </span>
  );
};

export default FileTypeTile;
