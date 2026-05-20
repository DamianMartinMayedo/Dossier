"use client";

import { useRouter } from "next/navigation";
import styles from "@/app/admin/(admin)/proyectos/form-page.module.css";

interface Props {
  projectId?: string;
  isEditing: boolean;
  loading?: boolean;
}

export default function FormActions({ projectId, isEditing, loading = false }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!projectId || !confirm("¿Eliminar este proyecto? Se borrarán también sus imágenes.")) return;

    const res = await fetch(`/api/admin/projects?id=${projectId}`, { method: "DELETE" });
    if (!res.ok) {
      const result = await res.json();
      alert(result.error || "Error al eliminar");
      return;
    }

    router.push("/admin/proyectos");
    router.refresh();
  }

  return (
    <div className={styles.actions}>
      <button type="submit" form="project-form" disabled={loading} className={styles.submitBtn}>
        {loading ? "Guardando…" : isEditing ? "Actualizar" : "Crear proyecto"}
      </button>
      {isEditing && (
        <button type="button" onClick={handleDelete} className={styles.deleteBtn}>
          Eliminar
        </button>
      )}
    </div>
  );
}
