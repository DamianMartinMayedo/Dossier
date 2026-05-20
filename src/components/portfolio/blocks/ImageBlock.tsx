import Image from "next/image";
import type { ImageBlock as ImageBlockT } from "@/types";
import styles from "./ImageBlock.module.css";

interface Props {
  block: ImageBlockT;
  embedded?: boolean;
}

const SIZES: Record<ImageBlockT["width"], string> = {
  contained: "(min-width: 640px) 640px, 100vw",
  wide: "(min-width: 960px) 960px, 100vw",
  full: "100vw",
};

export default function ImageBlock({ block, embedded }: Props) {
  if (!block.url) return null;
  const inner = (
    <>
      <div className={styles.imageInner}>
        <Image
          src={block.url}
          alt={block.alt}
          fill
          sizes={embedded ? "(min-width: 640px) 480px, 100vw" : SIZES[block.width]}
          className={styles.img}
        />
      </div>
      {block.caption && <figcaption className={styles.caption}>{block.caption}</figcaption>}
    </>
  );
  if (embedded) {
    return <figure className={`${styles.wrap} ${styles.embedded}`}>{inner}</figure>;
  }
  return <figure className={`${styles.wrap} ${styles[block.width]}`}>{inner}</figure>;
}
