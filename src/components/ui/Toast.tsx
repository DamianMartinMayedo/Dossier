"use client";

import { useEffect } from "react";
import styles from "./Toast.module.css";

interface Props {
  message: string | null;
  /** ms tras los que el toast se auto-cierra. 0 = no auto-dismiss. */
  duration?: number;
  variant?: "success" | "error";
  onClose: () => void;
}

/**
 * Toast minimal — se monta cuando `message` no es null y se desmonta tras
 * `duration` ms (o cuando el usuario lo cierra). Sin portales: vive en el
 * subtree del componente que lo invoca, pero con `position: fixed` flota
 * sobre cualquier contenido.
 */
export default function Toast({
  message,
  duration = 3000,
  variant = "success",
  onClose,
}: Props) {
  useEffect(() => {
    if (!message || duration <= 0) return;
    const t = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      className={`${styles.toast} ${variant === "error" ? styles.error : styles.success}`}
      role="status"
      aria-live="polite"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className={styles.closeBtn}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
}
