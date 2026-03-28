import { FolderOpen, Music, Pause, Play, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface EQBandDef {
  hz: number;
  gain: number;
}

interface MusicPlayerProps {
  onFrequencyData?: (bands: number[]) => void;
  volume?: number;
  generatorOn?: boolean;
  highMidFrequency?: number;
  bassBlock1?: boolean;
  bassBlock2?: boolean;
  kick?: number;
  thump?: number;
  bassCorrection?: boolean;
  eqBands?: EQBandDef[];
  eqBassBlockerActive?: boolean;
  eqDistortionBlockerActive?: boolean;
  sprPressure?: number;
  onDbLevel?: (db: number) => void;
  omniField?: boolean;
  soundStage?: number;
  centerPan?: number;
  mergeMode?: "bass" | "highs" | "merge";
  bassEqLevel?: number;
}

const BAND_FREQS = [60, 150, 400, 1000, 3500, 8000, 16000];

/** Gentle tanh soft-clip curve — smooths peaks, adds zero volume/gain */
function makeSoftClipCurve(): Float32Array<ArrayBuffer> {
  const n = 256;
  const curve = new Float32Array(n) as Float32Array<ArrayBuffer>;
  const k = 1.5;
  const norm = Math.tanh(k);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = Math.tanh(x * k) / norm;
  }
  return curve;
}

/**
 * Dynamic soft-clip curve — drive 1.0–4.0, range 100–1000.
 * Used by the full-signal distortion blocker.
 */
function makeDynamicSoftClipCurve(drive: number): Float32Array {
  const n = 256;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = Math.tanh(x * drive) / Math.tanh(drive);
  }
  return curve;
}

/**
 * Heavy-duty bass distortion blocker curve — drive 1.0–6.0, range 100–1000.
 * Harder knee + extra harmonic compression targeted at bass frequencies.
 */
function makeHeavyDutyBassBlockerCurve(drive: number): Float32Array {
  const n = 256;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    const hardClip = Math.max(-1, Math.min(1, x * drive));
    curve[i] = Math.tanh(hardClip * 2) / Math.tanh(2);
  }
  return curve;
}

/**
 * OmniField impulse response — exponentially decaying stereo noise.
 * Creates omnidirectional room-filling reverb that wraps around the listener.
 * 1.5 second decay, both channels decorrelated for true surround spread.
 */
function createOmniImpulse(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * 1.5;
  const buffer = ctx.createBuffer(2, length, sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2;
    }
  }
  return buffer;
}

