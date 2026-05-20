"use client";

import { useRef, useState, type DragEvent } from "react";
import { ADMIN_UPLOAD_ALLOWED_ACCEPT, ADMIN_UPLOAD_HINT, validateUploadFile } from "@/lib/admin-upload";
import styles from "./Dropzone.module.css";

interface Props {
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  hint?: string;
  onFiles: (files: File[]) => void;
  /** Si lo pasas, el dropzone es más compacto (ej. dentro de columnas). */
  compact?: boolean;
}

export default function Dropzone({
  multiple = false,
  disabled = false,
  label,
  hint = ADMIN_UPLOAD_HINT,
  onFiles,
  compact = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function handleFiles(files: FileList | File[] | null) {
    if (!files) return;
    const list = Array.from(files);
    if (list.length === 0) return;
    // Valida cada archivo antes de pasarlo arriba.
    for (const f of list) {
      const err = validateUploadFile(f);
      if (err) {
        setError(err);
        return;
      }
    }
    setError("");
    onFiles(multiple ? list : [list[0]]);
  }

  function onDragEnter(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setDragging(true);
  }

  function onDragOver(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onDragLeave(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }

  function onDrop(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }

  const defaultLabel = multiple ? "Arrastra imágenes aquí o pulsa para elegir" : "Arrastra una imagen aquí o pulsa para elegir";

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={`${styles.zone} ${dragging ? styles.dragging : ""} ${compact ? styles.compact : ""} ${disabled ? styles.disabled : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        disabled={disabled}
      >
        <svg
          className={styles.icon}
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className={styles.label}>{label ?? defaultLabel}</p>
        <p className={styles.hint}>{hint}</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ADMIN_UPLOAD_ALLOWED_ACCEPT}
        multiple={multiple}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
        className={styles.hiddenInput}
        disabled={disabled}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
