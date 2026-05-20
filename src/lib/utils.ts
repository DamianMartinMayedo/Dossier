import type { ContentBlock, Project } from "@/types";
import { isValidContent } from "@/lib/blocks";

/**
 * Returns the best URL to use as the project cover image.
 * Falls back to null when there is no image (the component shows initials instead).
 */
export function getProjectCover(project: Pick<Project, "cover_image" | "images">): string | null {
  return project.cover_image ?? (project.images?.[0] ?? null);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export interface ProjectPayload {
  title: string;
  slug: string;
  category: "principal" | "secundario";
  description?: string;
  subtitle?: string | null;
  cover_image?: string | null;
  header_image?: string | null;
  images?: string[];
  content?: ContentBlock[];
  services?: string[];
  client?: string | null;
  year?: string | null;
  featured?: boolean;
  order?: number;
}

export function validateProjectPayload(
  input: unknown
): { ok: true; data: ProjectPayload } | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Payload inválido" };
  }
  const p = input as Record<string, unknown>;

  if (typeof p.title !== "string" || p.title.trim().length === 0) {
    return { ok: false, error: "Falta título" };
  }
  if (typeof p.slug !== "string" || p.slug.trim().length === 0) {
    return { ok: false, error: "Falta slug" };
  }
  if (!/^[a-z0-9-]+$/.test(p.slug)) {
    return { ok: false, error: "Slug solo permite letras minúsculas, números y guiones" };
  }
  if (p.category !== "principal" && p.category !== "secundario") {
    return { ok: false, error: "Categoría debe ser 'principal' o 'secundario'" };
  }

  // Content blocks (sólo principales pueden tenerlos; en secundarios se ignora).
  let content: ContentBlock[] = [];
  if (p.category === "principal") {
    if (p.content !== undefined && p.content !== null) {
      if (!isValidContent(p.content)) {
        return { ok: false, error: "El contenido de bloques está malformado" };
      }
      content = p.content;
    }
  }

  return {
    ok: true,
    data: {
      title: p.title.trim(),
      slug: p.slug.trim(),
      category: p.category,
      description: typeof p.description === "string" ? p.description : "",
      subtitle:
        p.category === "principal" && typeof p.subtitle === "string" && p.subtitle.length > 0
          ? p.subtitle
          : null,
      cover_image: typeof p.cover_image === "string" ? p.cover_image : null,
      header_image:
        p.category === "principal" && typeof p.header_image === "string" && p.header_image.length > 0
          ? p.header_image
          : null,
      images: Array.isArray(p.images) ? p.images.filter((x): x is string => typeof x === "string") : [],
      content,
      services: Array.isArray(p.services) ? p.services.filter((x): x is string => typeof x === "string") : [],
      client: typeof p.client === "string" && p.client.length > 0 ? p.client : null,
      year: typeof p.year === "string" && p.year.length > 0 ? p.year : null,
      // Secundarios nunca van a home.
      featured: p.category === "principal" ? Boolean(p.featured) : false,
      order: typeof p.order === "number" ? p.order : 0,
    },
  };
}
