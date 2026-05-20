"use client";

import Image from "next/image";
import type { ImageBlock, ImageWidth } from "@/types";
import Dropzone from "../Dropzone";
import { useFileUpload } from "../useFileUpload";
import styles from "./BlockFields.module.css";

interface Props {
  block: ImageBlock;
  onChange: (next: ImageBlock) => void;
}

const WIDTH_LABELS: Record<ImageWidth, string> = {
  contained: "Contenido (texto)",
  wide: "Ancho",
  full: "Full-bleed",
};

export default function BlockImageForm({ block, onChange }: Props) {
  const { uploading, error, upload } = useFileUpload();

  async function handleFiles(files: File[]) {
    if (files.length === 0) return;
    try {
      const [url] = await upload([files[0]]);
      onChange({ ...block, url });
    } catch {
      // error ya mostrado por el hook
    }
  }

  return (
    <>
      {block.url ? (
        <div className={styles.preview}>
          <Image
            src={block.url}
            alt={block.alt || ""}
            fill
            sizes="240px"
            className={styles.previewImg}
            unoptimized
          />
        </div>
      ) : (
        <Dropzone onFiles={handleFiles} disabled={uploading} />
      )}
      {block.url && (
        <div className={styles.uploadColumn}>
          <Dropzone
            onFiles={handleFiles}
            disabled={uploading}
            compact
            label="Reemplazar imagen"
            hint="Arrastra o pulsa para sustituir"
          />
        </div>
      )}
      {uploading && <p className={styles.uploading}>Subiendo…</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Alt (descripción)</label>
          <input
            type="text"
            className={styles.input}
            value={block.alt}
            onChange={(e) => onChange({ ...block, alt: e.target.value })}
            placeholder="Texto alternativo para accesibilidad y SEO"
          />
        </div>
        <div className={styles.field} style={{ flex: "0 0 220px" }}>
          <label className={styles.label}>Ancho</label>
          <select
            className={styles.select}
            value={block.width}
            onChange={(e) => onChange({ ...block, width: e.target.value as ImageWidth })}
          >
            {(Object.keys(WIDTH_LABELS) as ImageWidth[]).map((w) => (
              <option key={w} value={w}>{WIDTH_LABELS[w]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Caption (opcional)</label>
        <input
          type="text"
          className={styles.input}
          value={block.caption ?? ""}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          placeholder="Pie de imagen"
        />
      </div>
    </>
  );
}
