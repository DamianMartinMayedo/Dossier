import { cn } from "@/lib/utils";
import styles from "./ProjectFilters.module.css";

interface Props {
  active: "todos" | "principal" | "secundario";
  onChange: (value: "todos" | "principal" | "secundario") => void;
  countPrincipal: number;
  countSecundario: number;
}

const FILTERS: { value: "todos" | "principal" | "secundario"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "principal", label: "Proyectos principales" },
  { value: "secundario", label: "Proyectos secundarios" },
];

export default function ProjectFilters({
  active,
  onChange,
}: Props) {
  return (
    <div className={styles.filters}>
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(styles.filter, active === value && styles.active)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
