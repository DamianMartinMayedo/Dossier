import styles from "./loading.module.css";

/**
 * Skeleton mostrado automáticamente por Next.js mientras el server component
 * de la página de proyecto se está resolviendo (consulta a Supabase + render).
 *
 * App Router monta este componente al iniciar la navegación y lo desmonta
 * cuando el contenido real está listo — sin necesidad de gestionar estado.
 */
export default function ProjectLoading() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Cargando proyecto">
      <div className={styles.backWrap}>
        <div className={`${styles.skeleton} ${styles.back}`} />
      </div>

      <div className={styles.header}>
        <div className={`${styles.skeleton} ${styles.title}`} />
        <div className={`${styles.skeleton} ${styles.subtitle}`} />
        <div className={styles.tags}>
          <div className={`${styles.skeleton} ${styles.tag}`} />
          <div className={`${styles.skeleton} ${styles.tag}`} />
          <div className={`${styles.skeleton} ${styles.tag}`} />
        </div>
      </div>

      <div className={styles.headerImage} />

      <div className={styles.content}>
        <div className={`${styles.skeleton} ${styles.blockTitle}`} />
        <div className={`${styles.skeleton} ${styles.blockText}`} />
        <div className={`${styles.skeleton} ${styles.blockText}`} />
        <div className={`${styles.skeleton} ${styles.blockTextShort}`} />
      </div>
    </div>
  );
}
