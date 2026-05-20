import Image from "next/image";
import styles from "./CollabGrid.module.css";

const LOGOS = [
  { src: "/images/empresas/barrabes.webp", name: "Barrabes" },
  { src: "/images/empresas/mandao.webp", name: "Mandao" },
  { src: "/images/empresas/ciclogreen.webp", name: "Ciclogreen" },
  { src: "/images/empresas/iwantic.webp", name: "Iwantic" },
  { src: "/images/empresas/iwantpro.webp", name: "Iwantpro" },
  { src: "/images/empresas/mapodec.webp", name: "Mapodec" },
  { src: "/images/empresas/migallon.webp", name: "Migallón" },
  { src: "/images/empresas/proxima.webp", name: "Próxima Energía" },
  { src: "/images/empresas/proxya.webp", name: "Proxya" },
  { src: "/images/empresas/starenlared.webp", name: "Starenlared" },
  { src: "/images/empresas/transformacion-digital.webp", name: "Transformación Digital" },
];

export default function CollabGrid() {
  const items = [...LOGOS, ...LOGOS];

  return (
    <section className={styles.section}>
      <p className={styles.label}>Han confiado en mi:</p>
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