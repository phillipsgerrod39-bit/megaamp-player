import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRouting } from "../context/RoutingContext";
import { TapButton } from "./TapButton";

interface HighMidState {
  frequency: number;
  blocker1: boolean;
  blocker2: boolean;
  soundStage: number;
  kick: number;
  thump: number;
}

interface HighMidAmpSectionProps {
  highMid: HighMidState;
  onHighMid: (update: Partial<HighMidState>) => void;
  masterVolume: number;
}

const CHANNELS = [
  { id: "CH1", units: "420,000,000" },
  { id: "CH2", units: "420,000,000" },
  { id: "CH3", units: "420,000,000" },
  { id: "CH4", units: "420,000,000" },
];

export function HighMidAmpSection({
  highMid,
  onHighMid,
  masterVolume,
}: HighMidAmpSectionProps) {
  const { fireRoute } = useRouting();

  const chainOf = (v: number) => (v % 5) + 1;
  const drive = Math.round((masterVolume / 1000) * 100);
  const driveColor =
    drive >= 80
      ? "oklch(0.75 0.24 25)"
      : drive >= 50
        ? "oklch(0.82 0.2 65)"
        : "oklch(0.72 0.22 145)";

  return (
    <section className="" data-ocid="highmid.panel">
      {/* Header */}
      <div
        className="flex items-center gap-2 flex-wrap px-3 py-2 border-b"
        style={{ borderColor: "oklch(0.55 0.22 240 / 0.2)" }}
      >
        <span
          className="font-mono text-[0.65rem] font-bold tracking-widest"
          style={{ color: "oklch(0.78 0.16 85)" }}
        >
          HIGH MID AMP
        </span>
        <span className="blockchain-badge">4-CHANNEL</span>
        <span className="blockchain-badge">GOLD PHANTOM MIDS &amp; HIGHS</span>
        <span className="blockchain-badge">FPGA CROSSOVER</span>
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
            background: "oklch(0.12 0.018 85 / 0.3)",
            border: "1px solid oklch(0.5 0.16 85 / 0.4)",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: "oklch(0.72 0.22 85)",
              boxShadow: "0 0 6px oklch(0.72 0.22 85 / 0.8)",
            }}
          />
          <span
            className="font-mono text-[0.55rem] font-black tracking-widest"
            style={{ color: "oklch(0.78 0.16 85)" }}
          >
            POWER SUPPLY
          </span>
          <span
            className="font-mono text-[0.5rem] tracking-wider"
            style={{ color: "oklch(0.55 0.1 85)" }}
          >
            70,000 × 20 = 1,400,000 UNITS
          </span>
          <span
            className="blockchain-badge ml-auto shrink-0"
            style={{
              borderColor: "oklch(0.5 0.16 85 / 0.6)",
              color: "oklch(0.78 0.18 85)",
              fontSize: "0.38rem",
            }}
          >
            HEAVY DUTY VIRTUAL SIMULATION
          </span>
        </div>

        {/* 4-Channel breakdown */}
        <div
          className="rounded px-2.5 py-2"
          style={{
            background: "oklch(0.11 0.01 85 / 0.25)",
            border: "1px solid oklch(0.42 0.12 85 / 0.3)",
          }}
        >
          <div
            className="font-mono text-[0.48rem] font-black tracking-[0.15em] mb-1.5"
            style={{ color: "oklch(0.6 0.1 85)" }}
          >
            OUTPUT CHANNEL DISTRIBUTION · 1,680,000,000 \u00f7 4
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {CHANNELS.map((ch) => (
              <div
                key={ch.id}
                className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded"
                style={{
                  background: "oklch(0.13 0.015 85 / 0.4)",
                  border: "1px solid oklch(0.45 0.14 85 / 0.45)",
                }}
              >
                <span
                  className="font-mono font-black tracking-widest"
                  style={{ fontSize: "0.52rem", color: "oklch(0.78 0.18 85)" }}
                >
                  {ch.id}
                </span>
                <span
                  className="font-mono font-bold text-center leading-tight"
                  style={{ fontSize: "0.4rem", color: "oklch(0.62 0.14 85)" }}
                >
                  {ch.units}
                  <br />
                  <span
                    style={{
                      color: "oklch(0.48 0.08 85)",
                      fontSize: "0.38rem",
                    }}
                  >
                    UNITS
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Frequency tap control */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.6rem] text-muted-foreground w-28 shrink-0">
            FREQUENCY
          </span>
          <span
            className="font-mono text-[0.5rem] text-muted-foreground"
            style={{ color: "oklch(0.42 0.01 252)" }}
          >
            1000\u20132000Hz
          </span>
          <TapButton
            onPress={() => {
              const v = Math.max(1000, highMid.frequency - 10);
              onHighMid({ frequency: v });
              fireRoute(`HIGH MID FREQ ${v}Hz \u2192 CHAIN ${chainOf(v)}`);
            }}
            label="-"
            disabled={highMid.frequency <= 1000}
            color="gold"
            className="px-2.5 py-1 ml-auto"
          />
          <span
            className="font-mono text-sm font-bold w-16 text-center"
            style={{ color: "oklch(0.78 0.16 85)" }}
          >
            {highMid.frequency}Hz
          </span>
          <TapButton
            onPress={() => {
              const v = Math.min(2000, highMid.frequency + 10);
              onHighMid({ frequency: v });
              fireRoute(`HIGH MID FREQ ${v}Hz \u2192 CHAIN ${chainOf(v)}`);
            }}
            label="+"
            disabled={highMid.frequency >= 2000}
            color="gold"
            className="px-2.5 py-1"
          />
        </div>

        {/* Soundstage tap control */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.6rem] text-muted-foreground w-28 shrink-0">
            SOUNDSTAGE
          </span>
          <TapButton
            onPress={() => {
              const v = Math.max(30, highMid.soundStage - 1);
              onHighMid({ soundStage: v });
              fireRoute(`HM SOUNDSTAGE ${v}ft \u2192 ENGINE 1`);
            }}
            label="-"
            disabled={highMid.soundStage <= 30}
            color="gold"
            className="px-2.5 py-1 ml-auto"
          />
          <span
            className="font-mono text-sm font-bold w-16 text-center"
            style={{ color: "oklch(0.78 0.16 85)" }}
          >
            {highMid.soundStage}ft
          </span>
          <TapButton
            onPress={() => {
              const v = Math.min(70, highMid.soundStage + 1);
              onHighMid({ soundStage: v });
              fireRoute(`HM SOUNDSTAGE ${v}ft \u2192 ENGINE 1`);
            }}
            label="+"
            disabled={highMid.soundStage >= 70}
            color="gold"
            className="px-2.5 py-1"
          />
        </div>

        {/* Bass block toggles */}
        <div className="border-t border-border pt-2 space-y-0.5">
          <div className="flex items-center gap-3 py-1">
            <Switch
              id="hm-blocker1"
              checked={highMid.blocker1}
              onCheckedChange={(v) => {
                onHighMid({ blocker1: v });
                fireRoute(`BASS BLOCK 1 \u2192 ${v ? "ON" : "OFF"} · CHAIN 1`);
              }}
              data-ocid="highmid.switch"
            />
            <Label htmlFor="hm-blocker1" className="cursor-pointer">
              <span className="font-mono text-[0.65rem] font-bold">
                BASS BLOCK 1
              </span>
            </Label>
            <div
              className="w-2 h-2 rounded-full ml-auto"
              style={{
                background: highMid.blocker1
                  ? "oklch(0.72 0.22 145)"
                  : "oklch(0.3 0.01 252)",
                boxShadow: highMid.blocker1
                  ? "0 0 6px oklch(0.72 0.22 145 / 0.8)"
                  : "none",
              }}
            />
          </div>
          <div className="flex items-center gap-3 py-1">
            <Switch
              id="hm-blocker2"
              checked={highMid.blocker2}
              onCheckedChange={(v) => {
                onHighMid({ blocker2: v });
                fireRoute(`BASS BLOCK 2 \u2192 ${v ? "ON" : "OFF"} · CHAIN 2`);
              }}
              data-ocid="highmid.switch"
            />
            <Label htmlFor="hm-blocker2" className="cursor-pointer">
              <span className="font-mono text-[0.65rem] font-bold">
                BASS BLOCK 2
              </span>
            </Label>
            <div
              className="w-2 h-2 rounded-full ml-auto"
              style={{
                background: highMid.blocker2
                  ? "oklch(0.72 0.22 145)"
                  : "oklch(0.3 0.01 252)",
                boxShadow: highMid.blocker2
                  ? "0 0 6px oklch(0.72 0.22 145 / 0.8)"
                  : "none",
              }}
            />
          </div>
        </div>

        {/* Chip badges */}
        <div className="flex gap-2 flex-wrap pt-1">
          <span className="blockchain-badge">SMART TWEETER</span>
          <span className="blockchain-badge">ADVANCE CHIP</span>
          <span className="blockchain-badge">BC ROUTED</span>
        </div>
      </div>
    </section>
  );
}
