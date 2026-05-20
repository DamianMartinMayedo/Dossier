// ── Content blocks ─────────────────────────────────────────────
// Sistema de bloques editable desde admin para proyectos principales.
// Se almacena en `projects.content` (JSONB array) en Supabase.

export interface BaseBlock {
  id: string; // uuid estable, usado como React key y para reorden
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 2 | 3;
  text: string;
  eyebrow?: string;
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  text: string; // line-breaks preservados; sin markdown
}

export type ImageWidth = "contained" | "wide" | "full";

export interface ImageBlock extends BaseBlock {
  type: "image";
  url: string;
  alt: string;
  caption?: string;
  width: ImageWidth;
}

export interface GalleryImage {
  url: string;
  alt: string;
}

export interface GalleryBlock extends BaseBlock {
  type: "gallery";
  images: GalleryImage[];
  columns: 1 | 2 | 3;
}

export interface CarouselBlock extends BaseBlock {
  type: "carousel";
  images: GalleryImage[];
}

export type TwoColumnsRatio = "1:1" | "1:2" | "2:1";

/** Bloques que pueden ir DENTRO de una columna (todos menos TwoColumns: no anidamos). */
export type SimpleBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | GalleryBlock
  | CarouselBlock;

export type SimpleBlockType = SimpleBlock["type"];

export interface TwoColumnsBlock extends BaseBlock {
  type: "two-columns";
  ratio: TwoColumnsRatio;
  left: SimpleBlock | null;
  right: SimpleBlock | null;
}

export type ContentBlock = SimpleBlock | TwoColumnsBlock;

export type ContentBlockType = ContentBlock["type"];

// ── Project ────────────────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: "principal" | "secundario";
  description: string;
  subtitle: string | null;
  cover_image: string | null;
  header_image: string | null;
  images: string[];
  content: ContentBlock[];
  services: string[];
  client: string | null;
  year: string | null;
  featured: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name: string;
  bio: string;
  avatar: string | null;
  skills: string[];
  social_links: SocialLinks;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  behance?: string;
  dribbble?: string;
  email?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ProjectFormData {
  title: string;
  slug: string;
  category: "principal" | "secundario";
  description: string;
  subtitle: string;
  services: string;
  client: string;
  year: string;
  featured: boolean;
  order: number;
}
