"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import type { Project, ProjectFormData } from "@/types";
import styles from "./ProjectForm.module.css";

interface Props {
  project?: Project;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 12;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

function pathFromPublicUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/projects/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export default function ProjectForm({ project }: Props) {
  const router = useRouter();
  const isEditing = !!project;

  const [form, setForm] = useState<ProjectFormData>({
    title: project?.title || "",
    slug: project?.slug || "",
    category: project?.category || "principal",
    description: project?.description || "",
    services: project?.services.join(", ") || "",
    client: project?.client || "",
    year: project?.year || "",
    featured: project?.featured || false,
    order: project?.order || 0,
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(project?.images || []);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const newGalleryPreviews = useMemo(
    () => galleryFiles.map((f) => URL.createObjectURL(f)),
    [galleryFiles]
  );

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  useEffect(() => {
    return () => newGalleryPreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [newGalleryPreviews]);

  function updateField<K extends keyof ProjectFormData>(
    key: K,
    value: ProjectFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "title" && !isEditing) {
      setForm((prev) => ({ ...prev, slug: slugify(value as string) }));
    }
  }

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Tipo no permitido: ${file.name}. Usa PNG, JPG, WebP, GIF o SVG.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} pesa más de 10 MB.`;
    }
    return null;
  }

  function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (file) {
      const err = validateFile(file);
      if (err) {
        setError(err);
        e.target.value = "";
        return;
      }
    }
    setError("");
    setCoverFile(file);
  }

  function onGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      const err = validateFile(f);
      if (err) {
        setError(err);
        e.target.value = "";
        return;
      }
    }
    const totalCount = existingImages.length + files.length;
    if (totalCount > MAX_GALLERY_IMAGES) {
      setError(`Máximo ${MAX_GALLERY_IMAGES} imágenes en la galería.`);
      e.target.value = "";
      return;
    }
    setError("");
    setGalleryFiles(files);
  }

  function removeExistingImage(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url));
    setRemovedImages((prev) => [...prev, url]);
  }

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al subir imagen");
    return data.url as string;
  }

  async function deleteStorageFiles(urls: string[]) {
    if (urls.length === 0) return;
    const paths = urls
      .map(pathFromPublicUrl)
      .filter((p): p is string => Boolean(p));
    if (paths.length === 0) return;
    await fetch("/api/admin/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let coverImage = project?.cover_image || null;

      if (coverFile) {
        if (project?.cover_image) {
          await deleteStorageFiles([project.cover_image]);
        }
        coverImage = await uploadFile(coverFile);
      }

      let images = [...existingImages];
      if (galleryFiles.length > 0) {
        const newUrls = await Promise.all(galleryFiles.map(uploadFile));
        images = [...images, ...newUrls];
      }

      const payload = {
        ...(isEditing ? { id: project.id } : {}),
        title: form.title,
        slug: form.slug,
        category: form.category,
        description: form.description,
        cover_image: coverImage,
        images,
        services: form.services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        client: form.client || null,
        year: form.year || null,
        featured: form.featured,
        order: form.order,
      };

      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error al guardar");

      if (removedImages.length > 0) {
        await deleteStorageFiles(removedImages);
      }

      router.push("/admin/proyectos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!project || !confirm("¿Eliminar este proyecto? Se borrarán también sus imágenes.")) return;

    const res = await fetch(`/api/admin/projects?id=${project.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const result = await res.json();
      alert(result.error || "Error al eliminar");
      return;
    }

    const urlsToDelete = [
      ...(project.cover_image ? [project.cover_image] : []),
      ...project.images,
    ];
    await deleteStorageFiles(urlsToDelete);

    router.push("/admin/proyectos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.field}>
        <label className={styles.label}>Título</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Slug</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => updateField("slug", e.target.value)}
          required
          pattern="[a-z0-9-]+"
          title="Solo minúsculas, números y guiones"
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Categoría</label>
        <select
          value={form.category}
          onChange={(e) =>
            updateField(
              "category",
              e.target.value as "principal" | "secundario"
            )
          }
          className={styles.input}
        >
          <option value="principal">Principal</option>
          <option value="secundario">Secundario</option>
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Descripción</label>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={4}
          className={styles.textarea}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Servicios (separados por coma)
        </label>
        <input
          type="text"
          value={form.services}
          onChange={(e) => updateField("services", e.target.value)}
          placeholder="UI/UX Design, Branding, Web"
          className={styles.input}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Cliente</label>
          <input
            type="text"
            value={form.client}
            onChange={(e) => updateField("client", e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Año</label>
          <input
            type="text"
            value={form.year}
            onChange={(e) => updateField("year", e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Orden</label>
          <input
            type="number"
            value={form.order}
            onChange={(e) =>
              updateField("order", parseInt(e.target.value) || 0)
            }
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => updateField("featured", e.target.checked)}
              className={styles.checkbox}
            />
            Destacado
          </label>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Imagen de portada</label>
        {(coverPreview || project?.cover_image) && (
          <div className={styles.coverPreview}>
            <Image
              src={coverPreview || project!.cover_image!}
              alt="Portada"
              width={320}
              height={200}
              className={styles.previewImg}
              unoptimized
            />
          </div>
        )}
        <input
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={onCoverChange}
          className={styles.fileInput}
        />
        <p className={styles.hint}>PNG, JPG, WebP, GIF o SVG. Máx 10 MB.</p>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Galería</label>
        {existingImages.length > 0 && (
          <div className={styles.gallery}>
            {existingImages.map((url) => (
              <div key={url} className={styles.galleryItem}>
                <Image
                  src={url}
                  alt=""
                  width={120}
                  height={90}
                  className={styles.galleryImg}
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(url)}
                  className={styles.galleryRemove}
                  aria-label="Quitar imagen"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {newGalleryPreviews.length > 0 && (
          <div className={styles.gallery}>
            {newGalleryPreviews.map((url, i) => (
              <div key={url} className={styles.galleryItem}>
                <Image
                  src={url}
                  alt=""
                  width={120}
                  height={90}
                  className={styles.galleryImg}
                  unoptimized
                />
                <span className={styles.newBadge}>Nueva {i + 1}</span>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          onChange={onGalleryChange}
          className={styles.fileInput}
        />
        <p className={styles.hint}>
          Hasta {MAX_GALLERY_IMAGES} imágenes en total (actualmente{" "}
          {existingImages.length + galleryFiles.length}).
        </p>
      </div>

      <div className={styles.buttons}>
        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading
            ? "Guardando..."
            : isEditing
              ? "Actualizar"
              : "Crear proyecto"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className={styles.deleteBtn}
          >
            Eliminar
          </button>
        )}
      </div>
    </form>
  );
}
