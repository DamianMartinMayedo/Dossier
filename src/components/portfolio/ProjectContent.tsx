import type { ContentBlock } from "@/types";
import HeadingBlock from "./blocks/HeadingBlock";
import ParagraphBlock from "./blocks/ParagraphBlock";
import ImageBlock from "./blocks/ImageBlock";
import GalleryBlock from "./blocks/GalleryBlock";
import CarouselBlock from "./blocks/CarouselBlock";
import TwoColumnsBlock from "./blocks/TwoColumnsBlock";
import styles from "./ProjectContent.module.css";

interface Props {
  blocks: ContentBlock[];
}

function renderBlock(block: ContentBlock) {
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

export default function ProjectContent({ blocks }: Props) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className={styles.root}>
      {blocks.map((block) => (
        // Wrapping each block in a typed slot so CSS can target relations
        // (ej. heading + paragraph) sin depender de clases hasheadas.
        <div key={block.id} data-block-type={block.type} className={styles.slot}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  );
}
