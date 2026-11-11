// Synthesized hardware chimes and Web Speech API voice output for GymRat

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    if (!sharedAudioCtx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) {
        sharedAudioCtx = new Ctx();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

export function playTone(
  freq: number,
  durationSec = 0.09,
  type: OscillatorType = 'sine',
  gainValue = 0.08,
  delaySec = 0
) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  } catch {
    // Ignore audio errors in restricted environments
  }
}

export function playPowerOnChime() {
  playTone(523.25, 0.1, 'triangle', 0.09, 0);
  playTone(659.25, 0.1, 'triangle', 0.09, 0.09);
  playTone(783.99, 0.18, 'triangle', 0.1, 0.18);
}

export function playButtonClick() {
  playTone(920, 0.045, 'square', 0.05, 0);
}

export function playCountdownTick(finalTick = false) {
  if (finalTick) {
    playTone(880, 0.12, 'triangle', 0.1, 0);
    playTone(1174.66, 0.22, 'triangle', 0.11, 0.11);
  } else {
    playTone(660, 0.07, 'sine', 0.07, 0);
  }
}

export function playRepVerifiedChime() {
  playTone(587.33, 0.08, 'triangle', 0.09, 0);
  playTone(880, 0.14, 'triangle', 0.1, 0.075);
}

export function playAntiCheatRejectSound() {
  playTone(220, 0.11, 'sawtooth', 0.06, 0);
  playTone(165, 0.16, 'sawtooth', 0.06, 0.1);
}

export function playShutterSound() {
  playTone(1450, 0.03, 'square', 0.04, 0);
  playTone(980, 0.04, 'triangle', 0.05, 0.035);
}

export function speakGymRatVoice(text: string, enabled = true) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Phonetic pronunciation normalization for speech synthesis engines:
      // Prevent browser TTS from interpreting "pull-ups" or "UPS" as the shipping acronym U-P-S
      const phoneticText = text
        .replace(/start\s+pull[- ]?ups!?/gi, "Start Pull-Up's!")
        .replace(/\bpull[- ]?ups\b/gi, "Pull-Up's");

      const utterance = new SpeechSynthesisUtterance(phoneticText);
      utterance.rate = 1.02;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  } catch {
    // Ignore speech synthesis errors if unavailable
  }
}

export function stopGymRatVoice() {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch {
    // Ignore
  }
}
