// scripts/seed-content.ts
// Sembra los 8 proyectos principales reales con su estructura básica de bloques.
// Lee variables desde .env.local y usa el service-role de Supabase para upsertear.
// Uso: npm run seed-content  (idempotente: respeta proyectos que ya tengan blocks salvo --force)

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { v4 as uuidv4 } from "uuid";
import type { ContentBlock, GalleryImage } from "../src/types";

config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const FORCE = process.argv.includes("--force");

// ── Helpers ────────────────────────────────────────────────────

function gallery(slug: string, count: number, columns: 1 | 2 | 3 = 1): GalleryImage[] {
  return Array.from({ length: count }, (_, i) => ({
    url: `/images/${slug}/gallery-${String(i + 1).padStart(2, "0")}.webp`,
    alt: `${slug} — imagen ${i + 1}`,
  })).map((g) => ({ ...g }));
  void columns;
}

function h(level: 2 | 3, text: string, eyebrow?: string): ContentBlock {
  return { id: uuidv4(), type: "heading", level, text, eyebrow };
}
function p(text: string): ContentBlock {
  return { id: uuidv4(), type: "paragraph", text };
}
function galleryBlock(slug: string, count: number, columns: 1 | 2 | 3 = 1): ContentBlock {
  return { id: uuidv4(), type: "gallery", images: gallery(slug, count), columns };
}
function carouselBlock(slug: string, count: number): ContentBlock {
  return { id: uuidv4(), type: "carousel", images: gallery(slug, count) };
}

// ── Definición de los 8 proyectos ──────────────────────────────

interface SeedProject {
  slug: string;
  title: string;
  subtitle: string;
  services: string[];
  client: string | null;
  year: string;
  order: number;
  featured: boolean;
  galleryCount: number;
  build: (slug: string) => ContentBlock[];
}

