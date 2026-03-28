import { useState } from "react";
import { toast } from "sonner";
import type { AppState } from "../backend.d";
import {
  useDeleteSlot,
  useGetSlots,
  useLoadSlot,
  useSaveSlot,
} from "../hooks/useQueries";

interface SaveLoadProps {
  getState: () => AppState;
  applyState: (state: AppState) => void;
}

const SLOT_KEYS = ["slot-0", "slot-1", "slot-2", "slot-3", "slot-4"];

export function SaveLoad({ getState, applyState }: SaveLoadProps) {
  const { data: slots } = useGetSlots();
  const saveSlot = useSaveSlot();
  const loadSlot = useLoadSlot();
  const deleteSlot = useDeleteSlot();
  const [slotNames, setSlotNames] = useState([
    "Session A",
    "Session B",
    "Session C",
    "Session D",
    "Session E",
  ]);

  const handleSave = async (index: number) => {
    try {
      await saveSlot.mutateAsync({
        slotIndex: BigInt(index),
        name: slotNames[index],
        state: getState(),
      });
      toast.success(`Saved to Slot ${index + 1}`);
    } catch {
      toast.error("Save failed");
    }
  };

  const handleLoad = async (index: number) => {
    try {
      const state = await loadSlot.mutateAsync(BigInt(index));
      applyState(state);
      toast.success(`Loaded Slot ${index + 1}`);
    } catch {
      toast.error("Load failed -- slot may be empty");
    }
  };

  const handleDelete = async (index: number) => {
    try {
      await deleteSlot.mutateAsync(BigInt(index));
      toast.success(`Slot ${index + 1} cleared`);
    } catch {
      toast.error("Delete failed");
    }
  };

  const fmt = (ts: bigint) => {
    const d = new Date(Number(ts) / 1_000_000);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  const SLOT_OCIDS = [
    "saveload.item.1",
    "saveload.item.2",
    "saveload.item.3",
    "saveload.item.4",
    "saveload.item.5",
  ];
  const DEL_OCIDS = [
    "saveload.delete_button.1",
    "saveload.delete_button.2",
    "saveload.delete_button.3",
    "saveload.delete_button.4",
    "saveload.delete_button.5",
  ];

  return (
    <section className="panel p-3" data-ocid="saveload.panel">
      <div className="flex items-center gap-2 mb-3">
        <span className="panel-title">SAVE / LOAD -- 5 SLOTS</span>
        <span className="blockchain-badge">SAVES ALL SETTINGS</span>
      </div>

      <div className="space-y-2">
        {SLOT_KEYS.map((key, i) => {
          const slot = slots?.[i];
          const hasData = !!slot && slot.name !== "";
          return (
            <div
              key={key}
              className="flex items-center gap-2 p-2 bg-[oklch(0.12_0.006_252)] border border-border rounded"
              data-ocid={SLOT_OCIDS[i]}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: hasData
                    ? "oklch(0.72 0.22 145)"
                    : "oklch(0.3 0.01 252)",
                  boxShadow: hasData
                    ? "0 0 5px oklch(0.72 0.22 145 / 0.7)"
                    : "none",
                }}
              />
              <span className="font-mono text-[0.6rem] text-muted-foreground w-6 shrink-0">
                {i + 1}
              </span>
              <input
                value={slotNames[i]}
                onChange={(e) => {
                  const next = [...slotNames];
                  next[i] = e.target.value;
                  setSlotNames(next);
                }}
                className="flex-1 bg-[oklch(0.16_0.008_252)] border border-border rounded px-2 py-0.5 font-mono text-xs text-foreground focus:outline-none focus:border-[oklch(0.55_0.12_252)]"
                placeholder={`Slot ${i + 1}`}
                data-ocid="saveload.input"
              />
              {hasData && (
                <span className="font-mono text-[0.5rem] text-muted-foreground/60 hidden sm:block w-28 text-right shrink-0">
                  {fmt(slot.lastModified)}
                </span>
              )}
              <button
                type="button"
                className="tap-btn text-[oklch(0.78_0.16_85)] border-[oklch(0.45_0.1_85/0.5)]"
                onClick={() => handleSave(i)}
                disabled={saveSlot.isPending}
                data-ocid="saveload.save_button"
              >
                SAVE
              </button>
              <button
                type="button"
                className="tap-btn text-[oklch(0.65_0.2_240)] border-[oklch(0.45_0.14_240/0.5)]"
                onClick={() => handleLoad(i)}
                disabled={loadSlot.isPending}
                data-ocid="saveload.secondary_button"
              >
                LOAD
              </button>
              <button
                type="button"
                className="tap-btn text-[oklch(0.63_0.24_25)] border-[oklch(0.45_0.18_25/0.5)]"
                onClick={() => handleDelete(i)}
                disabled={deleteSlot.isPending}
                data-ocid={DEL_OCIDS[i]}
              >
                DEL
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
