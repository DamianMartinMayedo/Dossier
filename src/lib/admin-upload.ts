// Cliente para /api/admin/upload (POST/DELETE).
// Centralizado para reusar desde ProjectForm, block-forms y ProfileForm.

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

/** Buckets aceptados por la API. Cualquier otro string es ignorado. */
export type AdminUploadBucket = "projects" | "profile" | "empresas";

export const ADMIN_UPLOAD_ALLOWED_ACCEPT = ALLOWED_TYPES.join(",");
export const ADMIN_UPLOAD_HINT = "PNG, JPG, WebP, GIF o SVG. Máx 10 MB.";

export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Tipo no permitido: ${file.name}. Usa PNG, JPG, WebP, GIF o SVG.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name} pesa más de 10 MB.`;
  }
  return null;
}

/**
 * Sube un archivo al bucket indicado (default: "projects").
 * Devuelve la URL pública.
 */
export async function uploadAdminFile(
  file: File,
  bucket: AdminUploadBucket = "projects",
): Promise<string> {
  const err = validateUploadFile(file);
  if (err) throw new Error(err);
  const fd = new FormData();
  fd.append("file", file);
  fd.append("bucket", bucket);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Error al subir imagen");
  return data.url as string;
}

function pathFromPublicUrl(url: string, bucket: AdminUploadBucket): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export async function deleteAdminFiles(
  urls: string[],
  bucket: AdminUploadBucket = "projects",
): Promise<void> {
  if (urls.length === 0) return;
  const paths = urls.map((u) => pathFromPublicUrl(u, bucket)).filter((p): p is string => Boolean(p));
  if (paths.length === 0) return;
  await fetch("/api/admin/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paths, bucket }),
  });
}
