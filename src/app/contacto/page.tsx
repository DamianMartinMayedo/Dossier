import ContactForm from "@/components/forms/ContactForm";
import { CONTACT } from "@/lib/contact";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "¿Tienes un proyecto? Cuéntamelo. Respondo en menos de 24h, casi siempre antes.",
  alternates: { canonical: "https://damianmartin.es/contacto" },
};

export default function Contacto() {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <p className="section-label">Contacto</p>
        <h1 className={styles.title}>¿Hablamos?</h1>
        <p className={styles.subtitle}>
          Cuéntame qué tienes entre manos. Si encajamos, lo sabremos enseguida.
        </p>

        {/* Direct channels */}
        <div className={styles.channels}>
          <a
            href={`mailto:${CONTACT.email}`}
            className={styles.channel}
          >
            <span className={styles.channelLabel}>Email</span>
            <span className={styles.channelArrow}>↗</span>
          </a>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.channel}
          >
            <span className={styles.channelLabel}>WhatsApp</span>
            <span className={styles.channelArrow}>↗</span>
          </a>
          <a
            href={CONTACT.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.channel}
          >
            <span className={styles.channelLabel}>LinkedIn</span>
            <span className={styles.channelArrow}>↗</span>
          </a>
        </div>

        <div className={styles.divider}>
          <span>o escríbeme directamente</span>
        </div>

        <ContactForm />
      </section>
    </div>
  );
}