const PROJECTS: SeedProject[] = [
  {
    slug: "ciclogreen",
    title: "Ciclogreen",
    subtitle: "Rediseño modular y adaptable de la plataforma de movilidad sostenible",
    services: ["UI/UX"],
    client: "Ciclogreen",
    year: "2025",
    order: 1,
    featured: true,
    galleryCount: 22,
    build: (slug) => [
      h(2, "Contexto y reto de partida", "Contexto"),
      p(
        "Ciclogreen es una plataforma que premia hábitos sostenibles de movilidad para empresas y municipios. El reto: rediseñar el producto desde cero para que escalara a nuevos clientes sin perder la coherencia, manteniendo la velocidad de iteración del equipo."
      ),
      galleryBlock(slug, 5, 1),
      h(2, "Análisis y toma de decisiones", "Investigación"),
      p(
        "Iteramos sobre presentaciones internas para validar dirección antes de pasar a Figma. Mapeamos los flujos críticos (registro, retos, recompensas) y separamos componentes reutilizables de los que dependen del tenant."
      ),
      h(2, "Soluciones modulares"),
      p(
        "El sistema final permite que cada cliente (ayuntamientos, empresas) tenga su branding sin tocar componentes base. Tokens centralizados, layouts variables y un set de patrones documentado para devs."
      ),
      galleryBlock(slug, 4, 2),
      h(2, "Aprendizaje y resultado"),
      p(
        "El producto entregó un sistema vivo y mantenible. Lo más valioso del proceso fue normalizar el lenguaje entre diseño y desarrollo antes de meterse en pantallas."
      ),
    ],
  },
  {
    slug: "mandao",
    title: "Mandao",
    subtitle: "Diseño, liderazgo y ecosistema digital — apps de usuario, mandaderos y negocio",
    services: ["UI/UX", "Branding", "Liderazgo de diseño"],
    client: "Mandao",
    year: "2021–2022",
    order: 2,
    featured: true,
    galleryCount: 72,
    build: (slug) => [
      h(2, "Contexto y propósito", "Contexto"),
      p(
        "Mandao nace en Cuba como ecosistema de delivery con tres apps coordinadas: usuario final, mandaderos y negocios. Lideré el equipo de diseño durante dos años, desde la investigación hasta la entrega continua."
      ),
      h(2, "Investigación, empatía y estrategia", "Investigación"),
      p(
        "Trabajo de campo en La Habana para entender restricciones reales: conectividad intermitente, pagos en efectivo, geografía complicada. Modelado de usuarios y journey maps que cuestionaban patrones del delivery estándar."
      ),
      galleryBlock(slug, 8, 2),
      h(2, "Arquitectura y prototipado"),
      p(
        "Rediseño de flujos críticos (búsqueda, pedido, seguimiento) con prototipos en Figma validados con usuarios reales antes de tocar código. Iteración rápida con el equipo de producto."
      ),
      h(2, "App de Mandaderos", "Producto"),
      p(
        "Una app específica para el mensajero, con foco en eficiencia: lectura rápida de pedidos, navegación con un dedo, modo offline robusto."
      ),
      galleryBlock(slug, 11, 2),
      h(2, "Rediseño de la web"),
      p(
        "Una web pública coherente con el resto del ecosistema, optimizada para captar restaurantes y conductores nuevos."
      ),
      galleryBlock(slug, 5, 1),
      h(2, "Impacto y aprendizaje"),
      p(
        "Tres apps consistentes, un design system funcional y un equipo de diseño autónomo. La lección: en mercados con restricciones reales, la diferencia entre buen y mal diseño se nota mucho más."
      ),
    ],
  },
  {
    slug: "qombii",
    title: "Qombii",
    subtitle: "Soluciones digitales para movilidad urbana sostenible",
    services: ["Branding", "UI/UX"],
    client: "Qombii",
    year: "2024",
    order: 3,
    featured: true,
    galleryCount: 25,
    build: (slug) => [
      h(2, "Contexto y propósito", "Contexto"),
      p(
        "Qombii facilita carpooling sostenible integrando municipios y empresas. El producto necesitaba una identidad clara y un sistema de UI capaz de soportar los distintos perfiles de uso sin fragmentarse."
      ),
      carouselBlock(slug, 8),
      h(2, "Reto y rol"),
      p(
        "Lideré el diseño desde la conceptualización hasta la entrega: identidad, sistema, pantallas y handoff. Trabajo end-to-end con autonomía sobre las decisiones de producto."
      ),
      h(2, "Investigación y estrategia", "Investigación"),
      p(
        "Entrevistas con usuarios, modelado de personas y journey maps para identificar fricciones en el carpooling actual: confianza, tiempos, gestión de pagos."
      ),
      h(2, "Diseño y validación"),
      p(
        "Wireframes y prototipos en Figma con tests iterativos. Cada cambio se validaba contra los flujos críticos antes de entrar en producción."
      ),
      galleryBlock(slug, 6, 2),
      h(2, "Sistema visual y handoff"),
      p(
        "Documentación del design system con tokens, componentes y reglas de uso. Handoff con el equipo de desarrollo respaldado por specs claras."
      ),
      h(2, "Aprendizaje y resultado"),
      p(
        "Un producto coherente con margen de evolución. El sistema soportó iteraciones rápidas sin romper la marca."
      ),
    ],
  },
  {
    slug: "misscar",
    title: "Misscar",
    subtitle: "App de gestión y reserva de servicios automotrices",
    services: ["UI/UX"],
    client: "Misscar",
    year: "2023",
    order: 4,
    featured: true,
    galleryCount: 33,
    build: (slug) => [
      h(2, "Contexto y propósito", "Contexto"),
      p(
        "Misscar centraliza la reserva de servicios para el automóvil (taller, ITV, seguros) en una app móvil. Reto: simplificar un dominio con mucha información técnica sin asustar al usuario medio."
      ),
      galleryBlock(slug, 8, 2),
      h(2, "Diseño de flujos y validación"),
      p(
        "Iteramos sobre los flujos críticos (alta de vehículo, búsqueda de servicio, pago) reduciendo pasos en cada versión. Pruebas con usuarios reales para validar la jerarquía visual."
      ),
      galleryBlock(slug, 8, 2),
      h(2, "Sistema visual"),
      p(
        "Identidad visual sobria y profesional, con componentes pensados para soportar listados largos sin saturar."
      ),
      galleryBlock(slug, 8, 2),
      h(2, "Resultado"),
      p(
        "Una app que comunica confianza en un sector donde la mayoría de productos digitales aún se sienten viejos. Lista para escalar a nuevos verticales."
      ),
    ],
  },
  {
    slug: "sube",
    title: "Sube",
    subtitle: "Plataforma de movilidad compartida — diseño de la app de usuarios",
    services: ["UI/UX"],
    client: "Sube",
    year: "2022",
    order: 5,
    featured: true,
    galleryCount: 31,
    build: (slug) => [
      h(2, "Contexto y propósito", "Contexto"),
      p(
        "Sube es una plataforma de movilidad compartida con foco en trayectos urbanos. Diseñé la app de usuarios: búsqueda de rutas, reserva, pagos y comunidad."
      ),
      galleryBlock(slug, 8, 2),
      h(2, "Decisiones de producto"),
      p(
        "Trabajo cercano con producto y desarrollo para validar cada flujo antes de pasar a alta fidelidad. Priorizamos claridad en el mapa y rapidez en el pago."
      ),
      galleryBlock(slug, 8, 2),
      h(2, "Sistema visual"),
      p(
        "Una marca amable y limpia que aguanta uso intensivo: tipografías legibles a tamaños pequeños, paleta cálida, iconografía consistente."
      ),
      galleryBlock(slug, 8, 2),
      h(2, "Resultado"),
      p(
        "Un producto coherente listo para iterar. El handoff con desarrollo se ejecutó sin fricciones gracias al sistema documentado."
      ),
    ],
  },
  {
    slug: "saturday",
    title: "Saturday",
    subtitle: "Concepto de app social — agenda de planes con amigos",
    services: ["UI/UX", "Branding"],
    client: "Proyecto personal",
    year: "2024",
    order: 6,
    featured: false,
    galleryCount: 20,
    build: (slug) => [
      h(2, "Contexto", "Concepto"),
      p(
        "Saturday es un concepto de app social pensado para coordinar planes con amigos sin la fricción de los grupos de WhatsApp. Diseño exploratorio para validar la idea visualmente."
      ),
      galleryBlock(slug, 8, 2),
      h(2, "Decisiones de diseño"),
      p(
        "Tono cercano, paleta vibrante y micro-interacciones que celebran el momento de quedar. Componentes pensados para feeds verticales y compartir rápidamente."
      ),
      galleryBlock(slug, 8, 2),
      h(2, "Aprendizaje"),
      p(
        "Un ejercicio útil para explorar lenguajes visuales fuera del producto serio. Algunas decisiones de tipografía y color terminaron filtrándose a otros proyectos."
      ),
    ],
  },
  {
    slug: "centro-habana",
    title: "Centro Habana",
    subtitle: "Identidad visual y branding para un proyecto cultural en La Habana",
    services: ["Branding", "Dirección de arte"],
    client: "Proyecto cultural",
    year: "2020",
    order: 7,
    featured: false,
    galleryCount: 10,
    build: (slug) => [
      h(2, "Contexto", "Identidad"),
      p(
        "Identidad para un proyecto cultural en Centro Habana. Se buscaba una marca que conectara con el barrio sin caer en el tópico turístico cubano."
      ),
      galleryBlock(slug, 5, 2),
      h(2, "Sistema visual"),
      p(
        "Tipografía con personalidad, paleta directa y composiciones que respiran. Materiales aplicados a publicaciones, señalética y digital."
      ),
      galleryBlock(slug, 5, 2),
      h(2, "Resultado"),
      p(
        "Una identidad que sostiene el proyecto y deja espacio para crecer. Aprendí mucho sobre balance entre referencias locales y lenguaje contemporáneo."
      ),
    ],
  },
  {
    slug: "agedigital",
    title: "AgeDigital",
    subtitle: "Plataforma educativa para mayores — diseño accesible y cálido",
    services: ["UI/UX", "Investigación"],
    client: "AgeDigital",
    year: "2023",
    order: 8,
    featured: false,
    galleryCount: 14,
    build: (slug) => [
      h(2, "Contexto", "Accesibilidad"),
      p(
        "AgeDigital es una plataforma educativa pensada para usuarios mayores que se acercan por primera vez al mundo digital. Reto: diseño accesible sin parecer infantil."
      ),
      galleryBlock(slug, 6, 2),
      h(2, "Decisiones de accesibilidad"),
      p(
        "Tamaños tipográficos generosos por defecto, contraste alto, controles grandes y un sistema de navegación predecible. Cada pantalla se validó pensando en lectores de pantalla y en uso real con el público objetivo."
      ),
      galleryBlock(slug, 6, 2),
      h(2, "Resultado"),
      p(
        "Una plataforma que se siente cálida sin sacrificar accesibilidad. El feedback de los primeros usuarios destacó la facilidad para encontrar lo que buscaban."
      ),
    ],
  },
];

