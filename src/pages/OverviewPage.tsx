import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Play,
  Volume2,
} from 'lucide-react';
import { GymRatLogo } from '../components/GymRatLogo';
import {
  HARDWARE_HOTSPOTS,
  PageId,
  numberToSpokenRep,
} from '../data/gymRatData';
import {
  playButtonClick,
  playRepVerifiedChime,
  speakGymRatVoice,
} from '../utils/gymRatAudio';

interface OverviewPageProps {
  onNavigate: (page: PageId) => void;
}

const SAMPLE_REP_ROWS = [
  { rep: 1, lcd: 'Count: 1', speaker: 'One' },
  { rep: 2, lcd: 'Count: 2', speaker: 'Two' },
  { rep: 3, lcd: 'Count: 3', speaker: 'Three' },
  { rep: 4, lcd: 'Count: 4', speaker: 'Four' },
  { rep: 5, lcd: 'Count: 5', speaker: 'Five' },
  { rep: 12, lcd: 'Count: 12', speaker: 'Twelve' },
  { rep: 13, lcd: 'Count: 13', speaker: 'Thirteen' },
  { rep: 14, lcd: 'Count: 14', speaker: 'Fourteen' },
  { rep: 15, lcd: 'Count: 15', speaker: 'Fifteen' },
];

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [photoView, setPhotoView] = useState<'studio' | 'mounted'>('studio');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>('lcd');
  const [imgError, setImgError] = useState<{ studio: boolean; mounted: boolean }>({
    studio: false,
    mounted: false,
  });

  const activeHotspot =
    HARDWARE_HOTSPOTS.find((h) => h.id === selectedHotspotId) ?? HARDWARE_HOTSPOTS[0];

  const activeImgSrc =
    photoView === 'studio'
      ? '/assets/aistudio/image_5bef5a52.png'
      : '/assets/aistudio/image_fb6b2c4c.png';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header Banner */}
      <div className="border-b border-[#E2E2DC] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#141517] text-[#F5B800] mb-4">
          <GymRatLogo className="w-4 h-4 text-[#F5B800]" />
          <span>Product Overview &amp; Hardware Guide</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#141517]">
          GymRat: Smart Pull-Ups Counter
        </h1>
        <p className="mt-3 text-base sm:text-lg text-[#52555A] max-w-3xl">
          Complete hardware overview of the GymRat device: dual IR optical beam verification, continuous counting past 12, inter-rep fatigue tracking, and 12-second session lockout.
        </p>

        {/* Quick KPI Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white border border-[#E2E2DC] rounded-xl p-3">
            <div className="font-mono-lcd text-xl font-bold text-[#141517]">07 Stages</div>
            <div className="text-[11px] text-[#52555A] mt-0.5">Workflow Cycle</div>
          </div>
          <div className="bg-white border border-[#E2E2DC] rounded-xl p-3">
            <div className="font-mono-lcd text-xl font-bold text-[#141517]">13, 14, 15+</div>
            <div className="text-[11px] text-[#52555A] mt-0.5">Continuous Count</div>
          </div>
          <div className="bg-white border border-[#E2E2DC] rounded-xl p-3">
            <div className="font-mono-lcd text-xl font-bold text-[#141517]">6s · 9s · 12s</div>
            <div className="text-[11px] text-[#52555A] mt-0.5">Watchdog Timer</div>
          </div>
          <div className="bg-white border border-[#E2E2DC] rounded-xl p-3">
            <div className="font-mono-lcd text-xl font-bold text-[#141517]">IR + Optics</div>
            <div className="text-[11px] text-[#52555A] mt-0.5">Onboard Storage</div>
          </div>
        </div>
      </div>

      {/* Head Points: Laid Out 1 by 1 in Clean Sequential Cards */}
      <div className="space-y-8">
        {/* HEAD POINT 01: Core Product Value & Quick Bench */}
        <section className="bg-white border-2 border-[#141517] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E2DC] pb-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#F5B800] text-[#141517] font-display font-extrabold text-lg flex items-center justify-center shrink-0">
                01
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B48300]">
                  Core Product Highlights
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#141517]">
                  Every Pull-Up Verified, Timed, and Spoken Aloud
                </h2>
              </div>
            </div>
            <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-[#141517] text-[#F5B800]">
              Hardware Ready
            </span>
          </div>

          <p className="text-sm font-medium text-[#52555A] mb-4">
            GymRat clamps directly to your pull-up bar, verifies strict form without false counts, and gives real-time voice feedback:
          </p>

          <ul className="space-y-2.5 text-xs sm:text-sm text-[#373A40]">
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Universal bar clamp:</strong> Clamps securely onto any standard pull-up bar (28mm–34mm diameter) with quick-lock tightening.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Dual IR optical beam verification:</strong> Verifies complete chin-over-bar movement cycles without false triggers or double-counting.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Continuous counting past 12:</strong> Does not stop at 12—counts seamlessly to 13, 14, 15, and onward with spoken numbers.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Live fatigue pace tracking:</strong> Calculates time elapsed between reps (1s, 3s, 6s, 7s) to detect pacing drops.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Inactivity watchdog:</strong> Speaks &quot;Come on!&quot; at 6 seconds and &quot;You can do it!&quot; at 9 seconds of inactivity.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>12-second permanent session lock:</strong> Workout automatically ends at 12s idle, permanently freezing final count until physical Restart is pressed.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Integrated camera photo capture:</strong> Logs workout snapshots directly onto an onboard memory card.
              </span>
            </li>
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('flow-game')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#111214] bg-[#F5B800] hover:bg-[#E0A800] rounded-xl transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch 3D Workflow Game</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('gymbot')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#141517] bg-[#F6F6F4] hover:bg-[#ECECE7] border border-[#D8D8D0] rounded-xl transition-colors cursor-pointer"
            >
              <span>Ask GymBot Specialist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* HEAD POINT 02: Hardware Anatomy & Real Device Architecture */}
        <section className="bg-white border-2 border-[#141517] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E2DC] pb-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#141517] text-[#F5B800] font-display font-extrabold text-lg flex items-center justify-center shrink-0">
                02
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B48300]">
                  Hardware Architecture
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#141517]">
                  Hardware Anatomy &amp; Component Inspection
                </h2>
              </div>
            </div>

            {/* Photo Angle Switcher */}
            <div
              role="group"
              aria-label="Hardware photo view"
              className="inline-flex items-center gap-1 p-1 bg-[#F6F6F4] border border-[#E2E2DC] rounded-lg"
            >
              <button
                type="button"
                onClick={() => setPhotoView('studio')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  photoView === 'studio'
                    ? 'bg-[#141517] text-[#F5B800]'
                    : 'text-[#52555A] hover:text-[#141517]'
                }`}
              >
                01. Front Unit
              </button>
              <button
                type="button"
                onClick={() => setPhotoView('mounted')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  photoView === 'mounted'
                    ? 'bg-[#141517] text-[#F5B800]'
                    : 'text-[#52555A] hover:text-[#141517]'
                }`}
              >
                02. Bar-Mounted
              </button>
            </div>
          </div>

          <p className="text-sm font-medium text-[#52555A] mb-4">
            Click any numbered hotspot pin on the GymRat device to inspect its role and technical specs:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Photo Container with Hotspots */}
            <div className="relative max-w-[420px] mx-auto w-full aspect-square rounded-xl overflow-hidden bg-[#C7C2B8] border border-[#E2E2DC]">
              {!imgError[photoView] ? (
                <img
                  src={activeImgSrc}
                  alt={
                    photoView === 'studio'
                      ? 'GymRat smart pull-up counter front hardware unit'
                      : 'GymRat smart pull-up counter clamped onto pull-up bar'
                  }
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setImgError((prev) => ({
                      ...prev,
                      [photoView]: true,
                    }))
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#141517] text-white">
                  <Cpu className="w-10 h-10 text-[#F5B800] mb-2" />
                  <p className="font-display text-xl font-bold">GymRat Hardware Unit</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Matte Charcoal Enclosure · Safety-Yellow Bumpers · 16x2 LCD · Optical Sensor & Camera
                  </p>
                </div>
              )}

              {/* Interactive Hotspot Pins */}
              {HARDWARE_HOTSPOTS.map((spot, idx) => {
                const coords = photoView === 'studio' ? spot.posStudio : spot.posMounted;
                const isSelected = spot.id === selectedHotspotId;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    aria-label={`Inspect ${spot.label}`}
                    onClick={() => {
                      setSelectedHotspotId(spot.id);
                      playButtonClick();
                    }}
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full font-mono-lcd text-xs font-bold flex items-center justify-center transition-transform cursor-pointer shadow-md ${
                      isSelected
                        ? 'bg-[#F5B800] text-[#111214] scale-115 ring-4 ring-[#141517]/70 z-20'
                        : 'bg-[#141517]/90 text-white hover:bg-[#F5B800] hover:text-[#111214] border border-white/40 z-10'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Selected Hotspot Details in Pointers */}
            <div className="bg-[#F6F6F4] border border-[#E2E2DC] rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E2DC] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono-lcd text-xs font-bold px-2.5 py-0.5 rounded bg-[#141517] text-[#F5B800]">
                    {activeHotspot.partCode}
                  </span>
                  <h3 className="text-base font-bold text-[#141517]">{activeHotspot.label}</h3>
                </div>
                <span className="text-xs font-medium text-[#52555A]">
                  {activeHotspot.workflowLink}
                </span>
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-[#141517]">
                Component Specifications (Pointers):
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-[#373A40]">
                {activeHotspot.pointers.map((ptr, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2">
                    <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
                    <span>{ptr.replace(/^•\s*/, '')}</span>
                  </li>
                ))}
              </ul>

              {/* Hotspots Quick Switcher */}
              <div className="pt-3 border-t border-[#E2E2DC] flex flex-wrap gap-1.5">
                {HARDWARE_HOTSPOTS.map((spot, idx) => (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => {
                      setSelectedHotspotId(spot.id);
                      playButtonClick();
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      spot.id === selectedHotspotId
                        ? 'bg-[#141517] text-[#F5B800]'
                        : 'bg-white text-[#52555A] hover:text-[#141517] border border-[#E2E2DC]'
                    }`}
                  >
                    {idx + 1}. {spot.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HEAD POINT 03: Automatic LCD Display & Real-Time Spoken Rep Output */}
        <section className="bg-white border-2 border-[#141517] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E2DC] pb-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#F5B800] text-[#141517] font-display font-extrabold text-lg flex items-center justify-center shrink-0">
                03
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B48300]">
                  Automatic Counting Output
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#141517]">
                  LCD Display &amp; Real-Time Spoken Numbers (No Cap at 12)
                </h2>
              </div>
            </div>
            <span className="font-mono-lcd text-xs font-bold text-[#059669] px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200">
              UNBOUNDED 13, 14, 15+
            </span>
          </div>

          <p className="text-sm font-medium text-[#52555A] mb-4">
            System rules for repetition counting, visual LCD output, and audio announcements:
          </p>

          <ul className="space-y-2.5 text-xs sm:text-sm text-[#373A40] mb-6">
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Instant count increment:</strong> Successful chin-over-bar movement triggers counter +1 instantly.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Synchronized display &amp; voice:</strong> LCD displays &quot;Count: N&quot; while speaker calls the matching word (&quot;One&quot;, &quot;Two&quot;, &quot;Twelve&quot;).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>No upper boundary at 12:</strong> Counting does not stop at 12—it continues continuously for all subsequent reps (13, 14, 15, and onward).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F5B800] font-bold text-base leading-none">•</span>
              <span>
                <strong>Anti-bounce debounce:</strong> Requires return to full arm hang before registering the next count, preventing false multiples.
              </span>
            </li>
          </ul>

          {/* Rep Counting Table */}
          <div className="overflow-x-auto border border-[#E2E2DC] rounded-xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#F6F6F4] border-b border-[#E2E2DC] text-xs font-semibold text-[#52555A]">
                  <th className="py-2.5 px-4">Pull-Up</th>
                  <th className="py-2.5 px-4">LCD Display</th>
                  <th className="py-2.5 px-4">Speaker Voice</th>
                  <th className="py-2.5 px-4 text-right">Voice Sample</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E0] font-mono-lcd tabular-nums">
                {SAMPLE_REP_ROWS.map((row) => (
                  <tr
                    key={row.rep}
                    className={row.rep >= 13 ? 'bg-[#FEF9E6]/60' : 'hover:bg-[#F6F6F4]/60'}
                  >
                    <td className="py-2.5 px-4 font-bold text-[#141517]">#{row.rep}</td>
                    <td className="py-2.5 px-4 text-[#141517]">{row.lcd}</td>
                    <td className="py-2.5 px-4 font-sans text-[#52555A]">
                      &ldquo;{row.speaker}&rdquo;
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          playRepVerifiedChime();
                          speakGymRatVoice(row.speaker, true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-sans font-semibold bg-[#141517] text-[#F5B800] hover:bg-[#2A2C32] cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Hear</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
