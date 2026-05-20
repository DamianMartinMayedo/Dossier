"use client";

import Image from "next/image";
import type { CarouselBlock, GalleryImage } from "@/types";
import Dropzone from "../Dropzone";
import { useFileUpload } from "../useFileUpload";
import styles from "./BlockFields.module.css";

interface Props {
  block: CarouselBlock;
  onChange: (next: CarouselBlock) => void;
}

export default function BlockCarouselForm({ block, onChange }: Props) {
  const { uploading, error, upload } = useFileUpload();

  async function handleFiles(files: File[]) {
    if (files.length === 0) return;
    try {
      const urls = await upload(files);
      const newImages: GalleryImage[] = urls.map((url) => ({ url, alt: "" }));
      onChange({ ...block, images: [...block.images, ...newImages] });
    } catch {
      // error ya mostrado
    }
  }

  function updateAlt(idx: number, alt: string) {
    const images = block.images.map((img, i) => (i === idx ? { ...img, alt } : img));
    onChange({ ...block, images });
  }

  function removeImage(idx: number) {
    const images = block.images.filter((_, i) => i !== idx);
    onChange({ ...block, images });
  }

  return (
    <>
      {block.images.length > 0 && (
        <div className={styles.imageList}>
          {block.images.map((img, i) => (
            <div key={`${img.url}-${i}`} className={styles.imageItem}>
              <div className={styles.imageItemThumb}>
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="140px"
                  className={styles.imageItemThumbImg}
                  unoptimized
                />
              </div>
              <input
                type="text"
                className={styles.input}
                value={img.alt}
                onChange={(e) => updateAlt(i, e.target.value)}
                placeholder="Alt"
              />
              <button
                type="button"
                className={styles.imageItemRemove}
                onClick={() => removeImage(i)}
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}

      <Dropzone
        onFiles={handleFiles}
        disabled={uploading}
        multiple
        label="Arrastra varias imágenes o pulsa"
        hint="Las imágenes se ordenan según el orden de subida."
      />
      {uploading && <p className={styles.uploading}>Subiendo…</p>}
      {error && <p className={styles.error}>{error}</p>}
    </>
  );
}
