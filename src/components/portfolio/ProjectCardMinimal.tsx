"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { getProjectCover } from "@/lib/utils";
import type { Project } from "@/types";
import ProjectThumb from "./ProjectThumb";
import styles from "./ProjectCardMinimal.module.css";

interface Props {
  project: Project;
}

export default function ProjectCardMinimal({ project }: Props) {
  const [expanded, setExpanded] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cover = getProjectCover(project);

  // Open / close the native dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (expanded) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [expanded]);

  // Close on Escape (native dialog already does this, but keep state in sync)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => setExpanded(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  return (
    <>
      <button
        className={styles.card}
        onClick={() => cover && setExpanded(true)}
        type="button"
        aria-haspopup="dialog"
      >
        <div className={styles.image}>
          <div className={styles.imageInner}>
            <ProjectThumb
              project={project}
              sizes="(min-width: 960px) 25vw, (min-width: 640px) 33vw, 50vw"
            />
          </div>
          {cover && (
            <div className={styles.overlay}>
              <div className={styles.zoom}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                  <path d="M11 8v6M8 11h6" />
                </svg>
              </div>
            </div>
          )}
        </div>
        <p className={styles.name}>{project.title}</p>
        <p className={styles.type}>
          {project.services.slice(0, 2).join(" · ") || "Proyecto"}
        </p>
      </button>

      {/* Native dialog — accessible, focus-trapped, Escape-dismissable */}
      <dialog
        ref={dialogRef}
        className={styles.modal}
        aria-label={`Vista ampliada de ${project.title}`}
        onClick={(e) => {
          // close when clicking the backdrop (outside the image)
          if (e.target === e.currentTarget) setExpanded(false);
        }}
      >
        <button
          className={styles.modalClose}
          onClick={() => setExpanded(false)}
          type="button"
          aria-label="Cerrar"
        >
          <X size={20} aria-hidden="true" />
        </button>
        {cover && (
          <div className={styles.modalImgWrap}>
            <Image
              src={cover}
              alt={project.title}
              fill
              sizes="90vw"
              className={styles.modalImg}
            />
          </div>
        )}
      </dialog>
    </>
  );
}
