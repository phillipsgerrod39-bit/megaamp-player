import { useEffect, useRef, useState } from "react";

interface DbMeterProps {
  db: number;
  isPlaying?: boolean;
}

export function DbMeter({ db, isPlaying }: DbMeterProps) {
  const [peak, setPeak] = useState(-60);
  const peakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const peakRef = useRef(-60);

  const playing = isPlaying !== undefined ? isPlaying : db > -59;

  useEffect(() => {
    if (!playing) {
      setPeak(-60);
      peakRef.current = -60;
      return;
    }
    if (db > peakRef.current) {
      peakRef.current = db;
      setPeak(db);
      if (peakTimerRef.current) clearTimeout(peakTimerRef.current);
      peakTimerRef.current = setTimeout(() => {
        peakRef.current = -60;
        setPeak(-60);
      }, 2000);
    }
  }, [db, playing]);

  useEffect(() => {
    return () => {
      if (peakTimerRef.current) clearTimeout(peakTimerRef.current);
    };
  }, []);

  // Map db (-60 to 0) to percentage (0 to 100)
  const toPercent = (v: number) =>
    Math.max(0, Math.min(100, ((v + 60) / 60) * 100));

  const fillPct = playing ? toPercent(db) : 0;
  const peakPct = playing ? toPercent(peak) : 0;

  // Color zone logic — segments at -18 and -6
  const greenEnd = toPercent(-18); // 70%
  const yellowEnd = toPercent(-6); // 90%

  // Build gradient based on current fill
  let barColor: string;
  if (fillPct <= greenEnd) {
    barColor = "oklch(0.72 0.22 145)";
  } else if (fillPct <= yellowEnd) {
    barColor = "oklch(0.85 0.22 85)";
  } else {
    barColor = "oklch(0.65 0.25 25)";
  }

  const dbDisplay = playing
    ? db <= -59
      ? "< -59"
      : `${db >= 0 ? "+" : ""}${db.toFixed(1)}`
    : "--";

  // Peak color
  let peakColor = "oklch(0.72 0.22 145)";
  if (peak > -6) peakColor = "oklch(0.65 0.25 25)";
  else if (peak > -18) peakColor = "oklch(0.85 0.22 85)";

  return (
    <section
      className="panel p-3"
      data-ocid="db_meter.panel"
      style={{
        background: "oklch(0.07 0.006 252)",
        border: "1px solid oklch(0.22 0.008 252 / 0.7)",
        borderRadius: "6px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="font-mono text-[0.5rem] font-bold tracking-[0.25em]"
          style={{ color: "oklch(0.55 0.12 240)" }}
        >
          OUTPUT dB
        </span>
        <span
          className="font-mono text-sm font-black"
          style={{
            color: playing
              ? db > -6
                ? "oklch(0.65 0.25 25)"
                : db > -18
                  ? "oklch(0.85 0.22 85)"
                  : "oklch(0.72 0.22 145)"
              : "oklch(0.3 0.006 252)",
            textShadow: playing
              ? `0 0 10px ${db > -6 ? "oklch(0.65 0.25 25 / 0.7)" : "oklch(0.72 0.22 145 / 0.5)"}`
              : "none",
            minWidth: "56px",
            textAlign: "right",
            transition: "color 0.1s",
          }}
        >
          {dbDisplay}{" "}
          <span style={{ fontSize: "0.55rem", opacity: 0.6 }}>dBFS</span>
        </span>
      </div>

      {/* Meter bar */}
      <div
        className="relative w-full rounded-sm overflow-hidden"
        style={{
          height: "18px",
          background: "oklch(0.1 0.005 252)",
          border: "1px solid oklch(0.2 0.008 252 / 0.6)",
        }}
      >
        {/* Segmented background marks */}
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((pct) => (
          <div
            key={pct}
            className="absolute top-0 h-full"
            style={{
              left: `${pct}%`,
              width: "1px",
              background: "oklch(0.18 0.006 252 / 0.6)",
            }}
          />
        ))}

        {/* Green zone background tint */}
        <div
          className="absolute top-0 h-full"
          style={{
            left: 0,
            width: `${greenEnd}%`,
            background: "oklch(0.72 0.22 145 / 0.06)",
          }}
        />
        {/* Yellow zone background tint */}
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${greenEnd}%`,
            width: `${yellowEnd - greenEnd}%`,
            background: "oklch(0.85 0.22 85 / 0.06)",
          }}
        />
        {/* Red zone background tint */}
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${yellowEnd}%`,
            width: `${100 - yellowEnd}%`,
            background: "oklch(0.65 0.25 25 / 0.1)",
          }}
        />

        {/* Active fill bar */}
        {playing && fillPct > 0 && (
          <div
            className="absolute top-0 h-full"
            style={{
              left: 0,
              width: `${Math.min(fillPct, greenEnd)}%`,
              background: "oklch(0.72 0.22 145)",
              boxShadow: "0 0 6px oklch(0.72 0.22 145 / 0.6)",
              transition: "width 0.05s linear",
            }}
          />
        )}
        {playing && fillPct > greenEnd && (
          <div
            className="absolute top-0 h-full"
            style={{
              left: `${greenEnd}%`,
              width: `${Math.min(fillPct, yellowEnd) - greenEnd}%`,
              background: "oklch(0.85 0.22 85)",
              boxShadow: "0 0 6px oklch(0.85 0.22 85 / 0.5)",
              transition: "width 0.05s linear",
            }}
          />
        )}
        {playing && fillPct > yellowEnd && (
          <div
            className="absolute top-0 h-full"
            style={{
              left: `${yellowEnd}%`,
              width: `${fillPct - yellowEnd}%`,
              background: "oklch(0.65 0.25 25)",
              boxShadow: "0 0 8px oklch(0.65 0.25 25 / 0.7)",
              transition: "width 0.05s linear",
            }}
          />
        )}

        {/* Peak hold indicator */}
        {playing && peakPct > 0 && (
          <div
            className="absolute top-0 h-full"
            style={{
              left: `${Math.max(0, peakPct - 0.5)}%`,
              width: "2px",
              background: peakColor,
              boxShadow: `0 0 4px ${peakColor}`,
              transition: "left 0.1s ease-out",
              opacity: 0.9,
            }}
          />
        )}
      </div>

      {/* Scale labels */}
      <div className="relative flex justify-between mt-0.5">
        {["-60", "-48", "-36", "-24", "-18", "-12", "-6", "0"].map(
          (label, i, arr) => (
            <span
              key={label}
              className="font-mono"
              style={{
                fontSize: "0.38rem",
                color:
                  label === "0"
                    ? "oklch(0.65 0.25 25 / 0.7)"
                    : label === "-6" || label === "-12"
                      ? "oklch(0.85 0.22 85 / 0.6)"
                      : "oklch(0.35 0.01 252)",
                position:
                  i === 0
                    ? "relative"
                    : i === arr.length - 1
                      ? "relative"
                      : "relative",
              }}
            >
              {label}
            </span>
          ),
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-1.5 mt-1.5">
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            background: playing ? barColor : "oklch(0.25 0.008 252)",
            boxShadow: playing ? `0 0 6px ${barColor}` : "none",
            transition: "all 0.1s",
          }}
        />
        <span
          className="font-mono"
          style={{
            fontSize: "0.42rem",
            letterSpacing: "0.12em",
            color: playing ? "oklch(0.45 0.01 252)" : "oklch(0.28 0.006 252)",
          }}
        >
          {playing
            ? db > -6
              ? "SIGNAL HOT · BLOCKER ACTIVE"
              : db > -18
                ? "SIGNAL STRONG · STABLE"
                : db > -40
                  ? "SIGNAL ACTIVE · CLEAN"
                  : "SIGNAL LOW"
            : "NO SIGNAL · IDLE"}
        </span>
        {playing && db > -6 && (
          <span
            className="font-mono ml-auto"
            style={{
              fontSize: "0.4rem",
              color: "oklch(0.65 0.25 25)",
              letterSpacing: "0.1em",
              animation: "pulse 0.8s ease-in-out infinite",
            }}
          >
            CLIP RISK
          </span>
        )}
      </div>
    </section>
  );
}
