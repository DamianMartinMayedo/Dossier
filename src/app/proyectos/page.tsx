import { createClient } from "@/lib/supabase/server";
import ProjectCard from "@/components/portfolio/ProjectCard";
import ProjectCardMinimal from "@/components/portfolio/ProjectCardMinimal";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Proyectos",
  description: "Todos los proyectos de Damián Martín.",
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
            {principales.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                featured={i === 0 && principales.length > 2}
                span={
                  i === 0 && principales.length > 2
                    ? 8
                    : i === 1 && principales.length > 2
                      ? 4
                      : 6
                }
              />
            ))}
          </div>
        </section>
      )}

      {secundarios.length > 0 && (
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Proyectos secundarios</p>
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
