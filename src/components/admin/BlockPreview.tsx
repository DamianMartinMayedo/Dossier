"use client";

import type { ContentBlock } from "@/types";
import HeadingBlock from "@/components/portfolio/blocks/HeadingBlock";
import ParagraphBlock from "@/components/portfolio/blocks/ParagraphBlock";
import ImageBlock from "@/components/portfolio/blocks/ImageBlock";
import GalleryBlock from "@/components/portfolio/blocks/GalleryBlock";
import CarouselBlock from "@/components/portfolio/blocks/CarouselBlock";
import TwoColumnsBlock from "@/components/portfolio/blocks/TwoColumnsBlock";
import styles from "./BlockPreview.module.css";

interface Props {
  block: ContentBlock;
}

function isEmpty(block: ContentBlock): boolean {
  switch (block.type) {
    case "heading":
      return !block.text;
    case "paragraph":
      return !block.text;
    case "image":
      return !block.url;
    case "gallery":
    case "carousel":
      return block.images.length === 0;
    case "two-columns":
      return !block.left && !block.right;
  }
}

function renderPublic(block: ContentBlock) {
  switch (block.type) {
    case "heading":
      return <HeadingBlock block={block} />;
    case "paragraph":
      return <ParagraphBlock block={block} />;
    case "image":
      return <ImageBlock block={block} />;
    case "gallery":
      return <GalleryBlock block={block} />;
    case "carousel":
      return <CarouselBlock block={block} />;
    case "two-columns":
      return <TwoColumnsBlock block={block} />;
  }
}

export default function BlockPreview({ block }: Props) {
  if (isEmpty(block)) {
    return (
      <div className={`${styles.frame} ${styles.empty}`}>
        <p className={styles.emptyLabel}>Vista previa</p>
        <p className={styles.emptyHint}>Rellena el formulario para ver cómo se renderiza.</p>
      </div>
    );
  }
  return (
    <div className={styles.frame}>
      <span className={styles.badge}>Vista previa</span>
      <div className={styles.canvas}>{renderPublic(block)}</div>
    </div>
  );
}
