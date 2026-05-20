import type { CSSProperties } from "react";
import type { SimpleBlock, TwoColumnsBlock as TwoColumnsBlockT } from "@/types";
import HeadingBlock from "./HeadingBlock";
import ParagraphBlock from "./ParagraphBlock";
import ImageBlock from "./ImageBlock";
import GalleryBlock from "./GalleryBlock";
import CarouselBlock from "./CarouselBlock";
import styles from "./TwoColumnsBlock.module.css";

interface Props {
  block: TwoColumnsBlockT;
}

const RATIO_MAP: Record<TwoColumnsBlockT["ratio"], string> = {
  "1:1": "1fr 1fr",
  "1:2": "1fr 2fr",
  "2:1": "2fr 1fr",
};

function renderSide(block: SimpleBlock | null) {
  if (!block) return null;
  switch (block.type) {
    case "heading":
      return <HeadingBlock block={block} embedded />;
    case "paragraph":
      return <ParagraphBlock block={block} embedded />;
    case "image":
      return <ImageBlock block={block} embedded />;
    case "gallery":
      return <GalleryBlock block={block} embedded />;
    case "carousel":
      return <CarouselBlock block={block} embedded />;
  }
}

export default function TwoColumnsBlock({ block }: Props) {
  const gridStyle = { "--grid-cols": RATIO_MAP[block.ratio] } as CSSProperties;

  return (
    <div className={styles.wrap}>
      <div className={styles.grid} style={gridStyle}>
        <div className={styles.col}>{renderSide(block.left)}</div>
        <div className={styles.col}>{renderSide(block.right)}</div>
      </div>
    </div>
  );
}
