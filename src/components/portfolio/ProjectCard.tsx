import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types";
import styles from "./ProjectCard.module.css";

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  return (
    <Link href={`/proyecto/${project.slug}`} className={styles.card}>
      <div className={styles.image}>
        {project.cover_image && (
          <Image
            src={project.cover_image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className={styles.img}
          />
        )}
      </div>
      <div className={styles.info}>
        <span className={styles.category}>
          {project.category === "principal" ? "Principal" : "Secundario"}
        </span>
        <h3 className={styles.title}>{project.title}</h3>
        {project.services.length > 0 && (
          <p className={styles.services}>{project.services.join(" · ")}</p>
        )}
      </div>
    </Link>
  );
}
