import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EQBandCol } from "./EQBand";
import { TapButton } from "./TapButton";

interface EQBand {
  freq: string;
  value: number;
}

interface HighMidState {
  frequency: number;
  blocker1: boolean;
  blocker2: boolean;
  soundStage: number;
  kick: number;
  thump: number;
}

interface BassState {
  omniField: boolean;
  correction: number;
  soundStage: number;
}

interface AmpSectionProps {
  activeTab: "highMid" | "bass";
  onTabChange: (tab: "highMid" | "bass") => void;
  mergeSwitch: boolean;
  onMergeToggle: () => void;
  highMid: HighMidState;
  onHighMid: (update: Partial<HighMidState>) => void;
  bass: BassState;
  onBass: (update: Partial<BassState>) => void;
  eqBands: EQBand[];
  onEqBand: (index: number, delta: number) => void;
  bassEqBands: EQBand[];
  onBassEqBand: (index: number, delta: number) => void;
  voiceDepth: number;
  onVoiceDepth: (delta: number) => void;
  speakerPushout: number;
  onSpeakerPushout: (delta: number) => void;
}

function TapControl({
  label,
  value,
  onIncrease,
  onDecrease,
  min,
  max,
  unit = "",
  color = "gold",
}: {
  label: string;
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min: number;
  max: number;
  unit?: string;
  color?: "gold" | "blue" | "green";
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[0.6rem] text-muted-foreground w-28 shrink-0">
        {label}
      </span>
      <TapButton
        onPress={onDecrease}
        label="-"
        disabled={value <= min}
        color={color}
        className="px-2.5 py-1"
      />
      <span
        className="font-mono text-sm font-bold w-16 text-center"
        style={{
          color:
            color === "gold"
              ? "oklch(0.78 0.16 85)"
              : color === "blue"
                ? "oklch(0.65 0.2 240)"
                : "oklch(0.72 0.22 145)",
        }}
      >
        {value}
        {unit}
      </span>
      <TapButton
        onPress={onIncrease}
        label="+"
        disabled={value >= max}
        color={color}
        className="px-2.5 py-1"
      />
    </div>
  );
}

function ToggleRow({
  label,
  sub,
  checked,
  onToggle,
  id,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onToggle: () => void;
  id: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onToggle}
        data-ocid="amp.switch"
      />
      <Label htmlFor={id} className="flex flex-col cursor-pointer">
        <span className="font-mono text-[0.65rem] font-bold text-foreground/90">
          {label}
        </span>
        {sub && (
          <span className="font-mono text-[0.55rem] text-muted-foreground">
            {sub}
          </span>
        )}
      </Label>
      <div
        className="w-2 h-2 rounded-full ml-auto"
        style={{
          background: checked ? "oklch(0.72 0.22 145)" : "oklch(0.3 0.01 252)",
          boxShadow: checked ? "0 0 6px oklch(0.72 0.22 145 / 0.8)" : "none",
        }}
      />
    </div>
  );
}

