import Image from "next/image";
import type { CSSProperties } from "react";
import type { GalleryBlock as GalleryBlockT } from "@/types";
import styles from "./GalleryBlock.module.css";

interface Props {
  block: GalleryBlockT;
  embedded?: boolean;
}

export default function GalleryBlock({ block, embedded }: Props) {
  if (block.images.length === 0) return null;
  // CSS variable injection (single allowed exception per CSS guide).
  const gridStyle = { "--cols": block.columns } as CSSProperties;
  const sizes =
    block.columns === 1
      ? "(min-width: 960px) 960px, 100vw"
      : block.columns === 2
        ? "(min-width: 640px) 50vw, 100vw"
        : "(min-width: 640px) 33vw, 100vw";

  const grid = (
    <div className={styles.grid} style={gridStyle}>
      {block.images.map((img, i) => (
        <div key={`${img.url}-${i}`} className={styles.item}>
          <Image src={img.url} alt={img.alt} fill sizes={sizes} className={styles.img} />
        </div>
      ))}
    </div>
  );

  if (embedded) return <div className={styles.embedded}>{grid}</div>;
  return <div className={styles.wrap}>{grid}</div>;
}
