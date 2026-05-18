import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SeedButton from "./SeedButton";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: projectsCount }, { count: unreadCount }] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("read", false),
  ]);

  const allowSeed =
    process.env.NODE_ENV !== "production" || process.env.ALLOW_SEED === "true";

  return (
    <div className="container">
      <div className={styles.page}>
        <p className="section-label">Admin</p>
        <h1 className={styles.title}>Dashboard</h1>

        <div className={styles.grid}>
          <Link href="/admin/proyectos" className={styles.card}>
            <span className={styles.number}>{projectsCount ?? 0}</span>
            <span className={styles.label}>Proyectos</span>
          </Link>

          <Link href="/admin/mensajes" className={styles.card}>
            <span className={styles.number}>{unreadCount ?? 0}</span>
            <span className={styles.label}>Mensajes sin leer</span>
          </Link>
        </div>

        <div className={styles.actions}>
          <Link href="/admin/proyectos/nuevo" className={styles.actionBtn}>
            + Nuevo proyecto
          </Link>
        </div>

        {allowSeed && <SeedButton />}
      </div>
    </div>
  );
}
