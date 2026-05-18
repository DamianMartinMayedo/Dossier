"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function AdminDashboard() {
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  async function handleSeed() {
    setSeeding(true);
    setSeedMsg("");
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSeedMsg(`Seed completo: ${data.count} proyectos insertados.`);
    } catch (err) {
      setSeedMsg(err instanceof Error ? err.message : "Error en seed");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="container">
      <div className={styles.page}>
        <p className="section-label">Admin</p>
        <h1 className={styles.title}>Dashboard</h1>

        <div className={styles.grid}>
          <Link href="/admin/proyectos" className={styles.card}>
            <span className={styles.number}>—</span>
            <span className={styles.label}>Proyectos</span>
          </Link>

          <Link href="/admin/mensajes" className={styles.card}>
            <span className={styles.number}>—</span>
            <span className={styles.label}>Mensajes sin leer</span>
          </Link>
        </div>

        <div className={styles.actions}>
          <Link href="/admin/proyectos/nuevo" className={styles.actionBtn}>
            + Nuevo proyecto
          </Link>
        </div>

        <div className={styles.seedSection}>
          <p className={styles.seedLabel}>Datos de ejemplo</p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className={styles.seedBtn}
          >
            {seeding ? "Insertando..." : "Insertar proyectos de ejemplo"}
          </button>
          {seedMsg && (
            <p
              className={`${styles.seedMsg} ${
                seedMsg.includes("Error") ? styles.seedError : ""
              }`}
            >
              {seedMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}