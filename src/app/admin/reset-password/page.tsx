"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "../login/page.module.css";

/**
 * Página de destino del email "reset password" de Supabase.
 *
 * Cuando el usuario hace click en el enlace del email, Supabase abre esta URL
 * con un token de recovery en el hash. El cliente de Supabase detecta el
 * fragmento y crea una sesión temporal "recovery" que permite cambiar la
 * contraseña sin saber la anterior.
 *
 * Si llegan a esta URL sin token (sesión inválida), redirigimos a /admin/login.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    // Esperamos al evento PASSWORD_RECOVERY del Supabase auth listener: confirma
    // que el token del email fue parseado y existe sesión recovery.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // Si ya hay sesión recovery activa (refresh, etc.), también listo.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message || "No se pudo actualizar la contraseña.");
      return;
    }
    setInfo("Contraseña actualizada. Redirigiendo al admin…");
    setTimeout(() => {
      router.push("/admin");
      router.refresh();
    }, 1500);
  }

  if (!ready) {
    return (
      <div className={styles.page}>
        <div className={styles.form}>
          <h1 className={styles.title}>Recuperar contraseña</h1>
          <p className={styles.info}>
            Comprobando enlace de recuperación…
            <br />
            Si llegaste aquí sin pulsar el enlace del email, vuelve al{" "}
            <Link href="/admin/login">login</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Nueva contraseña</h1>

        {error && <p className={styles.error}>{error}</p>}
        {info && <p className={styles.info}>{info}</p>}

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Nueva contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className={styles.input}
            autoComplete="new-password"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="confirm" className={styles.label}>
            Repítela
          </label>
          <input
            type="password"
            id="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            className={styles.input}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}
