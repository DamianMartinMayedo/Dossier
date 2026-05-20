"use client";

import type { ParagraphBlock } from "@/types";
import styles from "./BlockFields.module.css";

interface Props {
  block: ParagraphBlock;
  onChange: (next: ParagraphBlock) => void;
}

export default function BlockParagraphForm({ block, onChange }: Props) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>Texto</label>
      <textarea
        className={styles.textarea}
        rows={6}
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Escribe el párrafo. Los saltos de línea se preservan."
      />
    </div>
  );
}
