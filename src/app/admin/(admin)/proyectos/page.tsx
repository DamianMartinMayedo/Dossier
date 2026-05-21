import { createClient } from "@/lib/supabase/server";
import ProjectsList from "./ProjectsList";

export const dynamic = "force-dynamic";

export default async function AdminProyectos() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("order", { ascending: true });

  return <ProjectsList projects={projects || []} />;
}