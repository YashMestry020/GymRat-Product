export type GymBotRole = 'engineer' | 'coach' | 'tester';

export interface GymBotMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  pointers?: string[];
  lcdPreview?: { line1: string; line2: string };
  speakerQuote?: string;
  isOffTopic?: boolean;
  suggestedFollowUps?: string[];
  timestamp: string;
}

const GYMRAT_DOMAIN_KEYWORDS = [
  'gymrat',
  'gym rat',
  'gymbot',
  'gym bot',
  'pull-up',
  'pullup',
  'pull up',
  'pull-ups',
  'pullups',
  'pull ups',
  'rep',
  'reps',
  'count',
  'counter',
  'counting',
  '12',
  '13',
  '14',
  '15',
  '30',
  '31',
  'ir',
  'infrared',
  'sensor',
  'lcd',
  'display',
  'screen',
  'speaker',
  'voice',
  'audio',
  'sound',
  'hello gymrat',
  'get ready',
  'countdown',
  '6 second',
  '6s',
  '5 second',
  '8 second',
  '8s',
  '9 second',
  '9s',
  '12 second',
  '12s',
  'inactivity',
  'timer',
  'motivation',
  'motivate',
  'come on',
  'you can do it',
  'esp32',
  'esp32-cam',
  'cam',
  'camera',
  'photo',
  'photos',
  'picture',
  'microsd',
  'sd card',
  'restart',
  'reset',
  'power',
  'switch',
  'on/off',
  'start',
  'button',
  'anti-cheat',
  'anticheat',
  'cheat',
  'verified',
  'calibration',
  'calibrate',
  'full-range',
  'full range',
  'range',
  'speed',
  'fatigue',
  'break',
  'pause',
  'well done',
  'oh wow',
  'excellent',
  'consistent',
  'hardware',
  'device',
  'clamp',
  'bar',
  'workflow',
  'spec',
  'specs',
  'scaling',
  'scale',
  'scaling up',
  'formation',
  'posture',
  'squat',
  'squats',
  'push-up',
  'pushup',
  'dips',
  'dip',
  'deadlift',
  'deadlifts',
  'edge ai',
  'ai feature',
  'built-in ai',
  'vision ml',
  'tinyml',
  'roadmap',
  'product 2',
  'product 3',
];

const OFF_TOPIC_INDICATORS = [
  'weather',
  'forecast',
  'temperature',
  'rain',
  'climate',
  'president',
  'election',
  'prime minister',
  'politics',
  'movie',
  'film',
  'song',
  'music',
  'cricket',
  'football',
  'soccer',
  'bitcoin',
  'crypto',
  'stock',
  'recipe',
  'cook',
  'pizza',
  'pasta',
  'biryani',
  'python',
  'javascript',
  'java ',
  'c++',
  'html',
  'css',
  'sql',
  'homework',
  'essay',
  'poem',
  'joke',
  'riddle',
  'astrology',
  'horoscope',
  'protein shake',
  'creatine',
  'diet plan',
  'weight loss',
];

const GREETING_ONLY = /^(hi|hello|hey|namaste|yo|hola|good morning|good evening|help|start)[\s!?.]*$/i;

function isAboutGymRat(input: string): boolean {
  const lower = input.toLowerCase().trim();
  if (!lower) return true;
  if (GREETING_ONLY.test(lower)) return true;

  const hasGymRatKeyword = GYMRAT_DOMAIN_KEYWORDS.some((kw) => lower.includes(kw));
  const hasOffTopicKeyword = OFF_TOPIC_INDICATORS.some((kw) => lower.includes(kw));

  if (hasOffTopicKeyword && !hasGymRatKeyword) {
    return false;
  }
  return hasGymRatKeyword;
}

