"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

type Mode = "signin" | "reset";

/**
 * Traduce los códigos de error de Supabase Auth a mensajes útiles en español.
 * Supabase devuelve `code` (en versiones recientes) o `message` (legacy).
 */
function translateAuthError(err: { code?: string; message?: string } | null): string {
  if (!err) return "Error desconocido. Inténtalo de nuevo.";
  const code = err.code ?? "";
  const msg = (err.message ?? "").toLowerCase();

  if (code === "invalid_credentials" || msg.includes("invalid login")) {
    return "Email o contraseña incorrectos.";
  }
  if (code === "email_not_confirmed" || msg.includes("not confirmed")) {
    return "Tu email no está confirmado. Revisa tu bandeja.";
  }
  if (code === "user_not_found" || msg.includes("user not found")) {
    return "No existe ningún usuario con ese email.";
  }
  if (msg.includes("rate limit") || code === "over_request_rate_limit") {
    return "Demasiados intentos. Espera unos minutos antes de volver a probar.";
  }
  if (msg.includes("network") || code === "network_error") {
    return "Error de red. Comprueba tu conexión.";
  }
  return err.message || "Error al procesar la solicitud.";
}

export default function AdminLogin() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(translateAuthError(authError));
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email) {
      setError("Introduce tu email para recibir el enlace de recuperación.");
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    setLoading(false);
    if (resetError) {
      setError(translateAuthError(resetError));
      return;
    }
    setInfo(
      "Si ese email existe, te hemos enviado un enlace para restablecer la contraseña. Revisa tu bandeja (y spam).",
    );
  }

  return (
    <div className={styles.page}>
      <form
        onSubmit={mode === "signin" ? handleSignIn : handleReset}
        className={styles.form}
      >
        <h1 className={styles.title}>
          {mode === "signin" ? "Admin" : "Recuperar contraseña"}
        </h1>

        {error && <p className={styles.error}>{error}</p>}
        {info && <p className={styles.info}>{info}</p>}

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            autoComplete="email"
          />
        </div>

        {mode === "signin" && (
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              autoComplete="current-password"
            />
          </div>
        )}

        <button type="submit" disabled={loading} className={styles.button}>
          {loading
            ? mode === "signin"
              ? "Entrando…"
              : "Enviando…"
            : mode === "signin"
              ? "Entrar"
              : "Enviar enlace"}
        </button>

        <div className={styles.linkRow}>
          {mode === "signin" ? (
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => {
                setMode("reset");
                setError("");
                setInfo("");
              }}
            >
              ¿Olvidaste la contraseña?
            </button>
          ) : (
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => {
                setMode("signin");
                setError("");
                setInfo("");
              }}
            >
              ← Volver al login
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
