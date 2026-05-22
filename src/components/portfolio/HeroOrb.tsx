"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroOrb.module.css";

/**
 * Fondo interactivo del hero: grid de líneas horizontales planas EN REPOSO.
 *
 * Dos modos según el dispositivo:
 *
 * 1. **Cursor mode** (desktop con ratón fino): el cursor provoca una ondulación
 *    sinusoidal a su alrededor — las líneas cercanas se curvan en patrón sin()
 *    con desfase entre filas. Estático respecto al canvas; sólo se mueve
 *    cuando el ratón se mueve.
 *
 * 2. **Ambient mode** (touch / `hover: none`): el foco de la ola se mueve
 *    automáticamente trazando una figura Lissajous lenta. Misma estética que
 *    el desktop, pero sin necesidad de cursor. Densidad reducida para que en
 *    móvil no consuma GPU innecesaria.
 *
 * Ambos respetan `prefers-reduced-motion: reduce` → no se monta nada.
 *
 * Implementación: 1 path por fila → polilínea con muchos puntos siguiendo
 * sin(). Amplitud modulada por campana coseno centrada en el foco. Halo
 * radial controla la alpha para que la ola sea visible sólo en el área del
 * foco.
 */

const COLS = 140;
const ROWS_DESKTOP = 90;
const ROWS_MOBILE = 40;
const LINE_WIDTH = 1;
const LERP_SPEED_DESKTOP = 0.10;
const LERP_SPEED_MOBILE = 0.04;

const WAVE_FREQUENCY = 4.5;
const WAVE_FREQUENCY_MOBILE = 1.5;
const PHASE_PER_ROW = 0.22;

const FOCUS_RADIUS = 0.36;
const FOCUS_RADIUS_MOBILE = 0.62;
const MAX_AMPLITUDE = 0.045;
const MAX_AMPLITUDE_MOBILE = 0.01;
const AMBIENT_WAVE_ANGLE = 30 * (Math.PI / 180);

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
      ambient: "#D2C8AE",
      baseRgb: "28, 26, 18",
      activeRgb: "42, 39, 24",
      ambientRgb: "210, 200, 174",
    };
  }
    return {
    base: "#F3F0EB",
    active: "#E5DECF",
    ambient: "#D2C8AE",
    baseRgb: "243, 240, 235",
    activeRgb: "229, 222, 207",
    ambientRgb: "210, 200, 174",
    };
}

export default function HeroOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Activamos modo ambient si CUALQUIERA de estas señales sugiere touch /
    // móvil. Chrome DevTools no siempre simula `hover: none` con los presets
    // de dispositivo, así que añadimos `pointer: coarse` y un fallback por
    // ancho de viewport. Lo que queremos: que en CUALQUIER móvil real y en
    // DevTools mobile preview el efecto aparezca solo.
    const isAmbient =
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 768;
    const ROWS = isAmbient ? 72 : ROWS_DESKTOP;
    const LERP_SPEED = isAmbient ? LERP_SPEED_MOBILE : LERP_SPEED_DESKTOP;

    let colors = getThemeColors();

    // Cursor state (todo normalizado 0–1, con 2,2 = "fuera").
    // En modo ambient, tx/ty se recalculan en cada frame a partir del tiempo.
    let tx = isAmbient ? 0.5 : 2;
    let ty = isAmbient ? 0.5 : 2;
    let mx = tx;
    let my = ty;
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

      if (isAmbient) {
        mx = 0.5 + 0.35 * Math.sin(timestamp * 0.0003);
        my = 0.5 + 0.35 * Math.cos(timestamp * 0.0005);
      } else {
        mx += (tx - mx) * LERP_SPEED;
        my += (ty - my) * LERP_SPEED;
      }

      const focusRadius = isAmbient ? FOCUS_RADIUS_MOBILE : FOCUS_RADIUS;
      const focusR2 = focusRadius * focusRadius;
      const waveFreq = isAmbient ? WAVE_FREQUENCY_MOBILE : WAVE_FREQUENCY;
      const twoPiFreq = waveFreq * Math.PI * 2;
      const timePhase = isAmbient ? timestamp * 0.00025 : 0;

      ctx!.clearRect(0, 0, width, height);
      ctx!.lineWidth = LINE_WIDTH;
      ctx!.lineCap = "round";

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

          let amp: number;
          const dx = mx - xNorm;
          const dy = my - yNorm;
          const dist2 = dx * dx + dy * dy;
          amp = 0;
          if (dist2 < focusR2) {
            const dist = Math.sqrt(dist2);
            const rawBell = 0.5 + 0.5 * Math.cos((dist / focusRadius) * Math.PI);
            const bell = isAmbient ? rawBell * rawBell : rawBell;
            amp = bell * MAX_AMPLITUDE;
          }

          const wave = Math.sin(xNorm * twoPiFreq + rowPhase + timePhase);

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
    // En ambient no nos suscribimos al cursor — el foco viene del tiempo.
    if (!isAmbient) {
      window.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("mouseleave", onLeave);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (!isAmbient) {
        window.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseleave", onLeave);
      }
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
