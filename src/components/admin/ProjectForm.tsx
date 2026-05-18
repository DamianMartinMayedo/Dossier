"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import type { Project, ProjectFormData } from "@/types";
import styles from "./ProjectForm.module.css";

interface Props {
  project?: Project;
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
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof ProjectFormData>(
    key: K,
    value: ProjectFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "title" && !isEditing) {
      setForm((prev) => ({ ...prev, slug: slugify(value as string) }));
    }
  }

  async function uploadFile(file: File, bucket: string): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${uuidv4()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      let coverImage = project?.cover_image || null;

      if (coverFile) {
        if (project?.cover_image) {
          const oldPath = project.cover_image.split("/").pop();
          if (oldPath) {
            await supabase.storage.from("projects").remove([oldPath]);
          }
        }
        coverImage = await uploadFile(coverFile, "projects");
      }

      let images = project?.images || [];

      if (galleryFiles.length > 0) {
        const newUrls = await Promise.all(
          galleryFiles.map((f) => uploadFile(f, "projects"))
        );
        images = isEditing ? [...images, ...newUrls] : newUrls;
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
        updated_at: new Date().toISOString(),
        ...(isEditing ? {} : { created_at: new Date().toISOString() }),
      };

      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error al guardar");

      router.push("/admin/proyectos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!project || !confirm("¿Eliminar este proyecto?")) return;

    const res = await fetch(`/api/admin/projects?id=${project.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const result = await res.json();
      alert(result.error || "Error al eliminar");
      return;
    }

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
        {project?.cover_image && !coverFile && (
          <p className={styles.hint}>
            Actual: {project.cover_image.split("/").pop()}
          </p>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          className={styles.fileInput}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Galería de imágenes</label>
        {project?.images && project.images.length > 0 && (
          <p className={styles.hint}>
            {project.images.length} imágenes actuales. Las nuevas se añadirán.
          </p>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) =>
            setGalleryFiles(Array.from(e.target.files || []))
          }
          className={styles.fileInput}
        />
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