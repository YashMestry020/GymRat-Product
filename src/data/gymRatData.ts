export type PageId = 'overview' | 'flow-game' | 'uniqueness' | 'gymbot' | 'scaling-up';

export interface WorkflowStage {
  id: number;
  shortTitle: string;
  title: string;
  triggerLabel: string;
  lcdLine1: string;
  lcdLine2: string;
  speakerVoice: string;
  summaryPointers: string[];
  technicalPointers: string[];
  accentHex: string;
  nodePosition: [number, number, number];
}

export interface HardwareHotspot {
  id: string;
  label: string;
  partCode: string;
  pointers: string[];
  workflowLink: string;
  posStudio: { x: number; y: number };
  posMounted: { x: number; y: number };
}

export interface UniquenessFeature {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  pointers: string[];
  engineeringPointers: string[];
  metricLabel: string;
  metricValue: string;
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 1,
    shortTitle: 'Power ON',
    title: '01. Power ON – System Start',
    triggerLabel: 'Flip ON/OFF Switch',
    lcdLine1: 'Hello GymRat',
    lcdLine2: 'System Ready',
    speakerVoice: 'Hello GymRats !',
    summaryPointers: [
      'User turns the GymRat ON/OFF physical power switch ON.',
      '16x2 backlit LCD illuminates with "Hello GymRat".',
      'Speaker greets athlete aloud with "Hello GymRats !".',
      'Character stands on ground in ready standby mode.',
    ],
    technicalPointers: [
      'Initializes IR optical sensor array & calibration registers.',
      'Mounts onboard high-speed storage card for photo logging.',
      'Arms Start button listener in non-blocking standby state.',
    ],
    accentHex: '#F5B800',
    nodePosition: [-4.6, 0.4, 3.2],
  },
  {
    id: 2,
    shortTitle: 'Start Prep',
    title: '02. Start Button – Workout Preparation',
    triggerLabel: 'Press Start Button',
    lcdLine1: 'Get Ready!',
    lcdLine2: '6 -> 5 -> 4 -> 3 -> 2 -> 1',
    speakerVoice: 'Please get ready, countdown starts in 6 seconds.',
    summaryPointers: [
      'User presses the yellow Start button.',
      'LCD immediately shows "Get Ready!".',
      'Speaker announces: "Please get ready, countdown starts in 6 seconds."',
      '6-second countdown begins: 6 -> 5 -> 4 -> 3 -> 2 -> 1.',
      'Character jumps up and gets onto the pull-up bar, gripping in dead-hang.',
      'Countdown completes: LCD shows "Start Pull-ups!".',
    ],
    technicalPointers: [
      'Provides 6s athlete preparation window to secure grip.',
      'Samples ambient room lighting to calibrate optical baseline.',
      'Transitions character to Phase 2 (Got onto pull-up bar).',
    ],
    accentHex: '#F59E0B',
    nodePosition: [-5.4, 0.65, -0.8],
  },
  {
    id: 3,
    shortTitle: 'Auto Count',
    title: '03. Pull-Up Detection & Automatic Counting',
    triggerLabel: 'Complete Full Pull-Up',
    lcdLine1: 'Count: 13',
    lcdLine2: 'IR Cycle Verified',
    speakerVoice: 'One ... Two ... Twelve ... Thirteen ...',
    summaryPointers: [
      'User performs upward pull-up motion chin over bar.',
      'IR sensor detects movement through optical beam.',
      'Cycle verification blocks double-counting from 1 single rep.',
      'Count increases by +1 upon complete full-cycle return.',
      'LCD displays current count (e.g. "Count: 1", "Count: 12").',
      'Speaker speaks the corresponding number aloud in real time.',
      'Counting NEVER stops at 12: continues to 13, 14, 15+ without cap.',
    ],
    technicalPointers: [
      'Requires chin clearance break followed by dead-hang clearance.',
      'Zero arbitrary upper cap: fully continuous 13+ counter.',
      'Character performs Phase 3 (Do pull-up motion chin over bar).',
    ],
    accentHex: '#10B981',
    nodePosition: [-3.2, 0.9, -4.5],
  },
  {
    id: 4,
    shortTitle: 'Rep Speed',
    title: '04. Rep Speed & Fatigue Detection',
    triggerLabel: 'Measure Inter-Rep Time',
    lcdLine1: 'Count: 6',
    lcdLine2: 'Pace: 7s (Fatigue)',
    speakerVoice: 'Six',
    summaryPointers: [
      'Calculates exact seconds elapsed between consecutive reps.',
      'Rep 1: Starting rep (baseline).',
      'Rep 2 & 3: 1 second interval (fast, explosive cadence).',
      'Rep 4: 3 seconds interval (steady working cadence).',
      'Rep 5: 6 seconds interval (fatigue slowdown detected).',
      'Rep 6: 7 seconds interval (user taking mid-set break).',
      'Identifies when muscular speed is declining or athlete is pausing.',
    ],
    technicalPointers: [
      'Timestamps consecutive verified IR trigger cycles.',
      'Computes inter-rep delta time: Delta-T = T_current - T_previous.',
      'Feeds live cadence into inactivity watchdog state machine.',
    ],
    accentHex: '#0EA5E9',
    nodePosition: [1.0, 1.15, -5.2],
  },
  {
    id: 5,
    shortTitle: 'Motivation',
    title: '05. Motivation System – 6s, 9s & 12s Watchdog',
    triggerLabel: 'Inactivity Timer Watch',
    lcdLine1: 'Idle: 6s / 9s',
    lcdLine2: '8s Rep Cancels 9s!',
    speakerVoice: 'Come on! ... You can do it!',
    summaryPointers: [
      'Starts non-blocking inactivity timer after every verified rep.',
      '0–5 seconds: Normal active window, counting continues as normal.',
      '6 seconds idle: First motivation prompt speaks "Come on!".',
      '9 seconds idle: Second motivation prompt speaks "You can do it!".',
      '12 seconds idle: Session ends automatically, final count locks.',
      'CRITICAL 8s SAVE RULE: If user pulls up at 8s, count increases, timer resets to 0s, and pending "You can do it!" is canceled.',
    ],
    technicalPointers: [
      'Non-blocking timer cleared on any verified IR chin-break.',
      'Cancels pending audio queues upon intermediate rep detection.',
      'Automatically triggers Phase 4 character dismount at 12.0s.',
    ],
    accentHex: '#D97706',
    nodePosition: [4.6, 0.9, -3.2],
  },
  {
    id: 6,
    shortTitle: 'Final Voice',
    title: '06. Final Count & Tiered Voice Feedback',
    triggerLabel: '12s Inactivity Timeout',
    lcdLine1: 'Final Count: 18',
    lcdLine2: 'Set Complete',
    speakerVoice: "Oh wow, you're doing better.",
    summaryPointers: [
      'Session finishes automatically after 12 seconds with no pull-up.',
      'LCD displays final verified count permanently (LOCKED).',
      'Character Phase 4: Athlete gets off the pull-up bar, stands on ground.',
      'Count and LCD will NOT change until user clicks Restart.',
      'Tier 1 (1–10 pull-ups): "Well done! If you remain consistent, you can do even better."',
      'Tier 2 (11–30 pull-ups): "Oh wow, you\'re doing better."',
      'Tier 3 (Above 30 pull-ups): "Excellent, you\'re doing wow!"',
    ],
    technicalPointers: [
      'Hard-locks active counter: rep inputs ignored until restart signal.',
      'Transitions character to grounded stand stance (Phase 4).',
      'Selects audio prompt from 3 distinct performance tiers.',
    ],
    accentHex: '#059669',
    nodePosition: [3.8, 0.5, 3.2],
  },
  {
    id: 7,
    shortTitle: 'Restart',
    title: '07. Restart & Reset for Next Set',
    triggerLabel: 'Press Restart Button',
    lcdLine1: 'Hello GymRat',
    lcdLine2: 'Count Cleared: 0',
    speakerVoice: 'Hello GymRats !',
    summaryPointers: [
      'User presses the yellow Restart / Reset button.',
      'Previous session count resets back to 0.',
      'LCD displays "Hello GymRat" greeting again.',
      'Speaker plays greeting voice: "Hello GymRats !".',
      'Character remains standing on ground, ready for next workout set.',
    ],
    technicalPointers: [
      'Flushes inter-rep speed ring buffer & resets watchdog timer.',
      'Preserves saved microSD photo frames while clearing session reps.',
      'Returns system state to Phase 1 (Stand on ground / System Ready).',
    ],
    accentHex: '#F5B800',
    nodePosition: [-0.8, 0.4, 5.2],
  },
];

