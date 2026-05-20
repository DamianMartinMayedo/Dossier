import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import styles from "./CollabGrid.module.css";

interface CollaborationRow {
  id: string;
  name: string;
  image_url: string;
  order: number;
}

/**
 * Server component: lee la lista de colaboraciones desde Supabase y la
 * renderiza como marquee infinito horizontal. Los logos se gestionan en
 * /admin/empresas.
 */
export default async function CollabGrid() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collaborations")
    .select("id, name, image_url, order")
    .order("order", { ascending: true });

  const rows = (data ?? []) as CollaborationRow[];
  if (rows.length === 0) return null;

  // Duplicamos para que el loop CSS no muestre el corte al volver.
  const items = [...rows, ...rows];

  return (
    <section className={styles.section}>
      <p className={styles.label}>Han confiado en mi:</p>
      <div className={styles.wrap}>
        <div className={styles.track}>
          {items.map((logo, i) => (
            <div key={`${logo.id}-${i}`} className={styles.item}>
              <Image
                src={logo.image_url}
                alt={logo.name}
                width={200}
                height={56}
                className={styles.logo}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
