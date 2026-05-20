import ProjectForm from "@/components/admin/ProjectForm";
import styles from "../form-page.module.css";

export default function NuevoProyecto() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className="section-label">Proyectos</p>
          <h1 className={styles.title}>Nuevo proyecto</h1>
        </div>
        <div className={styles.actions}>
          <button type="submit" form="project-form" className={styles.submitBtn}>
            Crear proyecto
          </button>
        </div>
      </div>
      <ProjectForm />
    </div>
  );
}
