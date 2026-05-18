"use client";

import { useEffect, useRef } from "react";
import styles from "./Cursor.module.css";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch / pointer-coarse devices — CSS `@media (hover: none)` hides
    // the elements but the RAF loop would keep running without this guard.
    if (window.matchMedia("(hover: none)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = 0,
      my = 0,
      rx = 0,
      ry = 0;

    function handleMove(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;
      if (dot) {
        dot.style.left = mx + "px";
        dot.style.top = my + "px";
      }
    }

    function tick() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ring) {
        ring.style.left = rx + "px";
        ring.style.top = ry + "px";
      }
      requestAnimationFrame(tick);
    }

    document.addEventListener("mousemove", handleMove);
    tick();

    const interactives = document.querySelectorAll("a, button");
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        ring.style.width = "56px";
        ring.style.height = "56px";
        ring.style.opacity = "0.55";
      });
      el.addEventListener("mouseleave", () => {
        ring.style.width = "38px";
        ring.style.height = "38px";
        ring.style.opacity = "0.3";
      });
    });

    return () => {
      document.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className={styles.dot}>
        <div className={styles.dotInner} />
      </div>
      <div ref={ringRef} className={styles.ring} />
    </>
  );
}
