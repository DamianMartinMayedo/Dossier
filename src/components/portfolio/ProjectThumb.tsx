import Image from "next/image";
import type { Project } from "@/types";
import { getProjectCover } from "@/lib/utils";
import styles from "./ProjectThumb.module.css";

interface Props {
  project: Pick<Project, "title" | "cover_image" | "images">;
  /** Rendered size – passed to next/image for correct srcset. */
  sizes?: string;
  className?: string;
  innerClassName?: string;
}

/**
 * Shared thumbnail: shows cover_image via next/image when available,
 * otherwise renders the 2-char initials fallback. Used by ProjectCard,
 * ProjectCardMinimal, FeaturedMarquee — no duplicated logic.
 */
export default function ProjectThumb({
  project,
  sizes = "320px",
  className,
  innerClassName,
}: Props) {
  const src = getProjectCover(project);

  if (src) {
    return (
      <Image
        src={src}
        alt={project.title}
        fill
        sizes={sizes}
        className={`${styles.img}${className ? ` ${className}` : ""}`}
      />
    );
  }

  return (
    <span className={`${styles.initials}${innerClassName ? ` ${innerClassName}` : ""}`}>
      {project.title.slice(0, 2).toUpperCase()}
    </span>
  );
}
