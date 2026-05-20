"use client";

import type { CSSProperties } from "react";
import type { Project } from "@/types";
import ProjectCard from "./ProjectCard";
import styles from "./FeaturedMarquee.module.css";

interface Props {
  projects: Project[];
}

/**
 * Marquee horizontal infinito de los proyectos destacados.
 *
 * Patrón: duplicamos la lista y animamos translateX(-50%) — al llegar a la
 * mitad, el contenido visible coincide pixel-perfect con el inicio, así el
 * loop es invisible. Pausa al hover/focus para que se puedan leer las cards.
 *
 * Misma card que `/proyectos` (variant home: cover full + badge bottom-left
 * + shine border en hover).
 */
export default function FeaturedMarquee({ projects }: Props) {
  if (!projects || projects.length === 0) return null;

  const doubled = [...projects, ...projects];

  // Duración escalada al nº de proyectos (más proyectos = más lento para que
  // se aprecien). 5s por proyecto, mínimo 30s, máximo 90s.
  const duration = Math.min(90, Math.max(30, projects.length * 5));
  const trackStyle = { "--marquee-duration": `${duration}s` } as CSSProperties;

  return (
    <div
      className={styles.wrap}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Proyectos destacados"
    >
      <div className={styles.viewport}>
        <div className={styles.track} style={trackStyle}>
          {doubled.map((project, i) => {
            const isDuplicate = i >= projects.length;
            return (
              <div
                key={`${project.id}-${i}`}
                className={styles.item}
                aria-hidden={isDuplicate ? "true" : undefined}
              >
                <ProjectCard project={project} variant="home" span={4} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