// ── Ejecución ──────────────────────────────────────────────────

async function seedProject(p: SeedProject) {
  const { data: existing } = await supabase
    .from("projects")
    .select("id, content")
    .eq("slug", p.slug)
    .maybeSingle();

  const hasContent =
    existing &&
    Array.isArray(existing.content) &&
    (existing.content as unknown[]).length > 0;

  if (hasContent && !FORCE) {
    console.log(`⏭  ${p.slug} — ya tiene bloques, salto. (Usa --force para sobreescribir.)`);
    return;
  }

  const content = p.build(p.slug);
  const payload = {
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    category: "principal" as const,
    description: p.subtitle, // fallback para OG / sitemap
    cover_image: `/images/${p.slug}/cover.webp`,
    header_image: null,
    images: [],
    content,
    services: p.services,
    client: p.client,
    year: p.year,
    featured: p.featured,
    order: p.order,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase.from("projects").update(payload).eq("id", existing.id);
    if (error) throw error;
    console.log(`✓  ${p.slug} — actualizado (${content.length} bloques)`);
  } else {
    const { error } = await supabase.from("projects").insert(payload);
    if (error) throw error;
    console.log(`✓  ${p.slug} — creado (${content.length} bloques)`);
  }
}

async function main() {
  console.log(`\n🌱 Sembrando ${PROJECTS.length} proyectos principales${FORCE ? " (force)" : ""}…\n`);
  for (const p of PROJECTS) {
    try {
      await seedProject(p);
    } catch (err) {
      console.error(`✗  ${p.slug} — error:`, err instanceof Error ? err.message : err);
      process.exit(1);
    }
  }
  console.log("\n✅ Seed completo.\n");
}

main();
