"use client";

import { useState } from "react";
import type { Project } from "@/types";
import styles from "./ProjectCardMinimal.module.css";

interface Props {
  project: Project;
}

export default function ProjectCardMinimal({ project }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <button
        className={styles.card}
        onClick={() => setExpanded(true)}
        type="button"
      >
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
            <div className={styles.zoom}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
                <path d="M11 8v6M8 11h6" />
              </svg>
            </div>
          </div>
        </div>
        <p className={styles.name}>{project.title}</p>
        <p className={styles.type}>
          {project.services.slice(0, 2).join(" · ") || "Proyecto"}
        </p>
      </button>

      {expanded && project.cover_image && (
        <div className={styles.modal} onClick={() => setExpanded(false)}>
          <button
            className={styles.modalClose}
            onClick={() => setExpanded(false)}
            type="button"
            aria-label="Cerrar"
          >
            ×
          </button>
          <img
            src={project.cover_image}
            alt={project.title}
            className={styles.modalImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}