function formatTime(): string {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function generateGymBotResponse(
  rawInput: string,
  role: GymBotRole
): GymBotMessage {
  const text = rawInput.trim();
  const lower = text.toLowerCase();

  // 1. Strict Domain Guardrail Check
  if (!isAboutGymRat(text)) {
    return {
      id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: 'bot',
      isOffTopic: true,
      text: 'I am GymBot, the dedicated specialist for GymRat and its scaling ecosystem. I answer exclusively about GymRat hardware, pull-up verification, watchdog timers, and next-generation formation detectors.',
      pointers: [
        '• Off-topic query detected: GymBot only responds to GymRat topics.',
        '• Ask about GymRat v1: 7-stage workflow, IR counting, 12s lock rule.',
        '• Ask about Motivation Watchdog: 6s "Come on!", 9s "You can do it!".',
        '• Ask about Scaling Up: Smart exercise formation detector & edge AI.',
      ],
      suggestedFollowUps: [
        'Walk me through Power ON & 6s countdown',
        'Does counting stop at 12 pull-ups?',
        'What happens if I pause for 8 seconds then pull up?',
        'Tell me about Scaling Up and Edge AI features',
      ],
      timestamp: formatTime(),
    };
  }

  // 2. Greeting / Roleplay Intro
  if (GREETING_ONLY.test(lower) || lower.includes('roleplay') || lower.includes('who are you')) {
    const roleIntro =
      role === 'coach'
        ? "Welcome to GymBot! I'm your interactive GymRat Workout Coach."
        : role === 'tester'
        ? 'GymBot QA Stress-Test mode active!'
        : "Hello! I'm GymBot, your dedicated GymRat product engineer.";

    const pointers =
      role === 'coach'
        ? [
            '• Role: Workout Coach walking you through live pull-up sets.',
            '• Audio & LCD: Simulates real-time speaker voice cues and LCD status.',
            '• Watchdog: Tracks 6s, 9s, and 12s inactivity motivation tiers.',
            '• Try asking: "What happens if I pause for 8 seconds?"',
          ]
        : role === 'tester'
        ? [
            '• Role: QA Stress-Tester verifying boundary conditions and edge cases.',
            '• Test rules: Counting past 12 (13, 14, 15+), half-rep rejections.',
            '• Watchdog tests: 8s clutch rep canceling 9s voice message.',
            '• Lock tests: Final count locking after 12s until Restart is clicked.',
          ]
        : [
            '• Role: Product Engineer detailing GymRat electronics and firmware.',
            '• Primary Sensor: IR optical beam cycle verification.',
            '• Camera Logger: Dedicated optical camera saving frames to onboard memory card.',
            '• Ecosystem: Scaling into Smart Exercise Formation Detectors.',
          ];

    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: roleIntro,
      pointers,
      lcdPreview: { line1: 'Hello GymRat', line2: 'GymBot Ready' },
      speakerQuote: 'Hello GymRats !',
      suggestedFollowUps: [
        'How does Power ON & Start countdown work?',
        'Does counting stop at 12?',
        'What happens at 6s, 8s, 9s, and 12s inactivity?',
        'Tell me about Scaling Up to other exercises',
      ],
      timestamp: formatTime(),
    };
  }

  // 3A. The 4 Physical Character Phases (Exact Answer)
  if (
    lower.includes('phase') ||
    lower.includes('phases') ||
    (lower.includes('character') && (lower.includes('ground') || lower.includes('bar') || lower.includes('pull')))
  ) {
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: 'GymRat operates strictly across 4 distinct physical character phases in the 3D game:',
      pointers: [
        '• Phase 1: Standing on Ground — Athlete stands on the gym floor beside the rig during Power ON & standby.',
        '• Phase 2: Gripping Pull-Up Bar — When Start is pressed, the athlete jumps up and hangs from the bar during the 6-second countdown (6 → 5 → 4 → 3 → 2 → 1).',
        '• Phase 3: Do Pull-Up(s) — During active workout, the athlete elevates chin over the bar, triggers IR optical verification, increments count (+1), and drops back to bar hang.',
        '• Phase 4: Got Off the Pull-Up Bar (12s Done) — When 12s of inactivity expire, athlete drops off the bar to the ground, and Final Count is permanently LOCKED until user clicks Restart.',
      ],
      lcdPreview: { line1: '4 Character Phases', line2: 'Ground -> Bar -> Rep -> Off' },
      speakerQuote: '4 Phases: Ground, On Bar, Pull-Up, Off Bar',
      suggestedFollowUps: [
        'How does the 12s lock rule work?',
        'Does counting stop at 12 pull-ups?',
        'What happens if I pause for 8 seconds?',
      ],
      timestamp: formatTime(),
    };
  }

  // 3B. 12-Second Lock Rule (Exact Answer)
  if (
    (lower.includes('12') && (lower.includes('lock') || lower.includes('freeze') || lower.includes('final') || lower.includes('change') || lower.includes('stop'))) ||
    lower.includes('lock rule') ||
    lower.includes('locked')
  ) {
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: 'Here is the exact rule for the 12-second session lockout in GymRat:',
      pointers: [
        '• 12s Inactivity Trigger: When 12 consecutive seconds elapse without a completed pull-up, the session finishes automatically.',
        '• Character Dismount (Phase 4): The athlete drops off the pull-up bar and returns to standing on the ground.',
        '• Locked Final Count: The LCD and HUD display a frozen "Final Count: X" along with performance voice feedback.',
        '• No Further Changes: Repetition inputs (pull-up button and spacebar) are locked and cannot alter the count or display.',
        '• Restart Button Exclusivity: ONLY when the user clicks the yellow Restart button does the system unlock, reset the count to 0, restore "Hello GymRat", and return to Phase 1.',
      ],
      lcdPreview: { line1: 'COUNT LOCKED', line2: 'Only Restart Resets' },
      speakerQuote: 'Session Complete · Final Count Locked',
      suggestedFollowUps: [
        'Does counting stop at 12 pull-ups?',
        'What happens at 8 seconds of inactivity?',
        'What voice feedback plays for my final count?',
      ],
      timestamp: formatTime(),
    };
  }

  // 3C. Overview / How GymRat Works (Exact Answer)
  if (
    lower.includes('what is gymrat') ||
    lower.includes('how does it work') ||
    lower.includes('how gymrat works') ||
    lower.includes('tell me about gymrat')
  ) {
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: 'GymRat is a smart pull-up counter that clamps onto any gym bar to automate workout tracking:',
      pointers: [
        '• Dual IR Optical Beam: Verifies full chin-over-bar clearance without double-counting.',
        '• Camera & Local Storage: Captures workout photos at peak reps and logs them to an onboard memory card.',
        '• Continuous Counting: Never stops at 12; counts 13, 14, 15+ continuously with spoken numbers.',
        '• Live Fatigue Tracking: Calculates seconds between reps (1s explosive, 6s fatigue/break).',
        '• Inactivity Watchdog: 6s "Come on!", 9s "You can do it!", 12s dismount & locked final count.',
        '• Scaling Up: Expanding into smart posture detection (squats, pushups, dips, deadlifts) & built-in Edge AI.',
      ],
      lcdPreview: { line1: 'GymRat Counter', line2: 'IR + Optical Cam' },
      speakerQuote: 'Hello GymRats !',
      suggestedFollowUps: [
        'What are the 4 physical character phases?',
        'Does counting stop at 12 pull-ups?',
        'How does the 12s lock rule work?',
      ],
      timestamp: formatTime(),
    };
  }

  // 3. Scaling Up & Next Generation Products (User explicit prompt requirement!)
  if (
    lower.includes('scale') ||
    lower.includes('scaling') ||
    lower.includes('other product') ||
    lower.includes('future') ||
    lower.includes('formation') ||
    lower.includes('posture') ||
    lower.includes('squat') ||
    lower.includes('deadlift') ||
    lower.includes('built-in ai') ||
    lower.includes('edge ai') ||
    lower.includes('tinyml')
  ) {
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: 'GymRat is not getting stuck on just pull-ups! We are scaling up into a complete smart exercise formation and edge AI fitness ecosystem:',
      pointers: [
        '• Product 1 (Current): GymRat v1 — Smart pull-ups counter with IR optical beam & integrated camera photo logger.',
        '• Product 2 (Scaling Up): Smart Exercise Formation & Posture Detector — 17-point skeleton joint tracking for Squats, Push-Ups, Dips, and Deadlifts with instant audio injury warnings.',
        '• Product 3 (Built-In Edge AI): GymRat Core AI — on-device TinyML neural network running 100% offline with zero cloud latency and a 0–100% Rep Quality Index (RQI).',
        '• Privacy First: All video processing runs strictly on embedded hardware chips; no private workout footage is ever uploaded to the cloud.',
      ],
      lcdPreview: { line1: 'Scaling Up Ecosystem', line2: 'Formation + Edge AI' },
      speakerQuote: 'Scaling Up: Smart Formation & On-Device AI',
      suggestedFollowUps: [
        'How does the Posture Detector catch bad squat form?',
        'Why does GymRat v1 use IR sensor instead of camera for counting?',
        'Does pull-up counting stop at 12?',
      ],
      timestamp: formatTime(),
    };
  }

  // 4. Inactivity Watchdog: 6s, 8s save, 9s, 12s finish
  if (
    lower.includes('8 second') ||
    lower.includes('8s') ||
    lower.includes('6 second') ||
    lower.includes('6s') ||
    lower.includes('9 second') ||
    lower.includes('9s') ||
    lower.includes('motivat') ||
    lower.includes('inactiv') ||
    lower.includes('come on') ||
    lower.includes('you can do it') ||
    lower.includes('cancel')
  ) {
    if (lower.includes('countdown') && !lower.includes('inactiv') && !lower.includes('motivat')) {
      // Fall through to Start countdown
    } else {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'GymRat implements a strict inactivity watchdog after every single completed pull-up:',
        pointers: [
          '• 0–5 seconds: Active workout window; athlete can pull up without interruption.',
          '• 6 seconds idle: First motivation speaks aloud: "Come on!".',
          '• 8-second clutch pull-up: If athlete pulls up at 8s, rep count increments, inactivity timer resets to 0s, and the pending 9s prompt is CANCELED.',
          '• 9 seconds idle: Second motivation speaks aloud: "You can do it!".',
          '• 12 seconds idle: Session terminates automatically; athlete gets off the bar, final count is LOCKED, and performance voice feedback plays.',
        ],
        lcdPreview: { line1: 'Idle: 8s -> REP!', line2: '9s Prompt Canceled' },
        speakerQuote: 'Come on! ... [Rep at 8s] -> Timer Reset!',
        suggestedFollowUps: [
          'What happens when 12 seconds pass without a rep?',
          'Does counting stop at 12?',
          'What voice feedback plays for 1-10, 11-30, and 30+ reps?',
        ],
        timestamp: formatTime(),
      };
    }
  }

  // 5. Counting past 12 (13, 14, 15...)
  if (
    lower.includes('12') &&
    (lower.includes('stop') ||
      lower.includes('rukti') ||
      lower.includes('rukta') ||
      lower.includes('13') ||
      lower.includes('14') ||
      lower.includes('15') ||
      lower.includes('more') ||
      lower.includes('beyond') ||
      lower.includes('continue') ||
      lower.includes('limit') ||
      lower.includes('max'))
  ) {
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: 'Counting NEVER stops at 12! GymRat is designed for unlimited reps:',
      pointers: [
        '• 12 is merely an illustrative row in the documentation table ("Count: 12" -> "Twelve").',
        '• As long as the athlete performs verified full-range pull-ups, GymRat continues counting 13, 14, 15, 25, 35, and beyond.',
        '• Every single repetition is announced aloud through the speaker (e.g. "Thirteen", "Fourteen").',
        '• Counting stops ONLY when 12 consecutive seconds of inactivity elapse, at which point the final count is locked.',
      ],
      lcdPreview: { line1: 'Count: 14', line2: 'Continuous Mode' },
      speakerQuote: 'Twelve ... Thirteen ... Fourteen ... Fifteen!',
      suggestedFollowUps: [
        'What voice feedback plays if I do 15 or 35 pull-ups?',
        'How does GymRat prevent double-counting on 1 rep?',
        'What happens when I press Restart?',
      ],
      timestamp: formatTime(),
    };
  }

  // 6. Final Count Lock & 3 Voice Feedback Tiers
  if (
    lower.includes('final') ||
    lower.includes('feedback') ||
    lower.includes('well done') ||
    lower.includes('oh wow') ||
    lower.includes('excellent') ||
    lower.includes('tier') ||
    lower.includes('score') ||
    lower.includes('end') ||
    lower.includes('finish') ||
    lower.includes('30') ||
    lower.includes('35') ||
    lower.includes('lock')
  ) {
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: 'When 12 seconds pass without a pull-up, GymRat locks the session and delivers performance voice feedback:',
      pointers: [
        '• Athlete Phase: Athlete gets off the bar (Phase 4: OFF_BAR) and stands on ground.',
        '• Count Lock Rule: Final count is frozen permanently; display and count cannot change until user clicks Restart.',
        '• Tier 1 (1–10 pull-ups): Speaker says "Well done! If you remain consistent, you can do even better."',
        '• Tier 2 (11–30 pull-ups): Speaker says "Oh wow, you\'re doing better."',
        '• Tier 3 (Above 30 pull-ups): Speaker says "Excellent, you\'re doing wow!"',
        '• System Reset: Only pressing the Restart button clears the lock and resets count to 0.',
      ],
      lcdPreview: { line1: 'Final Count: 32', line2: 'Tier: Above 30' },
      speakerQuote: "Excellent, you're doing wow!",
      suggestedFollowUps: [
        'What happens when I press the Restart button?',
        'Does counting stop at 12 pull-ups?',
        'How does Rep Speed + Fatigue detection work?',
      ],
      timestamp: formatTime(),
    };
  }

  // 7. Integrated Camera vs IR Optical Sensor
  if (
    lower.includes('esp32') ||
    lower.includes('cam') ||
    lower.includes('camera') ||
    lower.includes('photo') ||
    lower.includes('picture') ||
    lower.includes('microsd') ||
    lower.includes('storage') ||
    lower.includes('sd')
  ) {
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: 'GymRat utilizes both an IR optical sensor and an integrated camera module with dedicated responsibilities:',
      pointers: [
        '• Primary Counter: Dual IR optical beam provides instant, zero-latency chin detection at 0ms delay.',
        '• Photo Logger: Integrated camera captures high-resolution workout frames at peak rep elevation.',
        '• Local Storage: All photos are saved directly to an onboard memory card.',
        '• Engineering Fact: Photo capture alone does not verify a rep—IR cycle validation makes GymRat v1 robust and immune to lighting shifts.',
        '• Movement Analysis: Saved photos can later be analyzed for posture evaluation and athlete records.',
      ],
      lcdPreview: { line1: 'Camera Active', line2: 'Saved -> Memory' },
      speakerQuote: 'IR Sensor: Primary Counter | Camera: Local Logger',
      suggestedFollowUps: [
        'How does the IR sensor verify a full pull-up cycle?',
        'Tell me about the 4 uniqueness quality features',
        'Tell me about Scaling Up into the posture detector',
      ],
      timestamp: formatTime(),
    };
  }

  // 8. Rep Speed & Fatigue Detection
  if (
    lower.includes('speed') ||
    lower.includes('fatigue') ||
    lower.includes('slow') ||
    lower.includes('break') ||
    lower.includes('pace') ||
    lower.includes('time between')
  ) {
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: 'GymRat timestamps every verified pull-up to calculate live inter-rep velocity and muscular fatigue:',
      pointers: [
        '• Rep 1: Starting rep recorded.',
        '• Rep 2 & 3: 1.0 second delta (fast, explosive cadence).',
        '• Rep 4: 3.0 seconds delta (steady rhythmic pace).',
        '• Rep 5 & 6: 6.0 to 7.0 seconds delta (fatigue detected / athlete taking rest break).',
        '• LCD readout updates dynamically with rep pace (e.g. "6.0s (Fatigue)").',
        '• Feeds directly into the inactivity watchdog for timely motivational prompts.',
      ],
      lcdPreview: { line1: 'Count: 6', line2: 'Delta: 7s (Fatigue)' },
      speakerQuote: 'Six',
      suggestedFollowUps: [
        'What happens if my break reaches 6s, 9s, or 12s?',
        'Tell me about the 4 uniqueness quality features',
        'What if I pull up at 8 seconds?',
      ],
      timestamp: formatTime(),
    };
  }

  // 9. 4 Uniqueness Quality Features
  if (
    lower.includes('unique') ||
    lower.includes('quality') ||
    lower.includes('feature') ||
    lower.includes('anti-cheat') ||
    lower.includes('anticheat') ||
    lower.includes('cheat') ||
    lower.includes('calibrat') ||
    lower.includes('full-range') ||
    lower.includes('full range')
  ) {
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: 'GymRat stands apart through 4 core engineering quality features:',
      pointers: [
        '• 1. Anti-Cheat / Verified Rep: Requires full ascent, peak chin clearance, and descent before rearming—preventing multiple counts on a single rep.',
        '• 2. Automatic User Calibration: Calibrates optical baseline to athlete height and bar diameter in seconds.',
        '• 3. Full-Range Pull-Up Detection: Rejects half-reps and kipping momentum to enforce strict calisthenics form.',
        '• 4. Rep Speed + Fatigue Detection: Measures inter-rep interval deltas to track athlete exhaustion curves in real time.',
      ],
      lcdPreview: { line1: '4 Quality Systems', line2: 'Cycle Lock Active' },
      speakerQuote: 'Verified Full-Range Cycle',
      suggestedFollowUps: [
        'How does the 6-second countdown work?',
        'Why use IR sensor instead of camera for counting?',
        'What voice feedback plays at the end?',
      ],
      timestamp: formatTime(),
    };
  }

  // 10. Power ON & 6-Second Countdown
  if (
    lower.includes('power') ||
    lower.includes('switch') ||
    lower.includes('start') ||
    lower.includes('get ready') ||
    lower.includes('countdown') ||
    lower.includes('hello gymrat')
  ) {
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: 'Here is how GymRat initializes and prepares the athlete:',
      pointers: [
        '• Phase 1 (Power ON): Flip ON/OFF switch -> LCD displays "Hello GymRat" and speaker plays "Hello GymRats !" greeting.',
        '• Phase 2 (Start Button): User presses Start -> Athlete jumps onto bar (ON_BAR) in dead-hang.',
        '• Spoken Prompt: Speaker announces "Please get ready, countdown starts in 6 seconds."',
        '• 6-Second Countdown: LCD counts 6 → 5 → 4 → 3 → 2 → 1 with audible metronome ticks.',
        '• Phase 3 (Active Counting): Countdown finishes -> LCD displays "Start Pull-ups!" and IR detection cycle arms.',
      ],
      lcdPreview: { line1: 'Get Ready! 6..1', line2: 'Start Pull-ups!' },
      speakerQuote: 'Please get ready, countdown starts in 6 seconds.',
      suggestedFollowUps: [
        'How does IR pull-up counting work after the countdown?',
        'Does counting stop at 12 pull-ups?',
        'What happens when I press Restart?',
      ],
      timestamp: formatTime(),
    };
  }

  // 11. Restart / Reset
  if (lower.includes('restart') || lower.includes('reset')) {
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: 'The Restart button is the ONLY mechanism that unlocks a completed session:',
      pointers: [
        '• Unlocks Count & Display: Clears the locked final count and releases system freeze.',
        '• Phase Reset: Returns character to Phase 1: STAND_GROUND beside the pull-up rig.',
        '• Counter Reset: Rep count resets strictly to 0; inactivity timer resets to 0.0s.',
        '• LCD & Audio: LCD displays "Hello GymRat" and speaker repeats "Hello GymRats !" greeting.',
      ],
      lcdPreview: { line1: 'Hello GymRat', line2: 'Reset -> Ready' },
      speakerQuote: 'Hello GymRats !',
      suggestedFollowUps: [
        'What happens during the 6-second countdown?',
        'Does counting stop at 12 pull-ups?',
        'Tell me about Scaling Up into the posture detector',
      ],
      timestamp: formatTime(),
    };
  }

  // Fallback Catch-All
  return {
    id: `bot-${Date.now()}`,
    sender: 'bot',
    text: 'GymRat is an intelligent pull-up tracking and multi-exercise fitness ecosystem:',
    pointers: [
      '• Optical Hardware: Dual IR beam for chin detection + integrated camera for local workout photos.',
      '• Live Guidance: 16x2 amber backlit LCD with natural voice announcements.',
      '• Watchdog Engine: 6s "Come on!", 9s "You can do it!", 12s session lock.',
      '• 8-Second Rule: Pulling up at 8s cancels the pending 9s prompt and keeps counting.',
      '• Scaling Up: Expanding into smart posture detection (squats, pushups, dips, deadlifts) & on-device edge AI.',
    ],
    lcdPreview: { line1: 'GymRat System', line2: 'Ready for Reps' },
    speakerQuote: 'Hello GymRats !',
    suggestedFollowUps: [
      'Does counting stop at 12 pull-ups?',
      'What happens if I pause for 8 seconds?',
      'Tell me about Scaling Up and Edge AI',
    ],
    timestamp: formatTime(),
  };
}
