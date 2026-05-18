import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
    .select("title, description, slug, cover_image")
    .eq("slug", slug)
    .single();

  if (!project) return { title: "Proyecto no encontrado" };

  return {
    title: project.title,
    description: project.description,
    alternates: {
      canonical: `https://damianmartin.es/proyecto/${project.slug}`,
    },
    openGraph: {
      title: project.title,
      description: project.description,
      url: `https://damianmartin.es/proyecto/${project.slug}`,
      type: "article",
      images: project.cover_image
        ? [{ url: project.cover_image, alt: project.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
      images: project.cover_image ? [project.cover_image] : [],
    },
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

  // Build metadata tags: services + year + client
  const tags = [
    ...project.services,
    project.year,
    project.client,
  ].filter(Boolean) as string[];

  return (
    <div className={styles.page}>
      {/* ── Back ── */}
      <div className="container">
        <Link href="/proyectos" className={styles.back}>
          ← Todos los proyectos
        </Link>
      </div>

      {/* ── Header ── */}
      <header className={styles.header}>
        <p className={styles.category}>
          {project.category === "principal" ? "Proyecto principal" : "Proyecto secundario"}
        </p>
        <h1 className={styles.title}>{project.title}</h1>
        {tags.length > 0 && (
          <div className={styles.meta}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </header>

      {/* ── Cover ── */}
      {project.cover_image && (
        <div className={styles.cover}>
          <div className={styles.coverInner}>
            <Image
              src={project.cover_image}
              alt={project.title}
              fill
              sizes="(min-width: 960px) 960px, 100vw"
              className={styles.coverImg}
              priority
            />
          </div>
        </div>
      )}

      {/* ── Description ── */}
      {project.description && (
        <div className={styles.body}>
          <p className={styles.description}>{project.description}</p>
        </div>
      )}

      {/* ── Gallery ── */}
      {project.images && project.images.length > 0 && (
        <div className={styles.gallery}>
          <p className={styles.galleryLabel}>Imágenes del proyecto</p>
          <div className={styles.galleryGrid}>
            {project.images.map((image: string, i: number) => (
              <div key={i} className={styles.galleryItem}>
                <Image
                  src={image}
                  alt={`${project.title} — imagen ${i + 1}`}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className={styles.galleryImg}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
