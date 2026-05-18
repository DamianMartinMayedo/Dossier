import ContactForm from "@/components/forms/ContactForm";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "¿Tienes un proyecto en mente? Escríbeme.",
};

export default function Contacto() {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h1 className={styles.title}>Contacto</h1>
        <p className={styles.subtitle}>
          ¿Tienes un proyecto en mente? Cuéntamelo y te responderé lo antes posible.
        </p>
        <ContactForm />
      </section>
    </div>
  );
}
