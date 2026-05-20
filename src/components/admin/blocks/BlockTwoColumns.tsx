"use client";

import { useState } from "react";
import type {
  SimpleBlock,
  SimpleBlockType,
  TwoColumnsBlock,
  TwoColumnsRatio,
} from "@/types";
import { BLOCK_LABELS, SIMPLE_BLOCK_TYPES, createSimpleBlock } from "@/lib/blocks";
import BlockHeadingForm from "./BlockHeading";
import BlockParagraphForm from "./BlockParagraph";
import BlockImageForm from "./BlockImage";
import BlockGalleryForm from "./BlockGallery";
import BlockCarouselForm from "./BlockCarousel";
import styles from "./BlockFields.module.css";
import shellStyles from "./BlockShell.module.css";

interface Props {
  block: TwoColumnsBlock;
  onChange: (next: TwoColumnsBlock) => void;
}

const RATIO_LABELS: Record<TwoColumnsRatio, string> = {
  "1:1": "50% / 50%",
  "1:2": "33% / 66%",
  "2:1": "66% / 33%",
};

function ColumnEditor({
  side,
  child,
  onChange,
}: {
  side: "left" | "right";
  child: SimpleBlock | null;
  onChange: (next: SimpleBlock | null) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function pick(type: SimpleBlockType) {
    onChange(createSimpleBlock(type));
    setPickerOpen(false);
  }

  function changeType(type: SimpleBlockType) {
    if (child?.type === type) return;
    if (child && !confirm(`Cambiar a "${BLOCK_LABELS[type]}" reemplazará el contenido actual de esta columna. ¿Continuar?`)) return;
    onChange(createSimpleBlock(type));
  }

  if (!child) {
    return (
      <div className={styles.columnSlot}>
        <p className={styles.label}>Columna {side === "left" ? "izquierda" : "derecha"}</p>
        <div className={styles.columnPicker}>
          {SIMPLE_BLOCK_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={styles.pickerChip}
              onClick={() => pick(t)}
            >
              + {BLOCK_LABELS[t]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderForm() {
    if (!child) return null;
    switch (child.type) {
      case "heading":
        return <BlockHeadingForm block={child} onChange={(b) => onChange(b)} />;
      case "paragraph":
        return <BlockParagraphForm block={child} onChange={(b) => onChange(b)} />;
      case "image":
        return <BlockImageForm block={child} onChange={(b) => onChange(b)} />;
      case "gallery":
        return <BlockGalleryForm block={child} onChange={(b) => onChange(b)} />;
      case "carousel":
        return <BlockCarouselForm block={child} onChange={(b) => onChange(b)} />;
    }
  }

  return (
    <div className={styles.columnSlot}>
      <header className={styles.columnHeader}>
        <p className={styles.label}>
          Columna {side === "left" ? "izquierda" : "derecha"}
        </p>
        <div className={styles.columnControls}>
          <button
            type="button"
            className={shellStyles.iconBtn}
            onClick={() => setPickerOpen((o) => !o)}
            aria-label="Cambiar tipo"
            title="Cambiar tipo"
          >
            ⇄
          </button>
          <button
            type="button"
            className={`${shellStyles.iconBtn} ${shellStyles.danger}`}
            onClick={() => onChange(null)}
            aria-label="Quitar columna"
            title="Quitar"
          >
            ×
          </button>
        </div>
      </header>
      {pickerOpen && (
        <div className={styles.columnPicker}>
          {SIMPLE_BLOCK_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={`${styles.pickerChip} ${child.type === t ? styles.pickerChipActive : ""}`}
              onClick={() => {
                changeType(t);
                setPickerOpen(false);
              }}
            >
              {BLOCK_LABELS[t]}
            </button>
          ))}
        </div>
      )}
      <p className={styles.columnTypeBadge}>{BLOCK_LABELS[child.type]}</p>
      <div className={styles.columnFormBody}>{renderForm()}</div>
    </div>
  );
}

export default function BlockTwoColumnsForm({ block, onChange }: Props) {
  return (
    <>
      <div className={styles.row}>
        <div className={styles.field} style={{ flex: "0 0 220px" }}>
          <label className={styles.label}>Proporción de columnas</label>
          <select
            className={styles.select}
            value={block.ratio}
            onChange={(e) => onChange({ ...block, ratio: e.target.value as TwoColumnsRatio })}
          >
            {(Object.keys(RATIO_LABELS) as TwoColumnsRatio[]).map((r) => (
              <option key={r} value={r}>{RATIO_LABELS[r]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.twoColGrid}>
        <ColumnEditor
          side="left"
          child={block.left}
          onChange={(next) => onChange({ ...block, left: next })}
        />
        <ColumnEditor
          side="right"
          child={block.right}
          onChange={(next) => onChange({ ...block, right: next })}
        />
      </div>
    </>
  );
}
