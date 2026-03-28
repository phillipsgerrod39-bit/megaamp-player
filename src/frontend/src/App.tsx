import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AppState } from "./backend.d";
import { BassAmpSection } from "./components/BassAmpSection";
import { BassEQ } from "./components/BassEQ";
import { CollapsibleCarPanel } from "./components/CollapsibleCarPanel";
import { FileDrawers } from "./components/FileDrawers";
import { GlobalGenerator } from "./components/GlobalGenerator";
import { HighMidAmpSection } from "./components/HighMidAmpSection";
import { HighMidEQ } from "./components/HighMidEQ";
import { LivePowerBus } from "./components/LivePowerBus";
import { MasterVolume } from "./components/MasterVolume";
import { MergeSwitch } from "./components/MergeSwitch";
import { MusicPlayer } from "./components/MusicPlayer";
import { ProtectionStack } from "./components/ProtectionStack";
import { WebApiLock } from "./components/WebApiLock";
import { RoutingProvider, useRouting } from "./context/RoutingContext";

const queryClient = new QueryClient();

const STARTUP_SEQUENCE = [
  { delay: 300, msg: "VOL BUS CONNECTED · ENGINE 1-4 STANDBY" },
  { delay: 1300, msg: "EQ BUS CONNECTED · ALL BANDS ROUTED" },
  { delay: 2300, msg: "PROTECTION STACK CONNECTED · BLOCKERS ACTIVE" },
  { delay: 3300, msg: "AMP BUS CONNECTED · HIGH MID + BASS ROUTED" },
  {
    delay: 4300,
    msg: "ALL SYSTEMS CONNECTED · BLOCKCHAIN LOCKED · READY",
  },
];

const SETTINGS_STORAGE_KEY = "megaamp_settings_v1";

interface EQBand {
  freq: string;
  value: number;
}

interface SavedSettings {
  masterVolume: number;
  sprPressure: number;
  mergeMode: "bass" | "highs" | "merge";
  hmFrequency: number;
  hmBlocker1: boolean;
  hmBlocker2: boolean;
  hmSoundStage: number;
  hmKick: number;
  hmThump: number;
  bassOmniField: boolean;
  bassCorrection: number;
  bassSoundStage: number;
  eqBands: EQBand[];
  bassEqBands: EQBand[];
  soundCenter: number;
}

function loadSettings(): Partial<SavedSettings> {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Partial<SavedSettings>;
  } catch {}
  return {};
}

