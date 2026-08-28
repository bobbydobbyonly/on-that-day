/**
 * Pure Web Audio API cosmic ambient synthesizer and speech narration
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let osc1: OscillatorNode | null = null;
let osc2: OscillatorNode | null = null;
let osc3: OscillatorNode | null = null;
let filter: BiquadFilterNode | null = null;
let isAudioPlaying = false;

export function toggleCosmicSound(): boolean {
  if (isAudioPlaying) {
    stopCosmicSound();
    return false;
  } else {
    startCosmicSound();
    return true;
  }
}

export function isCosmicSoundActive(): boolean {
  return isAudioPlaying;
}

export function startCosmicSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Stop existing nodes if any
    stopCosmicSound();

    // Master gain with smooth ramp
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 2.5);

    // Warm resonant low-pass filter
    filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, audioCtx.currentTime);
    filter.Q.setValueAtTime(3, audioCtx.currentTime);

    // Warm deep root note (108 Hz - celestial root harmonic)
    osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(108, audioCtx.currentTime);

    // Harmonic fifth (162 Hz)
    osc2 = audioCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(162.2, audioCtx.currentTime); // Slight detune for shimmer

    // Shimmer octave (216 Hz) with slow LFO
    osc3 = audioCtx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(216.3, audioCtx.currentTime);

    const subGain = audioCtx.createGain();
    subGain.gain.setValueAtTime(0.6, audioCtx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(subGain);
    subGain.connect(filter);

    filter.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    osc3.start();
    isAudioPlaying = true;
  } catch (err) {
    console.warn('Web Audio API not supported or blocked:', err);
    isAudioPlaying = false;
  }
}

export function stopCosmicSound() {
  try {
    if (masterGain && audioCtx) {
      masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
      setTimeout(() => {
        try {
          osc1?.stop();
          osc2?.stop();
          osc3?.stop();
          osc1?.disconnect();
          osc2?.disconnect();
          osc3?.disconnect();
        } catch {
          // ignore
        }
        isAudioPlaying = false;
      }, 900);
    } else {
      isAudioPlaying = false;
    }
  } catch {
    isAudioPlaying = false;
  }
}

// Text-to-speech for APOD story narration
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): boolean {
  if (!('speechSynthesis' in window)) {
    return false;
  }

  stopSpeaking();

  const cleanText = text.replace(/^Explanation:\s*/i, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 0.95; // Calm, meditative pace
  utterance.pitch = 1.0;

  // Try to pick a natural English voice if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
  ) || voices.find(v => v.lang.startsWith('en'));

  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    onError?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking(): boolean {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking;
}
