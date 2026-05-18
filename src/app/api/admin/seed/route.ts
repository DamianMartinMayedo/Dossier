import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const SEED_PROJECTS = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Brand Identity — Ciclogreen",
    slug: "ciclogreen-brand",
    category: "principal",
    description: "Diseño de identidad de marca completo para Ciclogreen, startup de movilidad sostenible. Incluye logotipo, sistema visual, tipografía y aplicación en materiales corporativos.",
    services: ["Branding", "Diseño de logo", "Sistema visual", "Packaging"],
    client: "Ciclogreen",
    year: "2024",
    featured: true,
    order: 1,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "E-commerce — Barrabes Ski",
    slug: "barrabes-ecommerce",
    category: "principal",
    description: "Rediseño UX/UI de la plataforma e-commerce de Barrabes, líder en equipamiento de esquí y outdoor. Mejora del funnel de compra y experiencia mobile.",
    services: ["UI/UX Design", "E-commerce", "Mobile", "Prototipado"],
    client: "Barrabes",
    year: "2024",
    featured: true,
    order: 2,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    title: "App Móvil — Mandao",
    slug: "mandao-app",
    category: "principal",
    description: "Diseño de interfaz para la aplicación móvil de Mandao, plataforma de envíos urbanos. Pantallas clave, sistema de diseño y especificaciones técnicas.",
    services: ["UI/UX Design", "Mobile App", "Design System", "Especificaciones"],
    client: "Mandao",
    year: "2023",
    featured: true,
    order: 3,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    title: "Dashboard — Analytics Tool",
    slug: "analytics-dashboard",
    category: "secundario",
    description: "Panel de control con visualizaciones de datos para herramienta SaaS B2B.",
    services: ["UI/UX Design", "Dashboard", "Data Visualization"],
    client: "Proyecto interno",
    year: "2024",
    featured: false,
    order: 4,
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    title: "Landing — SaaS Launch",
    slug: "saas-landing",
    category: "secundario",
    description: "Página de aterrizaje para el lanzamiento de producto SaaS con enfoque en conversión.",
    services: ["UI/UX Design", "Web Design", "Copywriting"],
    client: "Cliente privado",
    year: "2024",
    featured: false,
    order: 5,
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    title: "Rebrand — Startup Tech",
    slug: "startup-rebrand",
    category: "secundario",
    description: "Renovación de marca completa para startup tecnológica en fase de scaling.",
    services: ["Branding", "Diseño de logo", "Sistema visual"],
    client: "Startup Tech",
    year: "2023",
    featured: false,
    order: 6,
  },
  {
    id: "77777777-7777-7777-7777-777777777777",
    title: "Website — Studiopeat",
    slug: "studiopeat-web",
    category: "secundario",
    description: "Sitio web corporativo con portfolio interactivo para estudio de arquitectura.",
    services: ["Web Design", "UI/UX Design", "Animación"],
    client: "Studiopeat",
    year: "2023",
    featured: false,
    order: 7,
  },
];

export async function POST() {
  const adminEmail = process.env.ADMIN_EMAIL;

  try {
    const supabase = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email?.toLowerCase() !== adminEmail?.toLowerCase()) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    for (const project of SEED_PROJECTS) {
      const { error } = await supabase
        .from("projects")
        .upsert(project, { onConflict: "id" });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, count: SEED_PROJECTS.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const adminEmail = process.env.ADMIN_EMAIL;

  try {
    const supabase = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email?.toLowerCase() !== adminEmail?.toLowerCase()) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await supabase.from("projects").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}