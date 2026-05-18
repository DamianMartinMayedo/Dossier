import Link from "next/link";
import type { Project } from "@/types";
import styles from "./ProjectCardMinimal.module.css";

interface Props {
  project: Project;
}

export default function ProjectCardMinimal({ project }: Props) {
  return (
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
        <div className={styles.overlay}>
          <div className={styles.arrow}>→</div>
        </div>
      </div>
      <p className={styles.name}>{project.title}</p>
      <p className={styles.type}>
        {project.services.slice(0, 2).join(" · ") || "Proyecto"}
      </p>
    </Link>
  );
}
