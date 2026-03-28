import { useState } from "react";

type PanelColor = "gold" | "blue" | "cyan" | "green" | "purple" | "orange";

interface CollapsibleCarPanelProps {
  title: string;
  color: PanelColor;
  icon?: string;
  defaultOpen?: boolean;
  dataOcid?: string;
  children: React.ReactNode;
}

export function CollapsibleCarPanel({
  title,
  color,
  icon,
  defaultOpen = false,
  dataOcid,
  children,
}: CollapsibleCarPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`car-panel car-panel-${color}`} data-ocid={dataOcid}>
      <button
        type="button"
        className={`car-panel-header car-panel-header-${color} car-panel-toggle`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="car-panel-header-title">
          {icon && <span className="car-panel-header-icon">{icon}</span>}
          {title}
        </span>
        <span
          className="car-panel-chevron"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          &#9660;
        </span>
      </button>
      <div
        className="car-panel-body"
        style={{
          maxHeight: open ? "3000px" : "0",
          overflow: "hidden",
          transition: open
            ? "max-height 0.38s cubic-bezier(0.4,0,0.2,1)"
            : "max-height 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
