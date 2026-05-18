import styles from "./CollabGrid.module.css";

const COMPANIES = [
  { name: "Ciclogreen", role: "App · UX Redesign", color: "#27AE60" },
  { name: "Próxima Energía", role: "Web · Landings", color: "#E67E22" },
  { name: "Iwantic", role: "UI · Branding", color: "#2980B9" },
  { name: "Mandao", role: "Ecosistema · 3 Apps", color: "#F1C40F" },
  { name: "MissCar", role: "App · Web · CRO", color: "#C0392B" },
  { name: "Emergya", role: "UX · INAP", color: "#8E44AD" },
];

export default function CollabGrid() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.label}>Empresas y clientes</p>
          <p className={styles.title}>
            He colaborado con equipos de producto, startups y agencias en España
            y Latinoamérica
          </p>
        </div>
        <div className={styles.grid}>
          {COMPANIES.map((c) => (
            <div key={c.name} className={styles.item}>
              <span
                className={styles.logoPlaceholder}
                style={{ borderColor: c.color, color: c.color }}
              >
                {c.name.slice(0, 2).toUpperCase()}
              </span>
              <span className={styles.name}>{c.name}</span>
              <span className={styles.role}>{c.role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
