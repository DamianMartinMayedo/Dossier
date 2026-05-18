import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre mí",
  description: "Conoce más sobre Damián Martín, diseñador UI/UX y de producto.",
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
        {profile.avatar && (
          <div className={styles.avatar}>
            <Image
              src={profile.avatar}
              alt={profile.name}
              width={120}
              height={120}
              className={styles.avatarImg}
            />
          </div>
        )}
        <h1 className={styles.name}>{profile.name}</h1>
        <p className={styles.bio}>{profile.bio}</p>

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
