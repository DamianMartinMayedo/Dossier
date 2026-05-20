import "server-only";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

/**
 * Cliente de Google Analytics 4 Data API.
 *
 * Autenticación vía service account JSON pasado en `GA4_SERVICE_ACCOUNT_JSON`
 * (codificado en base64 para que quepa en una sola línea del .env). El
 * service account debe tener rol "Viewer" en la propiedad GA4.
 *
 * NO importar este módulo desde Client Components — usa `server-only` para
 * fallar en build si lo intentas.
 */

interface GA4Config {
  propertyId: string;
  client: BetaAnalyticsDataClient;
}

let cached: GA4Config | null = null;

export function getGA4Config(): GA4Config | null {
  if (cached) return cached;

  const propertyId = process.env.GA4_PROPERTY_ID;
  const credentialsB64 = process.env.GA4_SERVICE_ACCOUNT_JSON;
  if (!propertyId || !credentialsB64) return null;

  let credentials: { client_email: string; private_key: string };
  try {
    const decoded = Buffer.from(credentialsB64, "base64").toString("utf-8");
    credentials = JSON.parse(decoded);
  } catch (err) {
    console.error("[ga4] No se pudo decodificar GA4_SERVICE_ACCOUNT_JSON:", err);
    return null;
  }

  const client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key.replace(/\\n/g, "\n"),
    },
  });

  cached = { propertyId, client };
  return cached;
}

export interface KpiCounts {
  activeUsersToday: number;
  activeUsers7d: number;
  activeUsers30d: number;
  sessions30d: number;
}

export interface TopRow {
  label: string;
  value: number;
}

export interface GA4Stats {
  kpis: KpiCounts;
  topPages: TopRow[];
  topSources: TopRow[];
  topCountries: TopRow[];
}

function num(value: string | null | undefined): number {
  return Number(value ?? 0) || 0;
}

/**
 * Lanza una batchRunReports — una sola request HTTP a GA4, varias secciones
 * dentro. Reduce latencia vs lanzar 4 fetches separados.
 */
export async function fetchGA4Stats(): Promise<GA4Stats | null> {
  const config = getGA4Config();
  if (!config) return null;

  const { client, propertyId } = config;
  const property = `properties/${propertyId}`;

  try {
    const [response] = await client.batchRunReports({
      property,
      requests: [
        // 0: KPIs (4 ventanas temporales)
        {
          dateRanges: [
            { startDate: "today", endDate: "today", name: "today" },
            { startDate: "7daysAgo", endDate: "today", name: "last7" },
            { startDate: "30daysAgo", endDate: "today", name: "last30" },
          ],
          metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        },
        // 1: Top pages (30d)
        {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "screenPageViews" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 10,
        },
        // 2: Top sources (30d)
        {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 8,
        },
        // 3: Top countries (30d)
        {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "country" }],
          metrics: [{ name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 8,
        },
      ],
    });

    const [kpiReport, pagesReport, sourcesReport, countriesReport] =
      response.reports ?? [];

    // KPIs vienen en 3 filas, una por dateRange (today / last7 / last30).
    const kpiRows = kpiReport?.rows ?? [];
    const findRange = (name: string) =>
      kpiRows.find(
        (r) => r.dimensionValues?.[0]?.value === name,
      )?.metricValues;
    const todayMetrics = findRange("today");
    const last7Metrics = findRange("last7");
    const last30Metrics = findRange("last30");

    const kpis: KpiCounts = {
      activeUsersToday: num(todayMetrics?.[0]?.value),
      activeUsers7d: num(last7Metrics?.[0]?.value),
      activeUsers30d: num(last30Metrics?.[0]?.value),
      sessions30d: num(last30Metrics?.[1]?.value),
    };

    const topPages: TopRow[] = (pagesReport?.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value ?? "—",
      value: num(row.metricValues?.[0]?.value),
    }));

    const topSources: TopRow[] = (sourcesReport?.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value ?? "(unset)",
      value: num(row.metricValues?.[0]?.value),
    }));

    const topCountries: TopRow[] = (countriesReport?.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value ?? "—",
      value: num(row.metricValues?.[0]?.value),
    }));

    return { kpis, topPages, topSources, topCountries };
  } catch (err) {
    console.error("[ga4] Error al consultar Data API:", err);
    return null;
  }
}