export function MusicPlayer({
  onFrequencyData,
  volume = 1,
  generatorOn = true,
  highMidFrequency = 1150,
  bassBlock1 = false,
  bassBlock2 = false,
  kick = 0,
  thump = 0,
  bassCorrection: _bassCorrection = false,
  eqBands = [],
  eqBassBlockerActive = false,
  eqDistortionBlockerActive = false,
  sprPressure = 150,
  onDbLevel,
  omniField = false,
  soundStage = 40,
  centerPan = 0,
  mergeMode = "bass",
  bassEqLevel = 0,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [trackName, setTrackName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [objectUrl, setObjectUrl] = useState("");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  // Combined EQ filters: indices 0-6 = High Mid, indices 7-10 = Bass
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  // Crossover nodes for frequency isolation
  const highMidCrossoverRef = useRef<BiquadFilterNode | null>(null);
  const bassCrossoverRef = useRef<BiquadFilterNode | null>(null);
  // Merge gain node — both EQ paths feed into this before the rest of the chain
  const mergeGainRef = useRef<GainNode | null>(null);
  const eqProtectionCompressorRef = useRef<DynamicsCompressorNode | null>(null);
  /** DynamicsCompressorNode: HD Custom Fuse compressor — bass path only, activates in merge mode */
  const fuseBassCompressorRef = useRef<DynamicsCompressorNode | null>(null);
  const bassBlock1FilterRef = useRef<BiquadFilterNode | null>(null);
  const bassBlock2FilterRef = useRef<BiquadFilterNode | null>(null);
  const kickBoostRef = useRef<BiquadFilterNode | null>(null);
  const thumpBoostRef = useRef<BiquadFilterNode | null>(null);
  const bassCorrectionFilterRef = useRef<BiquadFilterNode | null>(null);
  /** WaveShaperNode: 80Hz Bass Correction signal stabilizer, 4x oversample */
  const waveShaperRef = useRef<WaveShaperNode | null>(null);
  /** WaveShaperNode: Full-signal Distortion Blocker 200,000-unit stabilizer */
  const distortionBlockerRef = useRef<WaveShaperNode | null>(null);
  /** WaveShaperNode: Heavy-duty Bass Amp distortion blocker — drive 1-6, bass path only */
  const bassDistortionBlockerRef = useRef<WaveShaperNode | null>(null);
  /** PannerNode: OmniField center anchor — position (0,0,0), bass path only */
  const omnifieldPannerNodeRef = useRef<PannerNode | null>(null);
  /** ConvolverNode: OmniField omnidirectional spread impulse — bass path only */
  const omnifieldConvolverRef = useRef<ConvolverNode | null>(null);
  /** GainNode: OmniField wet (convolver) mix — scales with volume when ON */
  const omnifieldWetGainRef = useRef<GainNode | null>(null);
  /** GainNode: OmniField dry (direct) mix — always 1.0 */
  const omnifieldDryGainRef = useRef<GainNode | null>(null);
  /** BiquadFilterNode: SPR allpass filter — zero gain, phase shaping only */
  const sprFilterRef = useRef<BiquadFilterNode | null>(null);
  /** StereoPannerNode: Push-Pull Soundstage — LFO-driven left/right oscillation */
  const soundStagePannerRef = useRef<StereoPannerNode | null>(null);
  /** StereoPannerNode: Sound Center — manual left/right pan (-1 to +1) */
  const centerPannerRef = useRef<StereoPannerNode | null>(null);
  /** OscillatorNode: LFO driving soundstage push-pull sweep */
  const lfoOscRef = useRef<OscillatorNode | null>(null);
  /** GainNode: LFO amplitude — controls soundstage width */
  const lfoGainRef = useRef<GainNode | null>(null);
  /** BiquadFilterNode: Strong Noise Filter — highpass 20Hz, end of chain, always active */
  const noiseFilterRef = useRef<BiquadFilterNode | null>(null);
  /** DynamicsCompressorNode: Signal Pulling Filter — High Mid path, 1000-ton hold, threshold -3dB ratio 20:1 */
  const spfHighMidRef = useRef<DynamicsCompressorNode | null>(null);
  /** DynamicsCompressorNode: Signal Pulling Filter — Bass path, 1000-ton hold, threshold -3dB ratio 20:1 */
  const spfBassRef = useRef<DynamicsCompressorNode | null>(null);

  const rafRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const isPlayingRef = useRef(false);
  const wasPlayingBeforeCutRef = useRef(false);
  const volumeRef = useRef(volume);
  const objectUrlRef = useRef(objectUrl);
  const onDbLevelRef = useRef(onDbLevel);
  onDbLevelRef.current = onDbLevel;
  volumeRef.current = volume;
  objectUrlRef.current = objectUrl;

  // biome-ignore lint/correctness/useExhaustiveDependencies: volume intentionally excluded
  const initAudioContext = useCallback(() => {
    if (audioCtxRef.current || !audioRef.current) return;
    const ctx = new AudioContext();

    const gainNode = ctx.createGain();
    gainNode.gain.value = Math.max(0.002, (volume / 1000) * 2.0);

    // ── Frequency-isolated EQ chains ──────────────────────────────────────
    // High Mid crossover: highpass at 200Hz keeps mids/highs only
    const highMidCrossover = ctx.createBiquadFilter();
    highMidCrossover.type = "highpass";
    highMidCrossover.frequency.value = 200;
    highMidCrossover.Q.value = 0.7;

    // Bass crossover: lowpass at 200Hz keeps bass only
    const bassCrossover = ctx.createBiquadFilter();
    bassCrossover.type = "lowpass";
    bassCrossover.frequency.value = 200;
    bassCrossover.Q.value = 0.7;

    // High Mid EQ filters (bands 0-6)
    // Bands 5 (TWEETER, 12kHz) and 6 (AIR, 16kHz) use highshelf for real treble presence
    const hmBands = eqBands.slice(0, 7);
    const hmFilters: BiquadFilterNode[] = hmBands.map((band, idx) => {
      const f = ctx.createBiquadFilter();
      if (idx >= 5) {
        // TWEETER + AIR: highshelf — wide treble lift, not narrow peak
        f.type = "highshelf";
        f.frequency.value = band.hz;
        f.gain.value = band.gain;
      } else {
        f.type = "peaking";
        f.frequency.value = band.hz;
        f.Q.value = 1.4;
        f.gain.value = band.gain;
      }
      return f;
    });

    // Bass EQ peaking filters (bands 7-10)
    const bassBands = eqBands.slice(7);
    const bassEqFilters: BiquadFilterNode[] = bassBands.map((band) => {
      const f = ctx.createBiquadFilter();
      f.type = "peaking";
      f.frequency.value = band.hz;
      f.Q.value = 1.4;
      f.gain.value = band.gain;
      return f;
    });

    // ── HD Custom Fuse Compressor — 6 × HD CUSTOM FUSE · 720W · HD SIM WIRE ──
    // Sits between bassEqFilters and bassDistortionBlocker.
    // Each fuse has dedicated simulation wire for precision clamping.
    // Inactive (ratio:1) by default; engages in MERGE mode.
    const fuseBassCompressor = ctx.createDynamicsCompressor();
    fuseBassCompressor.threshold.value = 0;
    fuseBassCompressor.knee.value = 6;
    fuseBassCompressor.ratio.value = 1;
    fuseBassCompressor.attack.value = 0.001;
    fuseBassCompressor.release.value = 0.06;

    // Heavy-duty Bass Distortion Blocker — sits in the bass path before OmniField
    const bassDistortionBlocker = ctx.createWaveShaper();
    bassDistortionBlocker.oversample = "4x";
    bassDistortionBlocker.curve = makeHeavyDutyBassBlockerCurve(
      1,
    ) as Float32Array<ArrayBuffer>;

    // ── OmniField: center-anchored PannerNode + ConvolverNode wet/dry mix ──
    // Center anchor — sound originates from (0,0,0), not left/right speaker
    const omnifieldPannerNode = ctx.createPanner();
    omnifieldPannerNode.panningModel = "HRTF";
    omnifieldPannerNode.distanceModel = "linear";
    omnifieldPannerNode.setPosition(0, 0, 0);
    omnifieldPannerNode.setOrientation(0, 0, -1);

    // Omnidirectional spread: ConvolverNode with synthetic room impulse
    const omnifieldConvolver = ctx.createConvolver();
    omnifieldConvolver.buffer = createOmniImpulse(ctx);
    omnifieldConvolver.normalize = true;

    // Wet gain — scales 0–0.8 based on volume when OmniField is ON
    const omnifieldWetGain = ctx.createGain();
    omnifieldWetGain.gain.value = 0;

    // Dry gain — always 1.0 (direct signal always passes through)
    const omnifieldDryGain = ctx.createGain();
    omnifieldDryGain.gain.value = 1.0;

    // Merge gain — both paths feed here before the shared chain
    const mergeGain = ctx.createGain();
    mergeGain.gain.value = 1.0;

    // Wire High Mid path: gainNode → highMidCrossover → hmFilters... → mergeGain
    gainNode.connect(highMidCrossover);
    let hmNode: AudioNode = highMidCrossover;
    for (const f of hmFilters) {
      hmNode.connect(f);
      hmNode = f;
    }
    // Signal Pulling Filter — High Mid path (1000-ton hold: threshold -3dB, ratio 20:1, knee 0)
    const spfHighMid = ctx.createDynamicsCompressor();
    spfHighMid.threshold.value = -3;
    spfHighMid.knee.value = 0;
    spfHighMid.ratio.value = 20;
    spfHighMid.attack.value = 0.001;
    spfHighMid.release.value = 0.25;
    hmNode.connect(spfHighMid);
    spfHighMid.connect(mergeGain);

    // Wire Bass path:
    //   gainNode → bassCrossover → bassEqFilters... → fuseBassCompressor
    //   → bassDistortionBlocker → omnifieldPannerNode → dryGain → mergeGain  (direct)
    //   → omnifieldPannerNode → convolverNode → wetGain → mergeGain  (spatial)
    gainNode.connect(bassCrossover);
    let bassNode: AudioNode = bassCrossover;
    for (const f of bassEqFilters) {
      bassNode.connect(f);
      bassNode = f;
    }
    bassNode.connect(fuseBassCompressor);
    fuseBassCompressor.connect(bassDistortionBlocker);
    // Signal Pulling Filter — Bass path (1000-ton hold: threshold -3dB, ratio 20:1, knee 0)
    const spfBass = ctx.createDynamicsCompressor();
    spfBass.threshold.value = -3;
    spfBass.knee.value = 0;
    spfBass.ratio.value = 20;
    spfBass.attack.value = 0.001;
    spfBass.release.value = 0.25;
    bassDistortionBlocker.connect(spfBass);
    spfBass.connect(omnifieldPannerNode);
    // Dry path
    omnifieldPannerNode.connect(omnifieldDryGain);
    omnifieldDryGain.connect(mergeGain);
    // Wet path (omnidirectional spread)
    omnifieldPannerNode.connect(omnifieldConvolver);
    omnifieldConvolver.connect(omnifieldWetGain);
    omnifieldWetGain.connect(mergeGain);

    // ── Shared downstream chain ────────────────────────────────────────────
    // EQ protection compressor — inactive by default, activates when bands pushed too far
    const eqProtectionCompressor = ctx.createDynamicsCompressor();
    eqProtectionCompressor.threshold.value = 0;
    eqProtectionCompressor.knee.value = 3;
    eqProtectionCompressor.ratio.value = 1;
    eqProtectionCompressor.attack.value = 0.003;
    eqProtectionCompressor.release.value = 0.25;

    // Bass block 1
    const bassBlock1Filter = ctx.createBiquadFilter();
    bassBlock1Filter.type = "highpass";
    bassBlock1Filter.frequency.value = bassBlock1 ? 250 : 20;
    bassBlock1Filter.Q.value = bassBlock1 ? 1.0 : 0.7;

    // Bass block 2
    const bassBlock2Filter = ctx.createBiquadFilter();
    bassBlock2Filter.type = "highpass";
    bassBlock2Filter.frequency.value = bassBlock2 ? 500 : 20;
    bassBlock2Filter.Q.value = bassBlock2 ? 1.0 : 0.7;

    // Kick boost
    const kickBoost = ctx.createBiquadFilter();
    kickBoost.type = "peaking";
    kickBoost.frequency.value = 80;
    kickBoost.Q.value = 1.4;
    kickBoost.gain.value = kick * 1.2;

    // Thump boost
    const thumpBoost = ctx.createBiquadFilter();
    thumpBoost.type = "peaking";
    thumpBoost.frequency.value = 150;
    thumpBoost.Q.value = 1.4;
    thumpBoost.gain.value = thump * 1.2;

    // 80Hz bass correction peaking filter (legacy frequency shaping)
    const bassCorrectionFilter = ctx.createBiquadFilter();
    bassCorrectionFilter.type = "peaking";
    bassCorrectionFilter.frequency.value = 80;
    bassCorrectionFilter.Q.value = 2.0;
    bassCorrectionFilter.gain.value = 0; // No gain — pure signal passthrough

    // WaveShaperNode: soft-clip signal stabilizer — 4x oversample, tanh curve
    const waveShaper = ctx.createWaveShaper();
    waveShaper.oversample = "4x";
    waveShaper.curve = makeSoftClipCurve();

    // Full-signal Distortion Blocker — 200,000-unit stabilizer, 4x oversample
    const distortionBlocker = ctx.createWaveShaper();
    distortionBlocker.oversample = "4x";
    distortionBlocker.curve = makeSoftClipCurve();

    // SPR Filter — allpass filter: zero gain, zero cut, phase-only shaping
    const sprFilter = ctx.createBiquadFilter();
    sprFilter.type = "allpass";
    sprFilter.frequency.value = sprPressure * 10;
    sprFilter.Q.value = 1.0;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;

    const source = ctx.createMediaElementSource(audioRef.current);

    // Wire source into gain node
    source.connect(gainNode);

    // Wire shared downstream: mergeGain → compressor → bassBlock1 → bassBlock2
    //   → kickBoost → thumpBoost → bassCorrectionFilter → waveShaper
    //   → distortionBlocker → sprFilter → analyser → destination
    mergeGain.connect(eqProtectionCompressor);
    eqProtectionCompressor.connect(bassBlock1Filter);
    bassBlock1Filter.connect(bassBlock2Filter);
    bassBlock2Filter.connect(kickBoost);
    kickBoost.connect(thumpBoost);
    thumpBoost.connect(bassCorrectionFilter);
    bassCorrectionFilter.connect(waveShaper);
    waveShaper.connect(distortionBlocker);
    // Strong Noise Filter — highpass 20Hz, end of chain, always active, blocks sub-20Hz rumble/hum
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 20;
    noiseFilter.Q.value = 0.7;

    // StereoPannerNode: Push-Pull Soundstage — slow LFO sweeps left/right
    const soundStagePanner = ctx.createStereoPanner();
    soundStagePanner.pan.value = 0;

    // LFO oscillator: slow sine wave (~0.15 Hz = 6.7s cycle) drives the pan
    const lfoOsc = ctx.createOscillator();
    lfoOsc.type = "sine";
    lfoOsc.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0; // starts at 0; updated by soundStage effect
    lfoOsc.connect(lfoGain);
    lfoGain.connect(soundStagePanner.pan);
    lfoOsc.start();

    // StereoPannerNode: Sound Center — manual left/right balance control
    const centerPanner = ctx.createStereoPanner();
    centerPanner.pan.value = 0;

    // Full chain: ... → distortionBlocker → sprFilter → soundStagePanner → centerPanner → noiseFilter → analyser → destination
    distortionBlocker.connect(sprFilter);
    sprFilter.connect(soundStagePanner);
    soundStagePanner.connect(centerPanner);
    centerPanner.connect(noiseFilter);
    noiseFilter.connect(analyser);
    analyser.connect(ctx.destination);

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
    gainNodeRef.current = gainNode;
    // Store combined for easy indexed access in update effects
    eqFiltersRef.current = [...hmFilters, ...bassEqFilters];
    highMidCrossoverRef.current = highMidCrossover;
    bassCrossoverRef.current = bassCrossover;
    mergeGainRef.current = mergeGain;
    eqProtectionCompressorRef.current = eqProtectionCompressor;
    fuseBassCompressorRef.current = fuseBassCompressor;
    bassBlock1FilterRef.current = bassBlock1Filter;
    bassBlock2FilterRef.current = bassBlock2Filter;
    kickBoostRef.current = kickBoost;
    thumpBoostRef.current = thumpBoost;
    bassCorrectionFilterRef.current = bassCorrectionFilter;
    waveShaperRef.current = waveShaper;
    distortionBlockerRef.current = distortionBlocker;
    bassDistortionBlockerRef.current = bassDistortionBlocker;
    omnifieldPannerNodeRef.current = omnifieldPannerNode;
    omnifieldConvolverRef.current = omnifieldConvolver;
    omnifieldWetGainRef.current = omnifieldWetGain;
    omnifieldDryGainRef.current = omnifieldDryGain;
    sprFilterRef.current = sprFilter;
    soundStagePannerRef.current = soundStagePanner;
    centerPannerRef.current = centerPanner;
    lfoOscRef.current = lfoOsc;
    lfoGainRef.current = lfoGain;
    noiseFilterRef.current = noiseFilter;
    spfHighMidRef.current = spfHighMid;
    spfBassRef.current = spfBass;
    dataArrayRef.current = new Uint8Array(
      analyser.frequencyBinCount,
    ) as Uint8Array<ArrayBuffer>;
  }, []);

  // Update GainNode when volume changes
  useEffect(() => {
    if (!gainNodeRef.current) return;
    if (!generatorOn) return;
    gainNodeRef.current.gain.value = Math.max(0.002, (volume / 1000) * 2.0);
  }, [volume, generatorOn]);

  // OmniField: center-anchored PannerNode + ConvolverNode wet/dry mix
  // Wet mix scales with volume (louder = wider field), dry is always 1.0
  useEffect(() => {
    const wetGain = omnifieldWetGainRef.current;
    const dryGain = omnifieldDryGainRef.current;

    if (omniField) {
      // Wet level: 0.4 base + 0.4 volume scaling (audible at ANY volume when ON)
      const wet = 0.4 + (volume / 1000) * 0.4;
      if (wetGain) wetGain.gain.value = wet;
      if (dryGain) dryGain.gain.value = 1.0;
    } else {
      if (wetGain) wetGain.gain.value = 0;
      if (dryGain) dryGain.gain.value = 1.0;
    }
  }, [omniField, volume]);

  // Soundstage push-pull: map soundStage FT value to LFO amplitude
  // 0 FT = off (amplitude 0), 30 FT = subtle (0.25), 70 FT = strong (0.9)
  useEffect(() => {
    const lfoGain = lfoGainRef.current;
    if (!lfoGain) return;
    const amplitude =
      soundStage <= 0 ? 0 : Math.min(0.9, (soundStage / 70) * 0.9);
    const t = audioCtxRef.current?.currentTime ?? 0;
    lfoGain.gain.setTargetAtTime(amplitude, t, 0.15);
  }, [soundStage]);

  // Sound Center: update StereoPannerNode pan from centerPan prop (-100 to +100)
  useEffect(() => {
    const panner = centerPannerRef.current;
    if (!panner) return;
    const t = audioCtxRef.current?.currentTime ?? 0;
    panner.pan.setTargetAtTime(centerPan / 100, t, 0.05);
  }, [centerPan]);

  // HD Custom Fuse Compressor — 6 × HD CUSTOM FUSE · 720W · HD SIM WIRE
  // Each fuse has dedicated heavy-duty virtual simulation wire (tighter, more precise clamping)
  // Inactive when mergeMode !== 'merge' (ratio:1 = bypass)
  // In merge mode: threshold, ratio, and knee scale with volume + bass EQ level (100→1000)
  useEffect(() => {
    const comp = fuseBassCompressorRef.current;
    if (!comp) return;

    if (mergeMode !== "merge") {
      // Fuses inactive — pass through unchanged
      comp.threshold.value = 0;
      comp.knee.value = 6;
      comp.ratio.value = 1;
      comp.attack.value = 0.001;
      comp.release.value = 0.06;
    } else {
      // HD custom fuses engaged — scale with both volume (100→1000) and bass EQ level (0→100)
      const t = volume < 100 ? 0 : (volume - 100) / 900;
      const bassEQFactor = bassEqLevel / 100;
      const factor = Math.max(t, bassEQFactor);

      // Threshold: -10dB at low → -34dB at max (HD custom fuse wall, per-fuse sim wire)
      comp.threshold.value = -10 - factor * 24;
      // Ratio: 4:1 at low → 14:1 at max (HD fuse precision clamping)
      comp.ratio.value = 4 + factor * 10;
      // Knee: 6 (controlled entry) at low → 3 (tight HD clamp) at high
      comp.knee.value = 6 - factor * 3;
      // Instant response — HD sim wire reacts fast
      comp.attack.value = 0.001;
      comp.release.value = 0.06;
    }
  }, [mergeMode, volume, bassEqLevel]);

  // Distortion Blocker + Bass HD Blocker + Bass Blockers — scale 100–1000
  useEffect(() => {
    const t = volume < 100 ? 0 : (volume - 100) / 900;

    // Full-signal distortion blocker: drive 1.0–4.0
    const drive = 1 + t * 3;
    if (distortionBlockerRef.current) {
      distortionBlockerRef.current.curve = makeDynamicSoftClipCurve(
        drive,
      ) as Float32Array<ArrayBuffer>;
    }

    // Bass-amp heavy-duty distortion blocker: drive 1.0–6.0 (more aggressive)
    const hdDrive = 1 + t * 5;
    if (bassDistortionBlockerRef.current) {
      bassDistortionBlockerRef.current.curve = makeHeavyDutyBassBlockerCurve(
        hdDrive,
      ) as Float32Array<ArrayBuffer>;
    }

    // Scale bass blocker Q (protective sharpness) when toggles are active
    const q = 0.5 + t * 2.5; // 0.5 to 3.0
    if (bassBlock1FilterRef.current && bassBlock1) {
      bassBlock1FilterRef.current.Q.value = q;
    }
    if (bassBlock2FilterRef.current && bassBlock2) {
      bassBlock2FilterRef.current.Q.value = q;
    }
  }, [volume, bassBlock1, bassBlock2]);

  // Update EQ band gains — bands 0-6 = High Mid filters, bands 7-10 = Bass filters
  useEffect(() => {
    eqBands.forEach((band, i) => {
      const f = eqFiltersRef.current[i];
      if (f) f.gain.value = band.gain;
    });
  }, [eqBands]);

  // EQ protection compressor — activates when bands pushed too far
  useEffect(() => {
    const comp = eqProtectionCompressorRef.current;
    if (!comp) return;
    if (eqDistortionBlockerActive) {
      comp.threshold.value = -12;
      comp.ratio.value = 8;
      comp.attack.value = 0.001;
    } else if (eqBassBlockerActive) {
      comp.threshold.value = -20;
      comp.ratio.value = 4;
      comp.attack.value = 0.003;
    } else {
      comp.threshold.value = 0;
      comp.ratio.value = 1;
      comp.attack.value = 0.003;
    }
  }, [eqBassBlockerActive, eqDistortionBlockerActive]);

  // Bass block 1 — toggle freq (Q is handled by the volume scaling effect)
  useEffect(() => {
    if (!bassBlock1FilterRef.current) return;
    bassBlock1FilterRef.current.frequency.value = bassBlock1 ? 250 : 20;
    if (!bassBlock1) bassBlock1FilterRef.current.Q.value = 0.7;
  }, [bassBlock1]);

  // Bass block 2 — toggle freq (Q is handled by the volume scaling effect)
  useEffect(() => {
    if (!bassBlock2FilterRef.current) return;
    bassBlock2FilterRef.current.frequency.value = bassBlock2 ? 500 : 20;
    if (!bassBlock2) bassBlock2FilterRef.current.Q.value = 0.7;
  }, [bassBlock2]);

  // Kick boost
  useEffect(() => {
    if (!kickBoostRef.current) return;
    kickBoostRef.current.gain.value = kick * 1.2;
  }, [kick]);

  // Thump boost
  useEffect(() => {
    if (!thumpBoostRef.current) return;
    thumpBoostRef.current.gain.value = thump * 1.2;
  }, [thump]);

  // 80Hz Bass Correction: always 0 gain — WaveShaper always active, pure signal stabilization
  useEffect(() => {
    if (bassCorrectionFilterRef.current) {
      bassCorrectionFilterRef.current.gain.value = 0;
    }
  }, []);

  // SPR Filter: update allpass frequency when sprPressure changes
  useEffect(() => {
    if (sprFilterRef.current) {
      sprFilterRef.current.frequency.value = sprPressure * 10;
    }
  }, [sprPressure]);

  // High mid frequency crossover
  useEffect(() => {
    const f = eqFiltersRef.current[0];
    if (f) f.frequency.value = highMidFrequency;
  }, [highMidFrequency]);

  const startAnalysis = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    const sampleRate = audioCtxRef.current!.sampleRate;

    const tick = () => {
      if (!isPlayingRef.current) return;
      analyser.getByteFrequencyData(dataArray);
      if (onFrequencyData) {
        const bands = BAND_FREQS.map((freq) => {
          const bin = Math.round((freq * analyser.fftSize) / sampleRate);
          const lo = Math.max(0, bin - 2);
          const hi = Math.min(dataArray.length - 1, bin + 2);
          let sum = 0;
          for (let i = lo; i <= hi; i++) sum += dataArray[i];
          const avg = sum / (hi - lo + 1);
          return Math.max(-12, Math.min(12, ((avg - 128) / 128) * 12));
        });
        onFrequencyData(bands);
      }
      // RMS dB from time-domain — no microphone, reads from the audio chain
      if (onDbLevelRef.current) {
        const timeDomain = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(timeDomain);
        let rmsSum = 0;
        for (let i = 0; i < timeDomain.length; i++) {
          const norm = (timeDomain[i] - 128) / 128;
          rmsSum += norm * norm;
        }
        const rms = Math.sqrt(rmsSum / timeDomain.length);
        const db = rms > 0 ? 20 * Math.log10(rms) : -100;
        onDbLevelRef.current(Math.max(-60, Math.min(0, db)));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [onFrequencyData]);

  const stopAnalysis = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!gainNodeRef.current) return;
    if (!generatorOn) {
      gainNodeRef.current.gain.value = 0;
      wasPlayingBeforeCutRef.current = isPlayingRef.current;
      if (audioRef.current && isPlayingRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        isPlayingRef.current = false;
        stopAnalysis();
      }
    } else {
      gainNodeRef.current.gain.value = Math.max(
        0.002,
        (volumeRef.current / 1000) * 2.0,
      );
      if (
        wasPlayingBeforeCutRef.current &&
        audioRef.current &&
        objectUrlRef.current
      ) {
        if (audioCtxRef.current?.state === "suspended") {
          audioCtxRef.current.resume();
        }
        audioRef.current.play();
        setIsPlaying(true);
        isPlayingRef.current = true;
        startAnalysis();
        wasPlayingBeforeCutRef.current = false;
      }
    }
  }, [generatorOn, stopAnalysis, startAnalysis]);

  useEffect(() => {
    return () => {
      stopAnalysis();
    };
  }, [stopAnalysis]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      setTrackName(file.name);
      setCurrentTime(0);
      setIsPlaying(false);
      isPlayingRef.current = false;
      stopAnalysis();
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
    },
    [objectUrl, stopAnalysis],
  );

  const handlePlay = () => {
    if (!audioRef.current || !objectUrl) return;
    initAudioContext();
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
    audioRef.current.play();
    setIsPlaying(true);
    isPlayingRef.current = true;
    startAnalysis();
  };

  const handlePause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
    isPlayingRef.current = false;
    stopAnalysis();
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentTime(0);
    stopAnalysis();
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    stopAnalysis();
  };

  const seek = (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (!audioRef.current || !duration) return;
    if (e.type === "click" || e.type === "keydown") {
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const clientX = "clientX" in e ? e.clientX : rect.left + rect.width / 2;
      const pct = (clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pct * duration;
    }
  };

  const fmt = (s: number) => {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section className="panel p-3" data-ocid="player.panel">
      {/* biome-ignore lint/a11y/useMediaCaption: audio player without captions is acceptable for music */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileChange}
        data-ocid="player.upload_button"
      />

      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          className="tap-btn flex items-center gap-1.5 text-[oklch(0.78_0.16_85)]"
          style={{ borderColor: "oklch(0.55 0.12 85 / 0.5)" }}
          onClick={() => fileInputRef.current?.click()}
          data-ocid="player.open_modal_button"
        >
          <FolderOpen size={12} />
          OPEN AUDIO FILE
        </button>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Music size={12} className="text-muted-foreground shrink-0" />
          <span className="font-mono text-xs truncate text-foreground/80">
            {trackName || "NO FILE LOADED"}
          </span>
        </div>
        {onFrequencyData && (
          <div
            className="flex items-center gap-1 font-mono text-[0.5rem] tracking-wider px-1.5 py-0.5 rounded-sm border"
            style={{
              borderColor: isPlaying
                ? "oklch(0.55 0.18 145 / 0.6)"
                : "oklch(0.35 0.01 252 / 0.4)",
              color: isPlaying ? "oklch(0.72 0.2 145)" : "oklch(0.45 0.01 252)",
              background: isPlaying
                ? "oklch(0.18 0.05 145 / 0.3)"
                : "transparent",
              animation: isPlaying ? "pulse 1.5s ease-in-out infinite" : "none",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isPlaying
                  ? "oklch(0.72 0.2 145)"
                  : "oklch(0.45 0.01 252)",
                boxShadow: isPlaying ? "0 0 4px oklch(0.72 0.2 145)" : "none",
              }}
            />
            LIVE EQ
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        tabIndex={0}
        className="relative h-2 bg-[oklch(0.22_0.01_252)] rounded-sm cursor-pointer mb-2 border border-border"
        onClick={seek}
        onKeyDown={seek}
        data-ocid="player.canvas_target"
      >
        <div
          className="h-full rounded-sm transition-none"
          style={{
            width: `${progress}%`,
            background: "oklch(0.65 0.2 240)",
            boxShadow:
              progress > 0 ? "0 0 6px oklch(0.65 0.2 240 / 0.6)" : "none",
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            className="tap-btn flex items-center gap-1"
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={!objectUrl || !generatorOn}
            data-ocid="player.primary_button"
          >
            {isPlaying ? <Pause size={10} /> : <Play size={10} />}
            {isPlaying ? "PAUSE" : "PLAY"}
          </button>
          <button
            type="button"
            className="tap-btn flex items-center gap-1"
            onClick={handleStop}
            disabled={!objectUrl || !generatorOn}
            data-ocid="player.secondary_button"
          >
            <Square size={10} />
            STOP
          </button>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {fmt(currentTime)} / {fmt(duration)}
        </span>
      </div>
    </section>
  );
}
