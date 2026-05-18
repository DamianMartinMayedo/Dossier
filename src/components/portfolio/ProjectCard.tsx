import Link from "next/link";
import type { Project } from "@/types";
import styles from "./ProjectCard.module.css";

interface Props {
  project: Project;
  featured?: boolean;
  span?: 4 | 6 | 8 | 12;
}

export default function ProjectCard({ project, featured, span = 6 }: Props) {
  const spanClass =
    span === 4
      ? styles.span4
      : span === 6
        ? styles.span6
        : span === 8
          ? styles.span8
          : styles.span12;

  return (
    <div className={`${spanClass} ${featured ? styles.featured : ""}`}>
      <Link href={`/proyecto/${project.slug}`} className={styles.card}>
        <div className={styles.image}>
          <div className={styles.imageInner}>
            {project.cover_image ? (
              <img
                src={project.cover_image}
                alt={project.title}
                className={styles.img}
              />
            ) : (
              <span>{project.title.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          {project.services.length > 0 && (
            <span className={styles.tag}>{project.services[0]}</span>
          )}
        </div>
        <div className={styles.body}>
          <p className={styles.meta}>
            {project.year || "—"} · {project.client || "Proyecto"}
          </p>
          <h3 className={styles.title}>{project.title}</h3>
          <p className={styles.desc}>{project.description}</p>
          <div className={styles.footer}>
            <div className={styles.tags}>
              {project.services.slice(0, 3).map((s) => (
                <span key={s} className={styles.chip}>
                  {s}
                </span>
              ))}
            </div>
            <span className={styles.arrow}>
              Ver <span>→</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