export function AmpSection({
  activeTab,
  onTabChange,
  mergeSwitch,
  onMergeToggle,
  highMid,
  onHighMid,
  bass,
  onBass,
  eqBands,
  onEqBand,
  bassEqBands,
  onBassEqBand,
  voiceDepth,
  onVoiceDepth,
  speakerPushout,
  onSpeakerPushout,
}: AmpSectionProps) {
  return (
    <section className="panel" data-ocid="amp.panel">
      {/* Tab Header with Merge */}
      <div className="flex items-center border-b border-border">
        <button
          type="button"
          className={`flex-1 py-2.5 font-mono text-[0.65rem] font-bold tracking-wider transition-all ${
            activeTab === "highMid"
              ? "bg-[oklch(0.18_0.015_85/0.3)] text-[oklch(0.78_0.16_85)] border-b-2 border-[oklch(0.78_0.16_85)]"
              : "text-muted-foreground hover:text-foreground/70"
          }`}
          onClick={() => onTabChange("highMid")}
          data-ocid="amp.tab"
        >
          HIGH MID AMP
        </button>

        <div className="flex flex-col items-center px-3 border-x border-border py-2">
          <span className="font-mono text-[0.5rem] text-muted-foreground mb-1">
            MERGE
          </span>
          <Switch
            checked={mergeSwitch}
            onCheckedChange={onMergeToggle}
            data-ocid="amp.switch"
          />
          <span
            className="font-mono text-[0.5rem] font-bold mt-1"
            style={{
              color: mergeSwitch
                ? "oklch(0.72 0.22 145)"
                : "oklch(0.45 0.01 252)",
            }}
          >
            {mergeSwitch ? "LOCKED" : "OFF"}
          </span>
        </div>

        <button
          type="button"
          className={`flex-1 py-2.5 font-mono text-[0.65rem] font-bold tracking-wider transition-all ${
            activeTab === "bass"
              ? "bg-[oklch(0.15_0.015_240/0.3)] text-[oklch(0.65_0.2_240)] border-b-2 border-[oklch(0.65_0.2_240)]"
              : "text-muted-foreground hover:text-foreground/70"
          }`}
          onClick={() => onTabChange("bass")}
          data-ocid="amp.tab"
        >
          BASS AMP
        </button>
      </div>

      {mergeSwitch && (
        <div className="px-3 py-1.5 bg-[oklch(0.18_0.015_145/0.2)] border-b border-[oklch(0.45_0.14_145/0.4)]">
          <span className="font-mono text-[0.6rem] text-[oklch(0.72_0.22_145)] tracking-widest">
            LOCKED -- BOTH AMPS MOVE AS ONE UNIT · BLOCKCHAIN SYNCHRONIZED
          </span>
        </div>
      )}

      {/* HIGH MID AMP TAB */}
      {activeTab === "highMid" && (
        <div className="p-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.6rem] text-[oklch(0.78_0.16_85)] font-bold">
              4-CHANNEL
            </span>
            <span className="blockchain-badge">
              GOLD PHANTOM MIDS &amp; HIGHS
            </span>
            <span className="blockchain-badge">1000-2000Hz</span>
            <span className="blockchain-badge">FPGA CROSSOVER · NO dB</span>
          </div>

          <TapControl
            label="FREQUENCY"
            value={highMid.frequency}
            onIncrease={() =>
              onHighMid({ frequency: Math.min(2000, highMid.frequency + 10) })
            }
            onDecrease={() =>
              onHighMid({ frequency: Math.max(1000, highMid.frequency - 10) })
            }
            min={1000}
            max={2000}
            unit="Hz"
            color="gold"
          />

          <TapControl
            label="SOUNDSTAGE"
            value={highMid.soundStage}
            onIncrease={() =>
              onHighMid({ soundStage: Math.min(70, highMid.soundStage + 1) })
            }
            onDecrease={() =>
              onHighMid({ soundStage: Math.max(30, highMid.soundStage - 1) })
            }
            min={30}
            max={70}
            unit="ft"
            color="gold"
          />

          <div className="border-t border-border pt-2 space-y-0.5">
            <ToggleRow
              id="blocker1"
              label="BLOCKER 1"
              sub="CUTS BELOW 120Hz"
              checked={highMid.blocker1}
              onToggle={() => onHighMid({ blocker1: !highMid.blocker1 })}
            />
            <ToggleRow
              id="blocker2"
              label="BLOCKER 2"
              sub="CUTS BELOW 80Hz"
              checked={highMid.blocker2}
              onToggle={() => onHighMid({ blocker2: !highMid.blocker2 })}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="blockchain-badge">SMART TWEETER CHIP</span>
            <span className="blockchain-badge">SMART ADVANCE CHIP</span>
            <span className="blockchain-badge">PUSH-PULL SOUNDSTAGE</span>
          </div>

          {/* High Mid 7-Band EQ */}
          <div className="border-t border-border pt-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="panel-title">7-BAND VERTICAL EQ</span>
              <span className="blockchain-badge">BLOCKCHAIN ROUTED</span>
              <span
                className="blockchain-badge"
                style={{
                  borderColor: "oklch(0.5 0.14 85 / 0.5)",
                  color: "oklch(0.72 0.16 85)",
                }}
              >
                HIGH MID
              </span>
            </div>
            <div
              className="flex gap-0.5 overflow-hidden w-full"
              data-ocid="eq.panel"
            >
              {eqBands.map((band, i) => (
                <EQBandCol
                  key={band.freq}
                  frequency={band.freq}
                  value={band.value}
                  onChange={(delta) => onEqBand(i, delta)}
                  index={i}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
              <TapControl
                label="VOICE DEPTH"
                value={voiceDepth}
                onIncrease={() => onVoiceDepth(1)}
                onDecrease={() => onVoiceDepth(-1)}
                min={0}
                max={20}
                color="gold"
              />
              <TapControl
                label="SPEAKER PUSHOUT"
                value={speakerPushout}
                onIncrease={() => onSpeakerPushout(1)}
                onDecrease={() => onSpeakerPushout(-1)}
                min={0}
                max={20}
                color="gold"
              />
            </div>
          </div>
        </div>
      )}

      {/* BASS AMP TAB */}
      {activeTab === "bass" && (
        <div className="p-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.6rem] text-[oklch(0.65_0.2_240)] font-bold">
              1-CHANNEL
            </span>
            <span className="blockchain-badge">70,000,000 ×5 POWER</span>
            <span className="blockchain-badge">OmniField</span>
          </div>

          <TapControl
            label="KICK"
            value={highMid.kick}
            onIncrease={() =>
              onHighMid({ kick: Math.min(20, highMid.kick + 1) })
            }
            onDecrease={() =>
              onHighMid({ kick: Math.max(0, highMid.kick - 1) })
            }
            min={0}
            max={20}
            color="blue"
          />
          <TapControl
            label="THUMP"
            value={highMid.thump}
            onIncrease={() =>
              onHighMid({ thump: Math.min(20, highMid.thump + 1) })
            }
            onDecrease={() =>
              onHighMid({ thump: Math.max(0, highMid.thump - 1) })
            }
            min={0}
            max={20}
            color="blue"
          />
          <TapControl
            label="BASS CORRECTION"
            value={bass.correction}
            onIncrease={() =>
              onBass({ correction: Math.min(20, bass.correction + 1) })
            }
            onDecrease={() =>
              onBass({ correction: Math.max(0, bass.correction - 1) })
            }
            min={0}
            max={20}
            color="blue"
          />
          <TapControl
            label="SOUNDSTAGE"
            value={bass.soundStage}
            onIncrease={() =>
              onBass({ soundStage: Math.min(70, bass.soundStage + 1) })
            }
            onDecrease={() =>
              onBass({ soundStage: Math.max(30, bass.soundStage - 1) })
            }
            min={30}
            max={70}
            unit="ft"
            color="blue"
          />

          <div className="border-t border-border pt-2 space-y-0.5">
            <ToggleRow
              id="bass80hz"
              label="80Hz BASS CORRECTION"
              sub="SIGNAL STABILIZER (NOT dB)"
              checked={bass.correction > 0}
              onToggle={() =>
                onBass({ correction: bass.correction > 0 ? 0 : 10 })
              }
            />
            <ToggleRow
              id="omnifield"
              label="OMNIFIELD SOUNDFIELD"
              sub="OMNIDIRECTIONAL ROOM FILL"
              checked={bass.omniField}
              onToggle={() => onBass({ omniField: !bass.omniField })}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="blockchain-badge">
              PUSH-PULL SOUNDSTAGE 30-70ft
            </span>
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
          </div>

          {/* Bass 7-Band EQ */}
          <div className="border-t border-border pt-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="panel-title">7-BAND VERTICAL EQ</span>
              <span
                className="blockchain-badge"
                style={{
                  borderColor: "oklch(0.45 0.14 240 / 0.6)",
                  color: "oklch(0.65 0.2 240)",
                }}
              >
                BLOCKCHAIN ROUTED
              </span>
              <span
                className="blockchain-badge"
                style={{
                  borderColor: "oklch(0.45 0.14 240 / 0.5)",
                  color: "oklch(0.65 0.2 240)",
                }}
              >
                BASS
              </span>
            </div>
            <div
              className="flex gap-0.5 overflow-hidden w-full"
              data-ocid="bass-eq.panel"
            >
              {bassEqBands.map((band, i) => (
                <EQBandCol
                  key={`bass-${band.freq}`}
                  frequency={band.freq}
                  value={band.value}
                  onChange={(delta) => onBassEqBand(i, delta)}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
