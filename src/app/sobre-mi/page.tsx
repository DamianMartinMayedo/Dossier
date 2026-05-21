import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import type { Metadata } from "next";
import type { Profile } from "@/types";
import { CONTACT } from "@/lib/contact";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sobre mí",
  description:
    "Conoce más sobre Damián Martín: 8+ años en diseño UI/UX, branding y producto digital. Disponible para nuevos proyectos.",
  alternates: { canonical: "https://damianmartin.es/sobre-mi" },
};

/** Re-render en cada request — los cambios desde /admin/perfil se reflejan al instante. */
export const revalidate = 0;

export default async function SobreMi() {
  const supabase = await createClient();

  const { data: profileRaw } = await supabase.from("profile").select("*").single();
  const profile = profileRaw as Profile | null;

  if (!profile) {
    return (
      <div className={styles.page}>
        <p>Información del perfil no disponible.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Hero personal ───────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.avatar}>
          <Image
            src={profile.avatar || "/foto_perfil.jpg"}
            alt={profile.name}
            width={160}
            height={160}
            className={styles.avatarImg}
            priority
          />
        </div>
        <p className={styles.eyebrow}>Sobre mí</p>
        <h1 className={styles.name}>{profile.name}</h1>
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
      </section>

      {/* ── Servicios / Skills ──────────────────────────────── */}
      {(profile.services?.length > 0 || profile.skills?.length > 0) && (
        <section className={styles.block}>
          <div className={styles.chipList}>
            {profile.services?.map((s) => (
              <span key={`s-${s}`} className={styles.chip}>
                {s}
              </span>
            ))}
            {profile.skills?.map((s) => (
              <span key={`k-${s}`} className={styles.chip}>
                {s}
              </span>
            ))}
          </div>
        </section>
      )}
      {/* ── Formación + Idiomas ─────────────────────────────── */}
      {(profile.formacion?.length > 0 || profile.languages?.length > 0) && (
        <section className={styles.block}>
          <div className={styles.cards}>
            {profile.formacion?.map((item, i) => (
              <div key={i} className={styles.card}>
                <p className={styles.cardLabel}>{item.label}</p>
                <p className={styles.cardTitle}>{item.title}</p>
                {item.subtitle && <p className={styles.cardSub}>{item.subtitle}</p>}
              </div>
            ))}
            {profile.languages?.length > 0 && (
              <div className={styles.card}>
                <p className={styles.cardLabel}>Idiomas</p>
                <p className={styles.cardSub}>{profile.languages.join(" · ")}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Stats ──────────────────────────────────────────── */}
      {profile.stats?.length > 0 && (
        <section className={styles.block}>
          <div className={styles.stats}>
            {profile.stats.map((stat, i) => (
              <div key={i} className={styles.stat}>
                <span className={styles.statNum}>{stat.num}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}


      {/* ── CTAs ────────────────────────────────────────────── */}
      <section className={styles.cta}>
        <span className={`${styles.badge} ${styles.badgePrimary}`}>
          Trabajemos juntos
        </span>
        <h2 className={styles.ctaTitle}>¿Hablamos?</h2>
        <p className={styles.ctaSub}>
          Contáctame, ya sea para unirme a tu equipo como para colaborar juntos, estoy disponible para nuevos desafíos.
        </p>
        <div className={styles.ctaButtons}>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
          >
            WhatsApp <span>↗</span>
          </a>
          <a href={`mailto:${CONTACT.email}`} className={styles.btnPrimary}>
            Email <span>↗</span>
          </a>
        </div>
      </section>
    </div>
  );
}
