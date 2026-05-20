import type { ParagraphBlock as ParagraphBlockT } from "@/types";
import styles from "./ParagraphBlock.module.css";

interface Props {
  block: ParagraphBlockT;
  embedded?: boolean;
}

export default function ParagraphBlock({ block, embedded }: Props) {
  if (embedded) {
    return <p className={`${styles.text} ${styles.embedded}`}>{block.text}</p>;
  }
  return (
    <div className={styles.wrap}>
      <p className={styles.text}>{block.text}</p>
    </div>
  );
}
