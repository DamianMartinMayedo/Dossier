"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import styles from "./ScrollTopButton.module.css";

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`${styles.btn} ${visible ? styles.visible : ""}`}
      aria-label="Volver arriba"
    >
      <ArrowUp size={18} />
    </button>
  );
}
