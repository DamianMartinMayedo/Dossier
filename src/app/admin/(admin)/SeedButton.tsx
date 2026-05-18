"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function SeedButton() {
  const router = useRouter();
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
      router.refresh();
    } catch (err) {
      setSeedMsg(err instanceof Error ? err.message : "Error en seed");
    } finally {
      setSeeding(false);
    }
  }

  return (
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
            seedMsg.toLowerCase().includes("error") ? styles.seedError : ""
          }`}
        >
          {seedMsg}
        </p>
      )}
    </div>
  );
}
