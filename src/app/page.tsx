import { createClient } from "@/lib/supabase/server";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import FeaturedMarquee from "@/components/portfolio/FeaturedMarquee";
import Marquee from "@/components/portfolio/Marquee";
import CollabGrid from "@/components/portfolio/CollabGrid";
import HeroOrb from "@/components/portfolio/HeroOrb";
import { CONTACT } from "@/lib/contact";
import styles from "./page.module.css";

/** Re-render en cada request — los cambios desde /admin se reflejan al instante.
    revalidatePath() en /api/admin/projects + /api/admin/profile invalida los snapshots. */
export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("order", { ascending: true });

  const principales = (projects || []).filter((p) => p.category === "principal");

  return (
    <>
      {/* HeroOrb — fondo fixed que cubre el viewport en TODAS las secciones del home. */}
      <HeroOrb />

      <div className={styles.pageContent}>
        {/* HERO */}
        <section className={styles.heroSection}>
          <div className={styles.hero}>
            <div className={styles.heroLeft}>
              <p className={styles.eyebrow}>
                <span className={styles.dot} />
                Trabajemos juntos
              </p>
              <h1 className={styles.name}>
                Hola

                 <span className={styles.smiley}> :)</span>
              </h1>
              <p className={styles.descriptor}>
                Soy Damián, diseñador con alcance completo: UI/UX, identidad y sistemas visuales, RRSS, editorial o producción para impresión.
              </p>
              <div className={styles.ctaRow}>
                <a href="#proyectos" className={styles.btnPrimary}>
                  Ver proyectos <ArrowDown size={14} aria-hidden="true" />
                </a>
                <a href="#contacto" className={styles.btnSecondary}>
                  Hablemos
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <Marquee />

        {/* PROYECTOS */}
        <section className="section" id="proyectos">
          <div className="container-wide">
            <div className={styles.projectsHeader}>
              <div>
                <p className="section-label">Proyectos seleccionados</p>
                <h2 className="section-title">Trabajos destacados</h2>
              </div>
              <a href="/proyectos" className={styles.arrowLink}>
                Ver todos <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>

            {principales.length === 0 ? (
              <p className={styles.emptyState}>
                Los proyectos aparecerán aquí cuando los añadas desde el panel admin.
              </p>
            ) : (
              <FeaturedMarquee projects={principales} />
            )}
          </div>
        </section>

        {/* SOBRE MÍ — teaser compacto, detalle en /sobre-mi */}
        <section className={`section ${styles.aboutSection}`} id="sobre">
          <div className="container">
            <div className={styles.aboutTeaser}>
              <p className="section-label">Sobre mí</p>
              <h2 className={styles.aboutTitle}>
                Diseño integral, del <em>concepto al producto.</em>
              </h2>
              <p className={styles.aboutText}>
                Tengo experiencia en procesos completos de UI/UX (end to end), creando identidades corporativas, sistemas visuales y piezas para web, RRSS, impresos y producto digital en general.
              </p>
              <a href="/sobre-mi" className={styles.arrowLink}>
                Más sobre mí <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* COLABORACIONES */}
        <CollabGrid />

        {/* CONTACTO */}
        <section className={styles.contactSection} id="contacto">
          <div className={styles.contactInner}>
            <span className={`${styles.badge} ${styles.badgePrimary}`}>
              Trabajemos juntos
            </span>
            <h2 className={styles.contactHeadline}>
              ¿Hablamos?
            </h2>
            <p className={styles.contactSub}>
              Contáctame, ya sea para unirme a tu equipo como para colaborar juntos, estoy disponible para nuevos desafíos.
            </p>
            <div className={styles.contactCta}>
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
                WhatsApp <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              <a href={`mailto:${CONTACT.email}`} className={styles.btnPrimary}>
                Email <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
