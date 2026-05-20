"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import type { ContentBlock, Project, ProjectFormData } from "@/types";
import { deleteAdminFiles } from "@/lib/admin-upload";
import Dropzone from "./Dropzone";
import { useFileUpload } from "./useFileUpload";
import ProjectMetaPanel from "./ProjectMetaPanel";
import ContentEditor from "./ContentEditor";
import Toast from "@/components/ui/Toast";
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
    subtitle: project?.subtitle || "",
    services: project?.services.join(", ") || "",
    client: project?.client || "",
    year: project?.year || "",
    featured: project?.featured || false,
    order: project?.order || 0,
  });

  const [coverImage, setCoverImage] = useState<string | null>(project?.cover_image ?? null);
  const [headerImage, setHeaderImage] = useState<string | null>(project?.header_image ?? null);
  const [content, setContent] = useState<ContentBlock[]>(project?.content ?? []);
  const headerUpload = useFileUpload();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function updateField<K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-slug on title change for new projects.
      if (key === "title" && !isEditing) {
        next.slug = slugify(value as string);
      }
      // When moving to secundario, force featured = false and clear principal-only fields.
      if (key === "category" && value === "secundario") {
        next.featured = false;
      }
      return next;
    });
  }

  async function handleHeaderImage(files: File[]) {
    if (files.length === 0) return;
    try {
      const [url] = await headerUpload.upload([files[0]]);
      setHeaderImage(url);
    } catch {
      // error en headerUpload.error
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...(isEditing ? { id: project.id } : {}),
        title: form.title,
        slug: form.slug,
        category: form.category,
        description: form.description,
        subtitle: form.category === "principal" ? form.subtitle : null,
        cover_image: coverImage,
        header_image: form.category === "principal" ? headerImage : null,
        // Sólo enviamos `content` para principales; en secundarios lo dejamos a []
        content: form.category === "principal" ? content : [],
        // El campo legacy `images` se queda como estaba (sin tocar)
        images: project?.images ?? [],
        services: form.services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        client: form.client || null,
        year: form.year || null,
        featured: form.category === "principal" ? form.featured : false,
        order: form.order,
      };

      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error al guardar");

      if (isEditing) {
        // Al editar nos quedamos en la misma página → sólo refrescamos y
        // mostramos toast. Así no se pierde el scroll/contexto.
        setToast("Proyecto actualizado");
        router.refresh();
      } else {
        // Al crear, redirigimos a la ruta de edición del recién creado para
        // poder subir imágenes y bloques con un id real.
        router.push(`/admin/proyectos/${result.id}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!project || !confirm("¿Eliminar este proyecto? Se borrarán también sus imágenes.")) return;

    const res = await fetch(`/api/admin/projects?id=${project.id}`, { method: "DELETE" });
    if (!res.ok) {
      const result = await res.json();
      alert(result.error || "Error al eliminar");
      return;
    }

    const urlsToDelete = [
      ...(project.cover_image ? [project.cover_image] : []),
      ...(project.header_image ? [project.header_image] : []),
      ...project.images,
    ];
    await deleteAdminFiles(urlsToDelete);

    router.push("/admin/proyectos");
    router.refresh();
  }

  const isPrincipal = form.category === "principal";

  return (
    <>
    <form id="project-form" onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.layout}>
        <main className={styles.main}>
          {isPrincipal ? (
            <>
              <section className={styles.headerCard}>
                <div className={styles.field}>
                  <label className={styles.label}>Subtítulo</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={form.subtitle}
                    onChange={(e) => updateField("subtitle", e.target.value)}
                    placeholder="Diseño, liderazgo y ecosistema digital"
                  />
                  <p className={styles.hint}>
                    Frase corta debajo del título en la página de detalle.
                  </p>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Imagen de cabecera (opcional)</label>
                  {headerImage && (
                    <div className={styles.headerPreview}>
                      <Image
                        src={headerImage}
                        alt="Cabecera"
                        fill
                        sizes="(min-width: 960px) 600px, 100vw"
                        className={styles.headerImg}
                        unoptimized
                      />
                    </div>
                  )}
                  <Dropzone
                    onFiles={handleHeaderImage}
                    disabled={headerUpload.uploading}
                    label={headerImage ? "Reemplazar cabecera" : "Arrastra o pulsa para subir cabecera"}
                    hint="Hero full-bleed arriba de la página. PNG, JPG, WebP, GIF o SVG. Máx 10 MB."
                  />
                  {headerUpload.uploading && <p className={styles.uploading}>Subiendo…</p>}
                  {headerUpload.error && <p className={styles.errorInline}>{headerUpload.error}</p>}
                  {headerImage && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => setHeaderImage(null)}
                    >
                      Quitar cabecera
                    </button>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Descripción (resumen corto)</label>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Se usa como fallback si no hay bloques y en metadatos OG/SEO."
                  />
                </div>
              </section>

              <ContentEditor blocks={content} onChange={setContent} />
            </>
          ) : (
            <section className={styles.headerCard}>
              <div className={styles.field}>
                <label className={styles.label}>Descripción (opcional)</label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Texto opcional sobre el proyecto secundario."
                />
              </div>
              <p className={styles.secondaryNote}>
                Los proyectos secundarios no tienen página propia. Sólo aparecen como tarjeta en
                /proyectos y se amplían en un lightbox al hacer click sobre el cover.
              </p>
            </section>
          )}
        </main>

        <aside className={styles.sidebar}>
          <ProjectMetaPanel
            form={form}
            isEditing={isEditing}
            hasContent={content.length > 0}
            coverUrl={coverImage}
            onUpdate={updateField}
            onCoverChange={setCoverImage}
          />
        </aside>
      </div>
    </form>
    <Toast message={toast} onClose={() => setToast(null)} />
    </>
  );
}
