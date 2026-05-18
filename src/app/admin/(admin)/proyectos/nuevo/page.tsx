import ProjectForm from "@/components/admin/ProjectForm";
import styles from "./page.module.css";

export default function NuevoProyecto() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Nuevo proyecto</h1>
      <ProjectForm />
    </div>
  );
}
