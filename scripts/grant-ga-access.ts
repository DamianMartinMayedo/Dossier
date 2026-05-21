/**
 * scripts/grant-ga-access.ts
 *
 * Añade un service account como Lector en una propiedad GA4, usando el
 * cliente oficial de googleapis (que conoce los endpoints reales del
 * Admin API y maneja la construcción de URLs).
 *
 * Run:  npx tsx scripts/grant-ga-access.ts
 */

import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { exec } from "node:child_process";
import { URL } from "node:url";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

// ── Config ────────────────────────────────────────────────────────
const PROJECT_ROOT = process.cwd();
const OAUTH_JSON_PATH = path.join(PROJECT_ROOT, "oauth-client.json");

const GA_PROPERTY_ID = "487614683";
const SERVICE_ACCOUNT_EMAIL = "ga4-reader@damianmartin-portfolio.iam.gserviceaccount.com";

const SCOPES = [
  "https://www.googleapis.com/auth/analytics.manage.users",
  "https://www.googleapis.com/auth/analytics.readonly",
];

// ── OAuth flow ────────────────────────────────────────────────────

function openBrowser(url: string): void {
  const cmd =
    process.platform === "darwin"
      ? `open "${url}"`
      : process.platform === "win32"
        ? `start "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd);
}

async function waitForCode(port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url) {
        res.writeHead(400);
        res.end("missing url");
        return;
      }
      const parsed = new URL(req.url, `http://127.0.0.1:${port}`);
      const code = parsed.searchParams.get("code");
      const err = parsed.searchParams.get("error");
      if (err) {
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`<h1>Error de OAuth: ${err}</h1>`);
        server.close();
        reject(new Error(`OAuth error: ${err}`));
        return;
      }
      if (!code) {
        res.writeHead(400);
        res.end("missing code");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        "<h1>Autenticación completa ✓</h1><p>Vuelve a la terminal.</p>",
      );
      server.close();
      resolve(code);
    });
    server.listen(port, "127.0.0.1");
    server.on("error", reject);
  });
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(OAUTH_JSON_PATH)) {
    throw new Error(`No encuentro ${OAUTH_JSON_PATH}`);
  }

  const raw = JSON.parse(fs.readFileSync(OAUTH_JSON_PATH, "utf-8"));
  const creds = raw.installed ?? raw.web;
  if (!creds?.client_id || !creds?.client_secret) {
    throw new Error("oauth-client.json no tiene client_id/client_secret");
  }

  const PORT = 7676;
  const redirectUri = `http://127.0.0.1:${PORT}`;
  const oauth = new OAuth2Client(creds.client_id, creds.client_secret, redirectUri);

  const authUrl = oauth.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("\nAbriendo navegador para autenticarte…");
  console.log("Si no se abre solo, abre esta URL:\n");
  console.log(authUrl, "\n");
  openBrowser(authUrl);

  const code = await waitForCode(PORT);
  console.log("Código recibido, intercambiando por token…");
  const { tokens } = await oauth.getToken(code);
  oauth.setCredentials(tokens);
  console.log("Token obtenido ✓");

  // ── Cliente oficial ─────────────────────────────────────────────
  // v1alpha es la única versión que expone accessBindings en la librería
  // actual (v1beta de la API REST documenta el recurso pero el cliente
  // oficial no lo ha incorporado todavía).
  const admin = google.analyticsadmin({ version: "v1alpha", auth: oauth });

  // Sanity check: GET property
  console.log("\nVerificando Property ID…");
  try {
    const propResp = await admin.properties.get({
      name: `properties/${GA_PROPERTY_ID}`,
    });
    console.log(
      `  Propiedad encontrada: "${propResp.data.displayName ?? "(sin nombre)"}"`,
    );
  } catch (err) {
    console.error("\n✗ No se pudo leer la propiedad:", err);
    process.exit(1);
  }

  // Listar bindings actuales para detectar si ya está añadido
  console.log("\nListando accessBindings actuales…");
  try {
    const listResp = await admin.properties.accessBindings.list({
      parent: `properties/${GA_PROPERTY_ID}`,
    });
    const existing = listResp.data.accessBindings ?? [];
    console.log(`  Encontradas: ${existing.length} bindings`);
    const already = existing.find((b) => b.user === SERVICE_ACCOUNT_EMAIL);
    if (already) {
      console.log(
        `\n✓ El service account ya estaba añadido (binding: ${already.name})`,
      );
      console.log("  Roles:", already.roles);
      return;
    }
  } catch (err) {
    console.warn("\n⚠ No se pudo listar bindings (sigue intentando crear):", err);
  }

  // Crear el binding
  console.log("\nCreando accessBinding para el service account…");
  console.log("  Property ID:", GA_PROPERTY_ID);
  console.log("  Email:", SERVICE_ACCOUNT_EMAIL);

  try {
    const createResp = await admin.properties.accessBindings.create({
      parent: `properties/${GA_PROPERTY_ID}`,
      requestBody: {
        user: SERVICE_ACCOUNT_EMAIL,
        roles: ["predefinedRoles/viewer"],
      },
    });
    console.log("\n✓ Acceso concedido");
    console.log(JSON.stringify(createResp.data, null, 2));
  } catch (err) {
    const e = err as { code?: number; message?: string; errors?: unknown };
    console.error("\n✗ Error al crear binding");
    console.error("  Code:", e.code);
    console.error("  Message:", e.message);
    if (e.errors) console.error("  Errors:", JSON.stringify(e.errors, null, 2));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n✗ Error fatal:", err);
  process.exit(1);
});
