import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";
import ProfileForm from "@/components/admin/ProfileForm";
import styles from "../proyectos/form-page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminPerfilPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("profile").select("*").single();
  const profile = data as Profile | null;

  return (
    <div className={styles.page}>
      <p className="section-label">Admin</p>
      <h1 className={styles.title}>Perfil</h1>
      {profile ? (
        <ProfileForm profile={profile} />
      ) : (
        <p>No se ha podido cargar el perfil.</p>
      )}
    </div>
  );
}