export const HARDWARE_HOTSPOTS: HardwareHotspot[] = [
  {
    id: 'lcd',
    label: '16x2 Backlit Amber LCD',
    partCode: 'DSP-01',
    pointers: [
      '• Displays boot greeting: "Hello GymRat".',
      '• Displays prep prompt: "Get Ready!" and 6-to-1 countdown.',
      '• Displays active counting: "Start Pull-ups!" & live "Count: X".',
      '• Displays permanently locked Final Count after 12s idle.',
    ],
    workflowLink: 'Active across Stages 1, 2, 3, 6 & 7',
    posStudio: { x: 64, y: 27 },
    posMounted: { x: 59, y: 22 },
  },
  {
    id: 'power',
    label: 'Power ON/OFF Button',
    partCode: 'PWR-02',
    pointers: [
      '• Boots the GymRat system and optical sensors.',
      '• Triggers "Hello GymRat" on the LCD screen.',
      '• Speaks "Hello GymRats !" greeting via speaker.',
      '• Character begins in Phase 1 (standing on ground).',
    ],
    workflowLink: 'Triggers Stage 1 (Power ON)',
    posStudio: { x: 25, y: 50 },
    posMounted: { x: 32, y: 38 },
  },
  {
    id: 'start',
    label: 'Start Workout Key',
    partCode: 'KEY-03',
    pointers: [
      '• Initiates 6-second workout preparation countdown.',
      '• Shows "Get Ready!" and counts down: 6 -> 5 -> 4 -> 3 -> 2 -> 1.',
      '• Character transitions to Phase 2 (gets onto pull-up bar).',
      '• Switches system to active IR counting mode.',
    ],
    workflowLink: 'Triggers Stage 2 (6s Countdown)',
    posStudio: { x: 24, y: 69 },
    posMounted: { x: 31, y: 53 },
  },
  {
    id: 'restart',
    label: 'Restart / Reset Key',
    partCode: 'RST-04',
    pointers: [
      '• Clears active session count back to 0.',
      '• Unlocks display after 12-second workout completion.',
      '• Restores "Hello GymRat" greeting on LCD.',
      '• Readies system for the athlete\'s next workout set.',
    ],
    workflowLink: 'Triggers Stage 7 (Restart & Reset)',
    posStudio: { x: 42, y: 69 },
    posMounted: { x: 43, y: 53 },
  },
  {
    id: 'speaker',
    label: 'Diagonal-Grille Voice Speaker',
    partCode: 'SPK-05',
    pointers: [
      '• Speaks spoken numbers ("One" to "Twelve", "Thirteen"+).',
      '• Speaks 6-second inactivity motivation: "Come on!".',
      '• Speaks 9-second inactivity motivation: "You can do it!".',
      '• Plays 3-tier performance feedback after 12s session finish.',
    ],
    workflowLink: 'Active across Stages 1, 2, 3, 5, 6 & 7',
    posStudio: { x: 66, y: 55 },
    posMounted: { x: 61, y: 43 },
  },
  {
    id: 'sensors',
    label: 'Optical Sensor & Camera Unit',
    partCode: 'OPT-06',
    pointers: [
      '• Optical Sensor: Primary real-time counter verifying full chin cycles.',
      '• Camera Unit: Captures workout photos onto onboard local memory card.',
      '• Anti-cheat cycle verification prevents double-counts.',
      '• Zero cloud dependency: 100% on-device embedded operation.',
    ],
    workflowLink: 'Triggers Stages 3 & 4',
    posStudio: { x: 45, y: 89 },
    posMounted: { x: 45, y: 67 },
  },
  {
    id: 'clamp',
    label: 'USB-C & Pull-Up Bar Clamp',
    partCode: 'MNT-07',
    pointers: [
      '• Heavy-duty articulated clamp locks securely to any pull-up bar.',
      '• Side USB-C port provides continuous power & battery recharging.',
      '• Non-slip silicone padding protects gym bar knurling.',
    ],
    workflowLink: 'Mechanical Rig & Power Interface',
    posStudio: { x: 83, y: 29 },
    posMounted: { x: 48, y: 84 },
  },
];

