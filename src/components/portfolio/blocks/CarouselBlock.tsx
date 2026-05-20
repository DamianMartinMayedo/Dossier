import Image from "next/image";
import type { CSSProperties } from "react";
import type { CarouselBlock as CarouselBlockT } from "@/types";
import styles from "./CarouselBlock.module.css";

interface Props {
  block: CarouselBlockT;
  embedded?: boolean;
}

export default function CarouselBlock({ block, embedded }: Props) {
  if (block.images.length === 0) return null;

  // Para el efecto infinito necesitamos duplicar los items: animamos translateX(-50%),
  // que recorre exactamente la mitad del track (la primera copia) y vuelve a 0 sin saltos.
  const doubled = [...block.images, ...block.images];

  // Duración proporcional al nº de imágenes (más imágenes = más lento para que sea legible).
  // ~3.5s por imagen, mínimo 18s, máximo 80s.
  const duration = Math.min(80, Math.max(18, block.images.length * 3.5));
  const trackStyle = { "--marquee-duration": `${duration}s` } as CSSProperties;

  return (
    <div
      className={`${styles.wrap} ${embedded ? styles.embedded : ""}`}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Galería deslizable de imágenes"
    >
      <div className={styles.viewport}>
        <div className={styles.track} style={trackStyle} aria-hidden="false">
          {doubled.map((img, i) => {
            const isDuplicate = i >= block.images.length;
            return (
              <div
                key={`${img.url}-${i}`}
                className={styles.item}
                aria-hidden={isDuplicate ? "true" : undefined}
              >
                <Image
                  src={img.url}
                  alt={isDuplicate ? "" : img.alt}
                  fill
                  sizes={embedded ? "180px" : "(min-width: 640px) 240px, 180px"}
                  className={styles.img}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
