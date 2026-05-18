"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./MessagesActions.module.css";

interface Props {
  messageId: string;
  read: boolean;
  email: string;
  name: string;
  originalMessage: string;
}

export default function MessagesActions({
  messageId,
  read,
  email,
  name,
  originalMessage,
}: Props) {
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

  const replyHref =
    `mailto:${email}` +
    `?subject=${encodeURIComponent(`Re: tu mensaje a damianmartin.es`)}` +
    `&body=${encodeURIComponent(
      `Hola ${name},\n\nGracias por escribir. ` +
        `\n\n---\nTu mensaje original:\n${originalMessage}\n`
    )}`;

  return (
    <div className={styles.actions}>
      <a href={replyHref} className={styles.actionBtn}>
        Responder
      </a>
      <button onClick={toggleRead} className={styles.actionBtn}>
        {read ? "Marcar no leído" : "Marcar leído"}
      </button>
      <button onClick={deleteMessage} className={styles.deleteBtn}>
        Eliminar
      </button>
    </div>
  );
}
