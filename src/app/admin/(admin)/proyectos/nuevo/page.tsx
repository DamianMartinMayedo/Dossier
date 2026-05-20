import ProjectForm from "@/components/admin/ProjectForm";
import FormActions from "@/components/admin/FormActions";
import styles from "../form-page.module.css";

export default function NuevoProyecto() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className="section-label">Proyectos</p>
          <h1 className={styles.title}>Nuevo proyecto</h1>
        </div>
        <FormActions isEditing={false} />
      </div>
      <ProjectForm />
    </div>
  );
}