export const UNIQUENESS_FEATURES: UniquenessFeature[] = [
  {
    id: 'anti-cheat',
    index: '01',
    title: 'Anti-Cheat / Verified Rep',
    subtitle: 'Full-Cycle Optical State Verification',
    pointers: [
      '• Requires complete ascent, peak chin dwell, and descent extension.',
      '• Prevents false multi-counts from kipping or top-bar bouncing.',
      '• Ignores rapid hand waves or casual bar vibrations.',
      '• Ensures 1 physical pull-up equals exactly 1 verified count.',
    ],
    engineeringPointers: [
      '• Phase 1: Optical dead-hang baseline confirmed.',
      '• Phase 2: Upward chin clearance threshold breached.',
      '• Phase 3: Dwell verification window validated.',
      '• Phase 4: Downward return to full extension unlocks next rep.',
    ],
    metricLabel: 'Double-Count Prevention',
    metricValue: '4-Phase Cycle Lock',
  },
  {
    id: 'auto-calibration',
    index: '02',
    title: 'Automatic User Calibration',
    subtitle: 'Zero-Setup Athlete Reach Adaptation',
    pointers: [
      '• Automatically adapts to any athlete\'s arm length and grip width.',
      '• No manual dip-switches, calibration rulers, or phone pairing needed.',
      '• Works on compact, standard, and tall-reach athletes seamlessly.',
      '• Calibrates during the initial 6-second preparation countdown.',
    ],
    engineeringPointers: [
      '• Samples ambient room infrared reflectivity during 6s countdown.',
      '• Dynamic baseline floating envelope tracks athlete chest height.',
      '• Auto-scales chin-clearance trigger zone based on opening rep.',
    ],
    metricLabel: 'Calibration Window',
    metricValue: '6s Auto-Baseline',
  },
  {
    id: 'full-range',
    index: '03',
    title: 'Full-Range Pull-Up Detection',
    subtitle: 'Chin-Over-Bar to Dead-Hang Validation',
    pointers: [
      '• Rejects incomplete half-reps and lazy partial elbow bends.',
      '• Mandates true chin-over-bar height before arming rep credit.',
      '• Requires full elbow extension at bottom before counting next rep.',
      '• Promotes strict, injury-free, competition-standard form.',
    ],
    engineeringPointers: [
      '• 85%+ vertical displacement envelope threshold enforced.',
      '• Traps incomplete upward strokes below the optical chin line.',
      '• LCD indicates "Half-Rep Ignored" if stroke is aborted early.',
    ],
    metricLabel: 'Required Stroke',
    metricValue: '100% Full ROM',
  },
  {
    id: 'rep-speed',
    index: '04',
    title: 'Rep Speed + Fatigue Detection',
    subtitle: 'Inter-Rep Cadence & Break Telemetry',
    pointers: [
      '• Measures exact time delta in seconds between every completed rep.',
      '• Categorizes cadence: Explosive (1s) -> Steady (3s) -> Fatigue (6s–7s).',
      '• Detects when the user is taking a rest break on the bar.',
      '• Synchronized with the 6s, 9s motivation cues & 12s session end.',
      '• 8s Rep Save: Rep at 8s resets timer to 0s and cancels pending 9s prompt.',
    ],
    engineeringPointers: [
      '• Real-time delta-T calculation: Delta-T = T_current - T_previous.',
      '• Integrates non-blocking 12s inactivity timeout state machine.',
      '• Automatically triggers character dismount when 12s completes.',
    ],
    metricLabel: 'Watchdog Thresholds',
    metricValue: '6s / 9s / 12s',
  },
];

