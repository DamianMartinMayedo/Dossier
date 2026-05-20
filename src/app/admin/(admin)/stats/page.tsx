import { unstable_cache } from "next/cache";
import { fetchGA4Stats, type GA4Stats, type TopRow } from "@/lib/ga4";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

/**
 * Cacheamos la respuesta GA4 durante 10 minutos. Es un compromiso entre:
 *  - frescura de datos (10 min es suficiente para un admin del portfolio),
 *  - quota de la Data API (concurrent + daily request limits),
 *  - coste de latencia (la llamada batchRunReports tarda 1–2s).
 *
 * `unstable_cache` ya es estable en Next 16.2; el nombre histórico se queda.
 */
const getCachedStats = unstable_cache(
  async () => fetchGA4Stats(),
  ["ga4-stats"],
  { revalidate: 600, tags: ["ga4-stats"] },
);

export default async function AdminStatsPage() {
  const stats: GA4Stats | null = await getCachedStats();

  if (!stats) {
    return (
      <div className={styles.page}>
        <p className="section-label">Admin</p>
        <h1 className={styles.title}>Estadísticas</h1>
        <div className={styles.empty}>
          <h2>Google Analytics no configurado</h2>
          <p>
            Para ver datos aquí, configura las variables{" "}
            <code>GA4_PROPERTY_ID</code> y <code>GA4_SERVICE_ACCOUNT_JSON</code>{" "}
            en <code>.env.local</code> y reinicia el servidor.
          </p>
          <p>
            Si las variables ya están configuradas, revisa la consola del
            servidor — hay un error en la conexión con la Data API (credenciales
            mal codificadas, propiedad sin permisos, o cuota agotada).
          </p>
        </div>
      </div>
    );
  }

  const { kpis, topPages, topSources, topCountries } = stats;

  return (
    <div className={styles.page}>
      <p className="section-label">Admin</p>
      <h1 className={styles.title}>Estadísticas</h1>
      <p className={styles.subtitle}>
        Datos de Google Analytics 4 — cacheados 10 minutos.
      </p>

      {/* ── KPIs ─────────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        <Kpi label="Visitantes hoy" value={kpis.activeUsersToday} />
        <Kpi label="Visitantes 7 días" value={kpis.activeUsers7d} />
        <Kpi label="Visitantes 30 días" value={kpis.activeUsers30d} />
        <Kpi label="Sesiones 30 días" value={kpis.sessions30d} />
      </div>

      {/* ── Listas ───────────────────────────────────── */}
      <div className={styles.listsGrid}>
        <ListBlock title="Páginas más vistas" empty="Sin datos en 30 días.">
          {topPages.map((row) => (
            <ListRow key={row.label} label={row.label} value={row.value} />
          ))}
        </ListBlock>

        <ListBlock title="Fuentes de tráfico" empty="Sin datos en 30 días.">
          {topSources.map((row) => (
            <ListRow key={row.label} label={row.label} value={row.value} />
          ))}
        </ListBlock>

        <ListBlock title="Países" empty="Sin datos en 30 días.">
          {topCountries.map((row) => (
            <ListRow key={row.label} label={row.label} value={row.value} />
          ))}
        </ListBlock>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.kpi}>
      <span className={styles.kpiValue}>{value.toLocaleString("es-ES")}</span>
      <span className={styles.kpiLabel}>{label}</span>
    </div>
  );
}

interface ListBlockProps {
  title: string;
  empty: string;
  children: React.ReactNode;
}

function ListBlock({ title, empty, children }: ListBlockProps) {
  const rows = Array.isArray(children) ? children : [children];
  const isEmpty = rows.length === 0 || rows.every((r) => !r);
  return (
    <section className={styles.listBlock}>
      <h2 className={styles.listTitle}>{title}</h2>
      {isEmpty ? (
        <p className={styles.listEmpty}>{empty}</p>
      ) : (
        <ul className={styles.list}>{children}</ul>
      )}
    </section>
  );
}

function ListRow({ label, value }: TopRow) {
  return (
    <li className={styles.listRow}>
      <span className={styles.listLabel} title={label}>
        {label}
      </span>
      <span className={styles.listValue}>{value.toLocaleString("es-ES")}</span>
    </li>
  );
}
