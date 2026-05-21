"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ui/ThemeToggle";
import styles from "./AdminNav.module.css";

interface Props {
  userEmail: string;
}

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/proyectos", label: "Proyectos" },
  { href: "/admin/empresas", label: "Colaboraciones" },
  { href: "/admin/perfil", label: "Perfil" },
  { href: "/admin/stats", label: "Estadísticas" },
];

export default function AdminNav({ userEmail }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Cerrar al navegar.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Escape + scroll lock cuando el drawer está abierto.
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  // El contenido del nav lo reusan sidebar (desktop) y drawer (móvil).
  // En el drawer, el ThemeToggle va abajo para no solaparse con el botón de cerrar.
  const NavContent = ({ isDrawer }: { isDrawer?: boolean }) => (
    <>
      <div className={styles.header}>
        <Link href="/admin" className={styles.brandLink}>
          Admin
        </Link>
        {!isDrawer && <ThemeToggle />}
      </div>

      <nav className={styles.nav}>
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(styles.link, pathname === href && styles.active)}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className={styles.bottom}>
        {isDrawer && (
          <div className={styles.themeToggleWrap}>
            <ThemeToggle />
          </div>
        )}
        <div className={styles.bottomRow}>
          <span className={styles.email}>{userEmail}</span>
        </div>
        <button onClick={handleLogout} className={styles.logout}>
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Top bar móvil (oculto en desktop via CSS). */}
      <header className={styles.mobileBar}>
        <Link href="/admin" className={styles.brandLink}>
          Admin
        </Link>
        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menú admin"
          aria-expanded={drawerOpen}
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      </header>

      {/* Sidebar (sticky en desktop, oculto en móvil via CSS). */}
      <aside className={styles.sidebar}><NavContent /></aside>

      {/* Drawer móvil — sólo cuando está abierto. */}
      {drawerOpen && (
        <div
          className={styles.drawerBackdrop}
          onClick={() => setDrawerOpen(false)}
          role="presentation"
        >
          <aside
            className={styles.drawer}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Menú admin"
          >
            <button
              type="button"
              className={styles.drawerClose}
              onClick={() => setDrawerOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={20} aria-hidden="true" />
            </button>
            <NavContent isDrawer />
          </aside>
        </div>
      )}
    </>
  );
}
