import { useRouting } from "../context/RoutingContext";

type MergeMode = "bass" | "highs" | "merge";

interface MergeSwitchProps {
  mergeMode: MergeMode;
  onMergeMode: (mode: MergeMode) => void;
}

const BUTTONS: { mode: MergeMode; label: string }[] = [
  { mode: "bass", label: "SW·1 BASS" },
  { mode: "highs", label: "SW·2 TWEETERS" },
  { mode: "merge", label: "MERGE" },
];

const REINFORCE_BADGE: Record<MergeMode, string> = {
  bass: "SIGNAL PULL · NOISE FILTER · BATTERY BANK · PROTECTED",
  highs: "SIGNAL PULL · NOISE FILTER · BATTERY BANK · PROTECTED",
  merge: "FULL STACK · 9,600W FUSE · SIGNAL PULL · PROTECTED",
};

export function MergeSwitch({ mergeMode, onMergeMode }: MergeSwitchProps) {
  const { fireRoute } = useRouting();

  const handleSelect = (mode: MergeMode) => {
    onMergeMode(mode);
    const label =
      mode === "bass"
        ? "BASS ONLY"
        : mode === "highs"
          ? "TWEETERS ONLY"
          : "BOTH AMPS MERGED";
    fireRoute(`AMP SWITCH → ${label} · FUSE ARRAY · ENGINE 4 · LOCKED`);
  };

  const statusText =
    mergeMode === "bass"
      ? "SW·1 ACTIVE — BASS ONLY"
      : mergeMode === "highs"
        ? "SW·2 ACTIVE — TWEETERS ONLY"
        : "MERGE ACTIVE — BOTH AMPS · FUSE PROTECTED";

  return (
    <section className="" data-ocid="merge.panel">
      <div className="flex flex-col gap-2 p-3">
        {/* Switch buttons row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-[0.65rem] font-bold tracking-widest text-muted-foreground whitespace-nowrap">
            AMP MERGE
          </span>
          <div className="flex gap-1 flex-wrap">
            {BUTTONS.map(({ mode, label }) => {
              const isActive = mergeMode === mode;
              return (
                <div key={mode} className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleSelect(mode)}
                    data-ocid={`merge.${mode}.button`}
                    className="font-mono text-[0.6rem] font-bold tracking-widest px-2 py-1 rounded border transition-all"
                    style={{
                      background: isActive
                        ? "oklch(0.22 0.08 252)"
                        : "oklch(0.14 0.01 252)",
                      borderColor: isActive
                        ? mode === "merge"
                          ? "oklch(0.72 0.22 145)"
                          : "oklch(0.55 0.22 252)"
                        : "oklch(0.25 0.02 252)",
                      color: isActive
                        ? mode === "merge"
                          ? "oklch(0.82 0.22 145)"
                          : "oklch(0.82 0.22 252)"
                        : "oklch(0.45 0.04 252)",
                      boxShadow: isActive
                        ? mode === "merge"
                          ? "0 0 10px oklch(0.55 0.22 145 / 0.6), 0 0 20px oklch(0.55 0.22 145 / 0.3)"
                          : "0 0 10px oklch(0.55 0.22 252 / 0.6), 0 0 20px oklch(0.55 0.22 252 / 0.3)"
                        : "none",
                    }}
                  >
                    {label}
                  </button>
                  {/* Per-button reinforce badge */}
                  {isActive && (
                    <div
                      className="font-mono font-bold rounded px-1 py-0.5 text-center leading-tight"
                      style={{
                        fontSize: "0.42rem",
                        letterSpacing: "0.06em",
                        background:
                          mode === "merge"
                            ? "oklch(0.14 0.04 145 / 0.8)"
                            : "oklch(0.12 0.06 252 / 0.8)",
                        border:
                          mode === "merge"
                            ? "1px solid oklch(0.45 0.18 145 / 0.7)"
                            : "1px solid oklch(0.45 0.18 252 / 0.7)",
                        color:
                          mode === "merge"
                            ? "oklch(0.78 0.16 85)"
                            : "oklch(0.78 0.18 252)",
                        boxShadow:
                          mode === "merge"
                            ? "0 0 6px oklch(0.55 0.22 145 / 0.4)"
                            : "0 0 6px oklch(0.55 0.22 252 / 0.4)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {REINFORCE_BADGE[mode]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-0.5">
            <span
              className="font-mono text-[0.6rem] font-bold"
              style={{
                color:
                  mergeMode === "merge"
                    ? "oklch(0.72 0.22 145)"
                    : "oklch(0.72 0.22 252)",
              }}
            >
              {statusText}
            </span>
            {mergeMode === "merge" && (
              <span
                className="font-mono text-[0.5rem] font-bold tracking-widest leading-tight"
                style={{ color: "oklch(0.78 0.16 85)" }}
              >
                80 × HD CUSTOM FUSE · 9,600W · 2-GAUGE HD SIM WIRE
              </span>
            )}
          </div>
          {mergeMode === "merge" && (
            <span className="blockchain-badge ml-auto">
              BLOCKCHAIN SYNCHRONIZED
            </span>
          )}
        </div>

        {/* REINFORCED status strip — always visible */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded"
          style={{
            background: "oklch(0.12 0.05 252 / 0.6)",
            border: "1px solid oklch(0.45 0.2 252 / 0.5)",
            boxShadow: "0 0 8px oklch(0.45 0.2 252 / 0.2)",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
            style={{
              background: "oklch(0.72 0.22 145)",
              boxShadow: "0 0 6px oklch(0.72 0.22 145)",
            }}
          />
          <span
            className="font-mono font-bold tracking-widest"
            style={{ fontSize: "0.48rem", color: "oklch(0.78 0.16 85)" }}
          >
            REINFORCED · SWITCH ARRAY · SIGNAL PULL ACTIVE · NOISE FILTER ACTIVE
            · BATTERY BANK ONLINE
          </span>
        </div>
      </div>
    </section>
  );
}
