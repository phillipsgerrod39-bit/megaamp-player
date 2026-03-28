import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import { useAddSystemCleanLog } from "../hooks/useQueries";

interface SystemCleanProps {
  phase: "idle" | "scanning" | "locked";
  timeLeft: number;
  logs: string[];
  running: boolean;
  onStart: () => void;
  onPhaseChange: (phase: "idle" | "scanning" | "locked") => void;
  onTimeLeftChange: (t: number) => void;
  onLog: (entry: string) => void;
}

const LOG_MESSAGES = [
  "Checking distortion blockers... OK",
  "Verifying blockchain nodes... LOCKED",
  "Scanning EQ integrity... CLEAN",
  "Checking SPR pressure... STABLE",
  "Bass amp verification... PASS",
  "High mid amp integrity... VERIFIED",
  "Force correction signal... ACTIVE",
  "Titanium overdrive check... NOMINAL",
  "SRS 2022 smart chip... LOCKED",
  "120W fuse integrity... SOLID",
  "Engine 1-4 crosscheck... ALL ONLINE",
  "Global generator status... 30B UNITS STABLE",
  "Stabilizer output... CLEAN",
  "Master volume routing... CONFIRMED",
  "FPGA crossover routing... VERIFIED",
  "Watchdog system pulse... ALIVE",
  "Signal pressure response... 100-200 RANGE OK",
  "Self-healing protocol... ACTIVE",
  "Bass correctional cleaner... 20Kx4 RUNNING",
  "Force boost signal... 200Kx4 LOCKED",
];

export function SystemClean({
  phase,
  timeLeft,
  logs,
  running,
  onStart,
  onPhaseChange,
  onTimeLeftChange,
  onLog,
}: SystemCleanProps) {
  const tickRef = useRef<number | null>(null);
  const logTickRef = useRef<number | null>(null);
  const logIndexRef = useRef(0);
  const addLog = useAddSystemCleanLog();

  // Stable refs so intervals don't need to be recreated
  const onTimeLeftChangeRef = useRef(onTimeLeftChange);
  const onLogRef = useRef(onLog);
  const onPhaseChangeRef = useRef(onPhaseChange);
  const addLogRef = useRef(addLog.mutate);
  onTimeLeftChangeRef.current = onTimeLeftChange;
  onLogRef.current = onLog;
  onPhaseChangeRef.current = onPhaseChange;
  addLogRef.current = addLog.mutate;

  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  useEffect(() => {
    if (!running) return;

    tickRef.current = window.setInterval(() => {
      const next = Math.max(0, timeLeftRef.current - 1);
      onTimeLeftChangeRef.current(next);
      if (next === 0) {
        onPhaseChangeRef.current("locked");
        const ts = new Date().toLocaleTimeString();
        const final = `[${ts}] ALL SYSTEMS LOCKED AND SAFE -- BLOCKCHAIN VERIFIED`;
        onLogRef.current(final);
        addLogRef.current(final);
        if (tickRef.current) clearInterval(tickRef.current);
        if (logTickRef.current) clearInterval(logTickRef.current);
      }
    }, 1000);

    logTickRef.current = window.setInterval(() => {
      const msg = LOG_MESSAGES[logIndexRef.current % LOG_MESSAGES.length];
      const ts = new Date().toLocaleTimeString();
      const entry = `[${ts}] ${msg}`;
      onLogRef.current(entry);
      addLogRef.current(entry);
      logIndexRef.current++;
    }, 15000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (logTickRef.current) clearInterval(logTickRef.current);
    };
  }, [running]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const statusColor = {
    idle: "oklch(0.45 0.01 252)",
    scanning: "oklch(0.85 0.18 95)",
    locked: "oklch(0.72 0.22 145)",
  }[phase];

  const statusLabel = {
    idle: "IDLE",
    scanning: "SCANNING...",
    locked: "ALL LOCKED",
  }[phase];

  return (
    <section className="panel p-3" data-ocid="systemclean.panel">
      <div className="flex items-center gap-2 mb-3">
        <span className="panel-title">SYSTEM CLEAN 12.0</span>
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            phase === "scanning"
              ? "glow-yellow-pulse"
              : phase === "locked"
                ? "glow-green"
                : ""
          }`}
          style={{
            background: statusColor,
            boxShadow: phase !== "idle" ? `0 0 8px ${statusColor}` : "none",
          }}
        />
        <span
          className="font-mono text-[0.6rem] font-bold"
          style={{ color: statusColor }}
        >
          {statusLabel}
        </span>
        <span
          className="ml-auto font-mono text-lg font-black"
          style={{ color: statusColor }}
        >
          {fmt(timeLeft)}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          className="tap-btn"
          onClick={onStart}
          disabled={running}
          data-ocid="systemclean.primary_button"
          style={{
            borderColor: running
              ? "oklch(0.3 0.01 252)"
              : "oklch(0.45 0.14 145 / 0.7)",
            color: running ? "oklch(0.4 0.01 252)" : "oklch(0.72 0.22 145)",
          }}
        >
          {running ? "SCAN IN PROGRESS..." : "START SCAN"}
        </button>
        {phase === "scanning" && (
          <span className="font-mono text-[0.6rem] text-[oklch(0.85_0.18_95)] animate-pulse">
            CHECKING EVERY 15s · SELF-HEALING ACTIVE
          </span>
        )}
        {phase === "locked" && (
          <span className="font-mono text-[0.6rem] text-[oklch(0.72_0.22_145)]">
            ALL SYSTEMS LOCKED AND SAFE
          </span>
        )}
      </div>

      {logs.length > 0 && (
        <ScrollArea
          className="h-32 bg-[oklch(0.1_0.005_252)] border border-border rounded p-2"
          data-ocid="systemclean.loading_state"
        >
          <div className="space-y-0.5">
            {logs.map((log, _i) => (
              <div
                key={log}
                className="font-mono text-[0.55rem] text-muted-foreground"
              >
                {log}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </section>
  );
}
