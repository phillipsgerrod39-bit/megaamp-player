import { useEffect, useRef, useState } from "react";

interface LivePowerBusProps {
  masterVolume: number;
}

export function LivePowerBus({ masterVolume }: LivePowerBusProps) {
  const [changed, setChanged] = useState(false);
  const [chainPulse, setChainPulse] = useState<number | null>(null);
  const changeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chainTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevVolume = useRef(masterVolume);

  const pct = Math.round((masterVolume / 1000) * 100);
  const activeEngine =
    masterVolume <= 250
      ? 0
      : masterVolume <= 500
        ? 1
        : masterVolume <= 750
          ? 2
          : 3;
  const activeChain = masterVolume % 5;

  useEffect(() => {
    if (prevVolume.current === masterVolume) return;
    prevVolume.current = masterVolume;
    setChanged(true);
    setChainPulse(activeChain);
    if (changeTimer.current) clearTimeout(changeTimer.current);
    if (chainTimer.current) clearTimeout(chainTimer.current);
    changeTimer.current = setTimeout(() => setChanged(false), 800);
    chainTimer.current = setTimeout(() => setChainPulse(null), 600);
  }, [masterVolume, activeChain]);

  const isHighDrive = masterVolume >= 500;
  const isDanger = masterVolume >= 800;

  return (
    <section
      className=""
      data-ocid="power-bus.panel"
      style={{
        transition: "box-shadow 0.2s",
        boxShadow: changed
          ? isDanger
            ? "0 0 18px oklch(0.63 0.24 25 / 0.35)"
            : isHighDrive
              ? "0 0 18px oklch(0.78 0.17 65 / 0.35)"
              : "0 0 18px oklch(0.72 0.22 145 / 0.25)"
          : "none",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 flex-wrap px-3 py-2 border-b"
        style={{ borderColor: "oklch(0.72 0.2 90 / 0.2)" }}
      >
        <span
          className="panel-title"
          style={{ color: "oklch(0.78 0.16 85)", fontSize: "0.7rem" }}
        >
          LIVE POWER BUS
        </span>
        <span
          className="blockchain-badge"
          style={{
            borderColor: changed ? "oklch(0.65 0.2 145 / 0.8)" : undefined,
            color: changed ? "oklch(0.75 0.22 145)" : undefined,
          }}
        >
          {changed ? "\u25cf ROUTING" : "\u25cf LOCKED"}
        </span>
        {isDanger && (
          <span
            className="blockchain-badge animate-pulse"
            style={{
              borderColor: "oklch(0.5 0.2 25 / 0.7)",
              color: "oklch(0.75 0.24 25)",
            }}
          >
            \u26a1 DANGER
          </span>
        )}
        {isHighDrive && !isDanger && (
          <span
            className="blockchain-badge"
            style={{
              borderColor: "oklch(0.55 0.18 65 / 0.7)",
              color: "oklch(0.82 0.2 65)",
            }}
          >
            HIGH DRIVE
          </span>
        )}
      </div>

      <div className="p-3 space-y-2">
        {/* ENGINES */}
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map((i) => {
            const isLead = i === activeEngine;
            const power = 100;
            return (
              <div
                key={i}
                className="flex flex-col gap-1 rounded px-2 py-1.5"
                style={{
                  background: isLead
                    ? "oklch(0.16 0.018 85 / 0.5)"
                    : "oklch(0.12 0.008 252 / 0.4)",
                  border: isLead
                    ? "1px solid oklch(0.65 0.18 85 / 0.8)"
                    : "1px solid oklch(0.28 0.008 252 / 0.4)",
                  transition: "all 0.25s",
                  boxShadow: isLead
                    ? "0 0 10px oklch(0.78 0.16 85 / 0.3)"
                    : "none",
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[0.5rem] font-black tracking-wider"
                    style={{
                      color: isLead
                        ? "oklch(0.88 0.16 85)"
                        : "oklch(0.42 0.008 252)",
                    }}
                  >
                    ENG {i + 1}
                  </span>
                  {isLead && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "oklch(0.82 0.18 85)",
                        boxShadow: "0 0 6px oklch(0.82 0.18 85)",
                        animation: changed
                          ? "pulse-dot 0.6s ease-in-out infinite"
                          : undefined,
                      }}
                    />
                  )}
                </div>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.18 0.007 252)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "100%",
                      background: isLead
                        ? "oklch(0.78 0.18 85)"
                        : "oklch(0.42 0.08 85 / 0.5)",
                      transition: "width 0.15s",
                      boxShadow: isLead
                        ? "0 0 4px oklch(0.78 0.18 85 / 0.8)"
                        : "none",
                    }}
                  />
                </div>
                <span
                  className="font-mono text-[0.45rem] tracking-wider"
                  style={{
                    color: isLead
                      ? "oklch(0.72 0.14 85)"
                      : "oklch(0.35 0.008 252)",
                  }}
                >
                  {power}%
                </span>
              </div>
            );
          })}
        </div>

        {/* BLOCKCHAIN CHAINS */}
        <div className="grid grid-cols-5 gap-1">
          {[0, 1, 2, 3, 4].map((i) => {
            const isActive = true;
            const isPulsing = chainPulse === i;
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1 rounded px-1.5 py-1.5"
                style={{
                  background: "oklch(0.14 0.018 240 / 0.5)",
                  border: "1px solid oklch(0.55 0.18 240 / 0.8)",
                  transition: "all 0.2s",
                  boxShadow: isPulsing
                    ? "0 0 10px oklch(0.62 0.2 240 / 0.5)"
                    : "none",
                }}
              >
                <span
                  className="font-mono text-[0.48rem] font-black tracking-wider"
                  style={{
                    color: "oklch(0.82 0.18 240)",
                  }}
                >
                  C{i + 1}
                </span>
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: isActive
                      ? "oklch(0.72 0.22 240)"
                      : "oklch(0.25 0.006 252)",
                    boxShadow: isPulsing
                      ? "0 0 8px oklch(0.72 0.22 240)"
                      : isActive
                        ? "0 0 4px oklch(0.72 0.22 240 / 0.5)"
                        : "none",
                    animation: isPulsing
                      ? "pulse-dot 0.5s ease-in-out 2"
                      : undefined,
                    transition: "all 0.2s",
                  }}
                />
                <span
                  className="font-mono text-[0.42rem] tracking-wider"
                  style={{
                    color: "oklch(0.58 0.16 240)",
                  }}
                >
                  LIVE
                </span>
              </div>
            );
          })}
        </div>

        {/* AMP DRIVE */}
        <div className="grid grid-cols-2 gap-1.5">
          {["HIGH MID DRIVE", "BASS DRIVE"].map((label) => (
            <div
              key={label}
              className="rounded px-2.5 py-2"
              style={{
                background: isDanger
                  ? "oklch(0.15 0.012 25 / 0.4)"
                  : isHighDrive
                    ? "oklch(0.14 0.012 65 / 0.35)"
                    : "oklch(0.12 0.008 145 / 0.35)",
                border: isDanger
                  ? "1px solid oklch(0.5 0.2 25 / 0.6)"
                  : isHighDrive
                    ? "1px solid oklch(0.55 0.18 65 / 0.6)"
                    : "1px solid oklch(0.4 0.14 145 / 0.45)",
                transition: "all 0.3s",
              }}
            >
              <div
                className="font-mono text-[0.48rem] tracking-wider mb-1"
                style={{ color: "oklch(0.48 0.01 252)" }}
              >
                {label}
              </div>
              <div
                className="font-mono text-lg font-black leading-none"
                style={{
                  color: isDanger
                    ? "oklch(0.75 0.24 25)"
                    : isHighDrive
                      ? "oklch(0.82 0.2 65)"
                      : "oklch(0.72 0.22 145)",
                  transition: "all 0.25s",
                }}
              >
                {pct}%
              </div>
              <div
                className="mt-1 h-1 rounded-full overflow-hidden"
                style={{ background: "oklch(0.18 0.007 252)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: isDanger
                      ? "oklch(0.65 0.24 25)"
                      : isHighDrive
                        ? "oklch(0.78 0.18 65)"
                        : "oklch(0.68 0.2 145)",
                    transition: "width 0.15s, background 0.3s",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* BLOCKER MODES */}
        <div className="grid grid-cols-2 gap-1.5">
          <div
            className="rounded px-2.5 py-2"
            style={{
              background: isDanger
                ? "oklch(0.15 0.015 25 / 0.45)"
                : isHighDrive
                  ? "oklch(0.14 0.012 35 / 0.4)"
                  : "oklch(0.12 0.008 145 / 0.3)",
              border: isDanger
                ? "1px solid oklch(0.55 0.22 25 / 0.7)"
                : isHighDrive
                  ? "1px solid oklch(0.5 0.2 35 / 0.6)"
                  : "1px solid oklch(0.38 0.14 145 / 0.4)",
              transition: "all 0.3s",
            }}
          >
            <div className="flex items-center gap-1 mb-1">
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  background: isDanger
                    ? "oklch(0.72 0.24 25)"
                    : isHighDrive
                      ? "oklch(0.8 0.2 40)"
                      : "oklch(0.72 0.22 145)",
                  animation: isHighDrive
                    ? `pulse-dot ${isDanger ? "0.5s" : "0.9s"} ease-in-out infinite`
                    : undefined,
                }}
              />
              <span
                className="font-mono text-[0.48rem] font-black tracking-wider"
                style={{
                  color: isDanger
                    ? "oklch(0.82 0.22 25)"
                    : isHighDrive
                      ? "oklch(0.85 0.18 40)"
                      : "oklch(0.72 0.16 145)",
                }}
              >
                DIST BLOCKERS
              </span>
            </div>
            <div
              className="font-mono text-[0.55rem] font-bold"
              style={{
                color: isDanger
                  ? "oklch(0.78 0.22 25)"
                  : isHighDrive
                    ? "oklch(0.8 0.18 40)"
                    : "oklch(0.62 0.14 145)",
              }}
            >
              {isDanger ? "CRITICAL" : isHighDrive ? "AGGRESSIVE" : "STANDARD"}{" "}
              · 24M
            </div>
          </div>

          <div
            className="rounded px-2.5 py-2"
            style={{
              background: "oklch(0.12 0.01 145 / 0.35)",
              border: "1px solid oklch(0.42 0.16 145 / 0.5)",
            }}
          >
            <div className="flex items-center gap-1 mb-1">
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  background: "oklch(0.72 0.22 145)",
                  boxShadow: "0 0 6px oklch(0.72 0.22 145 / 0.8)",
                  animation: `pulse-dot ${
                    masterVolume > 500
                      ? "0.6s"
                      : masterVolume > 100
                        ? "1.2s"
                        : "2s"
                  } ease-in-out infinite`,
                }}
              />
              <span
                className="font-mono text-[0.48rem] font-black tracking-wider"
                style={{ color: "oklch(0.75 0.18 145)" }}
              >
                BASS BLOCKERS
              </span>
            </div>
            <div
              className="font-mono text-[0.55rem] font-bold"
              style={{ color: "oklch(0.72 0.18 145)" }}
            >
              {masterVolume > 100 ? "KICKING" : "STANDBY"} · 100K
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.5); }
        }
      `}</style>
    </section>
  );
}
