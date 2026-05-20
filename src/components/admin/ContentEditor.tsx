"use client";

import { useState } from "react";
import type { ContentBlock, ContentBlockType } from "@/types";
import { BLOCK_LABELS, createBlock } from "@/lib/blocks";
import BlockShell from "./blocks/BlockShell";
import BlockHeadingForm from "./blocks/BlockHeading";
import BlockParagraphForm from "./blocks/BlockParagraph";
import BlockImageForm from "./blocks/BlockImage";
import BlockGalleryForm from "./blocks/BlockGallery";
import BlockCarouselForm from "./blocks/BlockCarousel";
import BlockTwoColumnsForm from "./blocks/BlockTwoColumns";
import styles from "./ContentEditor.module.css";

interface Props {
  blocks: ContentBlock[];
  onChange: (next: ContentBlock[]) => void;
}

const BLOCK_TYPES: ContentBlockType[] = [
  "heading",
  "paragraph",
  "image",
  "gallery",
  "carousel",
  "two-columns",
];

export default function ContentEditor({ blocks, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function addBlock(type: ContentBlockType) {
    onChange([...blocks, createBlock(type)]);
    setPickerOpen(false);
  }

  function updateBlock(index: number, next: ContentBlock) {
    onChange(blocks.map((b, i) => (i === index ? next : b)));
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  }

  function renderBlockForm(block: ContentBlock, idx: number) {
    const update = (next: ContentBlock) => updateBlock(idx, next);
    switch (block.type) {
      case "heading":
        return <BlockHeadingForm block={block} onChange={update} />;
      case "paragraph":
        return <BlockParagraphForm block={block} onChange={update} />;
      case "image":
        return <BlockImageForm block={block} onChange={update} />;
      case "gallery":
        return <BlockGalleryForm block={block} onChange={update} />;
      case "carousel":
        return <BlockCarouselForm block={block} onChange={update} />;
      case "two-columns":
        return <BlockTwoColumnsForm block={block} onChange={update} />;
    }
  }

  return (
    <section className={styles.section} aria-label="Bloques de contenido">
      <header className={styles.header}>
        <h3 className={styles.title}>Bloques de contenido</h3>
        <p className={styles.hint}>
          Construye la página alternando títulos, párrafos, imágenes, galerías, carruseles o columnas.
        </p>
      </header>

      <div className={styles.list}>
        {blocks.map((block, i) => (
          <BlockShell
            key={block.id}
            block={block}
            index={i}
            total={blocks.length}
            onRemove={() => removeBlock(i)}
            onMoveUp={() => moveBlock(i, -1)}
            onMoveDown={() => moveBlock(i, 1)}
          >
            {renderBlockForm(block, i)}
          </BlockShell>
        ))}
        {blocks.length === 0 && (
          <p className={styles.empty}>
            Aún no hay bloques. Añade el primero abajo.
          </p>
        )}
      </div>

      <div className={styles.adder}>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => setPickerOpen((o) => !o)}
          aria-expanded={pickerOpen}
        >
          + Añadir bloque
        </button>
        {pickerOpen && (
          <div className={styles.picker} role="menu">
            {BLOCK_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={styles.pickerItem}
                onClick={() => addBlock(t)}
                role="menuitem"
              >
                {BLOCK_LABELS[t]}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
