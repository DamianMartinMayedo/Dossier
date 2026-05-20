"use client";

import { useState, type ReactNode } from "react";
import type { ContentBlock } from "@/types";
import { BLOCK_LABELS, blockSummary } from "@/lib/blocks";
import BlockPreview from "../BlockPreview";
import styles from "./BlockShell.module.css";

interface Props {
  block: ContentBlock;
  index: number;
  total: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  children: ReactNode;
}

type ViewMode = "preview" | "form" | "split";

export default function BlockShell({
  block,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  children,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const [view, setView] = useState<ViewMode>("split");

  return (
    <div className={styles.card}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          <span className={styles.chevron} aria-hidden="true">{expanded ? "▾" : "▸"}</span>
          <span className={styles.type}>{BLOCK_LABELS[block.type]}</span>
          <span className={styles.summary}>{blockSummary(block)}</span>
        </button>
        <div className={styles.viewSwitch} role="tablist" aria-label="Modo de vista">
          <button
            type="button"
            className={`${styles.viewBtn} ${view === "preview" ? styles.viewBtnActive : ""}`}
            onClick={() => setView("preview")}
            aria-pressed={view === "preview"}
            title="Sólo vista previa"
          >
            Vista
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${view === "split" ? styles.viewBtnActive : ""}`}
            onClick={() => setView("split")}
            aria-pressed={view === "split"}
            title="Vista + edición"
          >
            Ambos
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${view === "form" ? styles.viewBtnActive : ""}`}
            onClick={() => setView("form")}
            aria-pressed={view === "form"}
            title="Sólo edición"
          >
            Editar
          </button>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label="Subir bloque"
            title="Subir"
          >
            ↑
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label="Bajar bloque"
            title="Bajar"
          >
            ↓
          </button>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.danger}`}
            onClick={onRemove}
            aria-label="Eliminar bloque"
            title="Eliminar"
          >
            ×
          </button>
        </div>
      </header>
      {expanded && (
        <div className={styles.body}>
          {view !== "form" && (
            <div className={styles.previewSlot}>
              <BlockPreview block={block} />
            </div>
          )}
          {view !== "preview" && <div className={styles.formSlot}>{children}</div>}
        </div>
      )}
    </div>
  );
}
