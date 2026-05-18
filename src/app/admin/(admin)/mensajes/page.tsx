import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import MessagesActions from "@/components/admin/MessagesActions";
import styles from "./page.module.css";

export default async function AdminMensajes() {
  const supabase = await createClient();

  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mensajes</h1>

      {!messages || messages.length === 0 ? (
        <p className={styles.empty}>No hay mensajes aún.</p>
      ) : (
        <div className={styles.list}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${!msg.read ? styles.unread : ""}`}
            >
              <div className={styles.msgHeader}>
                <div>
                  <span className={styles.msgName}>{msg.name}</span>
                  <span className={styles.msgEmail}>{msg.email}</span>
                </div>
                <span className={styles.msgDate}>
                  {formatDate(msg.created_at)}
                </span>
              </div>
              <p className={styles.msgBody}>{msg.message}</p>
              <MessagesActions messageId={msg.id} read={msg.read} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
