import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!project) return { title: "Proyecto no encontrado" };

  return {
    title: project.title,
    description: project.description,
  };
}

export default async function Proyecto({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!project) notFound();

  return (
    <div className={styles.page}>
      {project.cover_image && (
        <div className={styles.cover}>
          <Image
            src={project.cover_image}
            alt={project.title}
            fill
            className={styles.coverImg}
            sizes="100vw"
            priority
          />
        </div>
      )}

      <div className={styles.content}>
        <span className={styles.category}>
          {project.category === "principal"
            ? "Proyecto principal"
            : "Proyecto secundario"}
        </span>

        <h1 className={styles.title}>{project.title}</h1>

        {project.client && (
          <p className={styles.client}>Cliente: {project.client}</p>
        )}
        {project.year && <p className={styles.year}>Año: {project.year}</p>}

        <p className={styles.description}>{project.description}</p>

        {project.services && project.services.length > 0 && (
          <div className={styles.services}>
            <h2 className={styles.heading}>Servicios</h2>
            <div className={styles.serviceList}>
              {project.services.map((service: string) => (
                <span key={service} className={styles.service}>
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {project.images && project.images.length > 0 && (
          <div className={styles.gallery}>
            <h2 className={styles.heading}>Galería</h2>
            <div className={styles.galleryGrid}>
              {project.images.map((image: string, i: number) => (
                <div key={i} className={styles.galleryItem}>
                  <Image
                    src={image}
                    alt={`${project.title} — imagen ${i + 1}`}
                    width={800}
                    height={600}
                    className={styles.galleryImg}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
