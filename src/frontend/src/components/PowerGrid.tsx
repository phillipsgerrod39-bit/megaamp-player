const MAIN_CELLS = [
  {
    label: "MAIN AMP",
    formula: "240,000,000 ×7",
    result: "1,680,000,000",
    color: "gold",
  },
  {
    label: "BASS AMP",
    formula: "70,000,000 ×5",
    result: "350,000,000",
    color: "gold",
  },
  {
    label: "STABILIZER",
    formula: "20,000 ×4",
    result: "80,000",
    color: "green",
  },
];

const ENGINE_CELLS = [
  { label: "ENGINE 1", formula: "12,000,000 ×1", result: "12,000,000" },
  { label: "ENGINE 2", formula: "12,000,000 ×1", result: "12,000,000" },
  { label: "ENGINE 3", formula: "12,000,000 ×1", result: "12,000,000" },
  { label: "ENGINE 4", formula: "12,000,000 ×1", result: "12,000,000" },
];

const TOTAL_POWER = "32,080,728,000";

export function PowerGrid() {
  return (
    <section className="panel" data-ocid="power.panel">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className="panel-title"
            style={{ color: "oklch(0.78 0.16 85)", fontSize: "0.7rem" }}
          >
            POWER GRID
          </span>
          <span className="blockchain-badge">4-5 BLOCKCHAINS WIRED</span>
          <span className="blockchain-badge">WATCHDOG ACTIVE</span>
          <span
            className="blockchain-badge"
            style={{
              borderColor: "oklch(0.55 0.16 85 / 0.5)",
              color: "oklch(0.72 0.16 85)",
            }}
          >
            GLOBAL GENERATOR ONLINE
          </span>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Main Amp / Bass Amp / Stabilizer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {MAIN_CELLS.map((cell) => (
            <div
              key={cell.label}
              className="rounded p-2.5"
              style={{
                background:
                  cell.color === "gold"
                    ? "oklch(0.14 0.01 85 / 0.3)"
                    : "oklch(0.12 0.008 145 / 0.3)",
                border:
                  cell.color === "gold"
                    ? "1px solid oklch(0.5 0.14 85 / 0.4)"
                    : "1px solid oklch(0.4 0.14 145 / 0.4)",
              }}
            >
              <div
                className="font-mono text-[0.5rem] tracking-widest mb-1"
                style={{ color: "oklch(0.52 0.012 252)" }}
              >
                {cell.label}
              </div>
              <div
                className="font-mono text-[0.5rem] mb-1"
                style={{ color: "oklch(0.42 0.01 252)" }}
              >
                {cell.formula}
              </div>
              <div
                className="font-mono text-[0.72rem] font-black"
                style={{
                  color:
                    cell.color === "gold"
                      ? "oklch(0.78 0.16 85)"
                      : "oklch(0.72 0.22 145)",
                  textShadow:
                    cell.color === "gold"
                      ? "0 0 8px oklch(0.78 0.16 85 / 0.6)"
                      : "0 0 8px oklch(0.72 0.22 145 / 0.6)",
                }}
              >
                {cell.result}
              </div>
            </div>
          ))}
        </div>

        {/* 4 Engines */}
        <div>
          <div
            className="font-mono text-[0.52rem] tracking-widest mb-1.5"
            style={{ color: "oklch(0.48 0.012 252)" }}
          >
            ENGINES
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ENGINE_CELLS.map((cell) => (
              <div
                key={cell.label}
                className="rounded p-2"
                style={{
                  background: "oklch(0.13 0.01 240 / 0.3)",
                  border: "1px solid oklch(0.42 0.14 240 / 0.4)",
                }}
              >
                <div
                  className="font-mono text-[0.48rem] tracking-widest mb-1"
                  style={{ color: "oklch(0.52 0.012 252)" }}
                >
                  {cell.label}
                </div>
                <div
                  className="font-mono text-[0.45rem] mb-0.5"
                  style={{ color: "oklch(0.4 0.01 252)" }}
                >
                  {cell.formula}
                </div>
                <div
                  className="font-mono text-[0.65rem] font-bold"
                  style={{
                    color: "oklch(0.65 0.2 240)",
                    textShadow: "0 0 6px oklch(0.65 0.2 240 / 0.6)",
                  }}
                >
                  {cell.result}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Virtual Generator */}
        <div
          className="rounded p-3"
          style={{
            background: "oklch(0.15 0.012 85 / 0.25)",
            border: "1px solid oklch(0.55 0.16 85 / 0.5)",
            boxShadow: "0 0 12px oklch(0.78 0.16 85 / 0.15)",
          }}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div
                className="font-mono text-[0.52rem] tracking-widest mb-0.5"
                style={{ color: "oklch(0.52 0.012 252)" }}
              >
                GLOBAL VIRTUAL GENERATOR
              </div>
              <div
                className="font-mono text-[0.5rem] mb-1"
                style={{ color: "oklch(0.45 0.01 252)" }}
              >
                30,000,000,000 UNITS · VIRTUAL POWER SOURCE
              </div>
              <div
                className="font-mono text-xl font-black"
                style={{
                  color: "oklch(0.82 0.16 85)",
                  textShadow:
                    "0 0 16px oklch(0.78 0.16 85 / 0.8), 0 0 32px oklch(0.78 0.16 85 / 0.4)",
                }}
              >
                30,000,000,000
              </div>
            </div>
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{
                background: "oklch(0.78 0.16 85)",
                boxShadow:
                  "0 0 10px oklch(0.78 0.16 85 / 1), 0 0 20px oklch(0.78 0.16 85 / 0.5)",
              }}
            />
          </div>
        </div>

        {/* Total System Power */}
        <div
          className="rounded p-3 text-center"
          style={{
            background: "oklch(0.13 0.008 145 / 0.25)",
            border: "1px solid oklch(0.45 0.14 145 / 0.4)",
          }}
        >
          <div
            className="font-mono text-[0.52rem] tracking-widest mb-1"
            style={{ color: "oklch(0.52 0.012 252)" }}
          >
            TOTAL SYSTEM POWER
          </div>
          <div
            className="font-mono text-lg font-black"
            style={{
              color: "oklch(0.72 0.22 145)",
              textShadow:
                "0 0 14px oklch(0.72 0.22 145 / 0.8), 0 0 28px oklch(0.72 0.22 145 / 0.4)",
            }}
          >
            {TOTAL_POWER} UNITS
          </div>
        </div>

        {/* Status line */}
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: "oklch(0.72 0.22 145)",
              boxShadow: "0 0 6px oklch(0.72 0.22 145 / 0.8)",
            }}
          />
          <span
            className="font-mono text-[0.58rem]"
            style={{ color: "oklch(0.62 0.18 145)" }}
          >
            ALL ENGINES ONLINE · BLOCKCHAIN WATCHDOG RUNNING · NO FAILURES
            DETECTED
          </span>
        </div>
      </div>
    </section>
  );
}
