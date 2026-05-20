import Link from "next/link";
import type { Project } from "@/types";
import ProjectThumb from "./ProjectThumb";
import styles from "./ProjectCard.module.css";

interface Props {
  project: Project;
  featured?: boolean;
  span?: 4 | 6 | 8 | 12;
  /** "home" = cover full + nombre en hover. "list" = card completa para /proyectos. */
  variant?: "home" | "list";
}

export default function ProjectCard({ project, featured, span = 6, variant = "list" }: Props) {
  const spanClass =
    span === 4
      ? styles.span4
      : span === 6
        ? styles.span6
        : span === 8
          ? styles.span8
          : styles.span12;

  if (variant === "home") {
    // ── Variant para home: solo cover, badge servicio bottom-left ──
    // No mostramos nombre/año (la imagen ya muestra el nombre del proyecto).
    return (
      <div className={`${spanClass} ${featured ? styles.featured : ""}`}>
        <div className={styles.cardHomeWrap}>
          <Link href={`/proyecto/${project.slug}`} className={styles.cardHome}>
            <div className={styles.imageHome}>
              <ProjectThumb
                project={project}
                sizes="(min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
              {project.services.length > 0 && (
                <span className={`${styles.tag} ${styles.tagBottom}`}>{project.services[0]}</span>
              )}
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // ── Variant list (default, /proyectos) ──────────────────────────
  return (
    <div className={`${spanClass} ${featured ? styles.featured : ""}`}>
      <div className={styles.cardWrap}>
        <Link href={`/proyecto/${project.slug}`} className={styles.card}>
          <div className={styles.image}>
            <div className={styles.imageInner}>
              <ProjectThumb
                project={project}
                sizes="(min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </div>
          <div className={styles.body}>
            <h3 className={styles.title}>{project.title}</h3>
            <p className={styles.desc}>{project.description}</p>
            <div className={styles.footer}>
              <div className={styles.footerLeft}>
                {project.services.length > 0 && (
                  <span className={styles.bodyTag}>{project.services[0]}</span>
                )}
                {project.year && <span className={styles.year}>{project.year}</span>}
              </div>
              <span className={styles.arrow}>
                Ver <span>→</span>
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
