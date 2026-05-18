import { createClient } from "@/lib/supabase/server";
import ProjectCard from "@/components/portfolio/ProjectCard";
import ProjectCardMinimal from "@/components/portfolio/ProjectCardMinimal";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Proyectos",
  description: "Portfolio completo: proyectos de UI/UX, branding y producto digital de Damián Martín.",
  alternates: { canonical: "https://damianmartin.es/proyectos" },
};

export default async function Proyectos() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("order", { ascending: true });

  const principales = (projects || []).filter((p) => p.category === "principal");
  const secundarios = (projects || []).filter((p) => p.category === "secundario");

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className="section-label">Portfolio completo</p>
        <h1 className={styles.title}>Todos los proyectos</h1>
      </section>

      {principales.length > 0 && (
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Proyectos principales</p>
          <div className={styles.grid}>
            {principales.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                span={4}
              />
            ))}
          </div>
        </section>
      )}

      {secundarios.length > 0 && (
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Otros proyectos</p>
          <div className={styles.gridMinimal}>
            {secundarios.map((p) => (
              <ProjectCardMinimal key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      {projects?.length === 0 && (
        <p className={styles.empty}>
          Los proyectos aparecerán aquí cuando los añadas desde el panel admin.
        </p>
      )}
    </div>
  );
}