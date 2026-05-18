"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./ContactForm.module.css";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const supabase = createClient();

    const { error } = await supabase.from("contact_messages").insert({
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    });

    if (error) {
      setStatus("error");
      setErrorMessage("Error al enviar. Inténtalo de nuevo.");
    } else {
      setStatus("success");
      form.reset();
    }
  }

  if (status === "success") {
    return (
      <div className={styles.success}>
        <p>Mensaje enviado. Gracias por escribirme.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>
          Nombre
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className={styles.input}
          placeholder="Tu nombre"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className={styles.input}
          placeholder="tu@email.com"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={styles.textarea}
          placeholder="Cuéntame sobre tu proyecto..."
        />
      </div>

      {status === "error" && <p className={styles.error}>{errorMessage}</p>}

      <button type="submit" className={styles.button} disabled={status === "loading"}>
        {status === "loading" ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
}
