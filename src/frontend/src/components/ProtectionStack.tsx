import { useEffect, useRef, useState } from "react";

interface ProtectionStackProps {
  masterVolume: number;
  bassEQLevel?: number; // 0–100 scale derived from bass EQ bands
}

const BADGE_ROWS = [
  { id: "srs", label: "SRS 2022 SMART CHIP" },
  { id: "titanium", label: "TITANIUM OVERDRIVE" },
  {
    id: "fuse",
    label: "FUSE ARRAY · 80 × 120W = 9,600W",
    sublabel: "2-GAUGE VIRTUAL WIRE · SCALES WITH BASS EQ + VOLUME",
  },
  { id: "scd", label: "SYSTEM CLEAN DRIVE" },
];

const CONNECTED_TAGS = [
  { label: "EQ" },
  { label: "VOLUME" },
  { label: "HIGH MID AMP" },
  { label: "SRS 2022" },
];

function formatQuadrillion(n: number): string {
  if (n >= 1e15) return `${(n / 1e15).toFixed(1)} QUADRILLION`;
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)} TRILLION`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} BILLION`;
  return n.toLocaleString();
}

export function ProtectionStack({
  masterVolume,
  bassEQLevel = 0,
}: ProtectionStackProps) {
  const isAggressive = masterVolume >= 500;
  const isCritical = masterVolume >= 800;
  const pct = Math.round((masterVolume / 1000) * 100);

  const rangeT = masterVolume < 100 ? 0 : (masterVolume - 100) / 900;
  const rangePct = Math.round(rangeT * 100);
  const rangeActive = masterVolume >= 100;

  const hdDrive = (1 + rangeT * 5).toFixed(1);

  // Blocker count: scales with BOTH volume AND bassEQ
  const eqHigh = bassEQLevel >= 67;
  const eqMid = bassEQLevel >= 33 && bassEQLevel < 67;
  const blockerCount =
    masterVolume >= 700 || eqHigh ? 4 : masterVolume >= 400 || eqMid ? 3 : 2;

  const perBlockerUnits = 24_000_000;
  const distortionTotal = blockerCount * perBlockerUnits;
  const bassTotal = blockerCount * perBlockerUnits;
  const combinedStrength = distortionTotal * bassTotal;

  // Signal Pulling Filter grip: scales 0–100% with volume
  const spfGrip = Math.round(rangeT * 100);
  const spfActive = masterVolume >= 100;

  const [tagFlash, setTagFlash] = useState(false);
  const prevVolume = useRef(masterVolume);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevVolume.current === masterVolume) return;
    prevVolume.current = masterVolume;
    setTagFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setTagFlash(false), 400);
  }, [masterVolume]);

  const bassPulseSpeed =
    masterVolume > 750
      ? "0.5s"
      : masterVolume > 500
        ? "0.8s"
        : masterVolume > 250
          ? "1.3s"
          : "2s";

  const modeColor = isCritical
    ? {
        fg: "oklch(0.82 0.2 25)",
        bg: "oklch(0.16 0.015 25 / 0.4)",
        bd: "oklch(0.55 0.22 25 / 0.7)",
      }
    : isAggressive
      ? {
          fg: "oklch(0.85 0.18 40)",
          bg: "oklch(0.15 0.012 35 / 0.35)",
          bd: "oklch(0.5 0.2 35 / 0.6)",
        }
      : {
          fg: "oklch(0.72 0.16 145)",
          bg: "oklch(0.14 0.01 145 / 0.35)",
          bd: "oklch(0.42 0.14 145 / 0.45)",
        };

  const hdColor = {
    dot: rangeActive ? "oklch(0.68 0.22 220)" : "oklch(0.48 0.1 220)",
    label: "oklch(0.82 0.18 220)",
    total: rangeActive ? "oklch(0.72 0.2 220)" : "oklch(0.52 0.08 220)",
    bg: rangeActive
      ? "oklch(0.12 0.03 220 / 0.5)"
      : "oklch(0.12 0.015 220 / 0.35)",
    bd: rangeActive ? "oklch(0.48 0.2 220 / 0.8)" : "oklch(0.35 0.1 220 / 0.5)",
  };

  const blockerDotColor = isCritical
    ? "oklch(0.72 0.24 25)"
    : isAggressive
      ? "oklch(0.8 0.2 40)"
      : "oklch(0.72 0.22 145)";
  const blockerLabelColor = isCritical
    ? "oklch(0.82 0.22 25)"
    : isAggressive
      ? "oklch(0.85 0.2 40)"
      : "oklch(0.88 0.012 240)";
  const blockerTotalColor = isCritical
    ? "oklch(0.78 0.22 25)"
    : isAggressive
      ? "oklch(0.82 0.18 40)"
      : "oklch(0.78 0.16 85)";
  const blockerBg = isCritical
    ? "oklch(0.15 0.012 25 / 0.4)"
    : isAggressive
      ? "oklch(0.14 0.01 35 / 0.35)"
      : "oklch(0.13 0.008 145 / 0.4)";
  const blockerBd = isCritical
    ? "1px solid oklch(0.45 0.18 25 / 0.7)"
    : isAggressive
      ? "1px solid oklch(0.5 0.18 35 / 0.6)"
      : "1px solid oklch(0.38 0.14 145 / 0.4)";

  const eqLevelLabel = eqHigh ? "EQ HIGH" : eqMid ? "EQ MID" : "EQ LOW";

  return (
    <section className="" data-ocid="protection.panel">
      <div
        className="flex items-center gap-2 flex-wrap px-3 py-2 border-b"
        style={{ borderColor: "oklch(0.55 0.2 145 / 0.2)" }}
      >
        <span
          className="panel-title"
          style={{ color: "oklch(0.78 0.16 85)", fontSize: "0.7rem" }}
        >
          PROTECTION STACK
        </span>
        <span className="blockchain-badge">ALWAYS ACTIVE · BC ROUTED</span>
        {isCritical && (
          <span
            className="blockchain-badge animate-pulse"
            style={{
              borderColor: "oklch(0.5 0.2 25 / 0.7)",
              color: "oklch(0.75 0.24 25)",
            }}
          >
            \u26a1 CRITICAL
          </span>
        )}
        {isAggressive && !isCritical && (
          <span
            className="blockchain-badge animate-pulse"
            style={{
              borderColor: "oklch(0.5 0.2 35 / 0.7)",
              color: "oklch(0.82 0.2 35)",
            }}
          >
            \u26a1 AGGRESSIVE
          </span>
        )}
      </div>

      <div className="p-3 space-y-2">
        {/* Connected tags */}
        <div
          className="rounded px-3 py-2"
          style={{
            background: modeColor.bg,
            border: `1px solid ${modeColor.bd}`,
            transition: "all 0.4s",
          }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: modeColor.fg,
                boxShadow: `0 0 6px ${modeColor.fg} / 0.7`,
                animation: isAggressive
                  ? `pulse-dot ${
                      isCritical ? "0.5s" : "0.8s"
                    } ease-in-out infinite`
                  : undefined,
              }}
            />
            <span
              className="font-mono text-[0.55rem] font-black tracking-widest"
              style={{ color: modeColor.fg }}
            >
              CONNECTED TO
            </span>
            {CONNECTED_TAGS.map((tag) => (
              <span
                key={tag.label}
                className="font-mono text-[0.48rem] font-bold tracking-wider px-1.5 py-0.5 rounded-sm"
                style={{
                  border: `1px solid ${modeColor.bd}`,
                  color: modeColor.fg,
                  background: modeColor.bg,
                  boxShadow: tagFlash ? `0 0 10px ${modeColor.fg}` : "none",
                  transition: "box-shadow 0.15s, background 0.3s",
                }}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.4); }
          }
        `}</style>

        {/* VIRTUAL BATTERY BANK */}
        <div
          className="px-3 py-2 rounded"
          style={{
            background: "oklch(0.11 0.04 240 / 0.6)",
            border: "1px solid oklch(0.55 0.18 85 / 0.6)",
            boxShadow: "0 0 10px oklch(0.55 0.18 85 / 0.12)",
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: "oklch(0.82 0.22 85)",
                boxShadow: "0 0 8px oklch(0.82 0.22 85 / 0.8)",
              }}
            />
            <span
              className="font-mono text-[0.62rem] font-black tracking-wider"
              style={{ color: "oklch(0.88 0.2 85)" }}
            >
              VIRTUAL BATTERY BANK · 50 LITHIUM CELLS
            </span>
            <span
              className="ml-auto font-mono text-[0.42rem] font-black px-1.5 py-0.5 rounded-sm"
              style={{
                background: "oklch(0.18 0.05 145 / 0.5)",
                border: "1px solid oklch(0.55 0.18 145 / 0.7)",
                color: "oklch(0.82 0.2 145)",
              }}
            >
              CHARGED · ACTIVE
            </span>
          </div>
          <div
            className="font-mono text-[0.44rem] tracking-wider mb-2"
            style={{ color: "oklch(0.58 0.12 85)" }}
          >
            CHARGED BY GENERATOR · SMOOTHS POWER RIPPLE · 3.6T UNIT SOURCE
          </div>
          {/* Battery cell grid */}
          <div className="flex flex-wrap gap-[3px] mb-2">
            {Array.from({ length: 50 }, (_, i) => i).map((cellIdx) => (
              <div
                key={`cell-${cellIdx}`}
                className="rounded-sm"
                style={{
                  width: "10px",
                  height: "14px",
                  background: "oklch(0.75 0.2 85)",
                  boxShadow: "0 0 4px oklch(0.75 0.2 85 / 0.6)",
                  border: "1px solid oklch(0.55 0.15 85 / 0.8)",
                  transition: "opacity 0.2s",
                }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span
              className="font-mono text-[0.44rem] tracking-wider"
              style={{ color: "oklch(0.6 0.1 85)" }}
            >
              50 × 200,000,000 UNITS
            </span>
            <span
              className="font-mono font-black"
              style={{
                fontSize: "0.72rem",
                color: "oklch(0.9 0.22 85)",
                textShadow: "0 0 12px oklch(0.82 0.2 85 / 0.5)",
              }}
            >
              10B UNITS
            </span>
          </div>
        </div>

        {/* SIGNAL PULLING FILTERS */}
        <div
          className="px-3 py-2 rounded"
          style={{
            background: spfActive
              ? "oklch(0.12 0.04 265 / 0.55)"
              : "oklch(0.11 0.02 265 / 0.4)",
            border: spfActive
              ? "1px solid oklch(0.52 0.2 265 / 0.7)"
              : "1px solid oklch(0.35 0.1 265 / 0.5)",
            transition: "all 0.3s",
            boxShadow: spfActive
              ? "0 0 10px oklch(0.52 0.2 265 / 0.15)"
              : "none",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: spfActive
                  ? "oklch(0.72 0.22 265)"
                  : "oklch(0.45 0.1 265)",
                boxShadow: spfActive
                  ? "0 0 8px oklch(0.72 0.22 265 / 0.8)"
                  : "none",
                animation: spfActive
                  ? `pulse-dot ${bassPulseSpeed} ease-in-out infinite`
                  : undefined,
              }}
            />
            <span
              className="font-mono text-[0.62rem] font-black tracking-wider"
              style={{
                color: spfActive
                  ? "oklch(0.82 0.2 265)"
                  : "oklch(0.58 0.1 265)",
              }}
            >
              SIGNAL PULLING FILTERS · 4 TOTAL
            </span>
            <span
              className="ml-auto font-mono text-[0.42rem] font-black px-1.5 py-0.5 rounded-sm"
              style={{
                background: spfActive
                  ? "oklch(0.18 0.06 265 / 0.6)"
                  : "oklch(0.13 0.02 265 / 0.4)",
                border: spfActive
                  ? "1px solid oklch(0.55 0.2 265 / 0.8)"
                  : "1px solid oklch(0.35 0.08 265 / 0.5)",
                color: spfActive
                  ? "oklch(0.82 0.22 265)"
                  : "oklch(0.5 0.1 265)",
                transition: "all 0.3s",
              }}
            >
              {spfActive ? `GRIP ${spfGrip}%` : "STANDBY"}
            </span>
          </div>
          <div
            className="font-mono text-[0.5rem] font-black tracking-widest mb-1"
            style={{
              color: spfActive ? "oklch(0.78 0.18 265)" : "oklch(0.5 0.08 265)",
            }}
          >
            1,000-TON HOLD · CATCH · PULL · LOCK
          </div>
          <div className="flex items-center justify-between">
            <span
              className="font-mono text-[0.44rem] tracking-wider"
              style={{
                color: spfActive
                  ? "oklch(0.58 0.14 265)"
                  : "oklch(0.42 0.07 265)",
              }}
            >
              HM: 2 ACTIVE | BASS: 2 ACTIVE · RANGE 1–1000
            </span>
            <span
              className="font-mono text-[0.44rem] tracking-wider"
              style={{ color: "oklch(0.52 0.12 265)" }}
            >
              threshold −3dB · ratio 20:1
            </span>
          </div>
          {/* Grip bar */}
          {spfActive && (
            <div
              className="mt-1.5 h-1 rounded-full overflow-hidden"
              style={{ background: "oklch(0.18 0.04 265 / 0.5)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${spfGrip}%`,
                  background:
                    "linear-gradient(90deg, oklch(0.52 0.18 265), oklch(0.72 0.22 265))",
                  boxShadow: "0 0 6px oklch(0.72 0.22 265 / 0.6)",
                }}
              />
            </div>
          )}
        </div>

        {/* STRONG NOISE FILTER */}
        <div
          className="flex items-center gap-3 px-3 py-2 rounded"
          style={{
            background: "oklch(0.12 0.03 195 / 0.45)",
            border: "1px solid oklch(0.48 0.16 195 / 0.6)",
            boxShadow: "0 0 8px oklch(0.48 0.16 195 / 0.1)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              background: "oklch(0.72 0.2 195)",
              boxShadow: "0 0 8px oklch(0.72 0.2 195 / 0.8)",
            }}
          />
          <div className="flex-1 min-w-0">
            <span
              className="font-mono text-[0.62rem] font-black tracking-wider block"
              style={{ color: "oklch(0.82 0.18 195)" }}
            >
              STRONG NOISE FILTER · END OF CHAIN
            </span>
            <span
              className="font-mono text-[0.44rem] tracking-wider mt-0.5 block"
              style={{ color: "oklch(0.55 0.12 195)" }}
            >
              BLOCKS HUM · SUB-20HZ RUMBLE · ALWAYS ON
            </span>
          </div>
          <span
            className="font-mono text-[0.42rem] font-black px-1.5 py-0.5 rounded-sm shrink-0"
            style={{
              background: "oklch(0.18 0.05 195 / 0.5)",
              border: "1px solid oklch(0.52 0.18 195 / 0.7)",
              color: "oklch(0.82 0.2 195)",
            }}
          >
            ENGAGED · CLEAN
          </span>
        </div>

        {/* DISTORTION BLOCKERS row */}
        <div
          className="flex items-center gap-3 px-3 py-2 rounded"
          style={{
            background: blockerBg,
            border: blockerBd,
            transition: "all 0.3s",
          }}
        >
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              background: blockerDotColor,
              boxShadow: `0 0 6px ${blockerDotColor}`,
              animation: isAggressive
                ? `pulse-dot ${isCritical ? "0.5s" : "0.9s"} ease-in-out infinite`
                : undefined,
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="font-mono text-[0.62rem] font-bold tracking-wider"
                style={{ color: blockerLabelColor }}
              >
                DISTORTION BLOCKERS
              </span>
              <span
                className="font-mono text-[0.42rem] font-black tracking-widest px-1 py-0.5 rounded-sm"
                style={{
                  background: "oklch(0.14 0.02 145 / 0.5)",
                  border: "1px solid oklch(0.42 0.14 145 / 0.6)",
                  color: "oklch(0.72 0.18 145)",
                }}
              >
                {blockerCount} ACTIVE
              </span>
              <span
                className="font-mono text-[0.4rem] tracking-wider px-1 py-0.5 rounded-sm"
                style={{
                  background: "oklch(0.12 0.015 85 / 0.4)",
                  border: "1px solid oklch(0.4 0.1 85 / 0.5)",
                  color: "oklch(0.65 0.12 85)",
                }}
              >
                {eqLevelLabel}
              </span>
            </div>
            <div
              className="font-mono text-[0.5rem] tracking-wider mt-0.5"
              style={{
                color: rangeActive
                  ? "oklch(0.62 0.18 145)"
                  : "oklch(0.48 0.012 252)",
              }}
            >
              {rangeActive
                ? `VOL ${masterVolume} · RANGE ACTIVE`
                : "STANDBY · RANGE 100\u20131000"}
            </div>
            <div
              className="font-mono text-[0.44rem] tracking-wider mt-0.5"
              style={{
                color: rangeActive
                  ? "oklch(0.55 0.15 145)"
                  : "oklch(0.42 0.008 252)",
              }}
            >
              RANGE 100\u20131000 · SCALES WITH VOLUME + BASS EQ
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span
              className="font-mono text-[0.5rem]"
              style={{ color: "oklch(0.52 0.012 252)" }}
            >
              {blockerCount} × 200,000×120
            </span>
            <span
              className="font-mono text-[0.65rem] font-black"
              style={{ color: blockerTotalColor }}
            >
              {(distortionTotal / 1_000_000).toFixed(0)}M UNITS
            </span>
            <span
              className="font-mono text-[0.45rem] tracking-wider"
              style={{ color: blockerTotalColor }}
            >
              {pct}% DRIVE
            </span>
          </div>
        </div>

        {/* BASS BLOCKERS row */}
        <div
          className="flex items-center gap-3 px-3 py-2 rounded"
          style={{
            background: blockerBg,
            border: blockerBd,
            transition: "all 0.3s",
          }}
        >
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              background: blockerDotColor,
              boxShadow: `0 0 6px ${blockerDotColor}`,
              animation: isAggressive
                ? `pulse-dot ${isCritical ? "0.5s" : "0.9s"} ease-in-out infinite`
                : undefined,
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="font-mono text-[0.62rem] font-bold tracking-wider"
                style={{ color: blockerLabelColor }}
              >
                BASS BLOCKERS
              </span>
              <span
                className="font-mono text-[0.42rem] font-black tracking-widest px-1 py-0.5 rounded-sm"
                style={{
                  background: "oklch(0.14 0.02 145 / 0.5)",
                  border: "1px solid oklch(0.42 0.14 145 / 0.6)",
                  color: "oklch(0.72 0.18 145)",
                }}
              >
                {blockerCount} ACTIVE
              </span>
              <span
                className="font-mono text-[0.4rem] tracking-wider px-1 py-0.5 rounded-sm"
                style={{
                  background: "oklch(0.12 0.015 85 / 0.4)",
                  border: "1px solid oklch(0.4 0.1 85 / 0.5)",
                  color: "oklch(0.65 0.12 85)",
                }}
              >
                {eqLevelLabel}
              </span>
            </div>
            <div
              className="font-mono text-[0.5rem] tracking-wider mt-0.5"
              style={{
                color: rangeActive
                  ? "oklch(0.62 0.18 145)"
                  : "oklch(0.48 0.012 252)",
              }}
            >
              {rangeActive
                ? `VOL ${masterVolume} · RANGE ACTIVE`
                : "STANDBY · RANGE 100\u20131000"}
            </div>
            <div
              className="font-mono text-[0.44rem] tracking-wider mt-0.5"
              style={{
                color: rangeActive
                  ? "oklch(0.55 0.15 145)"
                  : "oklch(0.42 0.008 252)",
              }}
            >
              RANGE 100\u20131000 · SCALES WITH VOLUME + BASS EQ
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span
              className="font-mono text-[0.5rem]"
              style={{ color: "oklch(0.52 0.012 252)" }}
            >
              {blockerCount} × 200,000×120
            </span>
            <span
              className="font-mono text-[0.65rem] font-black"
              style={{ color: blockerTotalColor }}
            >
              {(bassTotal / 1_000_000).toFixed(0)}M UNITS
            </span>
            <span
              className="font-mono text-[0.45rem] tracking-wider"
              style={{ color: blockerTotalColor }}
            >
              {pct}% DRIVE
            </span>
          </div>
        </div>

        {/* COMBINED STRENGTH display */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded"
          style={{
            background: "oklch(0.12 0.025 85 / 0.35)",
            border: "1px solid oklch(0.5 0.18 85 / 0.5)",
          }}
        >
          <div>
            <div
              className="font-mono text-[0.52rem] font-black tracking-widest"
              style={{ color: "oklch(0.72 0.16 85)" }}
            >
              COMBINED BLOCKER STRENGTH
            </div>
            <div
              className="font-mono text-[0.44rem] tracking-wider mt-0.5"
              style={{ color: "oklch(0.52 0.1 85)" }}
            >
              DISTORTION TOTAL × BASS TOTAL · {blockerCount} ACTIVE EACH
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span
              className="font-mono font-black"
              style={{
                fontSize: "0.7rem",
                color: "oklch(0.88 0.2 85)",
                textShadow: "0 0 14px oklch(0.78 0.18 85 / 0.6)",
              }}
            >
              {formatQuadrillion(combinedStrength)}
            </span>
            <span
              className="font-mono text-[0.42rem] tracking-wider"
              style={{ color: "oklch(0.6 0.12 85)" }}
            >
              UNITS
            </span>
          </div>
        </div>

        {/* BASS DISTORTION HD row */}
        <div
          className="flex items-center gap-3 px-3 py-2 rounded"
          style={{
            background: hdColor.bg,
            border: `1px solid ${hdColor.bd}`,
            transition: "all 0.3s",
            ...(rangeActive
              ? { boxShadow: "0 0 8px oklch(0.68 0.22 220 / 0.25)" }
              : {}),
          }}
        >
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              background: hdColor.dot,
              boxShadow: `0 0 6px ${hdColor.dot}`,
              animation: rangeActive
                ? `pulse-dot ${bassPulseSpeed} ease-in-out infinite`
                : undefined,
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="font-mono text-[0.62rem] font-bold tracking-wider"
                style={{ color: hdColor.label }}
              >
                BASS DISTORTION BLOCKER
              </span>
              <span
                className="font-mono text-[0.42rem] font-black tracking-widest px-1 py-0.5 rounded-sm"
                style={{
                  background: rangeActive
                    ? "oklch(0.18 0.06 220 / 0.6)"
                    : "oklch(0.14 0.02 220 / 0.4)",
                  border: `1px solid ${
                    rangeActive
                      ? "oklch(0.55 0.22 220 / 0.8)"
                      : "oklch(0.38 0.1 220 / 0.5)"
                  }`,
                  color: rangeActive
                    ? "oklch(0.82 0.22 220)"
                    : "oklch(0.55 0.1 220)",
                  transition: "all 0.3s",
                }}
              >
                {rangeActive ? "HD ENGAGED" : "HD STANDBY"}
              </span>
            </div>
            <div
              className="font-mono text-[0.5rem] tracking-wider mt-0.5"
              style={{
                color: rangeActive
                  ? "oklch(0.62 0.18 220)"
                  : "oklch(0.45 0.08 220)",
                transition: "color 0.3s",
              }}
            >
              {rangeActive
                ? `VOL ${masterVolume} · RANGE ACTIVE`
                : "STANDBY · RANGE 100\u20131000"}
            </div>
            <div
              className="font-mono text-[0.44rem] tracking-wider mt-0.5"
              style={{
                color: rangeActive
                  ? "oklch(0.55 0.16 220)"
                  : "oklch(0.38 0.07 220)",
                transition: "color 0.3s",
              }}
            >
              RANGE 100\u20131000 · DRIVE {hdDrive} ·{" "}
              {rangeActive ? `${rangePct}% ENGAGED` : "STANDBY"}
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span
              className="font-mono text-[0.5rem]"
              style={{ color: "oklch(0.52 0.012 252)" }}
            >
              1 × 200,000
            </span>
            <span
              className="font-mono text-[0.65rem] font-black"
              style={{ color: hdColor.total }}
            >
              200,000 UNITS · HD
            </span>
          </div>
        </div>

        {/* Bass Correctional Cleaner */}
        <div
          className="flex items-center gap-3 px-3 py-2 rounded"
          style={{
            background: "oklch(0.13 0.008 145 / 0.4)",
            border: "1px solid oklch(0.38 0.14 145 / 0.4)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              background: "oklch(0.72 0.22 145)",
              boxShadow: "0 0 6px oklch(0.72 0.22 145)",
            }}
          />
          <div className="flex-1 min-w-0">
            <span
              className="font-mono text-[0.62rem] font-bold tracking-wider"
              style={{ color: "oklch(0.88 0.012 240)" }}
            >
              BASS CORRECTIONAL SIGNAL CLEANER
            </span>
            <div
              className="font-mono text-[0.5rem] tracking-wider mt-0.5"
              style={{ color: "oklch(0.48 0.012 252)" }}
            >
              ALWAYS ACTIVE
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span
              className="font-mono text-[0.5rem]"
              style={{ color: "oklch(0.52 0.012 252)" }}
            >
              4 × 20,000
            </span>
            <span
              className="font-mono text-[0.65rem] font-black"
              style={{ color: "oklch(0.78 0.16 85)" }}
            >
              80,000 UNITS
            </span>
          </div>
        </div>

        {/* Force Correction Booster */}
        <div
          className="flex items-center gap-3 px-3 py-2 rounded"
          style={{
            background: "oklch(0.13 0.008 145 / 0.4)",
            border: "1px solid oklch(0.38 0.14 145 / 0.4)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              background: "oklch(0.72 0.22 145)",
              boxShadow: "0 0 6px oklch(0.72 0.22 145)",
            }}
          />
          <div className="flex-1 min-w-0">
            <span
              className="font-mono text-[0.62rem] font-bold tracking-wider"
              style={{ color: "oklch(0.88 0.012 240)" }}
            >
              FORCE CORRECTION SIGNAL BOOSTER
            </span>
            <div
              className="font-mono text-[0.5rem] tracking-wider mt-0.5"
              style={{ color: "oklch(0.48 0.012 252)" }}
            >
              ALWAYS ACTIVE
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span
              className="font-mono text-[0.5rem]"
              style={{ color: "oklch(0.52 0.012 252)" }}
            >
              4 × 200,000
            </span>
            <span
              className="font-mono text-[0.65rem] font-black"
              style={{ color: "oklch(0.78 0.16 85)" }}
            >
              800,000 UNITS
            </span>
          </div>
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {BADGE_ROWS.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-0.5 px-2.5 py-2 rounded"
              style={{
                background: "oklch(0.13 0.008 145 / 0.3)",
                border: "1px solid oklch(0.38 0.14 145 / 0.35)",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: "oklch(0.72 0.22 145)",
                    boxShadow: "0 0 5px oklch(0.72 0.22 145 / 0.8)",
                  }}
                />
                <span
                  className="font-mono text-[0.58rem] font-bold truncate"
                  style={{ color: "oklch(0.82 0.012 240)" }}
                >
                  {b.label}
                </span>
              </div>
              {"sublabel" in b && b.sublabel && (
                <span
                  className="font-mono text-[0.42rem] tracking-wider pl-3.5"
                  style={{ color: "oklch(0.52 0.1 145)" }}
                >
                  {b.sublabel}
                </span>
              )}
            </div>
          ))}
        </div>

        {isAggressive && (
          <div
            className="font-mono text-[0.6rem] tracking-widest text-center py-1.5 rounded"
            style={{
              color: isCritical ? "oklch(0.75 0.24 25)" : "oklch(0.82 0.2 40)",
              background: isCritical
                ? "oklch(0.15 0.012 25 / 0.3)"
                : "oklch(0.14 0.01 35 / 0.3)",
              border: isCritical
                ? "1px solid oklch(0.45 0.18 25 / 0.5)"
                : "1px solid oklch(0.5 0.18 35 / 0.5)",
              animation: "pulse-dot 1s ease-in-out infinite",
            }}
          >
            \u26a1 {isCritical ? "CRITICAL" : "AGGRESSIVE"} · VOL {masterVolume}{" "}
            / 1000
          </div>
        )}
      </div>
    </section>
  );
}
