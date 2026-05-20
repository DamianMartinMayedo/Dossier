// Factory + validador para bloques de contenido de proyectos.
// Usado por el editor del admin y por la API route como type guard.

import { v4 as uuidv4 } from "uuid";
import type {
  ContentBlock,
  ContentBlockType,
  ImageWidth,
  SimpleBlock,
  SimpleBlockType,
  TwoColumnsRatio,
} from "@/types";

const BLOCK_TYPES: readonly ContentBlockType[] = [
  "heading",
  "paragraph",
  "image",
  "gallery",
  "carousel",
  "two-columns",
] as const;

export const SIMPLE_BLOCK_TYPES: readonly SimpleBlockType[] = [
  "heading",
  "paragraph",
  "image",
  "gallery",
  "carousel",
] as const;

const IMAGE_WIDTHS: readonly ImageWidth[] = ["contained", "wide", "full"] as const;
const TWO_COL_RATIOS: readonly TwoColumnsRatio[] = ["1:1", "1:2", "2:1"] as const;

/** Crea un sub-bloque "simple" (los que pueden ir dentro de TwoColumns). */
export function createSimpleBlock(type: SimpleBlockType): SimpleBlock {
  const id = uuidv4();
  switch (type) {
    case "heading":
      return { id, type, level: 2, text: "", eyebrow: "" };
    case "paragraph":
      return { id, type, text: "" };
    case "image":
      return { id, type, url: "", alt: "", caption: "", width: "wide" };
    case "gallery":
      return { id, type, images: [], columns: 1 };
    case "carousel":
      return { id, type, images: [] };
  }
}

/** Genera un bloque vacío con uuid y defaults razonables. */
export function createBlock(type: ContentBlockType): ContentBlock {
  if (type === "two-columns") {
    return {
      id: uuidv4(),
      type,
      ratio: "1:1",
      left: createSimpleBlock("paragraph"),
      right: createSimpleBlock("image"),
    };
  }
  return createSimpleBlock(type);
}

// ── Validación ────────────────────────────────────────────────

function isStr(v: unknown): v is string {
  return typeof v === "string";
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function validateBaseBlock(b: unknown): b is { id: string; type: string } {
  if (!isObj(b)) return false;
  if (!isStr(b.id) || b.id.length === 0) return false;
  if (!isStr(b.type) || !BLOCK_TYPES.includes(b.type as ContentBlockType)) return false;
  return true;
}

function validateHeading(b: Record<string, unknown>): boolean {
  if (b.level !== 2 && b.level !== 3) return false;
  if (!isStr(b.text)) return false;
  if (b.eyebrow !== undefined && !isStr(b.eyebrow)) return false;
  return true;
}

function validateParagraph(b: Record<string, unknown>): boolean {
  return isStr(b.text);
}

function validateImage(b: Record<string, unknown>): boolean {
  if (!isStr(b.url)) return false;
  if (!isStr(b.alt)) return false;
  if (b.caption !== undefined && !isStr(b.caption)) return false;
  if (!isStr(b.width) || !IMAGE_WIDTHS.includes(b.width as ImageWidth)) return false;
  return true;
}

function validateGalleryImages(v: unknown): boolean {
  if (!Array.isArray(v)) return false;
  return v.every((img) => isObj(img) && isStr(img.url) && isStr(img.alt));
}

function validateGallery(b: Record<string, unknown>): boolean {
  if (!validateGalleryImages(b.images)) return false;
  if (b.columns !== 1 && b.columns !== 2 && b.columns !== 3) return false;
  return true;
}

function validateCarousel(b: Record<string, unknown>): boolean {
  return validateGalleryImages(b.images);
}

function isValidSimpleSide(v: unknown): boolean {
  if (v === null) return true;
  if (!isObj(v)) return false;
  if (!isStr(v.type)) return false;
  if (!SIMPLE_BLOCK_TYPES.includes(v.type as SimpleBlockType)) return false;
  return isValidBlock(v);
}

function validateTwoColumns(b: Record<string, unknown>): boolean {
  if (!isStr(b.ratio) || !TWO_COL_RATIOS.includes(b.ratio as TwoColumnsRatio)) return false;
  if (!isValidSimpleSide(b.left)) return false;
  if (!isValidSimpleSide(b.right)) return false;
  return true;
}

function isValidBlock(b: unknown): b is ContentBlock {
  if (!validateBaseBlock(b)) return false;
  const block = b as Record<string, unknown>;
  switch (block.type) {
    case "heading":
      return validateHeading(block);
    case "paragraph":
      return validateParagraph(block);
    case "image":
      return validateImage(block);
    case "gallery":
      return validateGallery(block);
    case "carousel":
      return validateCarousel(block);
    case "two-columns":
      return validateTwoColumns(block);
    default:
      return false;
  }
}

/** Type guard server-side. Devuelve true si content es un array de bloques válidos. */
export function isValidContent(content: unknown): content is ContentBlock[] {
  if (!Array.isArray(content)) return false;
  return content.every(isValidBlock);
}

/** Resumen corto del bloque para mostrar en el editor (header colapsado). */
export function blockSummary(block: ContentBlock): string {
  switch (block.type) {
    case "heading":
      return block.text || "(sin título)";
    case "paragraph": {
      const t = block.text.trim();
      return t.length > 60 ? `${t.slice(0, 60)}…` : t || "(sin texto)";
    }
    case "image":
      return block.alt || block.url || "(sin imagen)";
    case "gallery":
      return `${block.images.length} imágenes · ${block.columns} col`;
    case "carousel":
      return `${block.images.length} imágenes`;
    case "two-columns": {
      const l = block.left ? BLOCK_LABELS[block.left.type] : "—";
      const r = block.right ? BLOCK_LABELS[block.right.type] : "—";
      return `${l} + ${r} · ${block.ratio}`;
    }
  }
}

/** Etiqueta legible para el selector de bloques. */
export const BLOCK_LABELS: Record<ContentBlockType, string> = {
  heading: "Título",
  paragraph: "Párrafo",
  image: "Imagen",
  gallery: "Galería",
  carousel: "Carrusel",
  "two-columns": "Dos columnas",
};
