import Image from "next/image";
import styles from "./CollabGrid.module.css";

const LOGOS = [
  { src: "/assets/empresas/Barrabes.png", name: "Barrabes" },
  { src: "/assets/empresas/Mandao.png", name: "Mandao" },
  { src: "/assets/empresas/ciclogreen.png", name: "Ciclogreen" },
  { src: "/assets/empresas/iwantic.png", name: "Iwantic" },
  { src: "/assets/empresas/iwantpro.png", name: "Iwantpro" },
  { src: "/assets/empresas/mapodec.png", name: "Mapodec" },
  { src: "/assets/empresas/migallon.png", name: "Migallon" },
  { src: "/assets/empresas/proxima.png", name: "Próxima Energía" },
  { src: "/assets/empresas/proxya.png", name: "Proxya" },
  { src: "/assets/empresas/starenlared.png", name: "Starenlared" },
  { src: "/assets/empresas/transformacion digital.png", name: "Transformación Digital" },
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
          {LOGOS.map((logo) => (
            <div key={logo.name} className={styles.item}>
              <Image
                src={logo.src}
                alt={logo.name}
                width={120}
                height={40}
                className={styles.logo}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
