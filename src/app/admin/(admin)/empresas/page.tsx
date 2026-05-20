import { createClient } from "@/lib/supabase/server";
import EmpresasManager, { type Collaboration } from "@/components/admin/EmpresasManager";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminEmpresasPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collaborations")
    .select("*")
    .order("order", { ascending: true });

  const collaborations = (data ?? []) as Collaboration[];

  return (
    <div className={styles.page}>
      <p className="section-label">Admin</p>
      <h1 className={styles.title}>Colaboraciones</h1>
      <p className={styles.hint}>
        Logos de empresas que aparecen en el marquee del home. Sube cada logo
        (preferible PNG/WebP con fondo transparente). El orden controla la
        posición en el carrusel.
      </p>
      <EmpresasManager initial={collaborations} />
    </div>
  );
}
