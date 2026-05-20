"use client";

import { useEffect, useRef } from "react";

/**
 * Fondo interactivo del hero: grid denso de dots que reaccionan al cursor.
 *
 * Implementación con Canvas 2D para máximo rendimiento:
 * - Sin elementos DOM individuales (solo 1 canvas)
 * - Dibujo directo en cada frame
 * - Throttle cuando el cursor no se mueve
 * - GPU acceleration explícita
 * - Actualización automática al cambiar de tema
 *
 * Sin animación en touch / reduced-motion.
 */

const COLS = 64;
const ROWS = 32;
const INFLUENCE_RADIUS = 0.22;
const DOT_SIZE = 1.5;
const LERP_SPEED = 0.10;
const PULL_STRENGTH = 120;
const SCALE_RANGE = 1.5;

interface Dot {
  x: number;
  y: number;
  scale: number;
  pullX: number;
  pullY: number;
  t: number;
}

function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  const bg = style.getPropertyValue("--color-bg").trim() || "#f5f3ef";

  // Detectar si es tema oscuro
  const isDark = bg === "#111009" || bg.toLowerCase() === "rgb(17, 16, 9)";

  if (isDark) {
    // Tema oscuro: colores derivados del fondo #111009
    return {
      base: "#1c1a12",
      active: "#2a2718",
    };
  }

  // Tema claro: colores exactos del usuario
  return {
    base: "#F3F0EB",
    active: "#EDE6D8",
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

    // Pre-calcular posiciones del grid
    const dots: Dot[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        dots.push({
          x: (c + 0.5) / COLS,
          y: (r + 0.5) / ROWS,
          scale: 1,
          pullX: 0,
          pullY: 0,
          t: 0,
        });
      }
    }

    // Estado del cursor
    let tx = 2;
    let ty = 2;
    let mx = 2;
    let my = 2;
    let raf = 0;
    let lastFrameTime = 0;
    let needsUpdate = true;

    function resize() {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      needsUpdate = true;
    }

    function onMove(e: MouseEvent) {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      tx = (e.clientX - rect.left) / rect.width;
      ty = (e.clientY - rect.top) / rect.height;
      needsUpdate = true;
    }

    function onLeave() {
      tx = 2;
      ty = 2;
      needsUpdate = true;
    }

    // Observer para detectar cambios de tema
    const observer = new MutationObserver(() => {
      colors = getThemeColors();
      needsUpdate = true;
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    function draw(timestamp: number) {
      raf = requestAnimationFrame(draw);

      // Limitar a 60fps
      if (timestamp - lastFrameTime < 16) return;
      lastFrameTime = timestamp;

      // Skip si no necesita update
      if (!needsUpdate) return;

      const width = canvas!.width / (window.devicePixelRatio || 1);
      const height = canvas!.height / (window.devicePixelRatio || 1);

      // Lerp
      mx += (tx - mx) * LERP_SPEED;
      my += (ty - my) * LERP_SPEED;

      const r2 = INFLUENCE_RADIUS * INFLUENCE_RADIUS;

      // Limpiar canvas
      ctx!.clearRect(0, 0, width, height);

      // Dibujar cada dot
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const dotX = dot.x * width;
        const dotY = dot.y * height;

        const dx = mx - dot.x;
        const dy = my - dot.y;
        const dist2 = dx * dx + dy * dy;

        if (dist2 < r2) {
          // Curva suave para efecto montaña gradual
          const linear = 1 - dist2 / r2;
          const t = linear * linear * (3 - 2 * linear);

          // Animar hacia el objetivo - más responsivo para pico pronunciado
          const targetScale = 1 + t * SCALE_RANGE;
          const targetPullX = dx * t * PULL_STRENGTH;
          const targetPullY = dy * t * PULL_STRENGTH;

          dot.scale += (targetScale - dot.scale) * 0.2;
          dot.pullX += (targetPullX - dot.pullX) * 0.2;
          dot.pullY += (targetPullY - dot.pullY) * 0.2;
          dot.t += (t - dot.t) * 0.2;

          // Dibujar con transformación
          const finalX = dotX + dot.pullX;
          const finalY = dotY + dot.pullY;
          const size = DOT_SIZE * dot.scale;

          // Color: interpolar entre base y activo según proximidad
          ctx!.fillStyle = dot.t > 0.01 ? colors.active : colors.base;
          ctx!.globalAlpha = 1;

          // Dibujar círculo
          ctx!.beginPath();
          ctx!.arc(finalX, finalY, size, 0, Math.PI * 2);
          ctx!.fill();
        } else {
          // Volver a reposo
          if (dot.scale !== 1 || dot.t !== 0) {
            dot.scale += (1 - dot.scale) * 0.1;
            dot.pullX *= 0.9;
            dot.pullY *= 0.9;
            dot.t += (0 - dot.t) * 0.1;

            // Snap a reposo si está muy cerca
            if (Math.abs(dot.scale - 1) < 0.001 &&
                Math.abs(dot.pullX) < 0.01 &&
                Math.abs(dot.pullY) < 0.01 &&
                Math.abs(dot.t) < 0.001) {
              dot.scale = 1;
              dot.pullX = 0;
              dot.pullY = 0;
              dot.t = 0;
            }

            const finalX = dotX + dot.pullX;
            const finalY = dotY + dot.pullY;
            const size = DOT_SIZE * dot.scale;

            ctx!.fillStyle = dot.t > 0.01 ? colors.active : colors.base;
            ctx!.globalAlpha = 1;
            ctx!.beginPath();
            ctx!.arc(finalX, finalY, size, 0, Math.PI * 2);
            ctx!.fill();
          } else {
            // Dot en reposo completo
            ctx!.fillStyle = colors.base;
            ctx!.globalAlpha = 1;
            ctx!.beginPath();
            ctx!.arc(dotX, dotY, DOT_SIZE, 0, Math.PI * 2);
            ctx!.fill();
          }
        }
      }

      ctx!.globalAlpha = 1;
      needsUpdate = false;
    }

    // Configurar canvas
    resize();

    // Event listeners
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    // Iniciar loop
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
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
        contain: "strict",
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          willChange: "transform",
        }}
      />
    </div>
  );
}