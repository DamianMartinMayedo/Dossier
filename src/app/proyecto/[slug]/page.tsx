import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { ContentBlock, Project } from "@/types";
import ProjectContent from "@/components/portfolio/ProjectContent";
import ScrollToTop from "@/components/ui/ScrollToTop";
import BackNav from "@/components/portfolio/BackNav";
import ScrollTopButton from "@/components/portfolio/ScrollTopButton";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Re-render en cada request — los cambios desde /admin se reflejan al instante. */
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("title, subtitle, description, slug, cover_image, category")
    .eq("slug", slug)
    .single();

  if (!project || project.category === "secundario") {
    return { title: "Proyecto no encontrado", robots: { index: false } };
  }

  const desc = project.subtitle || project.description;

  return {
    title: project.title,
    description: desc,
    alternates: {
      canonical: `https://damianmartin.es/proyecto/${project.slug}`,
    },
    openGraph: {
      title: project.title,
      description: desc,
      url: `https://damianmartin.es/proyecto/${project.slug}`,
      type: "article",
      images: project.cover_image
        ? [{ url: project.cover_image, alt: project.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: desc,
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
    .single<Project>();

  if (!project) notFound();
  // Secundarios no tienen página de detalle: sólo lightbox desde /proyectos.
  if (project.category === "secundario") notFound();

  const tags = [
    ...project.services,
    project.year,
    project.client,
  ].filter(Boolean) as string[];

  const blocks: ContentBlock[] = Array.isArray(project.content) ? project.content : [];
  const hasBlocks = blocks.length > 0;

  return (
    <>
      <ScrollToTop />
      <div className={styles.page}>
      {/* ── Back ── */}
      <BackNav />

      {/* ── Header ── */}
      <header className={styles.header}>
        <h1 className={styles.title}>{project.title}</h1>
        {project.subtitle && <p className={styles.subtitle}>{project.subtitle}</p>}
        {tags.length > 0 && (
          <div className={styles.meta}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </header>

      {/* ── Header image (full-bleed, opcional) ── */}
      {project.header_image && (
        <div className={styles.headerImage}>
          <div className={styles.headerImageInner}>
            <Image
              src={project.header_image}
              alt={project.title}
              fill
              sizes="100vw"
              className={styles.headerImg}
              priority
            />
          </div>
        </div>
      )}

      {/* ── Contenido por bloques ── */}
      {hasBlocks && <ProjectContent blocks={blocks} />}

      {/* ── Fallback: cover + description + grid de imágenes ── */}
      {!hasBlocks && (
        <>
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

          {project.description && (
            <div className={styles.body}>
              <p className={styles.description}>{project.description}</p>
            </div>
          )}

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
        </>
      )}

      {/* ── Bottom CTA ── */}
      <div className={styles.bottomCta}>
        <Link href="/proyectos" className={styles.btnSecondary}>
          Ver todos los proyectos <span>→</span>
        </Link>
      </div>

      <ScrollTopButton />
    </div>
    </>
  );
}
