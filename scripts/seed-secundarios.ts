// scripts/seed-secundarios.ts
// Siembra los 17 proyectos secundarios scrapeados de damianmartin.es.
// Las imágenes ya están optimizadas en public/images/secundarios/.
// Borra los secundarios dummy de la BD antes de insertar los reales.
// Uso: npm run seed-secundarios

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

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

interface SeedSecundario {
  slug: string;
  title: string;
  description: string;
  client: string;
  services: string[];
  image: string; // path relativo a /public
}

// Datos scrapeados de damianmartin.es (sección "otros proyectos").
// Las imágenes ya están descargadas, optimizadas y commiteadas.
const SECUNDARIOS: SeedSecundario[] = [
  {
    slug: "altiora",
    title: "Altiora",
    description: "Homepage para Real Estate en Dubai.",
    client: "Altiora",
    services: ["Web Design"],
    image: "/images/secundarios/altiora-cover.webp",
  },
  {
    slug: "electronautic",
    title: "Electronautic",
    description: "Empresa de electrónica para yates.",
    client: "Electronautic",
    services: ["Web Design"],
    image: "/images/secundarios/electronautic-cover.webp",
  },
  {
    slug: "clacudama",
    title: "Clacudama",
    description: "Blog de bienestar personal.",
    client: "Clacudama",
    services: ["Web Design"],
    image: "/images/secundarios/clacudama-cover.webp",
  },
  {
    slug: "eutron",
    title: "EUTRON",
    description: "Rediseño web para empresa de suministros.",
    client: "EUTRON",
    services: ["Web Design", "Rediseño"],
    image: "/images/secundarios/eutron-cover.webp",
  },
  {
    slug: "ibiza",
    title: "Ibiza",
    description: "Rediseño web del Ayuntamiento de Ibiza.",
    client: "Ayuntamiento de Ibiza",
    services: ["Web Design", "Rediseño"],
    image: "/images/secundarios/ibizza-cover.webp",
  },
  {
    slug: "obrs",
    title: "OBRS Drilling Solutions",
    description: "Empresa de perforación de pozos de agua.",
    client: "OBRS",
    services: ["Web Design"],
    image: "/images/secundarios/obrs-cover.webp",
  },
  {
    slug: "palex",
    title: "Palex",
    description: "Web para Laboratorios Palex.",
    client: "Palex",
    services: ["Web Design"],
    image: "/images/secundarios/palex-cover.webp",
  },
  {
    slug: "iwantech",
    title: "Iwantech",
    description: "Servicios técnicos de ingeniería.",
    client: "Iwantech",
    services: ["Web Design"],
    image: "/images/secundarios/iwantech-cover.webp",
  },
  {
    slug: "junta-andalucia",
    title: "Junta de Andalucía",
    description: "App y CMS para encuestas de la Junta.",
    client: "Junta de Andalucía",
    services: ["UI/UX", "CMS"],
    image: "/images/secundarios/junta-andalucia-cover.webp",
  },
  {
    slug: "centro-estudio-gobierno-digital",
    title: "Centro de Estudio del Gobierno Digital",
    description: "Proyecto del Observatorio de Gobierno Digital.",
    client: "Observatorio de Gobierno Digital",
    services: ["Web Design"],
    image: "/images/secundarios/centro-estudio-cover.webp",
  },
  {
    slug: "unipromel",
    title: "Unipromel",
    description: "Rediseño web para patronal de médicos.",
    client: "Unipromel",
    services: ["Web Design", "Rediseño"],
    image: "/images/secundarios/unipromel-cover.webp",
  },
  {
    slug: "solutiongrow",
    title: "SolutionGrow",
    description: "Agencia de Marketing Internacional.",
    client: "SolutionGrow",
    services: ["Web Design"],
    image: "/images/secundarios/solution-grow-cover.webp",
  },
  {
    slug: "proxima-energia",
    title: "Próxima Energía",
    description: "Landing Page para empresa energética.",
    client: "Próxima Energía",
    services: ["Web Design", "Landing"],
    image: "/images/secundarios/proxima-energia-cover.webp",
  },
  {
    slug: "madrid-estate",
    title: "Madrid Estate",
    description: "Serie de dossiers para empresa inmobiliaria.",
    client: "Madrid Estate",
    services: ["Branding", "Dossier"],
    image: "/images/secundarios/madrid-estate-cover.webp",
  },
  {
    slug: "nimo-gordillo",
    title: "Nimo Gordillo",
    description: "Web para concesionario de vehículos.",
    client: "Nimo Gordillo",
    services: ["Web Design"],
    image: "/images/secundarios/nimo-gordillo-cover.webp",
  },
  {
    slug: "t5arq",
    title: "T5Arq",
    description: "Dossier de proyectos para estudio de arquitectura.",
    client: "T5Arq",
    services: ["Branding", "Dossier"],
    image: "/images/secundarios/t5arq-cover.webp",
  },
  {
    slug: "jaujaus",
    title: "JAUJAUS",
    description: "Hostal para perros.",
    client: "JAUJAUS",
    services: ["Web Design"],
    image: "/images/secundarios/jaujaus-cover.webp",
  },
];

async function main() {
  console.log("\n🧹 Borrando secundarios anteriores…");
  const { error: delErr } = await supabase
    .from("projects")
    .delete()
    .eq("category", "secundario");
  if (delErr) {
    console.error("✗ Error borrando secundarios:", delErr.message);
    process.exit(1);
  }
  console.log("✓ Secundarios anteriores borrados.\n");

  console.log(`🌱 Sembrando ${SECUNDARIOS.length} secundarios desde el WP…\n`);
  let inserted = 0;
  for (const [idx, s] of SECUNDARIOS.entries()) {
    const payload = {
      slug: s.slug,
      title: s.title,
      description: s.description,
      category: "secundario" as const,
      cover_image: s.image,
      header_image: null,
      subtitle: null,
      images: [],
      content: [],
      services: s.services,
      client: s.client,
      year: null,
      featured: false,
      order: idx + 1,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("projects").insert(payload);
    if (error) {
      console.error(`✗  ${s.slug} — error:`, error.message);
      process.exit(1);
    }
    inserted++;
    console.log(`✓  ${s.slug} — insertado`);
  }

  console.log(`\n✅ ${inserted} secundarios sembrados.\n`);
}

main();
