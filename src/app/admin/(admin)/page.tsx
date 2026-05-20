import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { count: projectsCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  return (
    <div className={styles.page}>
      <p className="section-label">Admin</p>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.grid}>
        <Link href="/admin/proyectos" className={styles.card}>
          <span className={styles.number}>{projectsCount ?? 0}</span>
          <span className={styles.label}>Proyectos</span>
        </Link>

        <Link href="/admin/perfil" className={styles.card}>
          <span className={styles.number}>1</span>
          <span className={styles.label}>Perfil</span>
        </Link>
      </div>

      <div className={styles.actions}>
        <Link href="/admin/proyectos/nuevo" className={styles.actionBtn}>
          + Nuevo proyecto
        </Link>
      </div>
    </div>
  );
}
