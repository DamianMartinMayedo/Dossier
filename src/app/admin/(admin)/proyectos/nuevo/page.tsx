import ProjectForm from "@/components/admin/ProjectForm";
import styles from "../form-page.module.css";

export default function NuevoProyecto() {
  return (
    <div className="container">
      <div className={styles.page}>
        <p className="section-label">Proyectos</p>
        <h1 className={styles.title}>Nuevo proyecto</h1>
        <ProjectForm />
      </div>
    </div>
  );
}