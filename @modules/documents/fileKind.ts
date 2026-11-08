import {
  File as FileIcon,
  FileChartColumn,
  FileImage,
  FileText,
  FileType,
  LucideIcon,
} from "lucide-react";

export type DocumentFileKind = "pdf" | "word" | "slides" | "image" | "text";

const EXTENSIONS: Record<string, DocumentFileKind> = {
  pdf: "pdf",
  doc: "word",
  docx: "word",
  ppt: "slides",
  pptx: "slides",
  png: "image",
  jpg: "image",
  jpeg: "image",
  heic: "image",
  webp: "image",
  txt: "text",
};

/** Best guess at a stored file's type from its URL (e.g. the stored-file iframe URL). */
export const getFileKindFromUrl = (
  url?: string | null
): DocumentFileKind | undefined => {
  if (!url) return undefined;
  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    /* keep the raw url */
  }
  const matches = decoded
    .toLowerCase()
    .match(/\.(pdf|docx?|pptx?|png|jpe?g|heic|webp|txt)(?=$|[?#&/])/g);
  if (!matches?.length) return undefined;
  return EXTENSIONS[matches[matches.length - 1].slice(1)];
};

export const FILE_KIND_ICON: Record<DocumentFileKind, LucideIcon> = {
  pdf: FileText,
  word: FileType,
  slides: FileChartColumn,
  image: FileImage,
  text: FileIcon,
};

export const FILE_KIND_NAME: Record<DocumentFileKind, string> = {
  pdf: "PDF",
  word: "Word document",
  slides: "PowerPoint",
  image: "Image",
  text: "Text file",
};
