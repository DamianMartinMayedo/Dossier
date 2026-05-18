import AdminNav from "@/components/admin/AdminNav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import "../../globals.css";
import styles from "./layout.module.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <div className={styles.layout}>
      <AdminNav userEmail={user.email!} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
