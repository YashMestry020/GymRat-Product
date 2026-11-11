import React from 'react';
import {
  Brain,
  Camera,
  CheckCircle2,
  Cpu,
  Layers,
  Lock,
  Play,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { GymRatLogo } from '../components/GymRatLogo';

interface ScalingUpPageProps {
  onNavigate?: (page: 'flow-game' | 'gymbot' | 'overview') => void;
}

export const ScalingUpPage: React.FC<ScalingUpPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Hero Header */}
      <div className="border-b border-[#E2E2DC] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#141517] text-[#F5B800] mb-4">
          <GymRatLogo className="w-4 h-4 text-[#F5B800]" />
          <span>Product Roadmap &amp; Scaling Up Vision</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#141517]">
          GymRat: Scaling Up
        </h1>
        <p className="mt-3 text-base sm:text-lg text-[#52555A] max-w-3xl">
          We are not getting stuck on just one product. GymRat is scaling up into a complete smart
          exercise ecosystem with formation detectors and built-in edge AI.
        </p>
      </div>

      {/* The 3 Core Points — Presented 1 by 1 with Bullet Pointers */}
      <div className="space-y-8">
        {/* POINT 1 */}
        <section className="bg-white border-2 border-[#141517] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E2DC] pb-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#F5B800] text-[#141517] font-display font-extrabold text-lg flex items-center justify-center shrink-0">
                01
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B48300]">
                  Core Foundation
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#141517]">
                  We Are Not Stuck on One Product (GymRat v1 Foundation)
                </h2>
              </div>
            </div>
            <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-[#141517] text-[#F5B800]">
              Current Hardware
            </span>
          </div>

          <p className="text-sm font-medium text-[#52555A] mb-4">
            The GymRat smart pull-ups counter is our proven foundation, engineered for 100% reliable
            bar-mounted rep detection:
          </p>

          <ul className="space-y-2.5 text-xs sm:text-sm text-[#373A40]">
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Pull-up counter is phase one:</strong> Serves as the rock-solid hardware
                baseline for the expanding GymRat ecosystem.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Dual IR optical beam verification:</strong> Verifies complete chin-over-bar
                movement cycles without false triggers or double-counting.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Continuous counting:</strong> Counting does not stop at 12—seamlessly counts
                13, 14, 15, and beyond with clear spoken audio.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Fatigue pacing engine:</strong> Calculates inter-rep time deltas (1s, 3s,
                6s, 7s) to detect pacing slowdowns.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Dual motivation watchdog:</strong> Speaks &quot;Come on!&quot; at 6 seconds
                and &quot;You can do it!&quot; at 9 seconds of inactivity.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>12-second permanent session lock:</strong> Workout automatically ends at 12s
                idle, locking the final count permanently on display until physical Restart is pressed.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Integrated camera onboard logging:</strong> Stores verified repetition photo logs
                locally onto an onboard memory card.
              </span>
            </li>
          </ul>

          <div className="mt-5 pt-4 border-t border-[#E2E2DC] grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#F6F6F4] p-2.5 rounded-xl border border-[#E2E2DC]">
              <div className="text-[#52555A] text-[11px]">Sensor</div>
              <div className="font-bold text-[#141517] mt-0.5">Dual IR Beam</div>
            </div>
            <div className="bg-[#F6F6F4] p-2.5 rounded-xl border border-[#E2E2DC]">
              <div className="text-[#52555A] text-[11px]">Storage</div>
              <div className="font-bold text-[#141517] mt-0.5">Local Storage</div>
            </div>
            <div className="bg-[#F6F6F4] p-2.5 rounded-xl border border-[#E2E2DC]">
              <div className="text-[#52555A] text-[11px]">Lockout</div>
              <div className="font-bold text-[#141517] mt-0.5">12s Idle Freeze</div>
            </div>
          </div>
        </section>

        {/* POINT 2 */}
        <section className="bg-white border-2 border-[#B48300] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E2DC] pb-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#141517] text-[#F5B800] font-display font-extrabold text-lg flex items-center justify-center shrink-0">
                02
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B48300]">
                  Ecosystem Expansion
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#141517]">
                  Smart Exercise Formation &amp; Posture Detector
                </h2>
              </div>
            </div>
            <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-[#F5B800] text-[#141517]">
              Multi-Exercise
            </span>
          </div>

          <p className="text-sm font-medium text-[#52555A] mb-4">
            Scaling out of the pull-up bar onto the gym floor to track biomechanics and protect athletes
            from injury:
          </p>

          <ul className="space-y-2.5 text-xs sm:text-sm text-[#373A40]">
            <li className="flex items-start gap-2">
              <span className="text-[#B48300] font-bold text-base leading-none">•</span>
              <span>
                <strong>Expands past pull-ups:</strong> Covers squats, push-ups, dips, and deadlifts
                across gym racks and free-weight areas.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B48300] font-bold text-base leading-none">•</span>
              <span>
                <strong>17-point biomechanical tracking:</strong> Optical sensor monitors skeleton
                joint nodes in real time 30 times per second without wearables.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B48300] font-bold text-base leading-none">•</span>
              <span>
                <strong>Squat posture guard:</strong> Detects knee caving (valgus), shallow depth,
                and excessive forward spinal tilt.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B48300] font-bold text-base leading-none">•</span>
              <span>
                <strong>Push-up &amp; dip guard:</strong> Detects hazardous elbow flare angles (&gt;75°),
                sagging core, and shoulder impingement risks.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B48300] font-bold text-base leading-none">•</span>
              <span>
                <strong>Deadlift spinal warning:</strong> Immediate buzzer alerts if lumbar spine
                rounds during heavy pulls to prevent back injuries.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B48300] font-bold text-base leading-none">•</span>
              <span>
                <strong>Instant audio injury alerts (&lt;80ms):</strong> Speaker gives fast corrective
                verbal cues: &quot;Tuck elbows!&quot; / &quot;Lower hips!&quot; / &quot;Lock spine!&quot;.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#B48300] font-bold text-base leading-none">•</span>
              <span>
                <strong>Dual validation rule:</strong> A repetition only registers when both full
                range of motion and safe joint angles are verified.
              </span>
            </li>
          </ul>

          <div className="mt-5 pt-4 border-t border-[#E2E2DC] grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#F6F6F4] p-2.5 rounded-xl border border-[#E2E2DC]">
              <div className="text-[#52555A] text-[11px]">Skeleton Nodes</div>
              <div className="font-bold text-[#141517] mt-0.5">17 Joint Keypoints</div>
            </div>
            <div className="bg-[#F6F6F4] p-2.5 rounded-xl border border-[#E2E2DC]">
              <div className="text-[#52555A] text-[11px]">Exercise Range</div>
              <div className="font-bold text-[#141517] mt-0.5">Squats/Push/Dips/Deads</div>
            </div>
            <div className="bg-[#F6F6F4] p-2.5 rounded-xl border border-[#E2E2DC]">
              <div className="text-[#52555A] text-[11px]">Latency</div>
              <div className="font-bold text-[#B48300] mt-0.5">&lt;80ms Audio Alert</div>
            </div>
          </div>
        </section>

        {/* POINT 3 */}
        <section className="bg-white border-2 border-emerald-600 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E2DC] pb-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-display font-extrabold text-lg flex items-center justify-center shrink-0">
                03
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Artificial Intelligence
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#141517]">
                  Built-In Edge AI Feature
                </h2>
              </div>
            </div>
            <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
              On-Device TinyML
            </span>
          </div>

          <p className="text-sm font-medium text-[#52555A] mb-4">
            Autonomous on-device neural processing running 100% offline without subscriptions or cloud
            lag:
          </p>

          <ul className="space-y-2.5 text-xs sm:text-sm text-[#373A40]">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold text-base leading-none">•</span>
              <span>
                <strong>Embedded TinyML neural network:</strong> Runs directly on hardware silicon
                (Dedicated On-Device NPU) with zero cloud server dependency.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold text-base leading-none">•</span>
              <span>
                <strong>100% athlete privacy:</strong> No video streams or photos ever upload to the
                cloud; all inference happens locally on the chip.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold text-base leading-none">•</span>
              <span>
                <strong>0–100% Rep Quality Index (RQI):</strong> Evaluates movement smoothness,
                concentric velocity, and lockout stability per rep.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold text-base leading-none">•</span>
              <span>
                <strong>Predictive fatigue modeling:</strong> Detects micro-tremors and muscle speed
                drops to warn the athlete right before failure.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold text-base leading-none">•</span>
              <span>
                <strong>Adaptive voice motivation:</strong> AI personalizes encouragement timing to
                the athlete&apos;s real-time endurance threshold.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold text-base leading-none">•</span>
              <span>
                <strong>Anti-cheat filter:</strong> Automatically identifies kipping, momentum
                bounces, and incomplete extensions.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold text-base leading-none">•</span>
              <span>
                <strong>Clean metric sync:</strong> Wireless Bluetooth sync exports verified rep
                counts, RQI scores, and fatigue charts without cloud accounts.
              </span>
            </li>
          </ul>

          <div className="mt-5 pt-4 border-t border-[#E2E2DC] grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#F6F6F4] p-2.5 rounded-xl border border-[#E2E2DC]">
              <div className="text-[#52555A] text-[11px]">Processing</div>
              <div className="font-bold text-[#141517] mt-0.5">On-Device Edge NPU</div>
            </div>
            <div className="bg-[#F6F6F4] p-2.5 rounded-xl border border-[#E2E2DC]">
              <div className="text-[#52555A] text-[11px]">Cloud Upload</div>
              <div className="font-bold text-emerald-600 mt-0.5">0% (100% Offline)</div>
            </div>
            <div className="bg-[#F6F6F4] p-2.5 rounded-xl border border-[#E2E2DC]">
              <div className="text-[#52555A] text-[11px]">Form Metric</div>
              <div className="font-bold text-[#141517] mt-0.5">0–100% RQI Score</div>
            </div>
          </div>
        </section>
      </div>

      {/* Action Navigation Footer */}
      <div className="bg-[#141517] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h3 className="font-display text-2xl font-bold text-[#F5B800]">
            Experience the Core System in 3D
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl">
            Test the complete 4-phase GymRat workflow: standing on ground, mounting bar, active
            pull-ups, and dismounting with permanent locked final count.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('flow-game')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#F5B800] text-[#111214] hover:bg-[#E0A800] transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Launch 3D Flow Game</span>
            </button>
          )}
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('gymbot')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-colors cursor-pointer"
            >
              <GymRatLogo className="w-4 h-4 text-[#F5B800]" />
              <span>Ask GymBot AI</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
