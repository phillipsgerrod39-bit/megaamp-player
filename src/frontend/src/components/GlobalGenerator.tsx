interface GlobalGeneratorProps {
  masterVolume: number;
  generatorOn: boolean;
  onGeneratorToggle: () => void;
}

const POWERED_SYSTEMS = [
  "HM AMP SUPPLY 1.4M",
  "BASS AMP SUPPLY 1.4M",
  "STABILIZER 20K×4",
  "ENG 1\u20134 · 12M EA",
  "5 BLOCKCHAINS",
  "DIST BLOCKERS",
  "BASS BLOCKERS",
  "VOLUME BUS",
  "EQ BUS",
];

export function GlobalGenerator({
  masterVolume,
  generatorOn,
  onGeneratorToggle,
}: GlobalGeneratorProps) {
  const pct = Math.round((masterVolume / 1000) * 100);
  const flowSpeed = Math.max(0.8, 3 - pct * 0.022);

  return (
    <section
      data-ocid="generator.panel"
      className=""
      style={{
        background: generatorOn
          ? "linear-gradient(158deg, oklch(0.13 0.018 85) 0%, oklch(0.07 0.009 85) 100%)"
          : "linear-gradient(158deg, oklch(0.09 0.008 252) 0%, oklch(0.06 0.004 252) 100%)",
        border: generatorOn
          ? "1px solid oklch(0.65 0.18 85 / 0.6)"
          : "1px solid oklch(0.35 0.12 25 / 0.55)",
        boxShadow: generatorOn
          ? "0 0 24px oklch(0.78 0.16 85 / 0.18), inset 0 0 30px oklch(0.78 0.16 85 / 0.04)"
          : "0 0 20px oklch(0.45 0.18 25 / 0.2)",
        transition: "all 0.4s ease",
      }}
    >
      <style>{`
        @keyframes power-flow {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes gen-btn-glow-on {
          0%, 100% { box-shadow: 0 0 12px oklch(0.65 0.28 145 / 0.6), 0 0 28px oklch(0.65 0.28 145 / 0.25); }
          50%       { box-shadow: 0 0 22px oklch(0.72 0.3 145 / 0.85), 0 0 48px oklch(0.72 0.3 145 / 0.45); }
        }
        @keyframes gen-btn-glow-off {
          0%, 100% { box-shadow: 0 0 10px oklch(0.55 0.22 25 / 0.5); }
          50%       { box-shadow: 0 0 18px oklch(0.6 0.25 25 / 0.7); }
        }
      `}</style>

      {/* Header */}
      <div
        className="px-3 py-2 border-b flex items-center justify-between flex-wrap gap-2"
        style={{
          borderColor: generatorOn
            ? "oklch(0.65 0.18 85 / 0.3)"
            : "oklch(0.35 0.1 25 / 0.4)",
        }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-mono font-black tracking-[0.18em]"
            style={{
              fontSize: "0.62rem",
              color: generatorOn
                ? "oklch(0.88 0.16 85)"
                : "oklch(0.45 0.06 252)",
              textShadow: generatorOn
                ? "0 0 12px oklch(0.78 0.16 85 / 0.7)"
                : "none",
              transition: "all 0.3s",
            }}
          >
            GLOBAL VIRTUAL GENERATOR
          </span>
          {/* 4-gauge wiring — styled as a compact blockchain-badge */}
          <span
            className="blockchain-badge"
            style={{
              opacity: generatorOn ? 1 : 0.4,
              transition: "opacity 0.3s",
            }}
          >
            4-GAUGE WIRING
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="font-mono font-black"
            style={{
              fontSize: "0.95rem",
              color: generatorOn
                ? "oklch(0.88 0.18 85)"
                : "oklch(0.35 0.04 252)",
              textShadow: generatorOn
                ? "0 0 18px oklch(0.78 0.16 85 / 0.9), 0 0 35px oklch(0.78 0.16 85 / 0.45)"
                : "none",
              letterSpacing: "0.04em",
              transition: "all 0.3s",
            }}
          >
            3,600,000,000,000 UNITS
          </span>
          <span
            className="blockchain-badge"
            style={{
              borderColor: generatorOn
                ? "oklch(0.65 0.2 145 / 0.55)"
                : "oklch(0.5 0.2 25 / 0.55)",
              color: generatorOn
                ? "oklch(0.78 0.22 145)"
                : "oklch(0.65 0.22 25)",
              transition: "all 0.3s",
            }}
          >
            {generatorOn ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* ON/OFF switch */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-center">
        <button
          type="button"
          onClick={onGeneratorToggle}
          data-ocid="generator.toggle"
          style={{
            fontFamily: "monospace",
            fontWeight: 900,
            fontSize: "1.05rem",
            letterSpacing: "0.2em",
            padding: "14px 40px",
            borderRadius: "8px",
            border: generatorOn
              ? "3px solid oklch(0.60 0.28 145)"
              : "3px solid oklch(0.55 0.25 25)",
            background: generatorOn
              ? "oklch(0.12 0.018 145 / 0.7)"
              : "oklch(0.12 0.018 25 / 0.7)",
            color: generatorOn ? "oklch(0.82 0.3 145)" : "oklch(0.75 0.28 25)",
            cursor: "pointer",
            animation: generatorOn
              ? "gen-btn-glow-on 2s ease-in-out infinite"
              : "gen-btn-glow-off 1.5s ease-in-out infinite",
            transition: "background 0.3s, border-color 0.3s, color 0.3s",
            userSelect: "none",
            minWidth: "220px",
            textAlign: "center",
          }}
        >
          {generatorOn ? "\u2b24  GENERATOR ON" : "\u2b24  GENERATOR OFF"}
        </button>
      </div>

      {/* Status */}
      <div className="px-3 pt-1 pb-0">
        <span
          className="font-mono font-black tracking-[0.16em]"
          style={{
            fontSize: "0.52rem",
            color: generatorOn ? "oklch(0.72 0.22 145)" : "oklch(0.45 0.1 25)",
            textShadow: generatorOn
              ? "0 0 10px oklch(0.72 0.22 145 / 0.7)"
              : "none",
            transition: "all 0.3s",
          }}
        >
          {generatorOn
            ? "UNPLUGGED · VIRTUAL SIMULATION GENERATOR"
            : "GENERATOR OFFLINE · ALL SYSTEMS HALTED"}
        </span>
      </div>

      {/* Power distribution grid */}
      <div className="px-3 pt-2 pb-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {POWERED_SYSTEMS.map((sys) => (
            <div key={sys} className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  background: generatorOn
                    ? "oklch(0.72 0.22 145)"
                    : "oklch(0.38 0.1 25)",
                  boxShadow: generatorOn
                    ? "0 0 5px oklch(0.72 0.22 145 / 0.9)"
                    : "none",
                  transition: "all 0.3s",
                }}
              />
              <span
                className="font-mono font-bold whitespace-nowrap"
                style={{
                  fontSize: "0.46rem",
                  letterSpacing: "0.12em",
                  color: generatorOn
                    ? "oklch(0.68 0.12 85)"
                    : "oklch(0.35 0.04 252)",
                  transition: "all 0.3s",
                }}
              >
                {sys}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Power flow bar */}
      <div
        className="relative overflow-hidden mx-3 mb-3 mt-2 rounded-full"
        style={{
          height: "4px",
          background: "oklch(0.18 0.01 85 / 0.5)",
          border: "1px solid oklch(0.45 0.12 85 / 0.3)",
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: generatorOn
              ? "linear-gradient(90deg, oklch(0.55 0.14 85 / 0.3), oklch(0.72 0.18 85 / 0.5), oklch(0.55 0.14 85 / 0.3))"
              : "oklch(0.22 0.01 252)",
            transition: "background 0.4s",
          }}
        />
        {generatorOn && (
          <div
            className="absolute top-0 bottom-0 rounded-full"
            style={{
              width: "25%",
              background:
                "linear-gradient(90deg, transparent, oklch(0.88 0.18 85 / 0.9), transparent)",
              animation: `power-flow ${flowSpeed}s linear infinite`,
            }}
          />
        )}
      </div>
    </section>
  );
}
