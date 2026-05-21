"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./CollabGrid.module.css";

interface CollaborationRow {
  id: string;
  name: string;
  image_url: string;
  order: number;
}

interface Props {
  rows: CollaborationRow[];
}

export default function CollabGridClient({ rows }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rows.length === 0) return;

    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const SPEED = 80;
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
        const suppressClick = (ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        viewport!.addEventListener("click", suppressClick, { capture: true, once: true });
        setTimeout(() => {
          viewport!.removeEventListener("click", suppressClick, { capture: true } as EventListenerOptions);
        }, 0);
      }
      dragging = false;
      lastTime = 0;
    }

    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (supportsHover) {
      viewport.addEventListener("mouseenter", () => { paused = true; });
      viewport.addEventListener("mouseleave", () => { paused = false; lastTime = 0; });
    }
    viewport.addEventListener("pointerdown", onPointerDown);

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (supportsHover) {
        viewport.removeEventListener("mouseenter", () => {});
        viewport.removeEventListener("mouseleave", () => {});
      }
      viewport.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerup", onWindowUp);
      window.removeEventListener("pointercancel", onWindowUp);
    };
  }, [rows]);

  if (rows.length === 0) return null;

  const items = [...rows, ...rows];

  return (
    <div className={styles.wrap}>
      <div ref={viewportRef} className={styles.viewport}>
        <div ref={trackRef} className={styles.track}>
          {items.map((logo, i) => (
            <div key={`${logo.id}-${i}`} className={styles.item}>
              <Image
                src={logo.image_url}
                alt={logo.name}
                width={200}
                height={56}
                className={styles.logo}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