export interface RepTimingPoint {
  rep: number;
  intervalLabel: string;
  seconds: number | null;
  status: 'Start' | 'Explosive' | 'Steady' | 'Fatigue' | 'Long Pause';
}

export const REP_SPEED_EXAMPLES: RepTimingPoint[] = [
  { rep: 1, intervalLabel: 'Starting rep', seconds: null, status: 'Start' },
  { rep: 2, intervalLabel: '1 second', seconds: 1, status: 'Explosive' },
  { rep: 3, intervalLabel: '1 second', seconds: 1, status: 'Explosive' },
  { rep: 4, intervalLabel: '3 seconds', seconds: 3, status: 'Steady' },
  { rep: 5, intervalLabel: '6 seconds', seconds: 6, status: 'Fatigue' },
  { rep: 6, intervalLabel: '7 seconds', seconds: 7, status: 'Long Pause' },
];

export interface VoiceFeedbackTier {
  id: string;
  rangeLabel: string;
  minReps: number;
  maxReps: number | null;
  voiceQuote: string;
  badgeText: string;
  pointers: string[];
}

export const VOICE_FEEDBACK_TIERS: VoiceFeedbackTier[] = [
  {
    id: 'tier-1',
    rangeLabel: '1–10 Pull-ups',
    minReps: 1,
    maxReps: 10,
    voiceQuote: 'Well done! If you remain consistent, you can do even better.',
    badgeText: 'Foundation Tier',
    pointers: [
      '• Spoken feedback: "Well done! If you remain consistent, you can do even better."',
      '• Encourages beginner consistency and foundational muscular endurance.',
      '• Locks permanently on LCD display after 12s inactivity.',
    ],
  },
  {
    id: 'tier-2',
    rangeLabel: '11–30 Pull-ups',
    minReps: 11,
    maxReps: 30,
    voiceQuote: "Oh wow, you're doing better.",
    badgeText: 'Endurance Tier',
    pointers: [
      '• Spoken feedback: "Oh wow, you\'re doing better."',
      '• Rewards athletes breaking into intermediate and high rep volumes.',
      '• Confirms counting continued past 12 without stopping.',
    ],
  },
  {
    id: 'tier-3',
    rangeLabel: 'Above 30 Pull-ups',
    minReps: 31,
    maxReps: null,
    voiceQuote: "Excellent, you're doing wow!",
    badgeText: 'Peak Athlete Tier',
    pointers: [
      '• Spoken feedback: "Excellent, you\'re doing wow!"',
      '• Recognizes elite calisthenics capacity and exceptional stamina.',
      '• Highlights GymRat\'s unconstrained high-rep counting capability.',
    ],
  },
];

