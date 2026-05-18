import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarProyecto({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  return (
    <div className="container">
      <div className={styles.page}>
        <p className="section-label">Proyectos</p>
        <h1 className={styles.title}>Editar proyecto</h1>
        <ProjectForm project={project} />
      </div>
    </div>
  );
}