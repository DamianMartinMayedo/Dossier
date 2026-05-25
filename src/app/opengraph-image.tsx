import { ImageResponse } from "next/og";

export const runtime = "edge";
/* Sin esto, Next 16 cachea la primera renderización y no se regenera al cambiar
   el componente en dev. En producción la ImageResponse se sirve igualmente
   inmutable porque la build queda fijada — esto sólo afecta a HMR en dev. */
export const dynamic = "force-dynamic";
export const alt =
  "Damián Martín — Diseñador UI/UX, branding y producto digital";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Fuente Space Grotesk vía Google Fonts en runtime.
   next/og corre en edge, así que no podemos leer next/font ni los .ttf locales;
   pedimos el CSS, extraemos la URL del .ttf y lo descargamos como ArrayBuffer.
   El resultado lo cachea Next.js entre requests. */
async function loadGoogleFont(
  family: string,
  weight: number,
  text: string,
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&display=swap&text=${encodeURIComponent(text)}`;
  const cssRes = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });
  const css = await cssRes.text();
  const match = css.match(/src:\s*url\((.+?)\)\s*format\(/);
  if (!match) throw new Error(`No se encontró URL de la fuente ${family}`);
  return fetch(match[1]).then((r) => r.arrayBuffer());
}

export default async function OGImage() {
  const eyebrow = "TRABAJEMOS JUNTOS";
  const title = "Hola :)";
  const descriptor =
    "Soy Damián, diseñador con alcance completo: UI/UX, identidad y sistemas visuales, RRSS, editorial o producción para impresión.";
  const allText = `${eyebrow}${title}${descriptor} áéíóúñÁÉÍÓÚÑ·—:)`;

  const [bold, regular] = await Promise.all([
    loadGoogleFont("Space Grotesk", 700, title),
    loadGoogleFont("Space Grotesk", 400, allText),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f5f3ef",
          position: "relative",
          fontFamily: "Space Grotesk",
        }}
      >
        {/* Capa 1: líneas horizontales en reposo del HeroOrb.
            Satori (motor de next/og) descarta repeating-linear-gradient en
            silencio, así que dibujamos las líneas con un <svg> embebido —
            56 trazos a lo ancho, color cercano a --color-text-faint pero un
            punto más visible para que sobrevivan a la compresión de WhatsApp. */}
        <svg
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {Array.from({ length: 56 }).map((_, i) => {
            const y = ((i + 0.5) / 56) * 630;
            return (
              <line
                key={i}
                x1={0}
                y1={y}
                x2={1200}
                y2={y}
                stroke="#cdbf9f"
                strokeWidth={1}
              />
            );
          })}
        </svg>

        {/* Capa 2: halo radial — simula el foco del HeroOrb tras el titular.
            En el centro deja las líneas a la vista; en los bordes se funde
            con el bg para evocar el fade del canvas real. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse 60% 70% at 38% 52%, rgba(245,243,239,0) 0%, rgba(245,243,239,0.4) 50%, #f5f3ef 85%)",
          }}
        />

        {/* Capa 3: contenido (mitad izquierda, como en el hero real) */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 96px",
            width: "100%",
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 32,
              fontSize: 24,
              letterSpacing: 3,
              color: "#c0392b",
              fontWeight: 500,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#c0392b",
              }}
            />
            {eyebrow}
          </div>

          {/* Hola :) */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              fontWeight: 700,
              fontSize: 220,
              lineHeight: 0.95,
              letterSpacing: -8,
              color: "#1c1916",
              marginBottom: 40,
            }}
          >
            Hola
            <span
              style={{
                color: "#c0392b",
                transform: "rotate(90deg)",
                display: "flex",
                marginLeft: 94,
                marginTop: 24,
              }}
            >
              :)
            </span>
          </div>

          {/* Descriptor */}
          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.4,
              color: "#706a61",
              maxWidth: 820,
              fontWeight: 400,
            }}
          >
            {descriptor}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Grotesk",
          data: bold,
          style: "normal",
          weight: 700,
        },
        {
          name: "Space Grotesk",
          data: regular,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
