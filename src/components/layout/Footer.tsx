"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { CONTACT } from "@/lib/contact";
import styles from "./Footer.module.css";

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copy}>
          © 2026 Damián Martín
        </span>
        <div className={styles.links}>
          <a href={`mailto:${CONTACT.email}`}>Email</a>
          <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
