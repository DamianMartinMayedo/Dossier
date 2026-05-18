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
  cover_image?: string | null;
  images?: string[];
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

  return {
    ok: true,
    data: {
      title: p.title.trim(),
      slug: p.slug.trim(),
      category: p.category,
      description: typeof p.description === "string" ? p.description : "",
      cover_image: typeof p.cover_image === "string" ? p.cover_image : null,
      images: Array.isArray(p.images) ? p.images.filter((x): x is string => typeof x === "string") : [],
      services: Array.isArray(p.services) ? p.services.filter((x): x is string => typeof x === "string") : [],
      client: typeof p.client === "string" && p.client.length > 0 ? p.client : null,
      year: typeof p.year === "string" && p.year.length > 0 ? p.year : null,
      featured: Boolean(p.featured),
      order: typeof p.order === "number" ? p.order : 0,
    },
  };
}
