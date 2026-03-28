import { useState } from "react";
import type { AppState } from "../backend.d";
import { AutoConnect } from "./AutoConnect";
import { DbMeter } from "./DbMeter";
import { PowerGrid } from "./PowerGrid";
import { SaveLoad } from "./SaveLoad";
import { SystemClean } from "./SystemClean";

type DrawerTab = "systems" | "clean" | "save" | "meter";

interface FileDrawersProps {
  externalLogRef: React.MutableRefObject<((msg: string) => void) | null>;
  systemCleanPhase: "idle" | "scanning" | "locked";
  systemCleanTimeLeft: number;
  systemCleanLogs: string[];
  systemCleanRunning: boolean;
  onStartScan: () => void;
  onPhaseChange: (phase: "idle" | "scanning" | "locked") => void;
  onTimeLeftChange: (t: number) => void;
  onLog: (entry: string) => void;
  getState: () => AppState;
  applyState: (state: AppState) => void;
  db?: number;
}

export function FileDrawers({
  externalLogRef,
  systemCleanPhase,
  systemCleanTimeLeft,
  systemCleanLogs,
  systemCleanRunning,
  onStartScan,
  onPhaseChange,
  onTimeLeftChange,
  onLog,
  getState,
  applyState,
  db,
}: FileDrawersProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab | null>(null);

  const tabs: { id: DrawerTab; label: string }[] = [
    { id: "systems", label: "SYSTEMS" },
    { id: "clean", label: "CLEAN" },
    { id: "save", label: "SAVE/LOAD" },
    { id: "meter", label: "METER" },
  ];

  const toggle = (id: DrawerTab) =>
    setActiveTab((prev) => (prev === id ? null : id));

  return (
    <div className="max-w-4xl mx-auto px-3 pb-4">
      {/* Tab bar */}
      <div
        className="flex border border-border rounded-t overflow-hidden"
        style={{ background: "oklch(0.1 0.008 252)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className="flex-1 font-mono text-[0.6rem] tracking-widest py-2 border-r last:border-r-0 border-border transition-colors"
            style={{
              background:
                activeTab === tab.id
                  ? "oklch(0.16 0.014 85 / 0.5)"
                  : "transparent",
              color:
                activeTab === tab.id
                  ? "oklch(0.82 0.16 85)"
                  : "oklch(0.48 0.01 240)",
            }}
            onClick={() => toggle(tab.id)}
            data-ocid={`drawers.${tab.id}.tab`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drawer content */}
      {activeTab !== null && (
        <div
          className="border border-t-0 border-border rounded-b p-3 space-y-3"
          style={{ background: "oklch(0.08 0.006 252)" }}
        >
          {activeTab === "systems" && (
            <>
              <AutoConnect externalLogRef={externalLogRef} />
              <PowerGrid />
            </>
          )}
          {activeTab === "clean" && (
            <SystemClean
              phase={systemCleanPhase}
              timeLeft={systemCleanTimeLeft}
              logs={systemCleanLogs}
              running={systemCleanRunning}
              onStart={onStartScan}
              onPhaseChange={onPhaseChange}
              onTimeLeftChange={onTimeLeftChange}
              onLog={onLog}
            />
          )}
          {activeTab === "save" && (
            <SaveLoad getState={getState} applyState={applyState} />
          )}
          {activeTab === "meter" && <DbMeter db={db ?? -60} />}
        </div>
      )}
    </div>
  );
}