export interface ScalingProduct {
  id: string;
  title: string;
  tagline: string;
  status: 'CURRENT' | 'NEXT_GEN' | 'EXPANSION';
  pointers: string[];
  keySpecs: { label: string; value: string }[];
}

export const SCALING_ROADMAP: ScalingProduct[] = [
  {
    id: 'gymrat-v1',
    title: 'Product 1: GymRat v1 (Current)',
    tagline: 'Smart Pull-Up Counter with Optical Cycle Verification',
    status: 'CURRENT',
    pointers: [
      '• Clamps securely on any standard pull-up bar in seconds.',
      '• IR sensor array guarantees 100% anti-cheat cycle verification.',
      '• Counts continuously past 12 (13, 14, 15+) with live voice announcements.',
      '• Live inter-rep fatigue detection (1s, 3s, 6s, 7s) and 6s/9s/12s watchdog.',
      '• Integrated camera logs workout photos onto an onboard memory card.',
    ],
    keySpecs: [
      { label: 'Primary Sensor', value: 'IR Optical Beam' },
      { label: 'Capture Hardware', value: 'Integrated Camera + Local Storage' },
      { label: 'Display & Audio', value: '16x2 Backlit LCD + Speaker' },
    ],
  },
  {
    id: 'posture-detector',
    title: 'Product 2: GymRat Vision (Scaling Up)',
    tagline: 'Smart Exercise Formation & Posture Detector',
    status: 'NEXT_GEN',
    pointers: [
      '• We are NOT stuck on pull-ups alone—scaling into a complete exercise formation ecosystem.',
      '• Real-time biomechanical skeleton pose tracking for multi-exercise training.',
      '• Squats: Detects knee caving (valgus), excessive forward lean, and depth below parallel.',
      '• Push-Ups & Dips: Tracks elbow flare angles, shoulder winging, and spinal hyperextension.',
      '• Deadlifts: Warns immediately on lumbar rounding, hip shoot, and bar drift.',
      '• Anti-injury alerts: Instant audio chime and LCD prompt: "Tuck Elbows" or "Lock Core".',
    ],
    keySpecs: [
      { label: 'Pose Tracking', value: '17-Point Biomechanical Mesh' },
      { label: 'Exercise Library', value: 'Pull-Ups, Push-Ups, Dips, Squats, Deadlifts' },
      { label: 'Injury Warning', value: '<80ms Instant Audio Chime' },
    ],
  },
  {
    id: 'built-in-ai',
    title: 'Product 3: GymRat Core AI (Built-In AI Feature)',
    tagline: 'On-Device Edge Vision ML & Intelligent Coaching',
    status: 'NEXT_GEN',
    pointers: [
      '• Built-in Edge TinyML neural network running directly on embedded NPU/silicon.',
      '• 100% private and offline: zero cloud latency, zero video uploads, complete privacy.',
      '• Autonomous Form Scoring: Computes a 0–100% Rep Quality Index for every single movement.',
      '• Predictive Fatigue Engine: Detects micro-tremors and warns athletes before joint failure.',
      '• Adaptive Voice Coaching: AI adjusts motivation based on your personalized fatigue curve.',
      '• Universal Sync: Exports clean workout metrics to athlete dashboards & training logs.',
    ],
    keySpecs: [
      { label: 'Edge Silicon', value: 'Embedded Neural NPU Core' },
      { label: 'Cloud Dependency', value: 'Zero (100% Offline Edge ML)' },
      { label: 'Quality Metric', value: '0–100% Rep Quality Index' },
    ],
  },
];

