"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroOrb.module.css";

/**
 * Fondo interactivo del hero: grid de líneas horizontales planas EN REPOSO.
 * El cursor "provoca" una ondulación sinusoidal a su alrededor — las líneas
 * cercanas se curvan en patrón sin() con desfase entre filas (flujo tipo
 * tela ondulada). Sin animación temporal: el patrón es estático y sólo se
 * mueve cuando el ratón se mueve.
 *
 * Implementación con Canvas 2D:
 * - 1 path por fila → polilínea con muchos puntos siguiendo un sin().
 * - La amplitud está modulada radialmente por una campana coseno centrada
 *   en el cursor: 0 fuera del FOCUS_RADIUS, máxima en el puntero.
 * - Halo radial controla la alpha → la ola se ve sólo donde el cursor está.
 *
 * Sin efecto en touch / reduced-motion.
 */

const COLS = 140;
const ROWS = 90;
const LINE_WIDTH = 1;
const LERP_SPEED = 0.10;

// Patrón de la ola — se activa cuando el cursor está cerca.
const WAVE_FREQUENCY = 4.5;       // ciclos completos a lo ancho del canvas.
const PHASE_PER_ROW = 0.22;       // desfase de cada fila → flujo diagonal.

// Modulación con el cursor — fuera del radio: amp = 0 (líneas planas);
// dentro: amp crece con una campana coseno hasta MAX_AMPLITUDE en el centro.
const FOCUS_RADIUS = 0.36;
const MAX_AMPLITUDE = 0.045;      // pico de la ondulación (fracción del alto).

// Halo radial de visibilidad (alpha). Basado en `min(width, height)` para que
// sea un círculo perceptual con mismo alcance horizontal y vertical.
const FADE_RADIUS_FACTOR = 0.75;

function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  const bg = style.getPropertyValue("--color-bg").trim() || "#f5f3ef";
  const isDark = bg === "#111009" || bg.toLowerCase() === "rgb(17, 16, 9)";

  if (isDark) {
    return {
      base: "#1c1a12",
      active: "#2a2718",
      baseRgb: "28, 26, 18",
      activeRgb: "42, 39, 24",
    };
  }
  return {
    base: "#F3F0EB",
    active: "#EDE6D8",
    baseRgb: "243, 240, 235",
    activeRgb: "237, 230, 216",
  };
}

export default function HeroOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let colors = getThemeColors();

    // Cursor state (todo normalizado 0–1, con 2,2 = "fuera").
    let tx = 2;
    let ty = 2;
    let mx = 2;
    let my = 2;
    let raf = 0;
    let lastFrameTime = 0;


    function resize() {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onMove(e: MouseEvent) {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      tx = (e.clientX - rect.left) / rect.width;
      ty = (e.clientY - rect.top) / rect.height;
    }

    function onLeave() {
      tx = 2;
      ty = 2;
    }

    const observer = new MutationObserver(() => {
      colors = getThemeColors();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    function draw(timestamp: number) {
      raf = requestAnimationFrame(draw);

      // Cap ~60fps.
      if (timestamp - lastFrameTime < 16) return;
      lastFrameTime = timestamp;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas!.width / dpr;
      const height = canvas!.height / dpr;

      // Lerp suave del cursor.
      mx += (tx - mx) * LERP_SPEED;
      my += (ty - my) * LERP_SPEED;

      const focusR2 = FOCUS_RADIUS * FOCUS_RADIUS;
      const twoPiFreq = WAVE_FREQUENCY * Math.PI * 2;

      ctx!.clearRect(0, 0, width, height);
      ctx!.lineWidth = LINE_WIDTH;
      ctx!.lineCap = "round";

      // Halo radial: las líneas son visibles cerca del cursor y se desvanecen
      // hasta alpha 0 lejos. Un solo strokeStyle para todas las filas porque
      // el gradient vive en coordenadas del canvas.
      const cx = mx * width;
      const cy = my * height;
      const fadeRadius = FADE_RADIUS_FACTOR * Math.min(width, height);
      const gradient = ctx!.createRadialGradient(cx, cy, 0, cx, cy, fadeRadius);
      gradient.addColorStop(0, `rgba(${colors.activeRgb}, 1)`);
      gradient.addColorStop(0.45, `rgba(${colors.baseRgb}, 1)`);
      gradient.addColorStop(1, `rgba(${colors.baseRgb}, 0)`);
      ctx!.strokeStyle = gradient;

      for (let r = 0; r < ROWS; r++) {
        const yNorm = (r + 0.5) / ROWS;
        const rowPhase = r * PHASE_PER_ROW;

        ctx!.beginPath();
        for (let c = 0; c < COLS; c++) {
          const xNorm = c / (COLS - 1);

          // Amplitud: cero en reposo, campana coseno cerca del cursor →
          // las líneas son planas excepto en el área alrededor del puntero.
          const dx = mx - xNorm;
          const dy = my - yNorm;
          const dist2 = dx * dx + dy * dy;
          let amp = 0;
          if (dist2 < focusR2) {
            const dist = Math.sqrt(dist2);
            const bell = 0.5 + 0.5 * Math.cos((dist / FOCUS_RADIUS) * Math.PI);
            amp = bell * MAX_AMPLITUDE;
          }

          // Onda sin animación temporal — el patrón es estático respecto al
          // canvas. Se "revela" al pasar el cursor por encima.
          const wave = Math.sin(xNorm * twoPiFreq + rowPhase);

          const offsetY = wave * amp * height;
          const x = xNorm * width;
          const y = yNorm * height + offsetY;

          if (c === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }

        ctx!.stroke();
      }
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={styles.canvasWrap} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
