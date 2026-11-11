import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Info,
  Lock,
  Play,
  Power,
  RotateCcw,
  ShieldAlert,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { GymRatLogo } from '../components/GymRatLogo';
import {
  CameraPreset,
  CharacterPhase,
  GymRat3DFlowScene,
} from '../components/GymRat3DFlowScene';
import {
  WORKFLOW_STAGES,
  getFinalFeedbackForCount,
  numberToSpokenRep,
} from '../data/gymRatData';
import {
  playAntiCheatRejectSound,
  playButtonClick,
  playCountdownTick,
  playPowerOnChime,
  playRepVerifiedChime,
  playShutterSound,
  speakGymRatVoice,
  stopGymRatVoice,
} from '../utils/gymRatAudio';
import { CapturedFrame, generateEsp32CamSnapshot } from '../utils/esp32CamCanvas';

type WorkoutPhase = 'OFF' | 'READY' | 'COUNTDOWN' | 'ACTIVE' | 'FINISHED';

export const FlowGamePage: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [phase, setPhase] = useState<WorkoutPhase>('OFF');

  // 4 Physical Character Phases
  // 1) STAND_GROUND -> 2) ON_BAR -> 3) PULLING -> 4) OFF_BAR
  const [characterPhase, setCharacterPhase] = useState<CharacterPhase>('STAND_GROUND');
  // Locked state: 12 seconds expired -> Final count locked, display & count frozen until Restart
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const [lcdLine1, setLcdLine1] = useState<string>('SYSTEM OFF');
  const [lcdLine2, setLcdLine2] = useState<string>('Press Power ON');
  const [speakerText, setSpeakerText] = useState<string>(
    'Flip the ON/OFF switch to start GymRat.'
  );
  const [statusPointers, setStatusPointers] = useState<string[]>([
    '• Phase 1: Character standing on ground in standby.',
    '• Step 1: Click "Power ON" below to boot GymRat.',
    '• LCD will display "Hello GymRat" with voice greeting.',
  ]);

  const [countdownVal, setCountdownVal] = useState<number>(6);
  const [repCount, setRepCount] = useState<number>(0);
  const [lastRepIntervalSec, setLastRepIntervalSec] = useState<number | null>(null);
  const [inactivitySec, setInactivitySec] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('arena');
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [showSdModal, setShowSdModal] = useState<boolean>(false);
  const [mobileInfoOpen, setMobileInfoOpen] = useState<boolean>(false);
  const [capturedFrames, setCapturedFrames] = useState<CapturedFrame[]>([]);

  const cycleCameraPreset = useCallback(() => {
    setCameraPreset((prev) => {
      if (prev === 'arena') return 'hardware';
      if (prev === 'hardware') return 'track';
      return 'arena';
    });
  }, []);

  // Imperative 3D animation triggers
  const [repTriggerCounter, setRepTriggerCounter] = useState<number>(0);
  const [halfRepTriggerCounter, setHalfRepTriggerCounter] = useState<number>(0);
  const [camFlashCounter, setCamFlashCounter] = useState<number>(0);
  const [speakerPulseCounter, setSpeakerPulseCounter] = useState<number>(0);

  const lastRepTimestampRef = useRef<number | null>(null);
  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const markStageCompleted = useCallback((stageId: number) => {
    setCompletedStages((prev) => (prev.includes(stageId) ? prev : [...prev, stageId]));
  }, []);

  const announceVoice = useCallback((line: string) => {
    setSpeakerText(line);
    setSpeakerPulseCounter((c) => c + 1);
    speakGymRatVoice(line, soundEnabledRef.current);
  }, []);

  // =========================================================================
  // STAGE 1: POWER ON (Phase 1: Character stands on ground)
  // =========================================================================
  const handlePowerOn = useCallback(() => {
    playPowerOnChime();
    setPhase('READY');
    setCharacterPhase('STAND_GROUND');
    setIsLocked(false);
    setActiveStageId(1);
    markStageCompleted(1);
    setRepCount(0);
    setLastRepIntervalSec(null);
    setInactivitySec(0);
    setTimerRunning(false);
    lastRepTimestampRef.current = null;
    setLcdLine1('Hello GymRat');
    setLcdLine2('System Ready');
    announceVoice('Hello GymRats !');
    setStatusPointers([
      '• Phase 1 Active: Character stands on ground beside pull-up rig.',
      '• LCD: Displays "Hello GymRat" in backlit amber font.',
      '• Speaker: Plays "Hello GymRats !" greeting.',
      '• Next Action: Click Start to trigger Phase 2 (bar mount + countdown).',
    ]);
  }, [announceVoice, markStageCompleted]);

  // =========================================================================
  // STAGE 2: START BUTTON (Phase 2: Got in the pull-up bar)
  // =========================================================================
  const handlePressStart = useCallback(() => {
    playButtonClick();
    setPhase('COUNTDOWN');
    setCharacterPhase('ON_BAR');
    setIsLocked(false);
    setActiveStageId(2);
    setCountdownVal(6);
    setRepCount(0);
    setLastRepIntervalSec(null);
    setInactivitySec(0);
    setTimerRunning(false);
    lastRepTimestampRef.current = null;
    setLcdLine1('Get Ready!');
    setLcdLine2('Countdown: 6s');
    announceVoice('Please get ready, countdown starts in 6 seconds.');
    setStatusPointers([
      '• Phase 2 Active: Character jumped onto pull-up bar and gripped in dead-hang.',
      '• LCD: "Get Ready!" with live countdown: 6 → 5 → 4 → 3 → 2 → 1.',
      '• Speaker: "Please get ready, countdown starts in 6 seconds."',
      '• Optical beam auto-calibrates athlete position while hanging.',
    ]);
  }, [announceVoice]);

  const enterActiveCounting = useCallback(() => {
    playCountdownTick(true);
    setPhase('ACTIVE');
    setCharacterPhase('ON_BAR');
    setIsLocked(false);
    markStageCompleted(2);
    setActiveStageId(3);
    setLcdLine1("Start Pull-Up's!");
    setLcdLine2('IR Sensor Active');
    setInactivitySec(0);
    setTimerRunning(true);
    announceVoice("Start Pull-Up's!");
    setStatusPointers([
      '• Phase 2 -> 3 Ready: Athlete gripped to bar, IR detection loop armed.',
      '• LCD: "Start Pull-Up\'s!" — active counting mode engaged.',
      '• Action: Perform Pull-Up (Spacebar or Click) to execute Phase 3 pull-up!',
      '• Watchdog: 6s "Come on!", 9s "You can do it!", 12s dismount & lock.',
    ]);
  }, [announceVoice, markStageCompleted]);

  useEffect(() => {
    if (phase !== 'COUNTDOWN') return;
    const timer = window.setTimeout(() => {
      if (countdownVal > 1) {
        const nextVal = countdownVal - 1;
        setCountdownVal(nextVal);
        setLcdLine1('Get Ready!');
        setLcdLine2(`Countdown: ${nextVal}`);
        playCountdownTick(false);
        speakGymRatVoice(String(nextVal), soundEnabledRef.current);
      } else {
        enterActiveCounting();
      }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [phase, countdownVal, enterActiveCounting]);

  // =========================================================================
  // STAGES 3 & 4: PERFORM PULL-UP (Phase 3: Do pull-up)
  // =========================================================================
  const logEsp32CamSnapshot = useCallback((repNum: number, intervalSec: number | null) => {
    playShutterSound();
    setCamFlashCounter((c) => c + 1);
    const dataUrl = generateEsp32CamSnapshot(repNum, intervalSec);
    if (dataUrl) {
      const frame: CapturedFrame = {
        id: `cam-${Date.now()}-${repNum}`,
        filename: `GYMRAT_${String(repNum).padStart(3, '0')}.JPG`,
        repNumber: repNum,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        repIntervalSec: intervalSec,
        phase: 'PEAK_CHIN_OVER_BAR',
        dataUrl,
      };
      setCapturedFrames((prev) => [frame, ...prev].slice(0, 24));
    }
  }, []);

  const handlePerformPullUp = useCallback(
    (customIntervalOverride?: number, customPointersOverride?: string[]) => {
      // Locked guard: Final count cannot change once 12s expired
      if (isLocked) {
        return;
      }

      const now = performance.now();
      let deltaSec: number | null = null;
      if (typeof customIntervalOverride === 'number') {
        deltaSec = customIntervalOverride;
      } else if (lastRepTimestampRef.current !== null && repCount > 0) {
        deltaSec = Number(((now - lastRepTimestampRef.current) / 1000).toFixed(1));
      }
      lastRepTimestampRef.current = now;

      const nextCount = repCount + 1;
      const spoken = numberToSpokenRep(nextCount);

      setPhase('ACTIVE');
      // Phase 3: Character does pull-up!
      setCharacterPhase('PULLING');
      // After rep animation completes, character remains on bar
      window.setTimeout(() => {
        setCharacterPhase((curr) => (curr === 'PULLING' ? 'ON_BAR' : curr));
      }, 700);

      setRepCount(nextCount);
      setLastRepIntervalSec(deltaSec);
      setInactivitySec(0);
      setTimerRunning(true);
      setRepTriggerCounter((c) => c + 1);
      playRepVerifiedChime();
      logEsp32CamSnapshot(nextCount, deltaSec);

      markStageCompleted(1);
      markStageCompleted(2);
      markStageCompleted(3);
      if (deltaSec !== null) markStageCompleted(4);

      setActiveStageId(deltaSec !== null && deltaSec >= 3 ? 4 : 3);

      const paceLabel =
        deltaSec === null
          ? 'Starting rep'
          : deltaSec <= 2
          ? `${deltaSec}s (Fast)`
          : deltaSec <= 4
          ? `${deltaSec}s (Steady)`
          : `${deltaSec}s (Fatigue)`;

      setLcdLine1(`Count: ${nextCount}`);
      setLcdLine2(paceLabel);
      announceVoice(spoken);

      if (customPointersOverride) {
        setStatusPointers(customPointersOverride);
      } else if (nextCount >= 13) {
        setStatusPointers([
          `• Phase 3 Verified: Rep #${nextCount} complete ("${spoken}").`,
          '• Critical Rule: Counting does NOT stop at 12—it continues to 13, 14, 15+ seamlessly.',
          `• Speed: ${paceLabel} since last rep | Inactivity timer reset to 0s.`,
          '• Camera: Shutter triggered, photo saved to onboard storage.',
        ]);
      } else {
        setStatusPointers([
          `• Phase 3 Verified: Chin cleared bar -> Count increased to ${nextCount}.`,
          `• LCD Display: "Count: ${nextCount}" | Speaker: "${spoken}".`,
          `• Pace Tracking: ${paceLabel} inter-rep interval recorded.`,
          '• Camera: High-res frame logged to onboard memory card.',
        ]);
      }
    },
    [isLocked, repCount, announceVoice, logEsp32CamSnapshot, markStageCompleted]
  );

  const handleQuickAddFiveReps = useCallback(() => {
    if (isLocked) return;
    const startCount = repCount;
    const targetCount = startCount + 5;
    const spoken = numberToSpokenRep(targetCount);
    lastRepTimestampRef.current = performance.now();
    setPhase('ACTIVE');
    setCharacterPhase('PULLING');
    window.setTimeout(() => {
      setCharacterPhase((curr) => (curr === 'PULLING' ? 'ON_BAR' : curr));
    }, 700);

    setRepCount(targetCount);
    setLastRepIntervalSec(1.0);
    setInactivitySec(0);
    setTimerRunning(true);
    setRepTriggerCounter((c) => c + 1);
    playRepVerifiedChime();
    logEsp32CamSnapshot(targetCount, 1.0);
    markStageCompleted(1);
    markStageCompleted(2);
    markStageCompleted(3);
    markStageCompleted(4);
    setActiveStageId(3);
    setLcdLine1(`Count: ${targetCount}`);
    setLcdLine2('1.0s (Fast)');
    announceVoice(spoken);
    setStatusPointers([
      `• Fast Count Boost: Jumped from ${startCount} to ${targetCount} reps ("${spoken}").`,
      '• Rule Proven: Counting does not stop at 12; user can pull up past 13, 14, 15+.',
      '• Inactivity watchdog reset to 0s.',
      '• Camera snapshots stored on onboard memory card.',
    ]);
  }, [isLocked, repCount, announceVoice, logEsp32CamSnapshot, markStageCompleted]);

  // Anti-Cheat Half-Rep Rejection
  const handleTestHalfRep = useCallback(() => {
    if (isLocked) return;
    setPhase('ACTIVE');
    setActiveStageId(3);
    setHalfRepTriggerCounter((c) => c + 1);
    playAntiCheatRejectSound();
    setLcdLine1(`Count: ${repCount}`);
    setLcdLine2('Half-Rep Ignored');
    announceVoice('Incomplete rep');
    setStatusPointers([
      '• Anti-Cheat Rejection: Athlete reached only 45% range (chin below beam).',
      '• IR sensor cycle did NOT verify a complete rep.',
      `• Count stays strictly at ${repCount} — no false counts or multiple triggers.`,
    ]);
  }, [isLocked, repCount, announceVoice]);

  // =========================================================================
  // STAGES 5 & 7: 12-SECOND FINISH (Phase 4: Got off the pull-up bar)
  // LOCK FINAL COUNT PERMANENTLY UNTIL USER CLICKS RESTART
  // =========================================================================
  const finishSessionWithCount = useCallback(
    (finalTotal: number, reasonPointers?: string[]) => {
      setPhase('FINISHED');
      setTimerRunning(false);
      setInactivitySec(12);
      setRepCount(finalTotal);
      // Phase 4: Athlete drops off the bar to the ground!
      setCharacterPhase('OFF_BAR');
      // Lock final count permanently until user clicks Restart!
      setIsLocked(true);

      markStageCompleted(5);
      markStageCompleted(6);
      setActiveStageId(6);

      const feedback = getFinalFeedbackForCount(finalTotal);
      setLcdLine1(`Final Count: ${finalTotal}`);
      setLcdLine2(feedback.tierLabel);
      announceVoice(feedback.voiceMessage);

      setStatusPointers(
        reasonPointers ?? [
          `• Phase 4 Active: 12 seconds elapsed — athlete got off the pull-up bar!`,
          `• FINAL COUNT LOCKED: LCD displays "Final Count: ${finalTotal}".`,
          `• Count & display will NOT change until user clicks Restart button.`,
          `• Speaker: "${feedback.voiceMessage}" (${feedback.tierLabel}).`,
        ]
      );
    },
    [announceVoice, markStageCompleted]
  );

  useEffect(() => {
    if (phase !== 'ACTIVE' || !timerRunning || isLocked) return;
    const interval = window.setInterval(() => {
      setInactivitySec((prev) => {
        const next = Number((prev + 0.5).toFixed(1));
        if (prev < 6 && next >= 6) {
          setActiveStageId(5);
          markStageCompleted(5);
          setLcdLine1(`Count: ${repCount}`);
          setLcdLine2('Idle 6s: Come on!');
          announceVoice('Come on!');
          setStatusPointers([
            '• Stage 05 (6s Inactivity): First motivation triggered.',
            '• Speaker calls out: "Come on!".',
            '• Inactivity watchdog is running: pull up before 9s to cancel next prompt!',
            '• If idle reaches 12s, athlete drops off bar and count locks permanently.',
          ]);
        } else if (prev < 9 && next >= 9) {
          setActiveStageId(5);
          setLcdLine1(`Count: ${repCount}`);
          setLcdLine2('Idle 9s: Do it!');
          announceVoice('You can do it!');
          setStatusPointers([
            '• Stage 05 (9s Inactivity): Second motivation triggered.',
            '• Speaker calls out: "You can do it!".',
            '• 3 seconds left before session terminates at 12s.',
            '• Pull up now to reset timer to 0s and keep counting!',
          ]);
        } else if (next >= 12) {
          finishSessionWithCount(repCount);
          return 12;
        }
        return next;
      });
    }, 500);
    return () => window.clearInterval(interval);
  }, [phase, timerRunning, isLocked, repCount, announceVoice, finishSessionWithCount, markStageCompleted]);

  // 8-Second Clutch Save Demo (Cancels 9s message, resets timer to 0s)
  const handleSimulate8SecondSave = useCallback(() => {
    if (isLocked) return;
    const baseCount = repCount === 0 ? 6 : repCount;
    const nextCount = baseCount + 1;
    const spoken = numberToSpokenRep(nextCount);
    lastRepTimestampRef.current = performance.now();

    setPhase('ACTIVE');
    setCharacterPhase('PULLING');
    window.setTimeout(() => {
      setCharacterPhase((curr) => (curr === 'PULLING' ? 'ON_BAR' : curr));
    }, 700);

    setRepCount(nextCount);
    setLastRepIntervalSec(8.0);
    setInactivitySec(0);
    setTimerRunning(true);
    setRepTriggerCounter((c) => c + 1);
    playRepVerifiedChime();
    logEsp32CamSnapshot(nextCount, 8.0);

    markStageCompleted(3);
    markStageCompleted(4);
    markStageCompleted(5);
    setActiveStageId(5);

    setLcdLine1(`Count: ${nextCount}`);
    setLcdLine2('8s Save! Timer 0s');
    announceVoice(spoken);
    setStatusPointers([
      '• 8-Second Clutch Save Rule Proven!',
      `• User pulled up at 8s after 6s "Come on!" -> Rep count increased to ${nextCount}.`,
      '• Inactivity timer instantly reset to 0 seconds.',
      '• Pending 9s "You can do it!" voice alert was CANCELED automatically!',
    ]);
  }, [isLocked, repCount, announceVoice, logEsp32CamSnapshot, markStageCompleted]);

  // =========================================================================
  // STAGE 8: RESTART & RESET (Unlocks count & resets to Phase 1: STAND_GROUND)
  // =========================================================================
  const handleRestartReset = useCallback(() => {
    playPowerOnChime();
    setPhase('READY');
    setCharacterPhase('STAND_GROUND');
    setIsLocked(false);
    setActiveStageId(7);
    markStageCompleted(7);
    setRepCount(0);
    setLastRepIntervalSec(null);
    setInactivitySec(0);
    setTimerRunning(false);
    lastRepTimestampRef.current = null;
    setLcdLine1('Hello GymRat');
    setLcdLine2('Reset -> Ready');
    announceVoice('Hello GymRats !');
    setStatusPointers([
      '• System Restarted & Reset Complete!',
      '• Phase 1 Active: Character standing on ground in ready standby.',
      '• Display & count lock released: Active count cleared to 0.',
      '• LCD displays "Hello GymRat" and speaker greets with "Hello GymRats !".',
    ]);
  }, [announceVoice, markStageCompleted]);

  // Direct Stage Selection
  const handleJumpToStage = useCallback(
    (stageId: number) => {
      setActiveStageId(stageId);
      if (stageId === 1) {
        handlePowerOn();
      } else if (stageId === 2) {
        handlePressStart();
      } else if (stageId === 3) {
        handlePerformPullUp();
      } else if (stageId === 4) {
        handlePerformPullUp(6.0, [
          '• Stage 04 (Rep Speed & Fatigue Detection):',
          '• Inter-rep interval increased to 6.0 seconds.',
          '• GymRat flags reduced pace and detects muscular fatigue / rest break.',
          '• Audio pace log updated on LCD line 2.',
        ]);
      } else if (stageId === 5) {
        if (isLocked) return;
        setPhase('ACTIVE');
        setCharacterPhase('ON_BAR');
        setInactivitySec(6.0);
        setTimerRunning(true);
        markStageCompleted(5);
        setLcdLine1(`Count: ${repCount || 5}`);
        setLcdLine2('Idle 6s: Come on!');
        announceVoice('Come on!');
        setStatusPointers([
          '• Stage 05 (Motivation Watchdog):',
          '• 6s idle: Speaker plays "Come on!".',
          '• 9s idle: Speaker plays "You can do it!".',
          '• 12s idle: Athlete drops off bar (Phase 4) and Final Count locks permanently.',
        ]);
      } else if (stageId === 6) {
        const sampleCount = repCount > 0 ? repCount : 14;
        finishSessionWithCount(sampleCount);
      } else if (stageId === 7) {
        handleRestartReset();
      }
    },
    [
      handlePowerOn,
      handlePressStart,
      handlePerformPullUp,
      isLocked,
      repCount,
      markStageCompleted,
      announceVoice,
      logEsp32CamSnapshot,
      finishSessionWithCount,
      handleRestartReset,
    ]
  );

  // Keyboard shortcut: Space = Perform Pull-Up
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handlePerformPullUp();
      } else if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePerformPullUp]);

  const activeStage = WORKFLOW_STAGES.find((s) => s.id === activeStageId) ?? WORKFLOW_STAGES[0];
  const inactivityPct = Math.min(100, (inactivitySec / 12) * 100);

  // Human-readable phase label for HUD
  const phaseDisplay =
    characterPhase === 'STAND_GROUND'
      ? '1. Standing on Ground'
      : characterPhase === 'ON_BAR'
      ? '2. Gripping Pull-Up Bar'
      : characterPhase === 'PULLING'
      ? '3. Performing Pull-Up'
      : '4. Got Off Bar (12s Done)';

  return (
    <div className="relative w-full h-[calc(100dvh-64px)] sm:h-[calc(100vh-64px)] min-h-[520px] sm:min-h-[650px] bg-[#EFEFE9] overflow-hidden">
      {/* 3D WebGL Canvas Container */}
      <div className="w-full h-full">
        <GymRat3DFlowScene
          state={{
            activeStageId,
            completedStages,
            isPowered: phase !== 'OFF',
            characterPhase,
            isLocked,
            lcdLine1,
            lcdLine2,
            repTriggerCounter,
            halfRepTriggerCounter,
            camFlashCounter,
            speakerPulseCounter,
            inactivitySeconds: inactivitySec,
            cameraPreset,
          }}
          onSelectStage={handleJumpToStage}
        />
      </div>

      {/* MOBILE TOP HUD: Clean, Compact & Non-Intrusive */}
      <div className="block sm:hidden absolute top-2.5 left-2.5 right-2.5 z-20 pointer-events-auto space-y-1.5">
        {/* Row 1: Header status + Quick Controls */}
        <div className="flex items-center justify-between gap-1.5 bg-[#141517]/90 backdrop-blur-md text-white border border-white/15 rounded-xl px-3 py-1.5 shadow-lg">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono-lcd text-xs font-bold text-[#F5B800] truncate">
              0{activeStage.id}. {activeStage.shortTitle}
            </span>
            <span className="font-mono-lcd text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-200 font-semibold shrink-0">
              {repCount} Reps
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={cycleCameraPreset}
              title="Cycle 3D camera angle"
              className="px-2 py-1 rounded-md text-[10px] font-semibold bg-[#26282E] text-white border border-white/10 cursor-pointer capitalize"
            >
              Cam: {cameraPreset === 'track' ? 'Track' : cameraPreset}
            </button>
            <button
              type="button"
              onClick={() => {
                if (soundEnabled) stopGymRatVoice();
                setSoundEnabled((prev) => !prev);
              }}
              aria-label="Toggle speaker audio"
              className="p-1.5 rounded-md bg-[#26282E] text-white border border-white/10 cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#F5B800]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowSdModal(true)}
              aria-label="View microSD captures"
              className="p-1.5 rounded-md bg-[#26282E] text-white border border-white/10 cursor-pointer relative"
            >
              <Camera className="w-3.5 h-3.5 text-[#F5B800]" />
              {capturedFrames.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileInfoOpen((prev) => !prev)}
              aria-label="Toggle stage info"
              className="p-1.5 rounded-md bg-[#26282E] text-[#F5B800] border border-white/10 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Compact Glowing Amber LCD Pill */}
        <div
          className={`rounded-xl px-3 py-1.5 font-mono-lcd shadow-md transition-colors relative flex items-center justify-between gap-2 ${
            isLocked
              ? 'bg-[#2A2312] border border-[#F5B800]/50 text-[#F5B800]'
              : phase !== 'OFF'
              ? 'lcd-screen-glow text-[#111214]'
              : 'bg-[#23262D] text-neutral-400'
          }`}
        >
          <div className="min-w-0">
            <div className="text-xs font-bold leading-tight truncate">{lcdLine1}</div>
            <div className="text-[10px] font-semibold opacity-85 leading-tight truncate">
              {lcdLine2}
            </div>
          </div>
          {isLocked ? (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F5B800] text-[#111214] flex items-center gap-0.5 shrink-0">
              <Lock className="w-2.5 h-2.5" />
              <span>LOCKED</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold text-[#111214] opacity-80 shrink-0">
              {inactivitySec > 0 ? `${inactivitySec.toFixed(0)}s/12s` : phaseDisplay.split('.')[1]?.trim() || ''}
            </span>
          )}
        </div>

        {/* Inactivity Watchdog Mini Bar on Mobile */}
        {phase === 'ACTIVE' && (
          <div className="h-1 bg-[#262930]/80 rounded-full overflow-hidden shadow-xs">
            <div
              className={`h-full transition-all duration-150 ${
                inactivitySec >= 9
                  ? 'bg-red-500'
                  : inactivitySec >= 6
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${inactivityPct}%` }}
            />
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM DOCK: Thumb-Friendly Touch Controls */}
      <div className="block sm:hidden absolute bottom-2 left-2 right-2 z-20 pointer-events-auto space-y-1.5">
        {/* Horizontal Scrolling Stage Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {WORKFLOW_STAGES.map((stage) => {
            const isCurrent = stage.id === activeStageId;
            const isDone = completedStages.includes(stage.id);
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleJumpToStage(stage.id)}
                className={`px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#F5B800] text-[#111214]'
                    : isDone
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                    : 'bg-[#141517]/90 text-neutral-300 border border-white/10'
                }`}
              >
                0{stage.id}. {stage.shortTitle}
              </button>
            );
          })}
        </div>

        {/* Primary Touch Actions Card */}
        <div className="bg-[#141517]/95 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 shadow-2xl space-y-1.5">
          <div className="grid grid-cols-12 gap-1.5">
            {/* Big Primary Pull-Up Button */}
            <button
              type="button"
              onClick={() => handlePerformPullUp()}
              disabled={isLocked}
              className={`col-span-7 flex items-center justify-center gap-1.5 h-11 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                isLocked
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/10'
                  : 'bg-[#F5B800] text-[#111214] ring-2 ring-[#F5B800]/50'
              }`}
            >
              <GymRatLogo className="w-4 h-4 text-[#111214]" />
              <span>Pull-Up +1 ({repCount})</span>
            </button>

            {/* Contextual Action Button */}
            {isLocked ? (
              <button
                type="button"
                onClick={handleRestartReset}
                className="col-span-5 flex items-center justify-center gap-1 h-11 rounded-xl text-xs font-bold bg-[#F5B800] text-[#111214] animate-pulse"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            ) : phase === 'OFF' ? (
              <button
                type="button"
                onClick={handlePowerOn}
                className="col-span-5 flex items-center justify-center gap-1 h-11 rounded-xl text-xs font-bold bg-[#252830] text-white border border-white/10"
              >
                <Power className="w-3.5 h-3.5 text-[#F5B800]" />
                <span>Power ON</span>
              </button>
            ) : phase === 'COUNTDOWN' ? (
              <button
                type="button"
                onClick={enterActiveCounting}
                className="col-span-5 flex items-center justify-center gap-1 h-11 rounded-xl text-xs font-bold bg-amber-500/30 text-amber-300 border border-amber-400/30"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{countdownVal}s (Skip)</span>
              </button>
            ) : phase === 'READY' ? (
              <button
                type="button"
                onClick={handlePressStart}
                className="col-span-5 flex items-center justify-center gap-1 h-11 rounded-xl text-xs font-bold bg-[#252830] text-white border border-white/10"
              >
                <Play className="w-3.5 h-3.5 text-[#F5B800]" />
                <span>Start</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => finishSessionWithCount(repCount > 0 ? repCount : 14)}
                className="col-span-5 flex items-center justify-center gap-1 h-11 rounded-xl text-xs font-bold bg-[#252830] text-neutral-200 border border-white/10"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>12s Done</span>
              </button>
            )}
          </div>

          {/* Quick Secondary Helpers Row */}
          <div className="flex items-center justify-between gap-1 text-[10px]">
            <button
              type="button"
              onClick={handleQuickAddFiveReps}
              disabled={isLocked}
              className="flex-1 py-1 px-1.5 rounded-lg bg-[#252830] text-[#F5B800] border border-white/10 text-center font-semibold truncate cursor-pointer"
            >
              +5 Reps
            </button>
            <button
              type="button"
              onClick={handleTestHalfRep}
              disabled={isLocked}
              className="flex-1 py-1 px-1.5 rounded-lg bg-red-950/70 text-red-300 border border-red-700/40 text-center font-semibold truncate cursor-pointer"
            >
              Half-Rep
            </button>
            <button
              type="button"
              onClick={handleSimulate8SecondSave}
              disabled={isLocked}
              className="flex-1 py-1 px-1.5 rounded-lg bg-amber-950/70 text-amber-300 border border-amber-700/40 text-center font-semibold truncate cursor-pointer"
            >
              8s Save
            </button>
            <button
              type="button"
              onClick={handleRestartReset}
              className="flex-1 py-1 px-1.5 rounded-lg bg-[#252830] text-neutral-300 border border-white/10 text-center font-semibold truncate cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE INFO DRAWER MODAL */}
      {mobileInfoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="block sm:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-end p-2.5"
        >
          <div className="bg-[#141517] text-white border border-white/20 rounded-2xl w-full p-4 shadow-2xl space-y-3 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-mono-lcd text-xs font-bold text-[#F5B800]">
                Stage {activeStage.id} Info &amp; Definitions
              </span>
              <button
                type="button"
                onClick={() => setMobileInfoOpen(false)}
                className="w-7 h-7 rounded-lg bg-[#26282E] flex items-center justify-center text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs text-neutral-300 space-y-1.5">
              <div className="font-bold text-white">{activeStage.title}</div>
              <ul className="space-y-1">
                {statusPointers.map((ptr, idx) => (
                  <li key={idx} className="text-neutral-300 text-[11px]">
                    {ptr}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded-xl bg-[#1E2128] border border-white/10 text-xs flex items-center justify-between">
              <span className="text-neutral-400">Speaker Voice:</span>
              <span className="text-[#F5B800] font-semibold">&ldquo;{speakerText}&rdquo;</span>
            </div>

            <button
              type="button"
              onClick={() => setMobileInfoOpen(false)}
              className="w-full py-2 rounded-xl text-xs font-bold bg-[#F5B800] text-[#111214]"
            >
              Close Info &amp; Resume 3D View
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP Top-Left Hardware LCD & Telemetry HUD */}
      <div className="hidden sm:block absolute top-4 left-4 z-10 w-[min(350px,92vw)] bg-[#141517]/95 text-white border border-white/15 rounded-2xl p-4 shadow-xl pointer-events-auto">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono-lcd text-xs font-bold text-[#F5B800]">
            STAGE {activeStage.id} OF 7 · {activeStage.shortTitle.toUpperCase()}
          </span>
          <span className="font-mono-lcd text-xs text-neutral-300 tabular-nums">
            {completedStages.length}/7 Done
          </span>
        </div>

        {/* 4 Physical Phases Indicator */}
        <div className="mt-2 text-[11px] font-mono-lcd px-2.5 py-1 rounded-lg bg-[#1E2128] border border-white/10 flex items-center justify-between">
          <span className="text-neutral-400">Athlete Phase:</span>
          <span className="font-bold text-[#F5B800]">{phaseDisplay}</span>
        </div>

        {/* 16x2 Backlit Amber LCD */}
        <div
          className={`mt-2 rounded-xl px-3.5 py-2.5 font-mono-lcd transition-colors relative ${
            isLocked
              ? 'bg-[#2A2312] border border-[#F5B800]/50 text-[#F5B800]'
              : phase !== 'OFF'
              ? 'lcd-screen-glow text-[#111214]'
              : 'bg-[#23262D] text-neutral-400'
          }`}
        >
          {isLocked && (
            <div className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F5B800] text-[#111214] flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              <span>COUNT LOCKED</span>
            </div>
          )}
          <div className="text-base font-bold leading-tight truncate">{lcdLine1}</div>
          <div className="text-xs font-semibold opacity-90 leading-tight mt-0.5 truncate">
            {lcdLine2}
          </div>
        </div>

        {/* Telemetry Numbers */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center bg-[#1D1F24] rounded-xl p-2 border border-white/10">
          <div>
            <div className="text-[11px] text-neutral-400">Pull-Ups</div>
            <div className="font-mono-lcd text-lg font-bold text-white tabular-nums">
              {repCount}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-neutral-400">Rep Speed</div>
            <div className="font-mono-lcd text-sm font-bold text-[#F5B800] tabular-nums mt-0.5">
              {lastRepIntervalSec === null ? 'Start' : `${lastRepIntervalSec.toFixed(1)}s`}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-neutral-400">microSD</div>
            <div className="font-mono-lcd text-sm font-bold text-emerald-400 tabular-nums mt-0.5">
              {capturedFrames.length} JPG
            </div>
          </div>
        </div>

        {/* Inactivity Watchdog Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-neutral-300 mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#F5B800]" />
              <span>Inactivity Timer</span>
            </span>
            <span className="font-mono-lcd tabular-nums">
              {inactivitySec.toFixed(1)}s / 12.0s
            </span>
          </div>
          <div className="relative h-2 bg-[#262930] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                inactivitySec >= 9
                  ? 'bg-red-500'
                  : inactivitySec >= 6
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${inactivityPct}%` }}
            />
            <div
              title="6s: Come on!"
              className="absolute top-0 bottom-0 w-0.5 bg-white/70"
              style={{ left: '50%' }}
            />
            <div
              title="9s: You can do it!"
              className="absolute top-0 bottom-0 w-0.5 bg-white/70"
              style={{ left: '75%' }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono-lcd text-neutral-400 mt-1">
            <span>0s</span>
            <span>6s: Come on!</span>
            <span>9s: Do it!</span>
            <span>12s: End Set</span>
          </div>
        </div>

        {/* Live Speaker Subtitle */}
        <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-start gap-2 text-xs">
          <Volume2 className="w-4 h-4 text-[#F5B800] shrink-0 mt-0.5" />
          <span className="text-neutral-200 leading-snug">&ldquo;{speakerText}&rdquo;</span>
        </div>
      </div>

      {/* DESKTOP Top-Right Camera Presets, Audio Toggle & microSD Gallery */}
      <div className="hidden sm:flex absolute top-4 right-4 z-10 flex-wrap items-center justify-end gap-2 pointer-events-auto">
        <div className="inline-flex items-center gap-1 p-1 bg-[#141517]/95 border border-white/15 rounded-xl text-xs">
          {(['arena', 'hardware', 'track'] as CameraPreset[]).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setCameraPreset(preset)}
              className={`px-2.5 py-1.5 rounded-lg font-semibold capitalize transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                cameraPreset === preset
                  ? 'bg-[#F5B800] text-[#111214]'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              {preset === 'track' ? 'Flow Track' : preset}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            if (soundEnabled) stopGymRatVoice();
            setSoundEnabled((prev) => !prev);
          }}
          aria-label={soundEnabled ? 'Mute GymRat speaker' : 'Unmute GymRat speaker'}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#141517]/95 text-white border border-white/15 hover:border-[#F5B800] cursor-pointer whitespace-nowrap shrink-0"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#F5B800]" />
              <span className="hidden sm:inline">Voice ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Muted</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowSdModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#141517]/95 text-white border border-white/15 hover:border-[#F5B800] cursor-pointer whitespace-nowrap shrink-0"
        >
          <Camera className="w-3.5 h-3.5 text-[#F5B800]" />
          <span>microSD ({capturedFrames.length})</span>
        </button>
      </div>

      {/* DESKTOP Unified Bottom Control Dock */}
      <div
        className={`hidden sm:block absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(1000px,95vw)] transition-transform duration-200 pointer-events-auto ${
          dockCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-t-xl bg-[#141517] text-[#F5B800] text-xs font-semibold border border-b-0 border-white/15 cursor-pointer"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show 4-Phase Flowchart Controls (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Controls (H)</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-[#141517]/95 text-white border border-white/15 rounded-2xl p-3.5 sm:p-4 shadow-2xl space-y-3">
          {/* Row 1: 8-Stage Interactive Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {WORKFLOW_STAGES.map((stage) => {
              const isCurrent = stage.id === activeStageId;
              const isDone = completedStages.includes(stage.id);
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => handleJumpToStage(stage.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#F5B800] text-[#111214]'
                      : isDone
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/80'
                      : 'bg-[#22252B] text-neutral-300 hover:text-white'
                  }`}
                >
                  <span className="font-mono-lcd">0{stage.id}</span>
                  <span>{stage.shortTitle}</span>
                  {isDone && !isCurrent && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Row 2: Definitions & Status Strictly in POINTERS */}
          <div className="text-xs text-neutral-200 bg-[#1D2026] border border-white/10 rounded-xl p-3 leading-relaxed">
            <div className="font-bold text-[#F5B800] text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Stage {activeStage.id} Info &amp; Character Status (Pointers):</span>
              {isLocked && (
                <span className="text-amber-300 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Locked: Only Restart resets count
                </span>
              )}
            </div>
            <ul className="space-y-1">
              {statusPointers.map((ptr, idx) => (
                <li key={idx} className="text-neutral-300">
                  {ptr}
                </li>
              ))}
            </ul>
          </div>

          {/* Row 3: Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePowerOn}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#252830] hover:bg-[#323640] text-white border border-white/10 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Power className="w-3.5 h-3.5 text-[#F5B800]" />
              <span>Phase 1: Power ON (Ground)</span>
            </button>

            <button
              type="button"
              onClick={handlePressStart}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#252830] hover:bg-[#323640] text-white border border-white/10 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="w-3.5 h-3.5 text-[#F5B800]" />
              <span>
                {phase === 'COUNTDOWN'
                  ? `Phase 2: Countdown (${countdownVal}s)`
                  : 'Phase 2: Start (Grip Bar)'}
              </span>
            </button>

            {phase === 'COUNTDOWN' && (
              <button
                type="button"
                onClick={enterActiveCounting}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Skip Countdown</span>
              </button>
            )}

            {/* Phase 3 Button: Pull-Up (Disabled when locked) */}
            <button
              type="button"
              onClick={() => handlePerformPullUp()}
              disabled={isLocked}
              title={isLocked ? 'Session locked: Click Restart to reset' : 'Perform Pull-Up (Spacebar)'}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                isLocked
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/10'
                  : 'bg-[#F5B800] hover:bg-[#E0A800] text-[#111214] cursor-pointer'
              }`}
            >
              <GymRatLogo className="w-4 h-4 text-[#111214]" />
              <span>Phase 3: Pull-Up +1 (Space)</span>
            </button>

            <button
              type="button"
              onClick={handleQuickAddFiveReps}
              disabled={isLocked}
              className={`inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 ${
                isLocked
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-[#252830] hover:bg-[#323640] text-[#F5B800] border border-white/10 cursor-pointer'
              }`}
            >
              <span>+5 Reps (Test 13+)</span>
            </button>

            <button
              type="button"
              onClick={handleTestHalfRep}
              disabled={isLocked}
              className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 ${
                isLocked
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-red-950/70 hover:bg-red-900/80 text-red-200 border border-red-700/40 cursor-pointer'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Half-Rep (Anti-Cheat)</span>
            </button>

            <button
              type="button"
              onClick={handleSimulate8SecondSave}
              disabled={isLocked}
              className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 ${
                isLocked
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-amber-950/80 hover:bg-amber-900/80 text-amber-200 border border-amber-700/40 cursor-pointer'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Save at 8s (Cancels 9s)</span>
            </button>

            {/* Phase 4 Button: 12s Done -> Off bar & Lock */}
            <button
              type="button"
              onClick={() => finishSessionWithCount(repCount > 0 ? repCount : 14)}
              disabled={isLocked}
              className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 ${
                isLocked
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-700/40 cursor-pointer'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>6. 12s Done (Off Bar &amp; Lock)</span>
            </button>

            {/* Restart Button: ONLY action that unlocks and resets */}
            <button
              type="button"
              onClick={handleRestartReset}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isLocked
                  ? 'bg-[#F5B800] text-[#111214] ring-2 ring-[#F5B800] animate-pulse'
                  : 'bg-[#252830] hover:bg-[#323640] text-white border border-white/10'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-inherit" />
              <span>{isLocked ? '7. Click to Restart & Reset' : '7. Restart'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workout Camera Drawer Modal */}
      {showSdModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Workout Camera Captures"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#E2E2DC] rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-[#E2E2DC] flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-[#141517]">
                  Workout Camera Local Captures
                </h3>
                <p className="text-xs text-[#52555A]">
                  Stage 06 · Captured frames stored directly on the camera&apos;s memory card
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSdModal(false)}
                aria-label="Close memory modal"
                className="w-9 h-9 rounded-lg border border-[#E2E2DC] flex items-center justify-center text-[#141517] hover:bg-[#F6F6F4] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-4 rounded-xl bg-[#F6F6F4] border border-[#E2E2DC] text-xs sm:text-sm text-[#52555A]">
                <strong className="text-[#141517]">Local Storage Architecture (Pointers):</strong>
                <ul className="mt-1.5 space-y-1">
                  <li>• Captures high-res JPEG frames at peak chin elevation.</li>
                  <li>• Photos saved locally to high-speed onboard memory slot.</li>
                  <li>• Optical IR sensor remains primary instant counting mechanism.</li>
                  <li>• Preserves visual evidence for form review without cloud streaming lag.</li>
                </ul>
              </div>

              {capturedFrames.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-[#D8D8D0] rounded-xl">
                  <Cpu className="w-8 h-8 text-[#B48300] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#141517]">
                    No workout photos captured yet
                  </p>
                  <p className="text-xs text-[#52555A] mt-1">
                    Perform a pull-up in the 3D Flow Game to trigger the camera shutter and log a
                    snapshot to local memory.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {capturedFrames.map((frame) => (
                    <div
                      key={frame.id}
                      className="border border-[#E2E2DC] rounded-xl overflow-hidden bg-[#141517] text-white"
                    >
                      <img
                        src={frame.dataUrl}
                        alt={`Camera capture for Pull-Up #${frame.repNumber}`}
                        referrerPolicy="no-referrer"
                        className="w-full aspect-[16/10] object-cover"
                      />
                      <div className="p-3 flex items-center justify-between text-xs font-mono-lcd">
                        <span className="text-[#F5B800] font-bold">{frame.filename}</span>
                        <span className="text-neutral-300">{frame.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