const ONES = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

export function numberToSpokenRep(n: number): string {
  if (n < 0) return 'Zero';
  if (n < 20) return ONES[n];
  if (n < 100) {
    const ten = Math.floor(n / 10);
    const rem = n % 10;
    return rem === 0 ? TENS[ten] : `${TENS[ten]}-${ONES[rem].toLowerCase()}`;
  }
  return String(n);
}

export function getFinalFeedbackForCount(count: number): {
  tierLabel: string;
  voiceMessage: string;
  pointers: string[];
} {
  if (count <= 0) {
    return {
      tierLabel: '0 Pull-ups',
      voiceMessage: 'No pull-ups detected. Press Start to try again!',
      pointers: [
        '• Session ended with zero verified reps.',
        '• Character dismounted and standing on ground.',
        '• Press Restart / Reset button to rearm system.',
      ],
    };
  }
  if (count <= 10) {
    return {
      tierLabel: '1–10 Pull-ups',
      voiceMessage: 'Well done! If you remain consistent, you can do even better.',
      pointers: [
        '• Verified count: ' + count + ' pull-ups.',
        '• Spoken feedback: "Well done! If you remain consistent, you can do even better."',
        '• Display & count locked permanently until user presses Restart.',
      ],
    };
  }
  if (count <= 30) {
    return {
      tierLabel: '11–30 Pull-ups',
      voiceMessage: "Oh wow, you're doing better.",
      pointers: [
        '• Verified count: ' + count + ' pull-ups.',
        '• Spoken feedback: "Oh wow, you\'re doing better."',
        '• Display & count locked permanently until user presses Restart.',
      ],
    };
  }
  return {
    tierLabel: 'Above 30 Pull-ups',
    voiceMessage: "Excellent, you're doing wow!",
    pointers: [
      '• Verified count: ' + count + ' pull-ups (Peak Athlete Tier).',
      '• Spoken feedback: "Excellent, you\'re doing wow!"',
      '• Display & count locked permanently until user presses Restart.',
    ],
  };
}
