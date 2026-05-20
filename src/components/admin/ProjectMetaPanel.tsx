"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProjectFormData } from "@/types";
import Dropzone from "./Dropzone";
import { useFileUpload } from "./useFileUpload";
import styles from "./ProjectMetaPanel.module.css";

interface Props {
  form: ProjectFormData;
  isEditing: boolean;
  hasContent: boolean;
  coverUrl: string | null;
  onUpdate: <K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) => void;
  onCoverChange: (url: string | null) => void;
}

export default function ProjectMetaPanel({
  form,
  isEditing,
  hasContent,
  coverUrl,
  onUpdate,
  onCoverChange,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const { uploading, error, upload } = useFileUpload();

  async function handleCover(files: File[]) {
    if (files.length === 0) return;
    try {
      const [url] = await upload([files[0]]);
      onCoverChange(url);
    } catch {
      // error mostrado por el hook
    }
  }

  function handleCategoryChange(value: "principal" | "secundario") {
    if (form.category === "principal" && value === "secundario" && hasContent && isEditing) {
      const ok = confirm(
        "Este proyecto tiene bloques de contenido. Si lo cambias a secundario, su página de detalle dejará de existir y los bloques se ocultarán de la web (pero no se borrarán). ¿Continuar?"
      );
      if (!ok) return;
    }
    onUpdate("category", value);
  }

  return (
    <aside className={`${styles.panel} ${collapsed ? styles.collapsed : ""}`}>
      <header className={styles.header}>
        <h3 className={styles.title}>Ficha del proyecto</h3>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expandir panel" : "Colapsar panel"}
        >
          {collapsed ? "▸" : "◂"}
        </button>
      </header>

      {!collapsed && (
        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Categoría</label>
            <div className={styles.radioGroup}>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="category"
                  value="principal"
                  checked={form.category === "principal"}
                  onChange={() => handleCategoryChange("principal")}
                />
                <span>Principal</span>
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="category"
                  value="secundario"
                  checked={form.category === "secundario"}
                  onChange={() => handleCategoryChange("secundario")}
                />
                <span>Secundario</span>
              </label>
            </div>
            <p className={styles.hint}>
              {form.category === "principal"
                ? "Tiene página de detalle propia y puede aparecer en home."
                : "Sólo aparece como tarjeta en /proyectos; se amplía en lightbox."}
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Título</label>
            <input
              type="text"
              className={styles.input}
              value={form.title}
              onChange={(e) => onUpdate("title", e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Slug</label>
            <input
              type="text"
              className={styles.input}
              value={form.slug}
              onChange={(e) => onUpdate("slug", e.target.value)}
              required
              pattern="[a-z0-9-]+"
              title="Solo minúsculas, números y guiones"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Cliente</label>
            <input
              type="text"
              className={styles.input}
              value={form.client}
              onChange={(e) => onUpdate("client", e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Año</label>
            <input
              type="text"
              className={styles.input}
              value={form.year}
              onChange={(e) => onUpdate("year", e.target.value)}
              placeholder="Ej. 2024 o 2021–2022"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Servicios (separados por coma)</label>
            <input
              type="text"
              className={styles.input}
              value={form.services}
              onChange={(e) => onUpdate("services", e.target.value)}
              placeholder="UI/UX, Branding"
            />
          </div>

          {form.category === "principal" && (
            <div className={styles.field}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => onUpdate("featured", e.target.checked)}
                  className={styles.checkbox}
                />
                <span>Mostrar en home (destacado)</span>
              </label>
              <p className={styles.hint}>
                Sale en /proyectos siempre; en home solo si está marcado.
              </p>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>
              Cover {form.category === "secundario" ? "(se amplía en lightbox)" : "(card)"}
            </label>
            {coverUrl && (
              <div className={styles.coverPreview}>
                <Image
                  src={coverUrl}
                  alt="Cover"
                  fill
                  sizes="240px"
                  className={styles.coverImg}
                  unoptimized
                />
              </div>
            )}
            <Dropzone
              onFiles={handleCover}
              disabled={uploading}
              compact
              label={coverUrl ? "Reemplazar cover" : "Arrastra o pulsa para subir cover"}
            />
            {uploading && <p className={styles.uploading}>Subiendo…</p>}
            {error && <p className={styles.error}>{error}</p>}
            {coverUrl && (
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => onCoverChange(null)}
              >
                Quitar cover
              </button>
            )}
          </div>

          <div className={styles.advanced}>
            <p className={styles.advancedLabel}>Avanzado</p>
            <div className={styles.field}>
              <label className={styles.label}>Orden en /proyectos</label>
              <input
                type="number"
                className={`${styles.input} ${styles.inputSmall}`}
                value={form.order}
                onChange={(e) => onUpdate("order", parseInt(e.target.value) || 0)}
              />
              <p className={styles.hint}>
                Menor = más arriba en el listado. Usa 1, 2, 3… No es crítico.
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
