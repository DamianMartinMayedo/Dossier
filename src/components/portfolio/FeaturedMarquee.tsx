"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Project } from "@/types";
import styles from "./FeaturedMarquee.module.css";

interface Props {
  projects: Project[];
}

export default function FeaturedMarquee({ projects }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (!projects || projects.length === 0) return null;

  const items = [...projects, ...projects];

  return (
    <div className={styles.wrap}>
      <div className={styles.track} ref={trackRef}>
        {items.map((p, i) => (
          <Link
            key={`${p.id}-${i}`}
            href={`/proyecto/${p.slug}`}
            className={styles.card}
          >
            <div className={styles.image}>
              <div className={styles.imageInner}>
                {p.cover_image ? (
                  <img src={p.cover_image} alt={p.title} className={styles.img} />
                ) : (
                  <span>{p.title.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              {p.services.length > 0 && (
                <span className={styles.tag}>{p.services[0]}</span>
              )}
            </div>
            <div className={styles.body}>
              <p className={styles.meta}>
                {p.year || "—"} · {p.client || "Proyecto"}
              </p>
              <h3 className={styles.title}>{p.title}</h3>
              <p className={styles.desc}>{p.description}</p>
              <div className={styles.footer}>
                <div className={styles.tags}>
                  {p.services.slice(0, 3).map((s) => (
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
        ))}
      </div>
    </div>
  );
}