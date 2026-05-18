import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre mí",
  description: "Conoce más sobre Damián Martín: 8+ años en diseño UI/UX, branding y producto digital. Disponible para nuevos proyectos.",
  alternates: { canonical: "https://damianmartin.es/sobre-mi" },
};

export default async function SobreMi() {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profile")
    .select("*")
    .single();

  if (!profile) {
    return (
      <div className={styles.page}>
        <p>Información del perfil no disponible.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.avatar}>
          <Image
            src={profile?.avatar || "/foto_perfil.jpg"}
            alt={profile?.name || "Damián Martín"}
            width={120}
            height={120}
            className={styles.avatarImg}
          />
        </div>
        <h1 className={styles.name}>{profile?.name || "Damián Martín"}</h1>
        <p className={styles.role}>Diseñador UI/UX · Branding · Producto digital · Sevilla</p>
        <p className={styles.bio}>{profile?.bio}</p>

        {profile.skills && profile.skills.length > 0 && (
          <div className={styles.skills}>
            <h2 className={styles.heading}>Servicios</h2>
            <div className={styles.skillList}>
              {profile.skills.map((skill: string) => (
                <span key={skill} className={styles.skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
