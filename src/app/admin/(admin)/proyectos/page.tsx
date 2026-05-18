import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import styles from "./page.module.css";

export default async function AdminProyectos() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("order", { ascending: true });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Proyectos</h1>
        <Link href="/admin/proyectos/nuevo" className={styles.addBtn}>
          + Nuevo
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <p className={styles.empty}>No hay proyectos aún.</p>
      ) : (
        <div className={styles.list}>
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/proyectos/${project.id}`}
              className={styles.row}
            >
              <div className={styles.rowInfo}>
                <span className={styles.rowTitle}>{project.title}</span>
                <span className={styles.rowMeta}>
                  {project.category === "principal" ? "Principal" : "Secundario"}
                  {" · "}
                  {project.order}
                </span>
              </div>
              <span className={styles.rowArrow}>&rarr;</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
