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

  // ── Auto-scroll + drag handling (RAF + transform, no scrollLeft) ──
  useEffect(() => {
    if (!block.images || block.images.length === 0) return;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const SPEED = Math.min(140, Math.max(60, block.images.length * 7));
    const DRAG_THRESHOLD = 5;

    let raf = 0;
    let lastTime = 0;
    let paused = false;
    let dragging = false;
    let offset = 0;
    let half = track.scrollWidth / 2;

    let pointerDown = false;
    let pointerStartX = 0;
    let offsetAtStart = 0;

    function tick(time: number) {
      raf = requestAnimationFrame(tick);
      if (lastTime === 0) {
        lastTime = time;
        return;
      }
      const dt = time - lastTime;
      lastTime = time;
      if (paused || dragging) return;

      offset -= (SPEED * dt) / 1000;
      if (half === 0) half = track!.scrollWidth / 2;
      if (offset <= -half) offset += half;

      track!.style.transform = `translateX(${offset}px)`;
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
      offsetAtStart = offset;
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
        track!.classList.add(styles.grabbing);
      }
      offset = offsetAtStart + dx;
      if (half === 0) half = track!.scrollWidth / 2;
      if (offset <= -half) offset += half;
      if (offset > 0) offset -= half;
      track!.style.transform = `translateX(${offset}px)`;
      e.preventDefault();
    }

    function onWindowUp() {
      if (!pointerDown) return;
      pointerDown = false;
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerup", onWindowUp);
      window.removeEventListener("pointercancel", onWindowUp);

      if (dragging) {
        track!.classList.remove(styles.grabbing);
        const suppress = (ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        track!.addEventListener("click", suppress, { capture: true, once: true });
        setTimeout(() => {
          track!.removeEventListener("click", suppress, { capture: true } as EventListenerOptions);
        }, 0);
      }
      dragging = false;
      lastTime = 0;
    }

    const supportsHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (supportsHover) {
      viewport.addEventListener("mouseenter", onEnter);
      viewport.addEventListener("mouseleave", onLeave);
    }
    viewport.addEventListener("pointerdown", onPointerDown);

    // Mouse wheel support — horizontal (Magic Mouse/trackpad) or vertical (regular mouse).
    function onWheel(e: WheelEvent) {
      if (dragging) return;
      const delta = Math.abs(e.deltaX) > 1 ? e.deltaX : e.deltaY;
      offset -= delta;
      if (half === 0) half = track!.scrollWidth / 2;
      if (offset <= -half) offset += half;
      if (offset > 0) offset -= half;
      track!.style.transform = `translateX(${offset}px)`;
      e.preventDefault();
    }
    track.addEventListener("wheel", onWheel, { passive: false });

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (supportsHover) {
        viewport.removeEventListener("mouseenter", onEnter);
        viewport.removeEventListener("mouseleave", onLeave);
      }
      viewport.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("wheel", onWheel);
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
