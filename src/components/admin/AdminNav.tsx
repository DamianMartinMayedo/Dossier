"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Link href="/admin" className={styles.brandLink}>
          Admin
        </Link>
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
        <div className={styles.bottomRow}>
          <span className={styles.email}>{userEmail}</span>
          <ThemeToggle />
        </div>
        <button onClick={handleLogout} className={styles.logout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
