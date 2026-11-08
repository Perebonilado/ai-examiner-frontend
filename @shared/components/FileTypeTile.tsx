import React, { FC } from "react";
import cn from "classnames";
import { FileText, LucideIcon, Presentation, Type } from "lucide-react";

/* A white paper card with a folded corner, a brand-coloured glyph and a type label.
   Used by the upload box (fan + file chip) and the Preparing test dialog.
   Brand colours as on today's upload icons; flat fills only. */

export type FileTypeTileExt = "PDF" | "DOCX" | "PPTX" | "JPG" | "TXT";

const BRAND: Record<FileTypeTileExt, { color: string; icon?: LucideIcon }> = {
  PDF: { color: "#e0412b", icon: FileText },
  DOCX: { color: "#2b62c9", icon: Type },
  PPTX: { color: "#d9541e", icon: Presentation },
  JPG: { color: "#2f8f5b" },
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

type Size = "sm" | "fan" | "lg";

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
}

const FileTypeTile: FC<Props> = ({ ext, size = "sm", className }) => {
  const { color, icon: Icon } = BRAND[ext];
  const s = SIZES[size];
  const c = s.corner;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid place-items-center flex-shrink-0 bg-surface shadow-[inset_0_0_0_1px_rgba(16,12,40,0.08)]",
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
      {Icon ? (
        <Icon size={s.glyph} strokeWidth={s.stroke} className={s.glyphShift} />
      ) : (
        <PhotoGlyph size={s.glyph + 3} className={s.glyphShift} />
      )}
      {size === "fan" ? (
        <b
          className={cn(
            "absolute left-1/2 -translate-x-1/2 px-[5px] pt-[2px] pb-[1.5px] rounded font-extrabold leading-none tracking-[0.06em] text-white",
            s.label
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
