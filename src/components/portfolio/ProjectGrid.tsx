"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "./ProjectCard";
import ProjectFilters from "./ProjectFilters";
import type { Project } from "@/types";
import styles from "./ProjectGrid.module.css";

interface Props {
  projects: Project[];
}

export default function ProjectGrid({ projects }: Props) {
  const [filter, setFilter] = useState<"todos" | "principal" | "secundario">(
    "todos"
  );

  const filtered = useMemo(() => {
    if (filter === "todos") return projects;
    return projects.filter((p) => p.category === filter);
  }, [projects, filter]);

  const principales = projects.filter((p) => p.category === "principal");
  const secundarios = projects.filter((p) => p.category === "secundario");

  return (
    <div className={styles.grid}>
      <ProjectFilters
        active={filter}
        onChange={setFilter}
        countPrincipal={principales.length}
        countSecundario={secundarios.length}
      />

      <div className={styles.projects}>
        <AnimatePresence mode="popLayout">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
