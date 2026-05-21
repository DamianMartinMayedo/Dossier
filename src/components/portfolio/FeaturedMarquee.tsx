"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/types";
import ProjectCard from "./ProjectCard";
import styles from "./FeaturedMarquee.module.css";

interface Props {
  projects: Project[];
}

/**
 * Marquee horizontal infinito de proyectos destacados.
 *
 * Implementación scroll-based (no transform): el viewport tiene `overflow-x: auto`
 * y un RAF loop incrementa `scrollLeft`. Al pasar la mitad del track (lista
 * duplicada), restamos esa mitad → loop invisible.
 *
 * Drag-scroll que no rompe clicks:
 * - `pointerdown` sólo guarda la posición inicial. No setea dragging, no captura.
 * - `pointermove` (en `window` para soportar drag fuera del viewport) activa el
 *   modo drag sólo si el desplazamiento supera `DRAG_THRESHOLD`. Antes de eso,
 *   el evento se trata como un click potencial.
 * - Si hubo drag, en `pointerup` se inyecta un listener de captura one-shot
 *   sobre `click` para suprimir la navegación del Link.
 */
export default function FeaturedMarquee({ projects }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!projects || projects.length === 0) return;

    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const SPEED = Math.min(120, Math.max(60, projects.length * 8));
    const DRAG_THRESHOLD = 5; // px antes de considerar que es un drag.

    let raf = 0;
    let lastTime = 0;
    let paused = false;

    // Estado del puntero — se reinicia en cada pointerdown.
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
      // Listeners globales: el drag debe sobrevivir aunque el cursor salga
      // del viewport. NO usamos setPointerCapture porque interfiere con la
      // entrega de los `click` events a los Links internos.
      window.addEventListener("pointermove", onWindowMove);
      window.addEventListener("pointerup", onWindowUp);
      window.addEventListener("pointercancel", onWindowUp);
    }

    function onWindowMove(e: PointerEvent) {
      if (!pointerDown) return;
      const dx = e.clientX - pointerStartX;
      if (!dragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        // Cruzamos el umbral → modo drag.
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
        // Suprimimos el click que el browser está a punto de disparar tras el
        // pointerup: si arrastramos, no queremos navegar al Link debajo. El
        // setTimeout(0) limpia el handler si por alguna razón no llega click
        // (evita que se cuele en el siguiente).
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

    // Pause on hover sólo en dispositivos con cursor fino (desktop). En touch,
    // mobile Safari emula `mouseenter` al primer tap pero NUNCA dispara
    // `mouseleave` → si los enganchamos, el carrusel se queda pausado para
    // siempre tras la primera interacción del usuario.
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
  }, [projects]);

  if (!projects || projects.length === 0) return null;

  const doubled = [...projects, ...projects];

  return (
    <div
      className={styles.wrap}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Proyectos destacados"
    >
      <div ref={viewportRef} className={styles.viewport}>
        <div ref={trackRef} className={styles.track}>
          {doubled.map((project, i) => {
            const isDuplicate = i >= projects.length;
            return (
              <div
                key={`${project.id}-${i}`}
                className={styles.item}
                aria-hidden={isDuplicate ? "true" : undefined}
              >
                <ProjectCard project={project} variant="home" span={4} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
