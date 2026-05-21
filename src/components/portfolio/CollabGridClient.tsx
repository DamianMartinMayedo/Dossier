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
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rows.length === 0) return;

    const track = trackRef.current;
    if (!track) return;

    const SPEED = 80;
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
        const suppressClick = (ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        track!.addEventListener("click", suppressClick, { capture: true, once: true });
        setTimeout(() => {
          track!.removeEventListener("click", suppressClick, { capture: true } as EventListenerOptions);
        }, 0);
      }
      dragging = false;
      lastTime = 0;
    }

    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (supportsHover) {
      track.addEventListener("mouseenter", () => { paused = true; });
      track.addEventListener("mouseleave", () => { paused = false; lastTime = 0; });
    }
    track.addEventListener("pointerdown", onPointerDown);

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
        track.removeEventListener("mouseenter", () => {});
        track.removeEventListener("mouseleave", () => {});
      }
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerup", onWindowUp);
      window.removeEventListener("pointercancel", onWindowUp);
    };
  }, [rows]);

  if (rows.length === 0) return null;

  const items = [...rows, ...rows];

  return (
    <div className={styles.wrap}>
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
  );
}
