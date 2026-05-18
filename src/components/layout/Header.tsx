"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { href: "/", label: "Proyectos" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/logo.svg"
            alt="Damián Martín"
            width={36}
            height={36}
            className={styles.logoImg}
          />
        </Link>

        <nav className={styles.nav}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.link} ${
                pathname === href ? styles.active : ""
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
