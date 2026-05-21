"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { CarouselBlock as CarouselBlockT } from "@/types";
import styles from "./CarouselBlock.module.css";

interface Props {
  block: CarouselBlockT;
  embedded?: boolean;
}

/**
 * Carrusel scroll-based:
 *  - Auto-scroll suave con RAF (no animación CSS para soportar drag).
 *  - Drag con el ratón (umbral 5px → no se cancelan los clicks).
 *  - Soporta swipe táctil y wheel nativos.
 *  - Click en una imagen → lightbox con zoom-in (mismo efecto que las
 *    cards secundarias).
 */
export default function CarouselBlock({ block, embedded }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const orientation = block.orientation ?? "vertical";
  const orientationClass =
    orientation === "horizontal" ? styles.horizontal : styles.vertical;

  // ── Auto-scroll + drag handling ─────────────────────────────
  useEffect(() => {
    if (!block.images || block.images.length === 0) return;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    // Velocidad escalada al nº de imágenes (más imágenes = más rápido).
    const SPEED = Math.min(140, Math.max(60, block.images.length * 7));
    const DRAG_THRESHOLD = 5;

    let raf = 0;
    let lastTime = 0;
    let paused = false;
    let pointerDown = false;
    let dragging = false;
    let pointerStartX = 0;
    let scrollStartX = 0;

    function tick(time: number) {
      raf = requestAnimationFrame(tick);
      if (lastTime === 0) {
        lastTime = time;
        return;
      }
      const dt = time - lastTime;
      lastTime = time;
      if (paused || dragging) return;

      viewport!.scrollLeft += (SPEED * dt) / 1000;
      const half = track!.scrollWidth / 2;
      if (viewport!.scrollLeft >= half) viewport!.scrollLeft -= half;
    }

    function onEnter() {
      paused = true;
    }
    function onLeave() {
      paused = false;
      lastTime = 0;
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return;
      pointerDown = true;
      dragging = false;
      pointerStartX = e.clientX;
      scrollStartX = viewport!.scrollLeft;
      window.addEventListener("pointermove", onWindowMove);
      window.addEventListener("pointerup", onWindowUp);
      window.addEventListener("pointercancel", onWindowUp);
    }

    function onWindowMove(e: PointerEvent) {
      if (!pointerDown) return;
      const dx = e.clientX - pointerStartX;
      if (!dragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        dragging = true;
        viewport!.classList.add(styles.grabbing);
      }
      viewport!.scrollLeft = scrollStartX - dx;
      const half = track!.scrollWidth / 2;
      if (viewport!.scrollLeft < 0) viewport!.scrollLeft += half;
      else if (viewport!.scrollLeft >= half) viewport!.scrollLeft -= half;
      e.preventDefault();
    }

    function onWindowUp() {
      if (!pointerDown) return;
      pointerDown = false;
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerup", onWindowUp);
      window.removeEventListener("pointercancel", onWindowUp);

      if (dragging) {
        viewport!.classList.remove(styles.grabbing);
        // Suprimimos el click sintético que vendría tras el drag.
        const suppress = (ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        viewport!.addEventListener("click", suppress, { capture: true, once: true });
        setTimeout(() => {
          viewport!.removeEventListener("click", suppress, { capture: true } as EventListenerOptions);
        }, 0);
      }
      dragging = false;
      lastTime = 0;
    }

    // Pause on hover sólo en desktop con cursor fino. En touch, `mouseenter`
    // se dispara al primer tap pero `mouseleave` nunca llega → carrusel queda
    // pausado para siempre. Detectamos vía matchMedia.
    const supportsHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (supportsHover) {
      viewport.addEventListener("mouseenter", onEnter);
      viewport.addEventListener("mouseleave", onLeave);
    }
    viewport.addEventListener("pointerdown", onPointerDown);

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (supportsHover) {
        viewport.removeEventListener("mouseenter", onEnter);
        viewport.removeEventListener("mouseleave", onLeave);
      }
      viewport.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerup", onWindowUp);
      window.removeEventListener("pointercancel", onWindowUp);
    };
  }, [block.images]);

  // ── Lightbox open/close vía native <dialog> ─────────────────
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (lightboxIdx !== null) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [lightboxIdx]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setLightboxIdx(null);
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  // Navegación prev/next con flechas del teclado.
  useEffect(() => {
    if (lightboxIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        setLightboxIdx((i) =>
          i === null ? null : (i + 1) % block.images.length,
        );
      } else if (e.key === "ArrowLeft") {
        setLightboxIdx((i) =>
          i === null ? null : (i - 1 + block.images.length) % block.images.length,
        );
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, block.images.length]);

  if (!block.images || block.images.length === 0) return null;

  // Duplicamos para el loop infinito.
  const doubled = [...block.images, ...block.images];
  const lightboxImage =
    lightboxIdx !== null ? block.images[lightboxIdx] : null;

  return (
    <>
      <div
        className={`${styles.wrap} ${orientationClass} ${embedded ? styles.embedded : ""}`}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Galería deslizable de imágenes"
      >
        <div ref={viewportRef} className={styles.viewport}>
          <div ref={trackRef} className={styles.track}>
            {doubled.map((img, i) => {
              const isDuplicate = i >= block.images.length;
              const realIdx = i % block.images.length;
              return (
                <button
                  key={`${img.url}-${i}`}
                  type="button"
                  className={styles.item}
                  aria-hidden={isDuplicate ? "true" : undefined}
                  aria-label={isDuplicate ? undefined : `Ampliar imagen ${realIdx + 1}`}
                  onClick={() => setLightboxIdx(realIdx)}
                >
                  <Image
                    src={img.url}
                    alt={isDuplicate ? "" : img.alt}
                    fill
                    sizes={
                      orientation === "horizontal"
                        ? embedded
                          ? "280px"
                          : "(min-width: 640px) 360px, 280px"
                        : embedded
                          ? "180px"
                          : "(min-width: 640px) 240px, 180px"
                    }
                    className={styles.img}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Lightbox ───────────────────────────────────────── */}
      <dialog
        ref={dialogRef}
        className={styles.modal}
        aria-label="Imagen ampliada"
        onClick={(e) => {
          if (e.target === e.currentTarget) setLightboxIdx(null);
        }}
      >
        <button
          className={styles.modalClose}
          onClick={() => setLightboxIdx(null)}
          type="button"
          aria-label="Cerrar"
        >
          <X size={20} aria-hidden="true" />
        </button>
        {block.images.length > 1 && (
          <>
            <button
              className={`${styles.modalNav} ${styles.modalPrev}`}
              type="button"
              aria-label="Imagen anterior"
              onClick={() =>
                setLightboxIdx((i) =>
                  i === null ? null : (i - 1 + block.images.length) % block.images.length,
                )
              }
            >
              <ChevronLeft size={28} aria-hidden="true" />
            </button>
            <button
              className={`${styles.modalNav} ${styles.modalNext}`}
              type="button"
              aria-label="Imagen siguiente"
              onClick={() =>
                setLightboxIdx((i) =>
                  i === null ? null : (i + 1) % block.images.length,
                )
              }
            >
              <ChevronRight size={28} aria-hidden="true" />
            </button>
          </>
        )}
        {lightboxImage && (
          <div
            key={lightboxIdx}
            className={`${styles.modalImgWrap} ${
              orientation === "horizontal" ? styles.modalImgWrapHorizontal : ""
            }`}
          >
            <Image
              src={lightboxImage.url}
              alt={lightboxImage.alt}
              fill
              sizes="90vw"
              className={styles.modalImg}
              priority
            />
          </div>
        )}
      </dialog>
    </>
  );
}
