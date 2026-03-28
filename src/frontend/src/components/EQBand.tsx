import { useRouting } from "../context/RoutingContext";

interface EQBandProps {
  frequency: string;
  value: number;
  onChange: (delta: number) => void;
  index: number;
  routePrefix?: string;
}

// 10 segments: +10 down to -10 (visually clamped), values still allow -14 to +14
const SEGMENTS: { db: number; key: string }[] = [
  { db: 10, key: "p10" },
  { db: 8, key: "p8" },
  { db: 6, key: "p6" },
  { db: 4, key: "p4" },
  { db: 2, key: "p2" },
  { db: 0, key: "z0" },
  { db: -2, key: "n2" },
  { db: -4, key: "n4" },
  { db: -6, key: "n6" },
  { db: -8, key: "n8" },
];

function isLit(db: number, value: number): boolean {
  const clampedValue = Math.max(-10, Math.min(10, value));
  if (clampedValue > 0) return db > 0 && db <= clampedValue;
  if (clampedValue < 0) return db < 0 && db >= clampedValue;
  return false;
}

function segStyle(db: number, value: number): React.CSSProperties {
  const isCenter = db === 0;
  const lit = isLit(db, value);

  if (lit) {
    return {
      background: "oklch(0.72 0.24 220)",
      boxShadow:
        "0 0 5px oklch(0.72 0.24 220), 0 0 10px oklch(0.72 0.24 220 / 0.5)",
    };
  }
  if (isCenter) {
    return { background: "oklch(0.28 0.08 240)" };
  }
  return { background: "oklch(0.12 0.04 240)" };
}

function LEDBar({ value }: { value: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1px",
        width: "34px",
      }}
    >
      {SEGMENTS.map((seg) => (
        <div
          key={seg.key}
          style={{
            width: "34px",
            height: "5px",
            borderRadius: "2px",
            transition: "background 0.07s, box-shadow 0.07s",
            ...segStyle(seg.db, value),
          }}
        />
      ))}
    </div>
  );
}

export function EQBandCol({
  frequency,
  value,
  onChange,
  index,
  routePrefix = "EQ",
}: EQBandProps) {
  const { fireRoute } = useRouting();

  const handleChange = (delta: number) => {
    onChange(delta);
    const engine = (index % 4) + 1;
    const chain = (index % 5) + 1;
    fireRoute(
      `${routePrefix} ${frequency} \u2192 ${delta > 0 ? "UP" : "DN"} · ENGINE ${engine} · CHAIN ${chain}`,
    );
  };

  const displayValue = value > 0 ? `+${value}` : `${value}`;

  const btnBase: React.CSSProperties = {
    width: "34px",
    height: "38px",
    background: "oklch(0.08 0.03 240)",
    border: "1.5px solid oklch(0.35 0.14 220)",
    borderRadius: "4px",
    color: "oklch(0.72 0.24 220)",
    fontFamily: "monospace",
    fontSize: "1rem",
    fontWeight: "900",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none" as const,
    padding: 0,
    touchAction: "manipulation",
    transition: "background 0.08s, box-shadow 0.08s",
    boxShadow: "0 0 6px oklch(0.4 0.18 220 / 0.2)",
  };

  const btnDisabled: React.CSSProperties = {
    ...btnBase,
    color: "oklch(0.3 0.06 240)",
    border: "1.5px solid oklch(0.18 0.04 240)",
    cursor: "not-allowed",
    boxShadow: "none",
  };

  const bassBlockerActive = value >= 8;
  const distBlockerActive = value >= 12;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
        width: "40px",
        minWidth: "40px",
      }}
      data-ocid={`eq.item.${index + 1}`}
    >
      <style>{`
        @keyframes eq-blocker-pulse-bass {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        @keyframes eq-blocker-pulse-dist {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>

      {/* Frequency label */}
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "0.65rem",
          fontWeight: "700",
          color: "oklch(0.72 0.24 220)",
          textAlign: "center",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textShadow: "0 0 8px oklch(0.72 0.24 220 / 0.6)",
        }}
      >
        {frequency}
      </span>

      {/* UP tap button */}
      <button
        type="button"
        onClick={() => handleChange(2)}
        disabled={value >= 14}
        aria-label={`${frequency} up`}
        style={value >= 14 ? btnDisabled : btnBase}
        onMouseDown={(e) => {
          if (value < 14)
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.14 0.07 230)";
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "oklch(0.08 0.03 240)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "oklch(0.08 0.03 240)";
        }}
        data-ocid={`eq.button.${index + 1}`}
      >
        &#9650;
      </button>

      {/* LED bar graph */}
      <LEDBar value={value} />

      {/* Value display */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: "1.1rem",
          fontWeight: "700",
          color: "#fff",
          textAlign: "center",
          width: "34px",
          lineHeight: 1,
          padding: "3px 0",
          background: "oklch(0.06 0.03 240)",
          border: "1.5px solid oklch(0.22 0.08 230)",
          borderRadius: "4px",
          textShadow: "0 0 10px oklch(0.72 0.24 220 / 0.7)",
        }}
      >
        {displayValue}
      </div>

      {/* DOWN tap button */}
      <button
        type="button"
        onClick={() => handleChange(-2)}
        disabled={value <= -14}
        aria-label={`${frequency} down`}
        style={value <= -14 ? btnDisabled : btnBase}
        onMouseDown={(e) => {
          if (value > -14)
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.14 0.07 230)";
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "oklch(0.08 0.03 240)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "oklch(0.08 0.03 240)";
        }}
      >
        &#9660;
      </button>

      {/* Bass Blocker indicator */}
      {bassBlockerActive && (
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "0.45rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textAlign: "center",
            padding: "2px 4px",
            borderRadius: "3px",
            color: "oklch(0.72 0.22 55)",
            background: "oklch(0.12 0.05 55)",
            border: "1px solid oklch(0.4 0.18 55 / 0.5)",
            boxShadow: "0 0 6px oklch(0.72 0.22 55 / 0.5)",
            width: "34px",
            animation: "eq-blocker-pulse-bass 1.2s ease-in-out infinite",
          }}
        >
          BASS BLK · 100K
        </div>
      )}

      {/* Distortion Blocker indicator */}
      {distBlockerActive && (
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "0.45rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textAlign: "center",
            padding: "2px 4px",
            borderRadius: "3px",
            color: "oklch(0.65 0.25 25)",
            background: "oklch(0.12 0.05 25)",
            border: "1px solid oklch(0.4 0.2 25 / 0.5)",
            boxShadow: "0 0 6px oklch(0.65 0.25 25 / 0.5)",
            width: "34px",
            animation: "eq-blocker-pulse-dist 0.8s ease-in-out infinite",
          }}
        >
          DIST BLK · 24M
        </div>
      )}
    </div>
  );
}
