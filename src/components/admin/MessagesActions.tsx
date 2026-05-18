"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./MessagesActions.module.css";

interface Props {
  messageId: string;
  read: boolean;
}

export default function MessagesActions({ messageId, read }: Props) {
  const router = useRouter();

  async function toggleRead() {
    const supabase = createClient();
    await supabase
      .from("contact_messages")
      .update({ read: !read })
      .eq("id", messageId);
    router.refresh();
  }

  async function deleteMessage() {
    if (!confirm("¿Eliminar mensaje?")) return;
    const supabase = createClient();
    await supabase.from("contact_messages").delete().eq("id", messageId);
    router.refresh();
  }

  return (
    <div className={styles.actions}>
      <button onClick={toggleRead} className={styles.actionBtn}>
        {read ? "Marcar no leído" : "Marcar leído"}
      </button>
      <button onClick={deleteMessage} className={styles.deleteBtn}>
        Eliminar
      </button>
    </div>
  );
}
