import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppState, Slot } from "../backend.d";
import { useActor } from "./useActor";

export function useGetSlots() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<Slot>>({
    queryKey: ["slots"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSlots();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveSlot() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slotIndex,
      name,
      state,
    }: { slotIndex: bigint; name: string; state: AppState }) => {
      if (!actor) throw new Error("No actor");
      await actor.saveSlot(slotIndex, name, state);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["slots"] }),
  });
}

export function useLoadSlot() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (slotIndex: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.loadSlot(slotIndex);
    },
  });
}

export function useDeleteSlot() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slotIndex: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteSlot(slotIndex);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["slots"] }),
  });
}

export function useAddSystemCleanLog() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (entry: string) => {
      if (!actor) return;
      await actor.addSystemCleanLog(entry);
    },
  });
}
