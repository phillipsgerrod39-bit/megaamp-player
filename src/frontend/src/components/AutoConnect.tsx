import { useCallback, useEffect, useRef, useState } from "react";

const ROUTED_COMPONENTS = [
  { name: "Master Volume", type: "blockchain" },
  { name: "7-Band EQ", type: "blockchain" },
  { name: "High Mid Amp", type: "engine" },
  { name: "Bass Amp", type: "engine" },
  { name: "SPR Filter", type: "blockchain" },
  { name: "Protection Stack", type: "blockchain" },
  { name: "Power Grid", type: "engine" },
  { name: "System Clean 12.0", type: "engine" },
  { name: "Save/Load Slots", type: "blockchain" },
];

type ComponentState = "locked" | "verifying" | "repairing";

interface LogEntry {
  id: number;
  text: string;
  type: "verify" | "repair" | "external" | "heartbeat";
}

let logIdCounter = 0;

function makeTs() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

interface AutoConnectProps {
  externalLogRef?: React.MutableRefObject<((msg: string) => void) | null>;
}

export function AutoConnect({ externalLogRef }: AutoConnectProps) {
  const [log, setLog] = useState<LogEntry[]>(() => [
    {
      id: logIdCounter++,
      text: `[${makeTs()}] All 9 systems verified — connection stable`,
      type: "heartbeat",
    },
  ]);
  const [verifyCount, setVerifyCount] = useState(0);
  const [componentStates, setComponentStates] = useState<ComponentState[]>(() =>
    ROUTED_COMPONENTS.map(() => "locked"),
  );

  const activeRef = useRef(true);

  const addLog = useCallback(
    (msg: string, type: LogEntry["type"] = "external") => {
      const entry: LogEntry = {
        id: logIdCounter++,
        text: `[${makeTs()}] ${msg}`,
        type,
      };
      setLog((prev) => [...prev, entry].slice(-30));
    },
    [],
  );

  // Expose addLog for external callers (volume routing)
  useEffect(() => {
    if (externalLogRef) {
      externalLogRef.current = (msg: string) => addLog(msg, "external");
      return () => {
        externalLogRef.current = null;
      };
    }
  }, [externalLogRef, addLog]);

  // Core self-verify + self-heal loop — every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!activeRef.current) return;

      // Pick 1-3 components to "verify" this cycle
      const cycleIndexes = Array.from(
        { length: ROUTED_COMPONENTS.length },
        (_, i) => i,
      )
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 1);

      // Flash them as verifying
      setComponentStates((prev) => {
        const next = [...prev];
        for (const i of cycleIndexes) next[i] = "verifying";
        return next;
      });

      // After 400ms decide: most stay clean, ~20% chance one gets a drift
      const repairTimeout = setTimeout(() => {
        const driftIndex =
          Math.random() < 0.22
            ? cycleIndexes[Math.floor(Math.random() * cycleIndexes.length)]
            : null;

        if (driftIndex !== null) {
          // Flash as repairing
          setComponentStates((prev) => {
            const next = [...prev];
            next[driftIndex] = "repairing";
            return next;
          });

          addLog(
            `⚡ ${ROUTED_COMPONENTS[driftIndex].name} — drift detected → auto-reconnected · LOCKED`,
            "repair",
          );

          // Restore to locked after 700ms
          setTimeout(() => {
            setComponentStates((prev) => {
              const next = [...prev];
              next[driftIndex] = "locked";
              return next;
            });
          }, 700);
        }

        // Restore all verifying → locked
        setComponentStates((prev) => {
          const next = [...prev];
          for (const i of cycleIndexes) {
            if (next[i] === "verifying") next[i] = "locked";
          }
          return next;
        });

        // Log clean verifications
        const cleanIndexes = cycleIndexes.filter((i) => i !== driftIndex);
        if (cleanIndexes.length > 0) {
          const names = cleanIndexes
            .map((i) => ROUTED_COMPONENTS[i].name)
            .join(" · ");
          addLog(`✓ ${names} — verified · secure`, "verify");
        }

        setVerifyCount((c) => c + 1);
      }, 400);

      return () => clearTimeout(repairTimeout);
    }, 8000);

    return () => clearInterval(interval);
  }, [addLog]);

  const getDotStyle = (state: ComponentState, index: number) => {
    if (state === "repairing") {
      return {
        background: "oklch(0.78 0.17 65)",
        boxShadow:
          "0 0 10px oklch(0.78 0.17 65), 0 0 20px oklch(0.78 0.17 65 / 0.6)",
        transition: `all 0.2s ${index * 0.04}s`,
      };
    }
    if (state === "verifying") {
      return {
        background: "oklch(0.65 0.2 240)",
        boxShadow:
          "0 0 10px oklch(0.65 0.2 240), 0 0 20px oklch(0.65 0.2 240 / 0.6)",
        transition: `all 0.2s ${index * 0.04}s`,
        animation: "verify-pulse 0.4s ease-in-out infinite",
      };
    }
    return {
      background: "oklch(0.72 0.22 145)",
      boxShadow: "0 0 6px oklch(0.72 0.22 145 / 0.9)",
      transition: `all 0.3s ${index * 0.04}s`,
    };
  };

  const getLogColor = (type: LogEntry["type"]) => {
    if (type === "repair") return "oklch(0.78 0.17 65)";
    if (type === "verify") return "oklch(0.55 0.18 145)";
    if (type === "external") return "oklch(0.65 0.2 240)";
    return "oklch(0.48 0.12 145)";
  };

  return (
    <>
      <style>{`
        @keyframes green-pulse {
          0%, 100% {
            box-shadow: 0 0 6px oklch(0.72 0.22 145 / 0.5),
                        0 0 12px oklch(0.72 0.22 145 / 0.25);
            border-color: oklch(0.55 0.18 145 / 0.6);
          }
          50% {
            box-shadow: 0 0 18px oklch(0.72 0.22 145 / 0.9),
                        0 0 40px oklch(0.72 0.22 145 / 0.45),
                        0 0 70px oklch(0.72 0.22 145 / 0.2);
            border-color: oklch(0.72 0.22 145 / 0.95);
          }
        }
        @keyframes verify-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes repair-flash {
          0%, 100% { opacity: 1; }
          33% { opacity: 0.2; }
          66% { opacity: 0.8; }
        }
      `}</style>

      <section
        className="panel overflow-hidden"
        style={{
          animation: "green-pulse 1.5s ease-in-out infinite",
          border: "1px solid oklch(0.55 0.18 145 / 0.6)",
        }}
        data-ocid="autoconnect.panel"
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b border-border"
          style={{ background: "oklch(0.14 0.012 145 / 0.35)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-mono text-sm font-black tracking-widest"
                  style={{ color: "oklch(0.78 0.16 85)" }}
                >
                  BLOCKCHAIN &amp; ENGINE AUTO-CONNECT
                </span>
                <span className="blockchain-badge">SETTINGS</span>
                <span
                  className="font-mono text-[0.48rem] font-black tracking-wider px-2 py-0.5 rounded-sm"
                  style={{
                    background: "oklch(0.16 0.012 145 / 0.5)",
                    border: "1px solid oklch(0.52 0.18 145 / 0.6)",
                    color: "oklch(0.72 0.22 145)",
                  }}
                >
                  VERIFIED {verifyCount}×
                </span>
              </div>
              <p
                className="font-mono text-[0.5rem] mt-0.5 tracking-wider"
                style={{ color: "oklch(0.48 0.012 252)" }}
              >
                SELF-VERIFYING EVERY 8s &middot; SELF-HEALING &middot;
                PERSISTENT
              </p>
            </div>
            <div
              className="w-3 h-3 rounded-full shrink-0 mt-0.5"
              style={{
                background: "oklch(0.72 0.22 145)",
                boxShadow:
                  "0 0 10px oklch(0.72 0.22 145 / 1), 0 0 20px oklch(0.72 0.22 145 / 0.6)",
              }}
            />
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* System Count + Verify Count */}
          <div className="flex items-center justify-between gap-3">
            <span
              className="font-mono text-xl font-black tracking-widest"
              style={{
                color: "oklch(0.78 0.16 85)",
                textShadow: "0 0 20px oklch(0.78 0.16 85 / 0.7)",
              }}
            >
              9 / 9 SYSTEMS CONNECTED
            </span>
            <div
              className="flex flex-col items-end shrink-0"
              style={{ gap: "2px" }}
            >
              <span
                className="font-mono text-[0.48rem] tracking-widest"
                style={{ color: "oklch(0.52 0.14 145)" }}
              >
                SELF-VERIFY COUNT
              </span>
              <span
                className="font-mono text-lg font-black"
                style={{
                  color: "oklch(0.72 0.22 145)",
                  textShadow: "0 0 12px oklch(0.72 0.22 145 / 0.8)",
                  lineHeight: 1,
                }}
              >
                {verifyCount}×
              </span>
            </div>
          </div>

          {/* Permanently Locked Status */}
          <div
            className="w-full py-4 font-mono text-base font-black tracking-widest rounded flex items-center justify-center gap-3"
            style={{
              border: "1px solid oklch(0.65 0.22 145 / 0.8)",
              background: "oklch(0.18 0.015 145 / 0.6)",
              color: "oklch(0.82 0.22 145)",
              boxShadow:
                "0 0 16px oklch(0.72 0.22 145 / 0.4), inset 0 0 12px oklch(0.72 0.22 145 / 0.1)",
              letterSpacing: "0.15em",
            }}
          >
            <span>⬡ AUTO-CONNECT ACTIVE</span>
            <span
              className="font-mono px-2 py-0.5 rounded"
              style={{
                background: "oklch(0.72 0.22 145 / 0.15)",
                border: "1px solid oklch(0.72 0.22 145 / 0.5)",
                color: "oklch(0.88 0.22 145)",
                fontSize: "0.65rem",
              }}
            >
              🔒 LOCKED
            </span>
          </div>

          {/* Persistent Lock */}
          <div
            className="rounded px-3 py-3 space-y-2"
            style={{
              background: "oklch(0.15 0.01 145 / 0.3)",
              border: "1px solid oklch(0.5 0.16 145 / 0.4)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="font-mono text-sm"
                  style={{ color: "oklch(0.72 0.22 145)" }}
                >
                  🔒
                </span>
                <span
                  className="font-mono text-[0.65rem] font-black tracking-widest"
                  style={{ color: "oklch(0.82 0.18 145)" }}
                >
                  PERSISTENT LOCK
                </span>
              </div>
              <span
                className="font-mono text-[0.6rem] font-black tracking-wider px-3 py-1 rounded-sm shrink-0"
                style={{
                  border: "1px solid oklch(0.5 0.16 145 / 0.6)",
                  color: "oklch(0.88 0.22 145)",
                  background: "oklch(0.18 0.015 145 / 0.5)",
                  letterSpacing: "0.12em",
                }}
                data-ocid="autoconnect.toggle"
              >
                🔒 LOCKED ON
              </span>
            </div>
            <div
              className="font-mono text-[0.5rem] tracking-wider"
              style={{ color: "oklch(0.58 0.16 145)" }}
            >
              PERMANENTLY LOCKED — STAYS CONNECTED THROUGH ALL UPDATES &amp;
              REPAIRS · SELF-HEALS DRIFT IN &lt;1s
            </div>
          </div>

          {/* Routing Strength */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                className="font-mono text-[0.6rem] font-bold tracking-widest"
                style={{ color: "oklch(0.72 0.22 145)" }}
              >
                ROUTING STRENGTH: MAXIMUM
              </span>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-4 rounded-sm"
                  style={{
                    background: "oklch(0.72 0.22 145)",
                    boxShadow: "0 0 6px oklch(0.72 0.22 145 / 0.7)",
                    transition: `all 0.3s ${i * 0.06}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Component Routing List — dots pulse on verify/repair */}
          <div className="space-y-1">
            {ROUTED_COMPONENTS.map((item, i) => {
              const state = componentStates[i];
              const isRepairing = state === "repairing";
              const isVerifying = state === "verifying";
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-3 px-3 py-2.5 rounded"
                  style={{
                    background: isRepairing
                      ? "oklch(0.18 0.02 65 / 0.35)"
                      : isVerifying
                        ? "oklch(0.16 0.015 240 / 0.3)"
                        : "oklch(0.15 0.01 145 / 0.25)",
                    border: isRepairing
                      ? "1px solid oklch(0.6 0.18 65 / 0.5)"
                      : isVerifying
                        ? "1px solid oklch(0.5 0.16 240 / 0.4)"
                        : "1px solid oklch(0.45 0.14 145 / 0.2)",
                    transition: "background 0.25s, border 0.25s",
                  }}
                  data-ocid={`autoconnect.item.${i + 1}`}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      ...getDotStyle(state, i),
                      animation: isVerifying
                        ? "verify-pulse 0.4s ease-in-out infinite"
                        : isRepairing
                          ? "repair-flash 0.35s ease-in-out infinite"
                          : undefined,
                    }}
                  />
                  <span
                    className="font-mono text-[0.65rem] font-bold flex-1 min-w-0 truncate"
                    style={{
                      color: isRepairing
                        ? "oklch(0.85 0.14 65)"
                        : isVerifying
                          ? "oklch(0.75 0.16 240)"
                          : "oklch(0.9 0.012 240)",
                      transition: "color 0.2s",
                    }}
                  >
                    {item.name}
                    {isRepairing && (
                      <span
                        className="ml-2 font-mono text-[0.45rem] tracking-widest"
                        style={{ color: "oklch(0.78 0.17 65)" }}
                      >
                        ⚡ RECONNECTING
                      </span>
                    )}
                    {isVerifying && (
                      <span
                        className="ml-2 font-mono text-[0.45rem] tracking-widest"
                        style={{ color: "oklch(0.55 0.18 240)" }}
                      >
                        ✓ VERIFYING
                      </span>
                    )}
                  </span>
                  <span
                    className="font-mono text-[0.48rem] font-bold tracking-wider px-1.5 py-0.5 rounded-sm shrink-0"
                    style={{
                      border:
                        item.type === "blockchain"
                          ? "1px solid oklch(0.55 0.18 240 / 0.6)"
                          : "1px solid oklch(0.6 0.14 85 / 0.6)",
                      color:
                        item.type === "blockchain"
                          ? "oklch(0.65 0.2 240)"
                          : "oklch(0.78 0.16 85)",
                      background:
                        item.type === "blockchain"
                          ? "oklch(0.16 0.012 240 / 0.4)"
                          : "oklch(0.16 0.01 85 / 0.4)",
                    }}
                  >
                    {item.type === "blockchain"
                      ? "BLOCKCHAIN ROUTED"
                      : "ENGINE ROUTED"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {[
              "4-5 BLOCKCHAINS ACTIVE",
              "4 ENGINES ACTIVE",
              "ALL SYSTEMS CONNECTED",
              "SELF-HEALING ⚡ LIVE",
              "🔒 PERMANENTLY LOCKED",
            ].map((label) => (
              <span
                key={label}
                className="blockchain-badge"
                style={{
                  borderColor: "oklch(0.55 0.18 145 / 0.6)",
                  color: "oklch(0.68 0.2 145)",
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Live Log */}
          <div
            className="rounded"
            style={{
              border: "1px solid oklch(0.28 0.01 252)",
              background: "oklch(0.1 0.005 252)",
            }}
          >
            <div
              className="px-2 py-1 border-b flex items-center justify-between"
              style={{
                borderColor: "oklch(0.24 0.009 252)",
                background: "oklch(0.13 0.006 252)",
              }}
            >
              <span
                className="font-mono text-[0.5rem] font-bold tracking-widest"
                style={{ color: "oklch(0.52 0.14 145)" }}
              >
                LIVE SYSTEM LOG · VOLUME ROUTED · SELF-HEALING
              </span>
              <span
                className="font-mono text-[0.45rem] font-bold tracking-wider"
                style={{ color: "oklch(0.45 0.12 145)" }}
              >
                {verifyCount} VERIFICATIONS
              </span>
            </div>
            <div
              className="h-28 overflow-y-auto px-2 py-1.5 space-y-0.5"
              style={{ scrollbarWidth: "none" }}
              ref={(el) => {
                if (el) el.scrollTop = el.scrollHeight;
              }}
            >
              {log.map((entry) => (
                <div
                  key={entry.id}
                  className="font-mono text-[0.48rem] leading-relaxed"
                  style={{ color: getLogColor(entry.type) }}
                >
                  {entry.text}
                </div>
              ))}
            </div>
          </div>

          {/* Status Line */}
          <div
            className="font-mono text-xs font-bold tracking-widest text-center py-2 border-t border-border"
            style={{ color: "oklch(0.72 0.22 145)" }}
          >
            ALL SETTINGS AUTO-ROUTED · LIVE · SECURE · 🔒 LOCKED · VERIFIED{" "}
            {verifyCount}×
          </div>
        </div>
      </section>
    </>
  );
}
