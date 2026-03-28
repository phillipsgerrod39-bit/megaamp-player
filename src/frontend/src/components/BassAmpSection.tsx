import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRouting } from "../context/RoutingContext";
import { TapButton } from "./TapButton";

interface BassState {
  omniField: boolean;
  correction: number;
  soundStage: number;
}

interface HighMidState {
  frequency: number;
  blocker1: boolean;
  blocker2: boolean;
  soundStage: number;
  kick: number;
  thump: number;
}

interface BassAmpSectionProps {
  bass: BassState;
  onBass: (update: Partial<BassState>) => void;
  highMid: HighMidState;
  onHighMid: (update: Partial<HighMidState>) => void;
  masterVolume: number;
}

export function BassAmpSection({
  bass,
  onBass,
  highMid,
  onHighMid,
  masterVolume,
}: BassAmpSectionProps) {
  const { fireRoute } = useRouting();
  const chainOf = (v: number) => (v % 5) + 1;

  const drive = Math.round((masterVolume / 1000) * 100);
  const driveColor =
    drive >= 80
      ? "oklch(0.75 0.24 25)"
      : drive >= 50
        ? "oklch(0.82 0.2 65)"
        : "oklch(0.72 0.22 145)";

  const correctionOn = bass.correction > 0;

  return (
    <section className="" data-ocid="bassamp.panel">
      {/* Header */}
      <div
        className="flex items-center gap-2 flex-wrap px-3 py-2 border-b"
        style={{ borderColor: "oklch(0.6 0.22 195 / 0.2)" }}
      >
        <span
          className="font-mono text-[0.65rem] font-bold tracking-widest"
          style={{ color: "oklch(0.65 0.2 240)" }}
        >
          BASS AMP
        </span>
        <span className="blockchain-badge">1-CHANNEL</span>
        <span className="blockchain-badge">70M×5 POWER</span>
        <span className="blockchain-badge">PUSH-PULL SOUNDSTAGE</span>
        <span
          className="font-mono text-[0.5rem] font-black tracking-wider ml-auto"
          style={{ color: driveColor }}
        >
          DRIVE {drive}%
        </span>
      </div>

      <div className="p-3 space-y-3">
        {/* Power Supply row */}
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded"
          style={{
            background: "oklch(0.11 0.018 240 / 0.3)",
            border: "1px solid oklch(0.45 0.16 240 / 0.4)",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: "oklch(0.65 0.2 240)",
              boxShadow: "0 0 6px oklch(0.65 0.2 240 / 0.8)",
            }}
          />
          <span
            className="font-mono text-[0.55rem] font-black tracking-widest"
            style={{ color: "oklch(0.65 0.2 240)" }}
          >
            POWER SUPPLY
          </span>
          <span
            className="font-mono text-[0.5rem] tracking-wider"
            style={{ color: "oklch(0.48 0.12 240)" }}
          >
            70,000 × 20 = 1,400,000 UNITS
          </span>
          <span
            className="blockchain-badge ml-auto shrink-0"
            style={{
              borderColor: "oklch(0.45 0.14 240 / 0.6)",
              color: "oklch(0.65 0.2 240)",
              fontSize: "0.38rem",
            }}
          >
            HEAVY DUTY VIRTUAL SIMULATION
          </span>
        </div>

        {/* KICK tap control */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.6rem] text-muted-foreground w-28 shrink-0">
            KICK
          </span>
          <TapButton
            onPress={() => {
              const v = Math.max(0, highMid.kick - 1);
              onHighMid({ kick: v });
              fireRoute(`KICK ${v} \u2192 BASS ENGINE · CHAIN ${chainOf(v)}`);
            }}
            label="-"
            disabled={highMid.kick <= 0}
            color="blue"
            className="px-2.5 py-1 ml-auto"
          />
          <span
            className="font-mono text-sm font-bold w-16 text-center"
            style={{ color: "oklch(0.65 0.2 240)" }}
          >
            {highMid.kick}
          </span>
          <TapButton
            onPress={() => {
              const v = Math.min(20, highMid.kick + 1);
              onHighMid({ kick: v });
              fireRoute(`KICK ${v} \u2192 BASS ENGINE · CHAIN ${chainOf(v)}`);
            }}
            label="+"
            disabled={highMid.kick >= 20}
            color="blue"
            className="px-2.5 py-1"
          />
        </div>

        {/* THUMP tap control */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.6rem] text-muted-foreground w-28 shrink-0">
            THUMP
          </span>
          <TapButton
            onPress={() => {
              const v = Math.max(0, highMid.thump - 1);
              onHighMid({ thump: v });
              fireRoute(`THUMP ${v} \u2192 BASS ENGINE · CHAIN ${chainOf(v)}`);
            }}
            label="-"
            disabled={highMid.thump <= 0}
            color="blue"
            className="px-2.5 py-1 ml-auto"
          />
          <span
            className="font-mono text-sm font-bold w-16 text-center"
            style={{ color: "oklch(0.65 0.2 240)" }}
          >
            {highMid.thump}
          </span>
          <TapButton
            onPress={() => {
              const v = Math.min(20, highMid.thump + 1);
              onHighMid({ thump: v });
              fireRoute(`THUMP ${v} \u2192 BASS ENGINE · CHAIN ${chainOf(v)}`);
            }}
            label="+"
            disabled={highMid.thump >= 20}
            color="blue"
            className="px-2.5 py-1"
          />
        </div>

        {/* PUSH/PULL SOUNDSTAGE tap control */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.6rem] text-muted-foreground w-28 shrink-0">
            PUSH/PULL SOUNDSTAGE
          </span>
          <TapButton
            onPress={() => {
              const v = Math.max(30, bass.soundStage - 1);
              onBass({ soundStage: v });
              fireRoute(
                `SOUNDSTAGE ${v} FT \u2192 BASS AMP · CHAIN ${chainOf(v)}`,
              );
            }}
            label="-"
            disabled={bass.soundStage <= 30}
            color="blue"
            className="px-2.5 py-1 ml-auto"
          />
          <span
            className="font-mono text-sm font-bold w-16 text-center"
            style={{ color: "oklch(0.65 0.2 240)" }}
          >
            {bass.soundStage} FT
          </span>
          <TapButton
            onPress={() => {
              const v = Math.min(70, bass.soundStage + 1);
              onBass({ soundStage: v });
              fireRoute(
                `SOUNDSTAGE ${v} FT \u2192 BASS AMP · CHAIN ${chainOf(v)}`,
              );
            }}
            label="+"
            disabled={bass.soundStage >= 70}
            color="blue"
            className="px-2.5 py-1"
          />
          {bass.soundStage > 40 && (
            <span
              className="blockchain-badge shrink-0"
              style={{
                borderColor: "oklch(0.45 0.14 240 / 0.6)",
                color: "oklch(0.65 0.2 240)",
                fontSize: "0.38rem",
              }}
            >
              METER ASSIST ACTIVE
            </span>
          )}
        </div>

        {/* Switches */}
        <div className="border-t border-border pt-2 space-y-0.5">
          <div className="flex items-center gap-3 py-1">
            <Switch
              id="bass-80hz"
              checked={correctionOn}
              onCheckedChange={(v) => {
                onBass({ correction: v ? 10 : 0 });
                fireRoute(
                  `80Hz BASS CORRECTION \u2192 ${v ? "ON" : "OFF"} · SIGNAL STABILIZER`,
                );
              }}
              data-ocid="bassamp.switch"
            />
            <Label htmlFor="bass-80hz" className="cursor-pointer">
              <span className="font-mono text-[0.65rem] font-bold">
                80Hz BASS CORRECTION
              </span>
            </Label>
            <div
              className="w-2 h-2 rounded-full ml-auto"
              style={{
                background: correctionOn
                  ? "oklch(0.65 0.2 240)"
                  : "oklch(0.3 0.01 252)",
                boxShadow: correctionOn
                  ? "0 0 6px oklch(0.65 0.2 240 / 0.8)"
                  : "none",
              }}
            />
          </div>

          {/* WaveShaper status — visible only when 80Hz correction is ON */}
          {correctionOn && (
            <div
              className="flex flex-col gap-0.5 pl-10 pb-1"
              data-ocid="bassamp.panel"
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1 h-1 rounded-full shrink-0"
                  style={{
                    background: "oklch(0.65 0.2 240)",
                    boxShadow: "0 0 4px oklch(0.65 0.2 240 / 0.9)",
                  }}
                />
                <span
                  className="font-mono font-bold tracking-[0.12em]"
                  style={{
                    fontSize: "0.44rem",
                    color: "oklch(0.65 0.2 240)",
                    textShadow: "0 0 6px oklch(0.65 0.2 240 / 0.5)",
                  }}
                >
                  WAVESHAPER · SOFT-CLIP ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1 h-1 rounded-full shrink-0"
                  style={{
                    background: "oklch(0.58 0.16 240)",
                    boxShadow: "0 0 3px oklch(0.58 0.16 240 / 0.7)",
                  }}
                />
                <span
                  className="font-mono tracking-[0.1em]"
                  style={{
                    fontSize: "0.44rem",
                    color: "oklch(0.5 0.12 240)",
                  }}
                >
                  4x OVERSAMPLE · SIGNAL STABILIZED
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 py-1">
            <Switch
              id="omnifield"
              checked={bass.omniField}
              onCheckedChange={(v) => {
                onBass({ omniField: v });
                fireRoute(`OMNIFIELD ${v ? "ON" : "OFF"} · ROUTED`);
              }}
              data-ocid="bassamp.switch"
            />
            <Label htmlFor="omnifield" className="cursor-pointer">
              <span className="font-mono text-[0.65rem] font-bold">
                OMNIFIELD SOUNDFIELD
              </span>
            </Label>
            <div
              className="w-2 h-2 rounded-full ml-auto"
              style={{
                background: bass.omniField
                  ? "oklch(0.65 0.2 240)"
                  : "oklch(0.3 0.01 252)",
                boxShadow: bass.omniField
                  ? "0 0 6px oklch(0.65 0.2 240 / 0.8)"
                  : "none",
              }}
            />
          </div>

          {/* OmniField Force Status panel */}
          {bass.omniField && (
            <div
              className="mt-2 rounded p-2 space-y-0.5"
              style={{
                background: "oklch(0.1 0.02 240 / 0.6)",
                border: "1px solid oklch(0.35 0.12 240 / 0.5)",
              }}
              data-ocid="bassamp.panel"
            >
              <div
                className="font-mono text-[0.48rem] font-bold tracking-[0.15em] mb-1.5 flex items-center gap-1"
                style={{
                  color: "oklch(0.72 0.18 240)",
                  textShadow: "0 0 8px oklch(0.65 0.2 240 / 0.5)",
                }}
              >
                <span>\u2b21</span>
                <span>OMNIFIELD FORCE STATUS</span>
              </div>

              {(
                [
                  ["PROJECTION", "OMNIDIRECTIONAL · ALL DIRECTIONS"],
                  ["ANCHOR", "CENTER · ROOM LOCKED"],
                  ["OBSTACLES", "BYPASSED · NEVER BLOCKED"],
                  ["COVERAGE", "FULL ROOM · INFINITE FILL"],
                  ["DRIVE", `${drive}%`],
                  ["SPR LINK", "AIR PRESSURE ACTIVE · FIRING OUTWARD"],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-2"
                >
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "0.4rem",
                      letterSpacing: "0.1em",
                      color: "oklch(0.45 0.08 240)",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    className="font-mono font-bold"
                    style={{
                      fontSize: "0.4rem",
                      letterSpacing: "0.06em",
                      color:
                        label === "DRIVE" ? driveColor : "oklch(0.65 0.2 240)",
                      textShadow: "0 0 6px oklch(0.65 0.2 240 / 0.4)",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status badges */}
        <div className="flex gap-2 flex-wrap">
          {bass.omniField && (
            <span
              className="blockchain-badge"
              style={{
                borderColor: "oklch(0.45 0.14 240 / 0.6)",
                color: "oklch(0.65 0.2 240)",
              }}
            >
              OMNIFIELD ACTIVE
            </span>
          )}
          <span className="blockchain-badge">BC ROUTED</span>
        </div>
      </div>
    </section>
  );
}
