import { EQBandCol } from "./EQBand";

interface EQBand {
  freq: string;
  value: number;
}

interface BassEQProps {
  bassEqBands: EQBand[];
  onBassEqBand: (index: number, delta: number) => void;
}

export function BassEQ({ bassEqBands, onBassEqBand }: BassEQProps) {
  return (
    <section
      data-ocid="bass-eq.panel"
      className=""
      style={{
        position: "relative",
      }}
    >
      {/* Rack label strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 12px",
          borderBottom: "1px solid oklch(0.6 0.22 195 / 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Screw />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.7rem",
              fontWeight: "800",
              letterSpacing: "0.18em",
              color: "oklch(0.72 0.24 220)",
              textShadow: "0 0 10px oklch(0.72 0.24 220 / 0.7)",
              textTransform: "uppercase",
            }}
          >
            EQ · BASS
          </span>
        </div>
        <Screw />
      </div>

      {/* Reinforcement badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 12px",
          background: "oklch(0.11 0.05 200 / 0.7)",
          borderBottom: "1px solid oklch(0.45 0.18 200 / 0.4)",
          boxShadow: "0 0 8px oklch(0.45 0.18 200 / 0.2)",
        }}
      >
        <div
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: "oklch(0.72 0.18 200)",
            boxShadow: "0 0 6px oklch(0.72 0.18 200)",
            flexShrink: 0,
            animation: "pulse 2s infinite",
          }}
        />
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.44rem",
            fontWeight: "800",
            letterSpacing: "0.1em",
            color: "oklch(0.72 0.18 200)",
            textShadow: "0 0 8px oklch(0.72 0.18 200 / 0.6)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          BASS EQ · SIGNAL PULL ×2 · BATTERY BANK · NOISE FILTER · FULL STACK
          ACTIVE
        </span>
      </div>

      {/* 4 Bass EQ band columns */}
      <div style={{ padding: "8px 10px" }}>
        <div
          style={{
            display: "flex",
            gap: "4px",
            justifyContent: "center",
            padding: "4px 0",
            overflow: "hidden",
          }}
        >
          {bassEqBands.map((band, i) => (
            <EQBandCol
              key={`bass-${band.freq}`}
              frequency={band.freq}
              value={band.value}
              onChange={(delta) => onBassEqBand(i, delta)}
              index={i}
              routePrefix="BASS EQ"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Screw() {
  return (
    <div
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: "oklch(0.12 0.04 240)",
        border: "1.5px solid oklch(0.35 0.1 220)",
        flexShrink: 0,
        boxShadow: "inset 0 1px 2px oklch(0 0 0 / 0.4)",
      }}
    />
  );
}
