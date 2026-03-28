import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface HighMidAmpSettings {
    thump: bigint;
    blocker1: boolean;
    blocker2: boolean;
    soundStageDistance: bigint;
    kick: bigint;
    frequency: bigint;
}
export interface BassAmpSettings {
    soundStageDistance: bigint;
    omniField: boolean;
    bassCorrection: bigint;
}
export interface EQBand {
    value: bigint;
    frequency: string;
}
export interface AppState {
    speakerPushout: bigint;
    mergeSwitch: boolean;
    sprPressure: bigint;
    voiceDepth: bigint;
    masterVolume: bigint;
    eqBands: Array<EQBand>;
    bassAmpSettings: BassAmpSettings;
    highMidAmpSettings: HighMidAmpSettings;
}
export interface Slot {
    name: string;
    lastModified: bigint;
    state: AppState;
}
export interface backendInterface {
    addSystemCleanLog(entry: string): Promise<void>;
    deleteSlot(slotIndex: bigint): Promise<void>;
    getLastSystemCleanTimestamp(): Promise<bigint>;
    getSlots(): Promise<Array<Slot>>;
    getSystemCleanLogs(): Promise<Array<string>>;
    loadSlot(slotIndex: bigint): Promise<AppState>;
    saveSlot(slotIndex: bigint, name: string, state: AppState): Promise<void>;
}
