"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Reorder } from "framer-motion";
import { deleteAdminFiles, uploadAdminFile } from "@/lib/admin-upload";
import Dropzone from "./Dropzone";
import Toast from "@/components/ui/Toast";
import styles from "./EmpresasManager.module.css";

export interface Collaboration {
  id: string;
  name: string;
  image_url: string;
  order: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  initial: Collaboration[];
}

function nameFromFilename(filename: string): string {
  const noExt = filename.replace(/\.[^.]+$/, "");
  return noExt
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** ¿Cambió el orden de la lista respecto al original que vino del server? */
function isDirty(current: Collaboration[], baseline: Collaboration[]): boolean {
  if (current.length !== baseline.length) return true;
  for (let i = 0; i < current.length; i++) {
    if (current[i].id !== baseline[i].id) return true;
  }
  return false;
}

export default function EmpresasManager({ initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Lista local que el usuario reordena. Se sincroniza con `initial` cuando
  // el server devuelve datos nuevos (tras upload/delete).
  const [items, setItems] = useState<Collaboration[]>(initial);
  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const dirty = isDirty(items, initial);

  async function handleUpload(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    let nextOrder = initial.reduce((max, c) => Math.max(max, c.order), 0) + 1;
    let ok = 0;
    let fail = 0;

    for (const file of files) {
      try {
        const url = await uploadAdminFile(file, "empresas");
        const res = await fetch("/api/admin/empresas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameFromFilename(file.name),
            image_url: url,
            order: nextOrder++,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Error con ${file.name}`);
        }
        ok++;
      } catch (err) {
        fail++;
        console.error("[empresas] upload failed:", err);
      }
    }

    setUploading(false);
    if (ok > 0 && fail === 0) {
      setToast({
        message: `${ok} ${ok === 1 ? "logo subido" : "logos subidos"}`,
        variant: "success",
      });
    } else if (ok > 0 && fail > 0) {
      setToast({
        message: `${ok} subidos, ${fail} con error — revisa la consola`,
        variant: "error",
      });
    } else {
      setToast({ message: "Error al subir los logos", variant: "error" });
    }
    startTransition(() => router.refresh());
  }

  async function handleDelete(row: Collaboration) {
    if (!confirm(`¿Eliminar "${row.name}"?`)) return;
    setDeletingId(row.id);
    try {
      const res = await fetch(`/api/admin/empresas?id=${row.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }
      await deleteAdminFiles([row.image_url], "empresas");
      setToast({ message: "Eliminada", variant: "success" });
      startTransition(() => router.refresh());
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Error al eliminar",
        variant: "error",
      });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSaveOrder() {
    if (!dirty) return;
    setSaving(true);
    try {
      // Asignamos orden secuencial (10, 20, 30…) → deja huecos por si quieres
      // insertar manualmente en medio sin tener que repaginar todos.
      const payload = items.map((it, idx) => ({ id: it.id, order: (idx + 1) * 10 }));
      const res = await fetch("/api/admin/empresas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar el orden");
      }
      setToast({ message: "Orden guardado", variant: "success" });
      startTransition(() => router.refresh());
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Error al guardar",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <Dropzone
        multiple
        disabled={uploading}
        onFiles={handleUpload}
        label={
          uploading
            ? "Subiendo logos…"
            : "Arrastra uno o varios logos, o haz click para seleccionar"
        }
      />

      <section className={styles.list}>
        <div className={styles.listHeader}>
          <h2 className={styles.sectionTitle}>Logos ({items.length})</h2>
          {dirty && (
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSaveOrder}
              disabled={saving}
            >
              {saving ? "Guardando…" : "Guardar orden"}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className={styles.empty}>
            Todavía no has subido ningún logo. Empieza arrastrando archivos arriba.
          </p>
        ) : (
          <Reorder.Group
            axis="y"
            values={items}
            onReorder={setItems}
            className={styles.items}
          >
            {items.map((row) => (
              <Reorder.Item
                key={row.id}
                value={row}
                className={styles.row}
                /* Whileragging para feedback visual claro mientras arrastras */
                whileDrag={{ scale: 1.02, zIndex: 10 }}
              >
                <span className={styles.dragHandle} aria-hidden="true">
                  ⋮⋮
                </span>
                <div className={styles.rowImage}>
                  <Image
                    src={row.image_url}
                    alt={row.name}
                    fill
                    sizes="80px"
                    className={styles.rowImg}
                  />
                </div>
                <span className={styles.rowName}>{row.name}</span>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(row)}
                  disabled={deletingId === row.id}
                  aria-label={`Eliminar ${row.name}`}
                >
                  {deletingId === row.id ? "…" : "Eliminar"}
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </section>

      <Toast
        message={toast?.message ?? null}
        variant={toast?.variant ?? "success"}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
