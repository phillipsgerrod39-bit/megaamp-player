import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useRouting } from "../context/RoutingContext";

interface MasterVolumeProps {
  volume: number;
  onIncrease: () => void;
  onDecrease: () => void;
  generatorOn?: boolean;
}

export function MasterVolume({
  volume,
  onIncrease,
  onDecrease,
  generatorOn = true,
}: MasterVolumeProps) {
  const { fireRoute, active } = useRouting();
  const prevVolume = useRef(volume);
  const volumeRef = useRef(volume);
  const fireRouteRef = useRef(fireRoute);
  const lastActiveTimeRef = useRef(Date.now());
  const [verifyPulse, setVerifyPulse] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs in sync — never stale in intervals
  volumeRef.current = volume;
  fireRouteRef.current = fireRoute;

  // Track last time routing was active (for 8s idle re-verify)
  useEffect(() => {
    if (active) {
      lastActiveTimeRef.current = Date.now();
    }
  }, [active]);

  // Fire route on every volume tap
  useEffect(() => {
    if (prevVolume.current === volume) return;
    const direction = volume > prevVolume.current ? "UP" : "DN";
    prevVolume.current = volume;
    const engine = (volume % 4) + 1;
    const chain = (volume % 5) + 1;
    fireRoute(
      `BC VOL ${direction} \u2192 ${volume} · ENG ${engine} · CHAIN ${chain} · CONFIRMED`,
    );
  }, [volume, fireRoute]);

  // Auto-verify every 5s + re-verify if idle >8s — all via refs, never stale
  useEffect(() => {
    const pulse = () => {
      const vol = volumeRef.current;
      const eng = (vol % 4) + 1;
      const chn = (vol % 5) + 1;
      setVerifyPulse(true);
      fireRouteRef.current(
        `BC LOCKED · VOL ROUTED · ENG ${eng} · CHAIN ${chn} · 100%`,
      );
      lastActiveTimeRef.current = Date.now();
      setTimeout(() => setVerifyPulse(false), 600);
    };

    const verifyId = setInterval(pulse, 5000);
    const watchId = setInterval(() => {
      if (Date.now() - lastActiveTimeRef.current > 8000) {
        pulse();
      }
    }, 2000);

    return () => {
      clearInterval(verifyId);
      clearInterval(watchId);
    };
  }, []);

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, []);

  const triggerCooldown = () => {
    setIsCoolingDown(true);
    if (cooldownRef.current) clearTimeout(cooldownRef.current);
    cooldownRef.current = setTimeout(() => {
      setIsCoolingDown(false);
    }, 300);
  };

  const handleDecrease = () => {
    if (isCoolingDown || volume <= 1 || !generatorOn) return;
    onDecrease();
    triggerCooldown();
  };

  const handleIncrease = () => {
    if (isCoolingDown || volume >= 1000 || !generatorOn) return;
    onIncrease();
    triggerCooldown();
  };

  const getColor = () => {
    if (!generatorOn)
      return {
        text: "text-muted-foreground",
        glow: "",
        label: "OFFLINE",
        accent: "oklch(0.45 0.01 252)",
      };
    if (volume >= 800)
      return {
        text: "text-[oklch(0.63_0.24_25)]",
        glow: "glow-red text-glow-red",
        label: "DANGER ZONE",
        accent: "oklch(0.63 0.24 25)",
      };
    if (volume >= 500)
      return {
        text: "text-[oklch(0.78_0.17_65)]",
        glow: "glow-amber text-glow-gold",
        label: "HIGH DRIVE",
        accent: "oklch(0.78 0.17 65)",
      };
    return {
      text: "text-[oklch(0.72_0.22_145)]",
      glow: "glow-green text-glow-green",
      label: "CLEAN DRIVE",
      accent: "oklch(0.72 0.22 145)",
    };
  };

  const { text, glow, label, accent } = getColor();
  const pct = Math.round((volume / 1000) * 100);
  const engine = (volume % 4) + 1;
  const chain = (volume % 5) + 1;
  const isLive = (active || verifyPulse) && generatorOn;

  const btnColor = volume >= 800 ? "red" : volume >= 500 ? "gold" : "green";
  const btnColorStyle = {
    red: {
      border: "oklch(0.45 0.18 25 / 0.6)",
      color: "oklch(0.63 0.24 25)",
      bg: "oklch(0.18 0.012 25)",
    },
    gold: {
      border: "oklch(0.55 0.12 85 / 0.6)",
      color: "oklch(0.78 0.16 85)",
      bg: "oklch(0.2 0.015 85)",
    },
    green: {
      border: "oklch(0.45 0.14 145 / 0.6)",
      color: "oklch(0.72 0.22 145)",
      bg: "oklch(0.18 0.012 145)",
    },
  }[btnColor];

  const decDisabled = isCoolingDown || volume <= 1 || !generatorOn;
  const incDisabled = isCoolingDown || volume >= 1000 || !generatorOn;

  return (
    <section className="" data-ocid="volume.panel">
      <div className="p-4">
        <div className="text-center mb-3">
          <div className="panel-title mb-1">MASTER VOLUME &mdash; {label}</div>
          <div
            className={`font-mono font-black leading-none transition-all ${text} ${glow}`}
            style={{ fontSize: "clamp(3rem, 10vw, 6rem)" }}
          >
            {volume}
          </div>
          <div className="font-mono text-[0.55rem] text-muted-foreground mt-1">
            / 1000
          </div>
        </div>

        {/* HARD REINFORCED status strip — always visible */}
        <div
          className="mb-3 px-2 py-1.5 rounded flex items-center justify-center gap-1.5"
          style={{
            background: "oklch(0.13 0.05 85 / 0.6)",
            border: "1px solid oklch(0.55 0.18 85 / 0.7)",
            boxShadow:
              "0 0 10px oklch(0.55 0.18 85 / 0.3), inset 0 0 6px oklch(0.55 0.18 85 / 0.1)",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
            style={{
              background: "oklch(0.78 0.16 85)",
              boxShadow: "0 0 6px oklch(0.78 0.16 85)",
            }}
          />
          <span
            className="font-mono font-black tracking-widest text-center"
            style={{
              fontSize: "0.5rem",
              color: "oklch(0.78 0.16 85)",
              textShadow: "0 0 8px oklch(0.78 0.16 85 / 0.6)",
              letterSpacing: "0.12em",
            }}
          >
            VOL BUS · SIGNAL PULL FILTERS · NOISE FILTER · BATTERY BANK · ALL
            ACTIVE
          </span>
        </div>

        <div className="flex gap-3 justify-center items-center">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={decDisabled}
            data-ocid="volume.secondary_button"
            className={cn(
              "tap-btn select-none text-base px-8 py-3",
              decDisabled && "opacity-40 cursor-not-allowed",
            )}
            style={{
              borderColor: btnColorStyle.border,
              color: btnColorStyle.color,
            }}
          >
            TAP -
          </button>

          <div className="flex flex-col items-center">
            <div
              className="rounded-full transition-all"
              style={{
                width: isLive ? "14px" : "8px",
                height: isLive ? "14px" : "8px",
                background: accent,
                boxShadow: isLive
                  ? `0 0 16px ${accent}, 0 0 32px ${accent}88, 0 0 48px ${accent}44`
                  : `0 0 6px ${accent}66`,
                transition: "all 0.15s",
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleIncrease}
            disabled={incDisabled}
            data-ocid="volume.primary_button"
            className={cn(
              "tap-btn select-none text-base px-8 py-3",
              incDisabled && "opacity-40 cursor-not-allowed",
            )}
            style={{
              borderColor: btnColorStyle.border,
              color: btnColorStyle.color,
            }}
          >
            TAP +
          </button>
        </div>

        {/* Blockchain routing status */}
        <div
          className="mt-3 px-3 py-2 rounded flex items-center justify-center gap-2"
          style={{
            background: !generatorOn
              ? "oklch(0.10 0.02 25 / 0.35)"
              : isLive
                ? "oklch(0.12 0.04 145 / 0.7)"
                : "oklch(0.10 0.014 145 / 0.35)",
            border: !generatorOn
              ? "1px solid oklch(0.45 0.15 25 / 0.6)"
              : isLive
                ? "1px solid oklch(0.55 0.18 145 / 0.8)"
                : "1px solid oklch(0.42 0.12 145 / 0.5)",
            boxShadow: !generatorOn
              ? "none"
              : isLive
                ? "0 0 12px oklch(0.72 0.22 145 / 0.4), inset 0 0 8px oklch(0.72 0.22 145 / 0.1)"
                : "none",
            transition: "all 0.2s",
          }}
        >
          <span style={{ fontSize: "0.9rem" }}>
            {!generatorOn ? "\u26a0\ufe0f" : isLive ? "\u2b21" : "\ud83d\udd12"}
          </span>
          <span
            className="font-mono font-bold tracking-widest"
            style={{
              fontSize: "0.62rem",
              color: !generatorOn
                ? "oklch(0.65 0.18 25)"
                : isLive
                  ? "oklch(0.82 0.22 145)"
                  : "oklch(0.62 0.14 145)",
              textShadow: !generatorOn
                ? "none"
                : isLive
                  ? "0 0 8px oklch(0.72 0.22 145), 0 0 16px oklch(0.72 0.22 145 / 0.5)"
                  : "none",
              letterSpacing: "0.15em",
              transition: "all 0.2s",
            }}
          >
            {!generatorOn
              ? "\u26a0\ufe0f GENERATOR OFFLINE \u2014 ALL SYSTEMS HALTED"
              : isLive
                ? `\u2b21 BC ROUTING · ENG ${engine} · CHAIN ${chain} · CONFIRMED`
                : `\ud83d\udd12 BC LOCKED · VERIFIED · ENG ${engine} · CHAIN ${chain}`}
          </span>
        </div>

        <div className="mt-2 h-1.5 bg-[oklch(0.22_0.01_252)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(volume / 1000) * 100}%`,
              background: generatorOn ? accent : "oklch(0.3 0.01 252)",
              boxShadow: isLive ? `0 0 6px ${accent}` : "none",
              transition: "width 0.1s, box-shadow 0.15s",
            }}
          />
        </div>

        {/* Live connections status */}
        <div
          className="mt-2 px-2 py-1.5 rounded flex items-center gap-1 overflow-hidden"
          style={{
            background: "oklch(0.10 0.008 145 / 0.3)",
            border: "1px solid oklch(0.35 0.1 145 / 0.4)",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: isLive
                ? "oklch(0.72 0.22 145)"
                : "oklch(0.52 0.12 145)",
              boxShadow: isLive ? "0 0 6px oklch(0.72 0.22 145)" : "none",
              transition: "all 0.15s",
            }}
          />
          <span
            className="font-mono truncate"
            style={{
              fontSize: "0.46rem",
              letterSpacing: "0.1em",
              color: isLive ? "oklch(0.72 0.22 145)" : "oklch(0.52 0.12 145)",
              transition: "color 0.2s",
            }}
          >
            HIGH MID \u2192 {pct}% · BASS \u2192 {pct}% · ENG {engine} \u2192
            ACTIVE · CHAIN {chain} \u2192 LOCKED
          </span>
        </div>
      </div>
    </section>
  );
}
