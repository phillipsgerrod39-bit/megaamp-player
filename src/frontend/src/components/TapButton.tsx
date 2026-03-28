import { cn } from "@/lib/utils";
import { useCallback, useRef } from "react";

interface TapButtonProps {
  onPress: () => void;
  label: string;
  className?: string;
  disabled?: boolean;
  color?: "default" | "gold" | "blue" | "green" | "red";
  noRepeat?: boolean;
}

export function TapButton({
  onPress,
  label,
  className,
  disabled,
  color = "default",
  noRepeat = false,
}: TapButtonProps) {
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const touchActiveRef = useRef(false);

  const startRepeat = useCallback(() => {
    if (disabled) return;
    onPress();
    if (noRepeat) return;
    timeoutRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(onPress, 400);
    }, 600);
  }, [onPress, disabled, noRepeat]);

  const stopRepeat = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  const colorClass = {
    default: "",
    gold: "border-[oklch(0.55_0.12_85/0.6)] text-[oklch(0.78_0.16_85)] hover:bg-[oklch(0.2_0.015_85)]",
    blue: "border-[oklch(0.45_0.14_240/0.6)] text-[oklch(0.65_0.2_240)] hover:bg-[oklch(0.18_0.012_240)]",
    green:
      "border-[oklch(0.45_0.14_145/0.6)] text-[oklch(0.72_0.22_145)] hover:bg-[oklch(0.18_0.012_145)]",
    red: "border-[oklch(0.45_0.18_25/0.6)] text-[oklch(0.63_0.24_25)] hover:bg-[oklch(0.18_0.012_25)]",
  }[color];

  return (
    <button
      type="button"
      className={cn(
        "tap-btn select-none",
        colorClass,
        disabled && "opacity-40 cursor-not-allowed",
        className,
      )}
      onMouseDown={() => {
        if (touchActiveRef.current) return;
        startRepeat();
      }}
      onMouseUp={stopRepeat}
      onMouseLeave={stopRepeat}
      onTouchStart={(e) => {
        e.preventDefault();
        touchActiveRef.current = true;
        startRepeat();
      }}
      onTouchEnd={() => {
        touchActiveRef.current = false;
        stopRepeat();
      }}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
