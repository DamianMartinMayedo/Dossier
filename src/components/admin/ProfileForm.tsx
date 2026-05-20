"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Profile, ProfileFormacionItem, ProfileStat } from "@/types";
import Dropzone from "./Dropzone";
import { useFileUpload } from "./useFileUpload";
import styles from "./ProfileForm.module.css";

interface Props {
  profile: Profile;
}

/** Convierte un array de strings a string CSV editable y viceversa. */
function arrToCsv(arr: string[] | undefined | null): string {
  return (arr ?? []).join(", ");
}

function csvToArr(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function ProfileForm({ profile }: Props) {
  const router = useRouter();
  const avatarUpload = useFileUpload("profile");

  // Estado controlado de cada campo. Se inicializa con los valores actuales.
  const [name, setName] = useState(profile.name ?? "");
  const [role, setRole] = useState(profile.role ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatar, setAvatar] = useState<string | null>(profile.avatar ?? null);
  const [skillsCsv, setSkillsCsv] = useState(arrToCsv(profile.skills));
  const [servicesCsv, setServicesCsv] = useState(arrToCsv(profile.services));
  const [languagesCsv, setLanguagesCsv] = useState(arrToCsv(profile.languages));
  const [formacion, setFormacion] = useState<ProfileFormacionItem[]>(profile.formacion ?? []);
  const [stats, setStats] = useState<ProfileStat[]>(profile.stats ?? []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── Avatar ────────────────────────────────────────────────────
  async function handleAvatar(files: File[]) {
    if (files.length === 0) return;
    try {
      const [url] = await avatarUpload.upload([files[0]]);
      setAvatar(url);
    } catch {
      // error en avatarUpload.error
    }
  }

  // ── Formación: add / remove / update ──────────────────────────
  function addFormacion() {
    setFormacion((prev) => [...prev, { label: "", title: "", subtitle: "" }]);
  }
  function removeFormacion(idx: number) {
    setFormacion((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateFormacion(idx: number, field: keyof ProfileFormacionItem, value: string) {
    setFormacion((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  // ── Stats: add / remove / update ──────────────────────────────
  function addStat() {
    setStats((prev) => [...prev, { num: "", label: "" }]);
  }
  function removeStat(idx: number) {
    setStats((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateStat(idx: number, field: keyof ProfileStat, value: string) {
    setStats((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  // ── Submit ────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const payload = {
        name,
        role,
        bio,
        avatar,
        skills: csvToArr(skillsCsv),
        services: csvToArr(servicesCsv),
        languages: csvToArr(languagesCsv),
        formacion,
        stats,
      };
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error guardando");
      setSuccess("Perfil actualizado.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      {/* ── Avatar ─────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Foto de perfil</h2>
        <div className={styles.avatarRow}>
          {avatar && (
            <div className={styles.avatarPreview}>
              <Image src={avatar} alt="Avatar" fill sizes="160px" className={styles.avatarImg} unoptimized />
            </div>
          )}
          <div className={styles.avatarUpload}>
            <Dropzone
              onFiles={handleAvatar}
              disabled={avatarUpload.uploading}
              compact
              label={avatar ? "Reemplazar avatar" : "Subir avatar"}
              hint="Se guarda en el bucket profile de Supabase Storage."
            />
            {avatarUpload.uploading && <p className={styles.hint}>Subiendo…</p>}
            {avatarUpload.error && <p className={styles.error}>{avatarUpload.error}</p>}
            {avatar && (
              <button type="button" className={styles.removeBtn} onClick={() => setAvatar(null)}>
                Quitar avatar (usa fallback /foto_perfil.jpg)
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Datos básicos ─────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Datos básicos</h2>
        <div className={styles.field}>
          <label className={styles.label}>Nombre</label>
          <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Rol / titular</label>
          <input
            className={styles.input}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Diseñador UI/UX · Branding · Producto digital · Sevilla"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Bio (texto largo)</label>
          <textarea
            className={styles.textarea}
            rows={5}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
      </section>

      {/* ── Formación ─────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Formación</h2>
          <button type="button" className={styles.addBtn} onClick={addFormacion}>
            + Añadir
          </button>
        </div>
        {formacion.length === 0 && <p className={styles.hint}>Sin elementos.</p>}
        {formacion.map((item, i) => (
          <div key={i} className={styles.itemCard}>
            <div className={styles.itemHeader}>
              <span className={styles.itemBadge}>Item {i + 1}</span>
              <button
                type="button"
                className={styles.removeIcon}
                onClick={() => removeFormacion(i)}
                aria-label="Eliminar"
              >
                ×
              </button>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Label (categoría)</label>
              <input
                className={styles.input}
                value={item.label}
                onChange={(e) => updateFormacion(i, "label", e.target.value)}
                placeholder="Formación / Máster / Certificación…"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Título</label>
              <input
                className={styles.input}
                value={item.title}
                onChange={(e) => updateFormacion(i, "title", e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Subtítulo (institución)</label>
              <input
                className={styles.input}
                value={item.subtitle}
                onChange={(e) => updateFormacion(i, "subtitle", e.target.value)}
              />
            </div>
          </div>
        ))}
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Estadísticas (3 números clave)</h2>
          <button type="button" className={styles.addBtn} onClick={addStat}>
            + Añadir
          </button>
        </div>
        {stats.length === 0 && <p className={styles.hint}>Sin elementos.</p>}
        {stats.map((stat, i) => (
          <div key={i} className={styles.itemCard}>
            <div className={styles.itemHeader}>
              <span className={styles.itemBadge}>Stat {i + 1}</span>
              <button
                type="button"
                className={styles.removeIcon}
                onClick={() => removeStat(i)}
                aria-label="Eliminar"
              >
                ×
              </button>
            </div>
            <div className={styles.row}>
              <div className={`${styles.field} ${styles.fieldNarrow}`}>
                <label className={styles.label}>Número</label>
                <input
                  className={styles.input}
                  value={stat.num}
                  onChange={(e) => updateStat(i, "num", e.target.value)}
                  placeholder="8+"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Etiqueta</label>
                <input
                  className={styles.input}
                  value={stat.label}
                  onChange={(e) => updateStat(i, "label", e.target.value)}
                  placeholder="años de experiencia"
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Listas (CSV) ──────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Listas</h2>
        <div className={styles.field}>
          <label className={styles.label}>Servicios (separados por coma)</label>
          <input
            className={styles.input}
            value={servicesCsv}
            onChange={(e) => setServicesCsv(e.target.value)}
            placeholder="UI/UX Design, Branding, Diseño de producto"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Skills (separados por coma)</label>
          <input
            className={styles.input}
            value={skillsCsv}
            onChange={(e) => setSkillsCsv(e.target.value)}
            placeholder="Prototipado, Design Systems, Investigación"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Idiomas (separados por coma)</label>
          <input
            className={styles.input}
            value={languagesCsv}
            onChange={(e) => setLanguagesCsv(e.target.value)}
            placeholder="Español nativo, Inglés intermedio"
          />
        </div>
      </section>

      <div className={styles.actions}>
        <button type="submit" disabled={saving} className={styles.submitBtn}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
