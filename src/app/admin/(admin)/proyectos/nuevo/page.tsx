import ProjectForm from "@/components/admin/ProjectForm";
import styles from "../form-page.module.css";

export default function NuevoProyecto() {
  return (
    <div className={styles.page}>
      <ProjectForm title="Nuevo proyecto" />
    </div>
  );
}
