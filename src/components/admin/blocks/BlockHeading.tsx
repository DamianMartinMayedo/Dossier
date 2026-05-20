"use client";

import type { HeadingBlock } from "@/types";
import styles from "./BlockFields.module.css";

interface Props {
  block: HeadingBlock;
  onChange: (next: HeadingBlock) => void;
}

export default function BlockHeadingForm({ block, onChange }: Props) {
  return (
    <>
      <div className={styles.row}>
        <div className={`${styles.field} ${styles.fieldNarrow}`}>
          <label className={styles.label}>Nivel</label>
          <select
            className={styles.select}
            value={block.level}
            onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 2 | 3 })}
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Eyebrow (opcional)</label>
          <input
            type="text"
            className={styles.input}
            value={block.eyebrow ?? ""}
            onChange={(e) => onChange({ ...block, eyebrow: e.target.value })}
            placeholder="Ej. Contexto"
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Título</label>
        <input
          type="text"
          className={styles.input}
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder="Texto del título"
        />
      </div>
    </>
  );
}
