import { createClient } from "@/lib/supabase/server";
import ProjectCard from "@/components/portfolio/ProjectCard";
import Marquee from "@/components/portfolio/Marquee";
import CollabGrid from "@/components/portfolio/CollabGrid";
import Cursor from "@/components/ui/Cursor";
import { CONTACT } from "@/lib/contact";
import styles from "./page.module.css";

export default async function Home() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("order", { ascending: true });

  const principales = (projects || []).filter((p) => p.category === "principal");

  return (
    <>
      <Cursor />

      {/* HERO */}
      <section className={styles.heroSection}>
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
            <div className={styles.grid}>
              {principales.slice(0, 3).map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  span={4}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* COLABORACIONES */}
      <CollabGrid />

      {/* SOBRE MÍ */}
      <section className="section" id="sobre">
        <div className="container">
          <p className="section-label">Sobre mí</p>
          <div className={styles.aboutGrid}>
            <div>
              <h2 className={styles.aboutTitle}>
                Diseño con visión de{" "}
                <em>producto</em>, no solo pantallas.
              </h2>
              <p className={styles.aboutText}>
                Vengo del diseño gráfico clásico —licenciatura y máster— y aterricé en producto digital aprendiendo en startups. Eso significa que tanto puedo cerrar un design system como hacerte un logo, una landing o un sistema de impresos.
              </p>
              <p className={styles.aboutText}>
                Si necesitas un especialista puro, soy honesto: hay gente más profunda que yo en UX research. Si necesitas un diseñador que entienda el problema completo y entregue, ahí me muevo bien.
              </p>
              <a href="/sobre-mi" className={styles.arrowLink}>
                Más sobre mí <span>→</span>
              </a>
            </div>
            <div className={styles.aboutCards}>
              <div className={styles.aboutCard}>
                <p className={styles.cardLabel}>Formación</p>
                <p className={styles.cardTitle}>Lic. Diseño de Comunicación Visual</p>
                <p className={styles.cardSub}>Universidad de La Habana</p>
              </div>
              <div className={styles.aboutCard}>
                <p className={styles.cardLabel}>Máster</p>
                <p className={styles.cardTitle}>Diseño Gráfico y Multimedia</p>
                <p className={styles.cardSub}>Escuela Superior de Informática · CIPSA</p>
              </div>
              <div className={styles.aboutCard}>
                <p className={styles.cardLabel}>Idiomas</p>
                <p className={styles.cardSub}>Español nativo · Inglés intermedio</p>
              </div>
              <div className={styles.aboutStats}>
                <div className={styles.aboutStat}>
                  <span className={styles.aboutStatNum}>8+</span>
                  <span className={styles.aboutStatLabel}>años de experiencia</span>
                </div>
                <div className={styles.aboutStat}>
                  <span className={styles.aboutStatNum}>30+</span>
                  <span className={styles.aboutStatLabel}>proyectos entregados</span>
                </div>
                <div className={styles.aboutStat}>
                  <span className={styles.aboutStatNum}>3</span>
                  <span className={styles.aboutStatLabel}>co-fundaciones</span>
                </div>
              </div>
            </div>
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