function BookIntro({ onDone }: { onDone: () => void }) {
  const [flashing, setFlashing] = useState(false);

  const handleEnter = () => {
    setFlashing(true);
    setTimeout(onDone, 900);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <style>{`
        @keyframes shimmer-rotate {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes intro-pulse {
          0%, 100% { box-shadow: 0 0 20px oklch(0.78 0.16 85 / 0.4), 0 0 50px oklch(0.78 0.16 85 / 0.15); }
          50%       { box-shadow: 0 0 40px oklch(0.78 0.16 85 / 0.7), 0 0 90px oklch(0.78 0.16 85 / 0.35); }
        }
      `}</style>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.05 0.004 252), oklch(0.1 0.02 240), oklch(0.07 0.015 85), oklch(0.05 0.004 252))",
          backgroundSize: "400% 400%",
          animation: "shimmer-rotate 8s ease infinite",
        }}
      />
      {flashing && (
        <div
          className="absolute inset-0 z-10"
          style={{
            background: "oklch(0.95 0.04 85)",
            animation: "fadeOut 0.9s ease forwards",
          }}
        />
      )}
      <motion.div
        className="relative z-20 text-center px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="font-mono text-5xl font-black tracking-[0.25em] mb-1"
          style={{
            color: "oklch(0.78 0.16 85)",
            textShadow:
              "0 0 30px oklch(0.78 0.16 85 / 0.9), 0 0 60px oklch(0.78 0.16 85 / 0.4)",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          GERROD
        </motion.div>
        <motion.div
          className="font-mono text-2xl font-bold tracking-widest mb-2"
          style={{ color: "oklch(0.92 0.012 240)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          MegaAmp Player
        </motion.div>
        <motion.div
          className="font-mono text-sm tracking-[0.2em] mb-4"
          style={{ color: "oklch(0.6 0.15 240)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Engineer &middot; Designer &middot; Creator
        </motion.div>
        <motion.div
          className="font-mono text-[0.65rem] tracking-[0.18em] mb-8"
          style={{ color: "oklch(0.5 0.1 85)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          THE MOST ADVANCED VIRTUAL AMP EVER BUILT
        </motion.div>
        <motion.button
          type="button"
          className="font-mono text-base font-black tracking-[0.2em] px-10 py-4 rounded"
          style={{
            border: "1px solid oklch(0.65 0.16 85 / 0.8)",
            background: "oklch(0.16 0.012 85 / 0.5)",
            color: "oklch(0.88 0.16 85)",
            animation: "intro-pulse 2s ease-in-out infinite",
            cursor: "pointer",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          onClick={handleEnter}
          data-ocid="intro.primary_button"
        >
          ENTER
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function GlobalRoutingBar({ generatorOn }: { generatorOn: boolean }) {
  const { active, message } = useRouting();

  const idleMsg = generatorOn
    ? "ENGINE 1 · ENGINE 2 · ENGINE 3 · ENGINE 4 · ALL CHAINS LOCKED · BLOCKCHAIN SECURE"
    : "GENERATOR OFFLINE · ALL SYSTEMS HALTED";

  const displayMsg = active ? message : idleMsg;
  const isActive = active && generatorOn;

  return (
    <div
      className="sticky top-[53px] z-30 flex items-center gap-2 px-3 overflow-hidden"
      style={{
        height: "22px",
        background: "oklch(0.06 0.025 250)",
        borderBottom: "1px solid oklch(0.22 0.04 250 / 0.6)",
      }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: isActive
            ? "oklch(0.72 0.22 145)"
            : generatorOn
              ? "oklch(0.28 0.008 252)"
              : "oklch(0.55 0.2 25)",
          boxShadow: isActive
            ? "0 0 8px oklch(0.72 0.22 145), 0 0 16px oklch(0.72 0.22 145 / 0.5)"
            : "none",
          transition: "all 0.15s",
        }}
      />
      <span
        className="font-mono truncate"
        style={{
          fontSize: "0.44rem",
          letterSpacing: "0.1em",
          color: isActive
            ? "oklch(0.72 0.22 145)"
            : generatorOn
              ? "oklch(0.32 0.007 252)"
              : "oklch(0.6 0.18 25)",
          textShadow: isActive ? "0 0 8px oklch(0.72 0.22 145 / 0.6)" : "none",
          transition: "all 0.2s",
        }}
      >
        {displayMsg}
      </span>
    </div>
  );
}

function SprFilterPanel({
  sprPressure,
  onDecrease,
  onIncrease,
}: {
  sprPressure: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <section data-ocid="spr.panel">
      <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className="font-mono font-black tracking-[0.18em]"
            style={{
              fontSize: "0.62rem",
              color: "oklch(0.65 0.2 240)",
              textShadow: "0 0 10px oklch(0.65 0.2 240 / 0.5)",
            }}
          >
            SPR FILTER
          </span>
          <span
            className="blockchain-badge"
            style={{
              borderColor: "oklch(0.45 0.14 240 / 0.5)",
              color: "oklch(0.55 0.16 240)",
            }}
          >
            SIGNAL PRESSURE RESPONSE
          </span>
          <span
            className="blockchain-badge"
            style={{
              borderColor: "oklch(0.45 0.14 240 / 0.5)",
              color: "oklch(0.55 0.16 240)",
            }}
          >
            100\u2013200 UNITS
          </span>
          <span
            className="blockchain-badge"
            style={{
              borderColor: "oklch(0.45 0.14 240 / 0.5)",
              color: "oklch(0.55 0.16 240)",
            }}
          >
            NO GAIN
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="tap-btn"
            style={{
              color: "oklch(0.65 0.2 240)",
              borderColor: "oklch(0.45 0.14 240 / 0.5)",
            }}
            onClick={onDecrease}
            disabled={sprPressure <= 100}
            data-ocid="spr.secondary_button"
          >
            \u2212
          </button>
          <span
            className="font-mono font-black text-xl leading-none"
            style={{
              color: "oklch(0.78 0.2 240)",
              textShadow: "0 0 12px oklch(0.65 0.2 240 / 0.6)",
              minWidth: "3ch",
              textAlign: "center",
            }}
          >
            {sprPressure}
          </span>
          <button
            type="button"
            className="tap-btn"
            style={{
              color: "oklch(0.65 0.2 240)",
              borderColor: "oklch(0.45 0.14 240 / 0.5)",
            }}
            onClick={onIncrease}
            disabled={sprPressure >= 200}
            data-ocid="spr.primary_button"
          >
            +
          </button>
        </div>
      </div>
    </section>
  );
}

function SoundCenterPanel({
  value,
  onDecrease,
  onIncrease,
  onReset,
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onReset: () => void;
}) {
  const label =
    value === 0
      ? "CENTER"
      : value < 0
        ? `SURROUND L ${Math.abs(value)}`
        : `SURROUND R ${value}`;

  const barPct = ((value + 100) / 200) * 100;

  return (
    <section data-ocid="sound-center.panel" className="px-3 py-3 space-y-3">
      <div className="text-center">
        <div
          className="font-mono font-black leading-none"
          style={{
            fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
            color:
              value === 0
                ? "oklch(0.85 0.18 90)"
                : value < 0
                  ? "oklch(0.75 0.2 240)"
                  : "oklch(0.75 0.2 55)",
            textShadow:
              value === 0
                ? "0 0 16px oklch(0.85 0.18 90 / 0.6)"
                : value < 0
                  ? "0 0 16px oklch(0.65 0.2 240 / 0.6)"
                  : "0 0 16px oklch(0.75 0.2 55 / 0.6)",
          }}
        >
          {label}
        </div>
        <div
          className="font-mono text-[0.5rem] tracking-widest mt-1"
          style={{ color: "oklch(0.52 0.018 250)" }}
        >
          STEREO BALANCE · MIXING CENTER CONTROL
        </div>
      </div>

      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ background: "oklch(0.16 0.022 250)" }}
      >
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{ left: "50%", background: "oklch(0.35 0.04 250)" }}
        />
        <div
          className="absolute top-0 bottom-0 rounded-full transition-all"
          style={
            value === 0
              ? { left: "49%", width: "2%", background: "oklch(0.85 0.18 90)" }
              : value < 0
                ? {
                    left: `${barPct}%`,
                    right: "50%",
                    background: "oklch(0.65 0.2 240)",
                    boxShadow: "0 0 6px oklch(0.65 0.2 240 / 0.6)",
                  }
                : {
                    left: "50%",
                    right: `${100 - barPct}%`,
                    background: "oklch(0.75 0.2 55)",
                    boxShadow: "0 0 6px oklch(0.75 0.2 55 / 0.6)",
                  }
          }
        />
      </div>

      <div className="flex items-center gap-3 justify-center">
        <span
          className="font-mono text-[0.55rem] font-bold tracking-widest w-10 text-right"
          style={{ color: "oklch(0.55 0.15 240)" }}
        >
          L 100
        </span>
        <button
          type="button"
          className="tap-btn"
          style={{
            fontSize: "0.9rem",
            padding: "4px 14px",
            color: "oklch(0.75 0.2 240)",
            borderColor: "oklch(0.45 0.15 240 / 0.5)",
          }}
          onClick={onDecrease}
          disabled={value <= -100}
          data-ocid="sound-center.secondary_button"
        >
          ◀
        </button>
        <button
          type="button"
          className="tap-btn"
          style={{
            fontSize: "0.65rem",
            padding: "4px 10px",
            color: "oklch(0.88 0.18 90)",
            borderColor: "oklch(0.55 0.16 90 / 0.5)",
          }}
          onClick={onReset}
          data-ocid="sound-center.primary_button"
        >
          CENTER
        </button>
        <button
          type="button"
          className="tap-btn"
          style={{
            fontSize: "0.9rem",
            padding: "4px 14px",
            color: "oklch(0.75 0.2 55)",
            borderColor: "oklch(0.5 0.18 55 / 0.5)",
          }}
          onClick={onIncrease}
          disabled={value >= 100}
          data-ocid="sound-center.primary_button"
        >
          ▶
        </button>
        <span
          className="font-mono text-[0.55rem] font-bold tracking-widest w-10 text-left"
          style={{ color: "oklch(0.55 0.18 55)" }}
        >
          R 100
        </span>
      </div>

      <div
        className="font-mono text-[0.5rem] text-center tracking-[0.15em]"
        style={{ color: "oklch(0.42 0.015 250)" }}
      >
        STEREOPANNER NODE · WEB AUDIO API · BC ROUTED
      </div>
    </section>
  );
}

function AppCore({
  volumeRouteRef,
}: { volumeRouteRef: React.MutableRefObject<((msg: string) => void) | null> }) {
  const { fireRoute } = useRouting();
  const [showIntro, setShowIntro] = useState(true);
  const [generatorOn, setGeneratorOn] = useState(true);

  const savedSettings = loadSettings();

  const [masterVolume, setMasterVolume] = useState(
    savedSettings.masterVolume ?? 1,
  );
  const [sprPressure, setSprPressure] = useState(
    savedSettings.sprPressure ?? 150,
  );
  const [soundCenter, setSoundCenter] = useState(
    savedSettings.soundCenter ?? 0,
  );
  const [dbLevel, setDbLevel] = useState(-60);
  const [mergeMode, setMergeMode] = useState<"bass" | "highs" | "merge">(
    savedSettings.mergeMode ?? "bass",
  );

  const [hmFrequency, setHmFrequency] = useState(
    savedSettings.hmFrequency ?? 1150,
  );
  const [hmBlocker1, setHmBlocker1] = useState(
    savedSettings.hmBlocker1 ?? false,
  );
  const [hmBlocker2, setHmBlocker2] = useState(
    savedSettings.hmBlocker2 ?? false,
  );
  const [hmSoundStage, setHmSoundStage] = useState(
    savedSettings.hmSoundStage ?? 40,
  );
  const [hmKick, setHmKick] = useState(savedSettings.hmKick ?? 0);
  const [hmThump, setHmThump] = useState(savedSettings.hmThump ?? 0);

  const [bassOmniField, setBassOmniField] = useState(
    savedSettings.bassOmniField ?? false,
  );
  const [bassCorrection, setBassCorrection] = useState(
    savedSettings.bassCorrection ?? 0,
  );
  const [bassSoundStage, setBassSoundStage] = useState(
    savedSettings.bassSoundStage ?? 40,
  );

  const [eqBands, setEqBands] = useState<EQBand[]>(
    savedSettings.eqBands ?? [
      { freq: "KICK", value: 0 },
      { freq: "PUNCH", value: 0 },
      { freq: "THUMP", value: 0 },
      { freq: "VOICE", value: 0 },
      { freq: "MID", value: 0 },
      { freq: "TWEETER", value: 0 },
      { freq: "AIR", value: 0 },
    ],
  );
  const [bassEqBands, setBassEqBands] = useState<EQBand[]>(
    savedSettings.bassEqBands ?? [
      { freq: "SUB", value: 0 },
      { freq: "DEEP", value: 0 },
      { freq: "BASS", value: 0 },
      { freq: "KICK", value: 0 },
    ],
  );
  const [voiceDepth] = useState(0);
  const [speakerPushout] = useState(0);

  const [systemCleanRunning, setSystemCleanRunning] = useState(false);
  const [systemCleanPhase, setSystemCleanPhase] = useState<
    "idle" | "scanning" | "locked"
  >("idle");
  const [systemCleanTimeLeft, setSystemCleanTimeLeft] = useState(1200);
  const [systemCleanLogs, setSystemCleanLogs] = useState<string[]>([]);

  const startupFiredRef = useRef(false);
  useEffect(() => {
    if (showIntro || startupFiredRef.current) return;
    startupFiredRef.current = true;
    const timers = STARTUP_SEQUENCE.map(({ delay, msg }) =>
      setTimeout(() => fireRoute(msg), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [showIntro, fireRoute]);

  const triggerVerifyRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const settings: SavedSettings = {
      masterVolume,
      sprPressure,
      mergeMode,
      hmFrequency,
      hmBlocker1,
      hmBlocker2,
      hmSoundStage,
      hmKick,
      hmThump,
      bassOmniField,
      bassCorrection,
      bassSoundStage,
      eqBands,
      bassEqBands,
      soundCenter,
    };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [
    masterVolume,
    sprPressure,
    mergeMode,
    hmFrequency,
    hmBlocker1,
    hmBlocker2,
    hmSoundStage,
    hmKick,
    hmThump,
    bassOmniField,
    bassCorrection,
    bassSoundStage,
    eqBands,
    bassEqBands,
    soundCenter,
  ]);

  const handleVolumeIncrease = useCallback(() => {
    setMasterVolume((v) => {
      const newV = Math.min(1000, v + 1);
      fireRoute(`VOL ${newV} \u2192 VOL BUS · ENGINE 1 · LOCKED`);
      return newV;
    });
    triggerVerifyRef.current?.();
  }, [fireRoute]);

  const handleVolumeDecrease = useCallback(() => {
    setMasterVolume((v) => {
      const newV = Math.max(1, v - 1);
      fireRoute(`VOL ${newV} \u2192 VOL BUS · ENGINE 1 · LOCKED`);
      return newV;
    });
    triggerVerifyRef.current?.();
  }, [fireRoute]);

  const handleHighMid = useCallback(
    (
      update: Partial<{
        frequency: number;
        blocker1: boolean;
        blocker2: boolean;
        soundStage: number;
        kick: number;
        thump: number;
      }>,
    ) => {
      if (update.frequency !== undefined) {
        setHmFrequency(update.frequency);
        fireRoute(
          `HM FREQ ${update.frequency}Hz \u2192 ENGINE 1 · CROSSOVER LOCKED`,
        );
      }
      if (update.blocker1 !== undefined) {
        setHmBlocker1(update.blocker1);
        fireRoute(
          `BASS BLOCK 1 ${update.blocker1 ? "ON" : "OFF"} \u2192 HM AMP · ENGINE 2 · LOCKED`,
        );
      }
      if (update.blocker2 !== undefined) {
        setHmBlocker2(update.blocker2);
        fireRoute(
          `BASS BLOCK 2 ${update.blocker2 ? "ON" : "OFF"} \u2192 HM AMP · ENGINE 2 · LOCKED`,
        );
      }
      if (update.soundStage !== undefined) {
        setHmSoundStage(update.soundStage);
        fireRoute(
          `HM STAGE ${update.soundStage}FT \u2192 SOUNDSTAGE · CHAIN LOCKED`,
        );
      }
      if (update.kick !== undefined) {
        setHmKick(update.kick);
        fireRoute(`KICK ${update.kick} \u2192 BASS ENGINE · CHAIN 1 · LOCKED`);
      }
      if (update.thump !== undefined) {
        setHmThump(update.thump);
        fireRoute(
          `THUMP ${update.thump} \u2192 BASS ENGINE · CHAIN 2 · LOCKED`,
        );
      }
      triggerVerifyRef.current?.();
    },
    [fireRoute],
  );

  const handleBass = useCallback(
    (
      update: Partial<{
        omniField: boolean;
        correction: number;
        soundStage: number;
      }>,
    ) => {
      if (update.omniField !== undefined) {
        setBassOmniField(update.omniField);
        fireRoute(
          `OMNIFIELD ${update.omniField ? "ON" : "OFF"} \u2192 BASS AMP · ENGINE 3 · LOCKED`,
        );
      }
      if (update.correction !== undefined) {
        setBassCorrection(update.correction);
        fireRoute(
          `80HZ CORRECTION ${update.correction} \u2192 BASS CHAIN · STABILIZER LOCKED`,
        );
      }
      if (update.soundStage !== undefined) {
        setBassSoundStage(update.soundStage);
        fireRoute(
          `BASS STAGE ${update.soundStage}FT \u2192 OMNIFIELD · CHAIN LOCKED`,
        );
      }
      triggerVerifyRef.current?.();
    },
    [fireRoute],
  );

  const handleGeneratorToggle = useCallback(() => {
    setGeneratorOn((v) => {
      const newState = !v;
      fireRoute(
        `GENERATOR ${newState ? "ON" : "OFF"} \u2192 ALL SYSTEMS · CHAIN ROUTING LOCKED`,
      );
      return newState;
    });
    triggerVerifyRef.current?.();
  }, [fireRoute]);

  const handleMergeMode = (mode: "bass" | "highs" | "merge") => {
    setMergeMode(mode);
    const label =
      mode === "bass"
        ? "BASS ONLY"
        : mode === "highs"
          ? "TWEETERS ONLY"
          : "BOTH AMPS MERGED";
    fireRoute(`AMP SWITCH \u2192 ${label} · FUSE ARRAY · ENGINE 4 · LOCKED`);
    triggerVerifyRef.current?.();
  };

  const handleEqBand = useCallback((index: number, delta: number) => {
    setEqBands((prev) =>
      prev.map((b, i) =>
        i === index
          ? { ...b, value: Math.max(-14, Math.min(14, b.value + delta)) }
          : b,
      ),
    );
    triggerVerifyRef.current?.();
  }, []);

  const handleBassEqBand = useCallback((index: number, delta: number) => {
    setBassEqBands((prev) =>
      prev.map((b, i) =>
        i === index
          ? { ...b, value: Math.max(-14, Math.min(14, b.value + delta)) }
          : b,
      ),
    );
    triggerVerifyRef.current?.();
  }, []);

  const handleFrequencyData = useCallback((_bands: number[]) => {
    // intentionally no-op
  }, []);

  const getState = useCallback(
    (): AppState => ({
      masterVolume: BigInt(masterVolume),
      sprPressure: BigInt(sprPressure),
      mergeSwitch: mergeMode === "merge",
      voiceDepth: BigInt(voiceDepth),
      speakerPushout: BigInt(speakerPushout),
      eqBands: [],
      highMidAmpSettings: {
        frequency: BigInt(hmFrequency),
        blocker1: hmBlocker1,
        blocker2: hmBlocker2,
        soundStageDistance: BigInt(hmSoundStage),
        kick: BigInt(hmKick),
        thump: BigInt(hmThump),
      },
      bassAmpSettings: {
        omniField: bassOmniField,
        bassCorrection: BigInt(bassCorrection),
        soundStageDistance: BigInt(bassSoundStage),
      },
    }),
    [
      masterVolume,
      sprPressure,
      mergeMode,
      voiceDepth,
      speakerPushout,
      hmFrequency,
      hmBlocker1,
      hmBlocker2,
      hmSoundStage,
      hmKick,
      hmThump,
      bassOmniField,
      bassCorrection,
      bassSoundStage,
    ],
  );

  const applyState = useCallback((state: AppState) => {
    setMasterVolume(Number(state.masterVolume));
    setSprPressure(Number(state.sprPressure));
    setMergeMode(state.mergeSwitch ? "merge" : "bass");
    setHmFrequency(Number(state.highMidAmpSettings.frequency));
    setHmBlocker1(state.highMidAmpSettings.blocker1);
    setHmBlocker2(state.highMidAmpSettings.blocker2);
    setHmSoundStage(Number(state.highMidAmpSettings.soundStageDistance));
    setHmKick(Number(state.highMidAmpSettings.kick));
    setHmThump(Number(state.highMidAmpSettings.thump));
    setBassOmniField(state.bassAmpSettings.omniField);
    setBassCorrection(Number(state.bassAmpSettings.bassCorrection));
    setBassSoundStage(Number(state.bassAmpSettings.soundStageDistance));
  }, []);

  const highMidState = {
    frequency: hmFrequency,
    blocker1: hmBlocker1,
    blocker2: hmBlocker2,
    soundStage: hmSoundStage,
    kick: hmKick,
    thump: hmThump,
  };
  const bassState = {
    omniField: bassOmniField,
    correction: bassCorrection,
    soundStage: bassSoundStage,
  };

  const handleStartScan = () => {
    setSystemCleanRunning(true);
    setSystemCleanPhase("scanning");
    setSystemCleanTimeLeft(1200);
    const ts = new Date().toLocaleTimeString();
    setSystemCleanLogs([
      `[${ts}] System Clean 12.0 initiated -- 20-minute deep scan starting...`,
    ]);
  };

  const hmGain = (i: number) =>
    mergeMode === "bass" ? 0 : (eqBands[i]?.value ?? 0);
  const bsGain = (i: number) =>
    mergeMode === "highs" ? 0 : (bassEqBands[i]?.value ?? 0);
  const eqForPlayer = [
    { hz: 2500, gain: hmGain(0) },
    { hz: 800, gain: hmGain(1) },
    { hz: 400, gain: hmGain(2) },
    { hz: 600, gain: hmGain(3) },
    { hz: 1500, gain: hmGain(4) },
    { hz: 12000, gain: hmGain(5) * 0.45 },
    { hz: 16000, gain: hmGain(6) * 0.4 },
    { hz: 40, gain: bsGain(0) },
    { hz: 60, gain: bsGain(1) },
    { hz: 200, gain: bsGain(2) },
    { hz: 80, gain: bsGain(3) },
  ];

  const eqBassBlockerActive = [...eqBands, ...bassEqBands].some(
    (b) => b.value >= 8,
  );
  const eqDistortionBlockerActive = [...eqBands, ...bassEqBands].some(
    (b) => b.value >= 12,
  );

  const handleSprDecrease = useCallback(() => {
    setSprPressure((v) => {
      const next = Math.max(100, v - 1);
      fireRoute(`SPR ${next} \u2192 PRESSURE CHAIN · LOCKED`);
      return next;
    });
    triggerVerifyRef.current?.();
  }, [fireRoute]);

  const handleSprIncrease = useCallback(() => {
    setSprPressure((v) => {
      const next = Math.min(200, v + 1);
      fireRoute(`SPR ${next} \u2192 PRESSURE CHAIN · LOCKED`);
      return next;
    });
    triggerVerifyRef.current?.();
  }, [fireRoute]);

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{ background: "oklch(0.05 0.005 252)" }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.35 0.12 240 / 0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 60%, oklch(0.4 0.14 305 / 0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 30% at 20% 70%, oklch(0.4 0.12 195 / 0.07) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 50% 100%, oklch(0.38 0.14 85 / 0.06) 0%, transparent 70%)",
        }}
      />
      <AnimatePresence>
        {showIntro && <BookIntro onDone={() => setShowIntro(false)} />}
      </AnimatePresence>

      <header
        className="sticky top-0 z-40 backdrop-blur"
        style={{
          background: "oklch(0.06 0.025 250 / 0.96)",
          borderBottom: "1px solid oklch(0.22 0.04 250 / 0.8)",
          position: "relative",
          zIndex: 40,
        }}
        data-ocid="app.panel"
      >
        <div className="max-w-4xl mx-auto px-3 py-2 flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-2 min-w-0 overflow-hidden flex-1">
            <div
              className="font-mono font-black text-lg tracking-widest shrink-0"
              style={{
                color: "oklch(0.78 0.16 85)",
                textShadow: "0 0 15px oklch(0.78 0.16 85 / 0.6)",
              }}
            >
              MegaAmp
            </div>
            <div className="font-mono text-xs text-muted-foreground tracking-[0.2em] shrink-0">
              PLAYER
            </div>
            <span className="blockchain-badge shrink-0">LIVE</span>
            <span
              className="blockchain-badge hidden sm:inline shrink-0"
              style={{
                opacity: generatorOn ? 1 : 0.35,
                transition: "opacity 0.3s",
              }}
            >
              ENGINE-ROUTED
            </span>
            <span
              className="blockchain-badge hidden sm:inline shrink-0"
              style={{
                borderColor: generatorOn
                  ? "oklch(0.55 0.18 145 / 0.7)"
                  : "oklch(0.4 0.1 25 / 0.5)",
                color: generatorOn
                  ? "oklch(0.72 0.22 145)"
                  : "oklch(0.5 0.12 25)",
                opacity: generatorOn ? 1 : 0.45,
                transition: "all 0.3s",
              }}
            >
              {generatorOn ? "GEN POWERED" : "GEN OFFLINE"}
            </span>
          </div>
        </div>
      </header>

      <GlobalRoutingBar generatorOn={generatorOn} />

      <main
        className="max-w-4xl mx-auto px-3 py-4 space-y-3 overflow-hidden"
        style={{ position: "relative", zIndex: 1 }}
      >
        <CollapsibleCarPanel
          title="GLOBAL GENERATOR"
          color="gold"
          icon="⚡"
          dataOcid="generator.panel"
          defaultOpen={true}
        >
          <GlobalGenerator
            masterVolume={masterVolume}
            generatorOn={generatorOn}
            onGeneratorToggle={handleGeneratorToggle}
          />
        </CollapsibleCarPanel>

        <div
          className={
            generatorOn ? undefined : "pointer-events-none select-none"
          }
          style={{
            opacity: generatorOn ? 1 : 0.28,
            transition: "opacity 0.4s ease",
          }}
        >
          <div className="space-y-3">
            <CollapsibleCarPanel
              title="MUSIC PLAYER"
              color="orange"
              icon="♪"
              dataOcid="musicplayer.panel"
              defaultOpen={true}
            >
              <div className="p-3">
                <MusicPlayer
                  onFrequencyData={handleFrequencyData}
                  volume={masterVolume}
                  generatorOn={generatorOn}
                  highMidFrequency={hmFrequency}
                  bassBlock1={hmBlocker1}
                  bassBlock2={hmBlocker2}
                  kick={hmKick}
                  thump={hmThump}
                  bassCorrection={bassCorrection > 0}
                  eqBands={eqForPlayer}
                  eqBassBlockerActive={eqBassBlockerActive}
                  eqDistortionBlockerActive={eqDistortionBlockerActive}
                  sprPressure={sprPressure}
                  onDbLevel={setDbLevel}
                  omniField={bassOmniField}
                  soundStage={bassSoundStage}
                  centerPan={soundCenter}
                  mergeMode={mergeMode}
                  bassEqLevel={Math.round(
                    (Math.max(0, Math.max(...bassEqBands.map((b) => b.value))) /
                      14) *
                      100,
                  )}
                />
              </div>
            </CollapsibleCarPanel>
            <WebApiLock
              generatorOn={generatorOn}
              volume={masterVolume}
              triggerVerifyRef={triggerVerifyRef}
            />
            <CollapsibleCarPanel
              title="LIVE POWER BUS"
              color="gold"
              icon="⚡"
              dataOcid="power-bus.panel"
            >
              <LivePowerBus masterVolume={masterVolume} />
            </CollapsibleCarPanel>
            <CollapsibleCarPanel
              title="PROTECTION STACK"
              color="green"
              icon="🛡"
              dataOcid="protection.panel"
              defaultOpen={true}
            >
              <ProtectionStack
                masterVolume={masterVolume}
                bassEQLevel={Math.round(
                  (Math.max(0, Math.max(...bassEqBands.map((b) => b.value))) /
                    14) *
                    100,
                )}
              />
            </CollapsibleCarPanel>
            <CollapsibleCarPanel
              title="MASTER VOLUME"
              color="gold"
              icon="◎"
              dataOcid="volume.panel"
            >
              <MasterVolume
                volume={masterVolume}
                onIncrease={handleVolumeIncrease}
                onDecrease={handleVolumeDecrease}
                generatorOn={generatorOn}
              />
            </CollapsibleCarPanel>
            <CollapsibleCarPanel
              title="MIXING CENTER"
              color="gold"
              icon="◈"
              dataOcid="sound-center.panel"
            >
              <SoundCenterPanel
                value={soundCenter}
                onDecrease={() => setSoundCenter((v) => Math.max(-100, v - 5))}
                onIncrease={() => setSoundCenter((v) => Math.min(100, v + 5))}
                onReset={() => setSoundCenter(0)}
              />
            </CollapsibleCarPanel>
            <CollapsibleCarPanel
              title="SPR FILTER"
              color="purple"
              icon="〜"
              dataOcid="spr.panel"
            >
              <SprFilterPanel
                sprPressure={sprPressure}
                onDecrease={handleSprDecrease}
                onIncrease={handleSprIncrease}
              />
            </CollapsibleCarPanel>
            <CollapsibleCarPanel
              title="HIGH MID AMP"
              color="blue"
              icon="♦"
              dataOcid="highmid.panel"
            >
              <HighMidAmpSection
                highMid={highMidState}
                onHighMid={handleHighMid}
                masterVolume={masterVolume}
              />
            </CollapsibleCarPanel>
            <CollapsibleCarPanel
              title="HIGH MID EQ"
              color="blue"
              icon="≡"
              dataOcid="eq.panel"
            >
              <HighMidEQ
                eqBands={eqBands}
                onEqBand={handleEqBand}
                masterVolume={masterVolume}
              />
            </CollapsibleCarPanel>
            <CollapsibleCarPanel
              title="AMP MERGE"
              color="blue"
              icon="↔"
              dataOcid="merge.panel"
            >
              <MergeSwitch
                mergeMode={mergeMode}
                onMergeMode={handleMergeMode}
              />
            </CollapsibleCarPanel>
            <CollapsibleCarPanel
              title="BASS AMP"
              color="cyan"
              icon="◈"
              dataOcid="bassamp.panel"
            >
              <BassAmpSection
                bass={bassState}
                onBass={handleBass}
                highMid={highMidState}
                onHighMid={handleHighMid}
                masterVolume={masterVolume}
              />
            </CollapsibleCarPanel>
            <CollapsibleCarPanel
              title="BASS EQ"
              color="cyan"
              icon="≡"
              dataOcid="bass-eq.panel"
            >
              <BassEQ
                bassEqBands={bassEqBands}
                onBassEqBand={handleBassEqBand}
              />
            </CollapsibleCarPanel>
          </div>
        </div>
      </main>

      <FileDrawers
        externalLogRef={volumeRouteRef}
        systemCleanPhase={systemCleanPhase}
        systemCleanTimeLeft={systemCleanTimeLeft}
        systemCleanLogs={systemCleanLogs}
        systemCleanRunning={systemCleanRunning}
        onStartScan={handleStartScan}
        onPhaseChange={setSystemCleanPhase}
        onTimeLeftChange={setSystemCleanTimeLeft}
        onLog={(entry) => setSystemCleanLogs((prev) => [...prev, entry])}
        getState={getState}
        applyState={applyState}
        db={dbLevel}
      />

      <footer className="max-w-4xl mx-auto px-3 py-4 text-center">
        <span className="font-mono text-[0.5rem] text-muted-foreground">
          \u00a9 {new Date().getFullYear()}. Built with \u2665 using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            caffeine.ai
          </a>
        </span>
      </footer>

      <Toaster theme="dark" />
    </div>
  );
}

function AppInner() {
  const volumeRouteRef = useRef<((msg: string) => void) | null>(null);
  const handleLog = useCallback(
    (msg: string) => volumeRouteRef.current?.(msg),
    [],
  );
  return (
    <RoutingProvider onLog={handleLog}>
      <AppCore volumeRouteRef={volumeRouteRef} />
    </RoutingProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
