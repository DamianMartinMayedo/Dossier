import type { HeadingBlock as HeadingBlockT } from "@/types";
import styles from "./HeadingBlock.module.css";

interface Props {
  block: HeadingBlockT;
  embedded?: boolean;
}

export default function HeadingBlock({ block, embedded }: Props) {
  const Tag = block.level === 3 ? "h3" : "h2";
  const content = (
    <>
      {block.eyebrow && <p className={styles.eyebrow}>{block.eyebrow}</p>}
      <Tag className={block.level === 3 ? styles.h3 : styles.h2}>{block.text}</Tag>
    </>
  );
  if (embedded) return <div className={styles.embedded}>{content}</div>;
  return <div className={styles.wrap}>{content}</div>;
}
