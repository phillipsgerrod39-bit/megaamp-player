import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const CHAIN_BLOCKS = [
  "VOL BUS",
  "HM EQ",
  "BASS EQ",
  "BASS CTRL",
  "GENERATOR",
  "PROTECTION",
  "SPR FILTER",
  "OMNIFIELD",
  "SIGNAL CHAIN",
  "EQ BLOCKERS",
  "80HZ STAB",
  "CHAIN ROUTING",
];

interface RoutingContextValue {
  active: boolean;
  message: string;
  fireRoute: (label: string) => void;
  log: string[];
  chainLocked: boolean;
}

const RoutingContext = createContext<RoutingContextValue>({
  active: false,
  message: "",
  fireRoute: () => {},
  log: [],
  chainLocked: true,
});

interface RoutingProviderProps {
  children: React.ReactNode;
  onLog?: (msg: string) => void;
  generatorOn?: boolean;
}

export function RoutingProvider({
  children,
  onLog,
  generatorOn = true,
}: RoutingProviderProps) {
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [chainLocked, setChainLocked] = useState(generatorOn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chainTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onLogRef = useRef(onLog);
  onLogRef.current = onLog;

  // Chainblock heartbeat — re-locks routing every 500ms (tightened from 800ms)
  useEffect(() => {
    if (chainTimerRef.current) clearInterval(chainTimerRef.current);
    chainTimerRef.current = setInterval(() => {
      setChainLocked(generatorOn);
    }, 500);
    setChainLocked(generatorOn);
    return () => {
      if (chainTimerRef.current) clearInterval(chainTimerRef.current);
    };
  }, [generatorOn]);

  const fireRoute = useCallback((label: string) => {
    setActive(true);
    setMessage(label);
    setLog((prev) => [...prev, label].slice(-20));
    onLogRef.current?.(label);
    // Re-lock chain on every user action
    setChainLocked(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setActive(false), 900);
  }, []);

  return (
    <RoutingContext.Provider
      value={{ active, message, fireRoute, log, chainLocked }}
    >
      {children}
    </RoutingContext.Provider>
  );
}

export function useRouting() {
  return useContext(RoutingContext);
}

export { CHAIN_BLOCKS };
