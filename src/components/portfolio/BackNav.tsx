"use client";

import { ArrowLeft } from "lucide-react";
import styles from "./BackNav.module.css";

export default function BackNav() {
  return (
    <div className={styles.backWrap}>
      <button onClick={() => window.history.back()} className={styles.back}>
        <ArrowLeft size={14} aria-hidden="true" /> Volver
      </button>
    </div>
  );
}
