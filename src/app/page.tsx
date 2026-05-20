import { createClient } from "@/lib/supabase/server";
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
      {/* HERO */}
      <section className={styles.heroSection}>
        <HeroOrb />
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <p className={styles.eyebrow}>
              <span className={styles.dot} />
              Trabajemos juntos
            </p>
            <h1 className={styles.name}>
              Product
              <br />
              <span>Designer</span>
            </h1>
            <p className={styles.descriptor}>
              Llevo 8+ años ayudando a startups y empresas a convertir ideas confusas en productos claros. Trabajo end-to-end: investigación, UI/UX, branding y diseño general — lo que el proyecto necesite.
            </p>
            <div className={styles.ctaRow}>
              <a href="#proyectos" className={styles.btnPrimary}>
                Ver proyectos <span>↓</span>
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
              Ver todos <span>→</span>
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

      {/* COLABORACIONES */}
      <CollabGrid />

      {/* SOBRE MÍ — teaser compacto, detalle en /sobre-mi */}
      <section className="section" id="sobre">
        <div className="container">
          <div className={styles.aboutTeaser}>
            <p className="section-label">Sobre mí</p>
            <h2 className={styles.aboutTitle}>
              Diseño con visión de <em>producto.</em>
            </h2>
            <p className={styles.aboutText}>
              Vengo del diseño gráfico clásico —licenciatura y máster— y aterricé en producto digital aprendiendo en startups. Tanto puedo cerrar un design system como hacerte un logo, una landing o un sistema de impresos.
            </p>
            <a href="/sobre-mi" className={styles.arrowLink}>
              Más sobre mí <span>→</span>
            </a>
          </div>
        </div>
      </section>

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
            Cuéntame qué tienes entre manos. Respondo en menos de 24h, casi siempre antes.
          </p>
          <div className={styles.contactCta}>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
              WhatsApp <span>↗</span>
            </a>
            <a href={`mailto:${CONTACT.email}`} className={styles.btnPrimary}>
              Email <span>↗</span>
            </a>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
              LinkedIn <span>↗</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
