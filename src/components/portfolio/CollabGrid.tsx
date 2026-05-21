import { createClient } from "@/lib/supabase/server";
import CollabGridClient from "./CollabGridClient";
import styles from "./CollabGrid.module.css";

interface CollaborationRow {
  id: string;
  name: string;
  image_url: string;
  order: number;
}

export default async function CollabGrid() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collaborations")
    .select("id, name, image_url, order")
    .order("order", { ascending: true });

  const rows = (data ?? []) as CollaborationRow[];
  if (rows.length === 0) return null;

  return (
    <section className={styles.section}>
      <p className={styles.label}>Han confiado en mi:</p>
      <CollabGridClient rows={rows} />
    </section>
  );
}
