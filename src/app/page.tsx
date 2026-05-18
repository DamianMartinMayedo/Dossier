import { createClient } from "@/lib/supabase/server";
import ProjectGrid from "@/components/portfolio/ProjectGrid";
import styles from "./page.module.css";

export default async function Home() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("order", { ascending: true });

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Diseño digital
          <br />
          con propósito
        </h1>
        <p className={styles.subtitle}>
          Portfolio de Damián Martín — UI/UX, branding y producto digital.
        </p>
      </section>

      <section className={styles.portfolio}>
        <ProjectGrid projects={projects || []} />
      </section>
    </div>
  );
}
