import { useCallback, useEffect, useRef, useState } from "react";

interface WebApiLockProps {
  generatorOn: boolean;
  volume: number;
  triggerVerifyRef?: React.MutableRefObject<(() => void) | null>;
}

const LOCK_ITEMS = [
  { label: "VOLUME BUS", key: "volume" },
  { label: "HIGH MID EQ", key: "hmEq" },
  { label: "BASS EQ", key: "bassEq" },
  { label: "BASS CONTROLS", key: "bass" },
  { label: "GENERATOR", key: "generator" },
  { label: "PROTECTION STACK", key: "protection" },
  { label: "SPR FILTER", key: "spr" },
  { label: "OMNIFIELD", key: "omnifield" },
  { label: "SIGNAL CHAIN", key: "signalChain" },
  { label: "EQ BLOCKERS", key: "eqBlockers" },
  { label: "CHAIN ROUTING", key: "chainRouting" },
  { label: "80HZ STABILIZER", key: "stabilizer" },
] as const;

type LockKey = (typeof LOCK_ITEMS)[number]["key"];
type LockState = Record<LockKey, boolean>;

const STORAGE_KEY = "megaamp_api_lock_v3";

function buildFullLock(generatorOn: boolean): LockState {
  const on = generatorOn;
  return {
    volume: on,
    hmEq: on,
    bassEq: on,
    bass: on,
    generator: on,
    protection: on,
    spr: on,
    omnifield: on,
    signalChain: on,
    eqBlockers: on,
    chainRouting: on,
    stabilizer: on,
  };
}

function saveLock(state: LockState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function loadLock(generatorOn: boolean): LockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LockState>;
      const full = buildFullLock(generatorOn);
      return { ...full, ...parsed } as LockState;
    }
  } catch {}
  return buildFullLock(generatorOn);
}

export function WebApiLock({ generatorOn, triggerVerifyRef }: WebApiLockProps) {
  const [, setLockState] = useState<LockState>(() => loadLock(generatorOn));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chainIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runVerify = useCallback((genOn: boolean) => {
    const needed = buildFullLock(genOn);
    setLockState(needed);
    saveLock(needed);
  }, []);

  // Main verify interval: 500ms (tightened from 1000ms)
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => runVerify(generatorOn), 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [generatorOn, runVerify]);

  // Chain heartbeat: 250ms (tightened from 500ms)
  useEffect(() => {
    if (chainIntervalRef.current) clearInterval(chainIntervalRef.current);
    chainIntervalRef.current = setInterval(() => {
      setLockState((prev) => {
        const needed = buildFullLock(generatorOn);
        const same = (Object.keys(needed) as LockKey[]).every(
          (k) => prev[k] === needed[k],
        );
        if (!same) {
          saveLock(needed);
          return needed;
        }
        return prev;
      });
    }, 250);
    return () => {
      if (chainIntervalRef.current) clearInterval(chainIntervalRef.current);
    };
  }, [generatorOn]);

  useEffect(() => {
    runVerify(generatorOn);
  }, [generatorOn, runVerify]);

  useEffect(() => {
    if (triggerVerifyRef) {
      triggerVerifyRef.current = () => runVerify(generatorOn);
    }
  });

  // Lock logic runs silently in the background — no visible panel
  return null;
}
