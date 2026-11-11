import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Ruler,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { GymRatLogo } from '../components/GymRatLogo';
import { UNIQUENESS_FEATURES } from '../data/gymRatData';
import {
  playAntiCheatRejectSound,
  playButtonClick,
  playRepVerifiedChime,
} from '../utils/gymRatAudio';

type CheatPattern = 'clean' | 'kipping' | 'wave';

export const UniquenessPage: React.FC = () => {
  // Feature 1: Anti-Cheat Pattern Tester
  const [cheatPattern, setCheatPattern] = useState<CheatPattern>('clean');
  const [verifiedTotal, setVerifiedTotal] = useState<number>(4);

  // Feature 2: Automatic User Calibration
  const [athleteHeightCm, setAthleteHeightCm] = useState<number>(175);

  // Feature 3: Full-Range Pull-Up Detection Slider (0% = Dead Hang, 100% = Chin Over Bar)
  const [romPercent, setRomPercent] = useState<number>(92);

  const handleTestCheatPattern = (pattern: CheatPattern) => {
    setCheatPattern(pattern);
    if (pattern === 'clean') {
      playRepVerifiedChime();
      setVerifiedTotal((c) => c + 1);
    } else {
      playAntiCheatRejectSound();
    }
  };

  // Calibration calculations based on athlete height
  const armReachCm = Math.round(athleteHeightCm * 0.44);
  const peakZoneCm = Math.max(12, Math.round(28 - (athleteHeightCm - 155) * 0.18));
  const deadHangCm = armReachCm + 14;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Page Header */}
      <div className="border-b border-[#E2E2DC] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#141517] text-[#F5B800] mb-4">
          <GymRatLogo className="w-4 h-4 text-[#F5B800]" />
          <span>Core Engineering Advantages &amp; Quality Systems</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#141517]">
          Uniqueness in GymRat
        </h1>
        <p className="mt-3 text-base sm:text-lg text-[#52555A] max-w-3xl">
          Ordinary motion counters fail when athletes swing, bounce at the top of the bar, or vary in height. GymRat integrates four dedicated hardware and firmware quality systems so every counted pull-up is genuine.
        </p>

        {/* Quick Summary Pill Strip */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="bg-white border border-[#E2E2DC] rounded-xl p-3">
            <div className="font-mono-lcd text-xl font-bold text-[#141517]">100%</div>
            <div className="text-[11px] text-[#52555A] mt-0.5">Anti-Cheat Verification</div>
          </div>
          <div className="bg-white border border-[#E2E2DC] rounded-xl p-3">
            <div className="font-mono-lcd text-xl font-bold text-[#141517]">Adaptive</div>
            <div className="text-[11px] text-[#52555A] mt-0.5">Auto Stature Calibration</div>
          </div>
          <div className="bg-white border border-[#E2E2DC] rounded-xl p-3">
            <div className="font-mono-lcd text-xl font-bold text-[#141517]">85%+ ROM</div>
            <div className="text-[11px] text-[#52555A] mt-0.5">Chin-Over-Bar Gate</div>
          </div>
        </div>
      </div>

      {/* Head Points: Laid Out 1 by 1 in Clean Sequential Sections */}
      <div className="space-y-8">
        {/* HEAD POINT 01: 4-Phase Optical Cycle Lock */}
        <section className="bg-white border-2 border-[#141517] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E2DC] pb-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#F5B800] text-[#141517] font-display font-extrabold text-lg flex items-center justify-center shrink-0">
                01
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B48300]">
                  Feature 01 · Anti-Cheat Engine
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#141517]">
                  4-Phase Optical Cycle Lock
                </h2>
              </div>
            </div>
            <span className="font-mono-lcd text-xs font-bold px-3 py-1 bg-[#141517] text-[#F5B800] rounded-full self-start sm:self-center">
              Verified Count: {verifiedTotal}
            </span>
          </div>

          <p className="text-sm font-medium text-[#52555A] mb-4">
            Guarantees 100% genuine pull-ups by verifying every step of the movement: Hang → Ascent → Peak → Descent.
          </p>

          <ul className="space-y-2.5 text-xs sm:text-sm text-[#373A40]">
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Optical beam verification:</strong> Dual IR optical beam and camera verify complete chin-over-bar movement without false triggers.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Anti-bounce debounce:</strong> Requires complete descent back to dead-hang before the next rep can be initiated.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Rejects half-reps &amp; kipping:</strong> Bouncing at the top or kicking legs without full extension is rejected.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Noise filtering:</strong> Transient IR interruptions under 150ms (such as waving a hand) are filtered out.
              </span>
            </li>
          </ul>

          {/* Interactive Pattern Tester */}
          <div className="mt-6 pt-5 border-t border-[#E2E2DC] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#141517]">
                Test Movement Patterns:
              </span>
              <span className="text-xs text-[#52555A]">
                Click each button to simulate sensor detection
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleTestCheatPattern('clean')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  cheatPattern === 'clean'
                    ? 'bg-[#141517] text-[#F5B800]'
                    : 'bg-[#F6F6F4] text-[#141517] border border-[#E2E2DC] hover:bg-[#ECECE7]'
                }`}
              >
                Test Clean Full Rep (+1)
              </button>
              <button
                type="button"
                onClick={() => handleTestCheatPattern('kipping')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  cheatPattern === 'kipping'
                    ? 'bg-[#141517] text-[#F5B800]'
                    : 'bg-[#F6F6F4] text-[#141517] border border-[#E2E2DC] hover:bg-[#ECECE7]'
                }`}
              >
                Test Top-Bar Double Bounce
              </button>
              <button
                type="button"
                onClick={() => handleTestCheatPattern('wave')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  cheatPattern === 'wave'
                    ? 'bg-[#141517] text-[#F5B800]'
                    : 'bg-[#F6F6F4] text-[#141517] border border-[#E2E2DC] hover:bg-[#ECECE7]'
                }`}
              >
                Test Brief Hand Wave
              </button>
            </div>

            {/* 4-Stage State Machine Visualization */}
            <div className="bg-[#141517] text-white rounded-xl p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-4 gap-2 text-center font-mono-lcd text-[11px]">
                {[
                  { step: '1. HANG', pass: true },
                  { step: '2. ASCENT', pass: cheatPattern !== 'wave' },
                  { step: '3. PEAK', pass: cheatPattern !== 'wave' },
                  { step: '4. DESCENT', pass: cheatPattern === 'clean' },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`p-2.5 rounded-lg border ${
                      s.pass
                        ? 'bg-emerald-950/70 border-emerald-600/50 text-emerald-300'
                        : 'bg-red-950/70 border-red-600/50 text-red-300'
                    }`}
                  >
                    <div className="font-bold">{s.step}</div>
                    <div className="mt-1 text-[10px]">{s.pass ? 'PASS' : 'FAIL'}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                {cheatPattern === 'clean' ? (
                  <span className="inline-flex items-center gap-2 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>VERIFIED CYCLE: Complete ascent + descent confirmed. Count +1!</span>
                  </span>
                ) : cheatPattern === 'kipping' ? (
                  <span className="inline-flex items-center gap-2 text-red-400 font-semibold">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>REJECTED: Athlete bounced at top without full bottom extension.</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-red-400 font-semibold">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>REJECTED: Transient IR beam interruption (&lt;150ms) filtered out.</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* HEAD POINT 02: Automatic User Calibration */}
        <section className="bg-white border-2 border-[#141517] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E2DC] pb-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#141517] text-[#F5B800] font-display font-extrabold text-lg flex items-center justify-center shrink-0">
                02
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B48300]">
                  Feature 02 · Stature Adaptation
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#141517]">
                  Automatic User Calibration &amp; Stature Envelope
                </h2>
              </div>
            </div>
            <span className="font-mono-lcd text-xs font-bold px-3 py-1 bg-[#F6F6F4] text-[#141517] border border-[#E2E2DC] rounded-full self-start sm:self-center">
              Stature: {athleteHeightCm} cm
            </span>
          </div>

          <p className="text-sm font-medium text-[#52555A] mb-4">
            GymRat dynamically adapts IR sensing thresholds to each athlete&apos;s physical reach and stroke travel length:
          </p>

          <ul className="space-y-2.5 text-xs sm:text-sm text-[#373A40]">
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Self-calibrating envelope:</strong> Calibrates across 155 cm to 198 cm stature ranges upon first rep.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Arm reach auto-scaling:</strong> Scales stroke travel length dynamically without manual tuning switches.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Dual threshold zones:</strong> Establishes Upper Peak Lock zone (chin over bar) and Dead-Hang Reset position.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Zero manual dials:</strong> Athlete simply starts their set—GymRat handles geometry automatically.
              </span>
            </li>
          </ul>

          {/* Interactive Calibration Controls */}
          <div className="mt-6 pt-5 border-t border-[#E2E2DC] space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Compact (160 cm)', val: 160 },
                { label: 'Standard (175 cm)', val: 175 },
                { label: 'Tall Reach (192 cm)', val: 192 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => {
                    setAthleteHeightCm(preset.val);
                    playButtonClick();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    athleteHeightCm === preset.val
                      ? 'bg-[#141517] text-[#F5B800]'
                      : 'bg-[#F6F6F4] text-[#52555A] border border-[#E2E2DC]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div>
              <label
                htmlFor="height-slider"
                className="flex justify-between text-xs font-medium text-[#52555A] mb-1"
              >
                <span>Drag to simulate athlete stature profile:</span>
                <span className="font-mono-lcd font-bold text-[#141517] tabular-nums">
                  {athleteHeightCm} cm
                </span>
              </label>
              <input
                id="height-slider"
                type="range"
                min={155}
                max={198}
                value={athleteHeightCm}
                onChange={(e) => setAthleteHeightCm(Number(e.target.value))}
                className="w-full accent-[#F5B800] cursor-pointer"
              />
            </div>

            {/* Calibrated Readout Cards */}
            <div className="bg-[#F6F6F4] border border-[#E2E2DC] rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-[11px] font-medium text-[#52555A]">Upper Peak Lock</div>
                <div className="mt-1 font-mono-lcd text-lg font-bold text-[#141517] tabular-nums">
                  {peakZoneCm} cm
                </div>
                <div className="text-[11px] text-[#52555A]">Below IR Lens</div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-[#52555A]">Stroke Travel</div>
                <div className="mt-1 font-mono-lcd text-lg font-bold text-[#B48300] tabular-nums">
                  {armReachCm} cm
                </div>
                <div className="text-[11px] text-[#52555A]">Auto-Scaled</div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-[#52555A]">Dead-Hang Reset</div>
                <div className="mt-1 font-mono-lcd text-lg font-bold text-[#059669] tabular-nums">
                  {deadHangCm} cm
                </div>
                <div className="text-[11px] text-[#52555A]">Full Extension</div>
              </div>
            </div>
          </div>
        </section>

        {/* HEAD POINT 03: Full-Range Pull-Up Detection */}
        <section className="bg-white border-2 border-[#141517] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E2DC] pb-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#F5B800] text-[#141517] font-display font-extrabold text-lg flex items-center justify-center shrink-0">
                03
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B48300]">
                  Feature 03 · Range-of-Motion Validator
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#141517]">
                  Full-Range Pull-Up Detection (85%+ Chin Clearance)
                </h2>
              </div>
            </div>
            <span
              className={`font-mono-lcd text-xs font-bold px-3 py-1 rounded-full self-start sm:self-center ${
                romPercent >= 85
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              ROM: {romPercent}%
            </span>
          </div>

          <p className="text-sm font-medium text-[#52555A] mb-4">
            Enforces strict range of motion by requiring the athlete&apos;s chin to pass cleanly above the optical threshold line:
          </p>

          <ul className="space-y-2.5 text-xs sm:text-sm text-[#373A40]">
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>85%+ Chin threshold line:</strong> Optical beam checks that chin clears the bar plane at peak elevation.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Filters out half-reps:</strong> Repetitions reaching only nose or forehead level are discarded.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Requires return to full dead hang:</strong> Prevents short-pulsing at the top of the pull-up bar.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Visualized real-time stroke:</strong> Clear feedback allows athletes to see exactly where chin clearance triggers.
              </span>
            </li>
          </ul>

          {/* Interactive Range-of-Motion Slider & SVG Diagram */}
          <div className="mt-6 pt-5 border-t border-[#E2E2DC] space-y-4">
            <div>
              <label
                htmlFor="rom-slider"
                className="flex justify-between text-xs font-medium text-[#52555A] mb-1"
              >
                <span>Drag Vertical Pull-Up Stroke (0% Dead Hang to 100% Chin Over Bar):</span>
                <span className="font-mono-lcd font-bold text-[#141517] tabular-nums">
                  {romPercent}%
                </span>
              </label>
              <input
                id="rom-slider"
                type="range"
                min={0}
                max={100}
                value={romPercent}
                onChange={(e) => setRomPercent(Number(e.target.value))}
                className="w-full accent-[#F5B800] cursor-pointer"
              />
            </div>

            {/* SVG Pull-Up Bar Diagram */}
            <div className="bg-[#141517] rounded-xl p-4 text-white">
              <svg
                viewBox="0 0 360 150"
                className="w-full h-36"
                role="img"
                aria-label="Pull-up vertical range of motion optical sensor diagram"
              >
                <line x1="30" y1="28" x2="330" y2="28" stroke="#9CA3AF" strokeWidth="6" strokeLinecap="round" />
                <rect x="162" y="10" width="36" height="18" rx="4" fill="#F5B800" />
                <line
                  x1="40"
                  y1="44"
                  x2="320"
                  y2="44"
                  stroke={romPercent >= 85 ? '#10B981' : '#F59E0B'}
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                />
                <text x="44" y="40" fill="#9CA3AF" fontSize="9" fontFamily="monospace">
                  IR CHIN-CLEARANCE THRESHOLD (85%+)
                </text>

                {(() => {
                  const headY = 104 - (romPercent / 100) * 68;
                  const shoulderY = headY + 24;
                  const cleared = romPercent >= 85;
                  return (
                    <g>
                      <line
                        x1="152"
                        y1={shoulderY}
                        x2="136"
                        y2="28"
                        stroke="#D6A682"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="208"
                        y1={shoulderY}
                        x2="224"
                        y2="28"
                        stroke="#D6A682"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="150"
                        y1={shoulderY}
                        x2="210"
                        y2={shoulderY}
                        stroke="#F5B800"
                        strokeWidth="7"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="180"
                        cy={headY}
                        r="13"
                        fill="#1E2024"
                        stroke={cleared ? '#10B981' : '#F5B800'}
                        strokeWidth="3"
                      />
                    </g>
                  );
                })()}
              </svg>

              <div className="mt-2 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                {romPercent >= 85 ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>PEAK REACHED ({romPercent}%): Lower back to 0% dead-hang to complete rep cycle.</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>PARTIAL STROKE ({romPercent}%): Below 85% threshold — half-rep ignored.</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
