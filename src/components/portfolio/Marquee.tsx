import styles from "./Marquee.module.css";

const ITEMS = [
  "UI/UX",
  "Branding",
  "Figma",
  "Design Systems",
  "Prototipado",
  "WordPress",
  "Shopify",
  "Adobe Illustrator",
  "Adobe Photoshop",
  "Adobe Premiere Pro",
  "Adobe After Effects",
  "Affinity",
  "Canva",
  "VSCode",
  "AI",
  "Claude Code"
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
