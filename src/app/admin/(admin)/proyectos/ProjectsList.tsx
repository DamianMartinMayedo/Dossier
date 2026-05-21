"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import styles from "./page.module.css";

interface Project {
  id: string;
  title: string;
  category: "principal" | "secundario";
  featured: boolean;
  order: number;
  updated_at: string;
  created_at: string;
}

interface Props {
  projects: Project[];
}

type FilterValue = "todos" | "principal" | "secundario";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "principal", label: "Principales" },
  { value: "secundario", label: "Secundarios" },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProjectsList({ projects }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("todos");

  const filteredProjects = useMemo(() => {
    if (activeFilter === "todos") return projects;
    return projects.filter((p) => p.category === activeFilter);
  }, [projects, activeFilter]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className="section-label">Portfolio</p>
          <h1 className={styles.title}>Proyectos</h1>
        </div>
        <Link href="/admin/proyectos/nuevo" className={styles.addBtn}>
          + Nuevo
        </Link>
      </div>

      <div className={styles.filters}>
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={cn(styles.filter, activeFilter === value && styles.active)}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <p className={styles.empty}>
          {activeFilter === "todos" ? (
            <>
              No hay proyectos aún.{" "}
              <Link href="/admin/proyectos/nuevo">Crea el primero.</Link>
            </>
          ) : (
            <>
              No hay proyectos {activeFilter === "principal" ? "principales" : "secundarios"}.{" "}
              <Link href="/admin/proyectos/nuevo">Crea uno nuevo.</Link>
            </>
          )}
        </p>
      ) : (
        <div className={styles.list}>
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/proyectos/${project.id}`}
              className={styles.row}
            >
              <div className={styles.rowInfo}>
                <span className={styles.rowTitle}>{project.title}</span>
                <span className={styles.rowMeta}>
                  {project.category === "principal" ? "Principal" : "Secundario"}
                  {project.featured && " · Destacado"}
                  {" · Orden "}{project.order}
                  {" · Actualizado "}{formatDate(project.updated_at || project.created_at)}
                </span>
              </div>
              <span className={styles.rowArrow}>&rarr;</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
