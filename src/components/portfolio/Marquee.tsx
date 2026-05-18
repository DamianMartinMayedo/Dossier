import styles from "./Marquee.module.css";

const ITEMS = [
  "UI/UX Design",
  "Branding",
  "Figma",
  "Design Systems",
  "Prototipado",
  "User Research",
  "WordPress",
  "Shopify",
  "Hotjar",
  "FullStory",
  "Adobe CC",
  "Arquitectura IA",
];

export default function Marquee() {
  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        {ITEMS.map((item) => (
          <span key={item} className={styles.item}>
            {item}
          </span>
        ))}
        {ITEMS.map((item) => (
          <span key={`${item}-dup`} className={styles.item}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
