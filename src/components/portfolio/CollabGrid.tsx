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
  const items = [...LOGOS, ...LOGOS];

  return (
    <section className={styles.section}>
      <p className={styles.label}>Colaboraciones</p>
      <div className={styles.wrap}>
        <div className={styles.track}>
          {items.map((logo, i) => (
            <div key={`${logo.name}-${i}`} className={styles.item}>
              <Image
                src={logo.src}
                alt={logo.name}
                width={200}
                height={56}
                className={styles.logo}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}