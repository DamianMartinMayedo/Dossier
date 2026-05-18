import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import styles from "./page.module.css";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: projects } = await supabase.from("projects").select("*");
  const { count: mensajesNoLeidos } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("read", false);

  const projectCount = projects?.length || 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.grid}>
        <Link href="/admin/proyectos" className={styles.card}>
          <span className={styles.number}>{projectCount}</span>
          <span className={styles.label}>Proyectos</span>
        </Link>

        <Link href="/admin/mensajes" className={styles.card}>
          <span className={styles.number}>{mensajesNoLeidos || 0}</span>
          <span className={styles.label}>Mensajes sin leer</span>
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
