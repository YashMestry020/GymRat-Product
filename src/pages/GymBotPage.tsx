import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Brain,
  CheckCircle2,
  Lock,
  RotateCcw,
  ShieldAlert,
  Volume2,
} from 'lucide-react';
import {
  GymBotMessage,
  GymBotRole,
  generateGymBotResponse,
} from '../utils/gymBotEngine';
import { playButtonClick, speakGymRatVoice } from '../utils/gymRatAudio';

const ROLE_OPTIONS: { id: GymBotRole; label: string; desc: string }[] = [
  {
    id: 'coach',
    label: 'Workout Coach',
    desc: 'Live set roleplay with LCD cues, spoken counting, and motivation prompts.',
  },
  {
    id: 'engineer',
    label: 'Product Engineer',
    desc: 'Hardware specs, IR cycle verification, optical camera, and scaling up.',
  },
  {
    id: 'tester',
    label: 'QA Stress Tester',
    desc: 'Edge cases: 8s clutch save, counting past 12, and 12s lock state.',
  },
];

const QUICK_PROMPTS: { label: string; prompt: string; isGuardrailTest?: boolean }[] = [
  {
    label: '4 Character Phases',
    prompt: 'Explain the 4 physical character phases: ground, on bar, pull-up, and off bar.',
  },
  {
    label: '12-Second Final Lock',
    prompt: 'How does the 12s final count lock work, and why does only Restart reset it?',
  },
  {
    label: 'Scaling Up Beyond Pull-Ups',
    prompt: 'Tell me how GymRat is scaling up to posture detection and built-in AI.',
  },
  {
    label: 'Does counting stop at 12?',
    prompt: 'Does counting stop at 12 pull-ups or continue to 13, 14, 15?',
  },
  {
    label: '8-Second Clutch Save',
    prompt: 'What happens if I pause for 8 seconds then do a proper pull-up?',
  },
  {
    label: '6s & 9s Motivation',
    prompt: 'Explain the 6-second and 9-second inactivity motivation messages.',
  },
  {
    label: 'Camera vs IR Sensor',
    prompt: 'Why does GymRat use IR sensor for counting instead of the camera module?',
  },
  {
    label: 'Off-Topic Test: Weather',
    prompt: 'What is the weather in New York today?',
    isGuardrailTest: true,
  },
];


export const GymBotPage: React.FC = () => {
  const [role, setRole] = useState<GymBotRole>('coach');
  const [messages, setMessages] = useState<GymBotMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendPrompt = (text: string, overrideRole?: GymBotRole) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    playButtonClick();

    const activeRole = overrideRole ?? role;
    const userMsg: GymBotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const botReply = generateGymBotResponse(trimmed, activeRole);
    setMessages((prev) => [...prev, userMsg, botReply]);
    setInputVal('');
  };

  const handleRoleSwitch = (nextRole: GymBotRole) => {
    setRole(nextRole);
    playButtonClick();
    setMessages([]);
  };

  const handleClear = () => {
    playButtonClick();
    setMessages([]);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] text-[#141517] flex flex-col justify-between">
      {/* Gemini-Inspired Clean Header */}
      <div className="max-w-4xl w-full mx-auto px-4 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E3E3] pb-6">
          <div className="flex items-center gap-3">
            <div
              aria-label="GymRat logo"
              className="w-10 h-10 rounded-2xl bg-[#141517] border border-[#F5B800]/50 flex items-center justify-center shadow-md shrink-0 relative overflow-hidden select-none"
            >
              <span className="font-display font-extrabold text-base tracking-tight text-[#F5B800]">G</span>
              <span className="font-display font-bold text-sm tracking-tight text-white -ml-0.5">R</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#F5B800] rounded-tl-sm opacity-80" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-[#141517]">GymBot</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6F4EA] text-[#137333]">
                  GymRat Domain Guard
                </span>
              </div>
              <p className="text-xs text-[#5F6368] mt-0.5">
                Conversational specialist for GymRat v1, 4-phase game loop, and scaling up
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#5F6368] hover:text-[#141517] hover:bg-[#ECEEF0] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </button>
          </div>
        </div>

        {/* Gemini Persona Selector Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#5F6368] mr-1">Specialist Mode:</span>
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleRoleSwitch(opt.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                role === opt.id
                  ? 'bg-[#141517] text-white shadow-sm'
                  : 'bg-white border border-[#E3E3E3] text-[#5F6368] hover:text-[#141517] hover:border-[#C4C7C5]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversational Feed (Gemini Style) */}
      <div className="max-w-4xl w-full mx-auto px-4 flex-1 py-4 space-y-6 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center px-4 py-8 select-none">
            <div className="w-14 h-14 rounded-3xl bg-[#141517] border border-[#F5B800]/50 flex items-center justify-center shadow-md mb-4 relative">
              <span className="font-display font-black text-2xl tracking-tight text-[#F5B800]">G</span>
              <span className="font-display font-bold text-lg tracking-tight text-white -ml-0.5">R</span>
              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#F5B800] rounded-full" />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1F1F]">
              How can GymBot help you today?
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[#5F6368] max-w-md">
              Screen is clear and ready. Ask any question below to get an exact, verified answer.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left">
              {[
                {
                  title: 'Does counting stop at 12?',
                  desc: 'Find out why counting continues to 13, 14, 15+ without stopping.',
                  prompt: 'Does counting stop at 12 pull-ups or continue to 13, 14, 15?',
                },
                {
                  title: '4 Character Physical Phases',
                  desc: 'Ground stand, gripping bar, pull-up rep, and off bar (12s done).',
                  prompt: 'What are the 4 physical character phases: ground, on bar, pull-up, and off bar?',
                },
                {
                  title: '12-Second Lock Rule',
                  desc: 'Why final count locks permanently and only Restart resets it.',
                  prompt: 'How does the 12s final count lock work, and why does only Restart reset it?',
                },
                {
                  title: 'Scaling Up Beyond Pull-Ups',
                  desc: 'Posture formation detector & built-in Edge AI roadmap.',
                  prompt: 'Tell me how GymRat is scaling up to posture detection and built-in AI.',
                },
              ].map((card, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendPrompt(card.prompt)}
                  className="p-3.5 rounded-2xl bg-white border border-[#E3E3E3] hover:border-[#141517] hover:shadow-sm transition-all text-left cursor-pointer group"
                >
                  <div className="text-xs font-bold text-[#141517] group-hover:text-[#B48300] flex items-center justify-between">
                    <span>{card.title}</span>
                    <span className="text-[#BDC1C6] group-hover:text-[#141517] text-sm">→</span>
                  </div>
                  <div className="text-[11px] text-[#5F6368] mt-0.5 leading-snug">
                    {card.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isBot = msg.sender === 'bot';

          if (!isBot) {
            // User Message Bubble (Right-aligned, clean pill style)
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] sm:max-w-[70%] bg-[#E9EEF6] text-[#1F1F1F] rounded-3xl rounded-tr-md px-5 py-3 text-sm leading-relaxed shadow-xs">
                  <p>{msg.text}</p>
                  <span className="block text-[10px] text-[#747775] text-right mt-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          }

          // GymBot / Gemini-Style Response (Left-aligned, clean typography, sparkle avatar)
          return (
            <div key={msg.id} className="flex items-start gap-3 sm:gap-4">
              <div
                aria-label="GymRat response"
                className="w-8 h-8 rounded-full bg-[#141517] border border-[#F5B800]/50 flex items-center justify-center shrink-0 mt-1 shadow-xs font-display select-none"
              >
                <span className="font-extrabold text-xs text-[#F5B800]">G</span>
                <span className="font-bold text-[11px] text-white -ml-0.5">R</span>
              </div>

              <div className="flex-1 space-y-3">
                {/* Headline / Summary text */}
                <div className="text-sm sm:text-base font-medium text-[#1F1F1F] leading-relaxed">
                  {msg.text}
                </div>

                {/* Structured POINTERS (Prompt requirement) */}
                {msg.pointers && msg.pointers.length > 0 && (
                  <div className="bg-white border border-[#E3E3E3] rounded-2xl p-4 shadow-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F] mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#137333]" />
                      <span>Key Pointers &amp; Explanations:</span>
                    </div>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-[#444746]">
                      {msg.pointers.map((ptr, idx) => (
                        <li key={idx} className="leading-snug">
                          {ptr}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Simulated LCD Screen & Speaker Chips */}
                {(msg.lcdPreview || msg.speakerQuote) && (
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {msg.lcdPreview && (
                      <div className="bg-[#1D2026] text-white px-3 py-1.5 rounded-xl text-xs font-mono-lcd border border-white/10 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#F5B800] animate-pulse" />
                        <div>
                          <span className="text-[#F5B800] font-bold">{msg.lcdPreview.line1}</span>
                          <span className="text-neutral-400 mx-1.5">|</span>
                          <span className="text-neutral-300">{msg.lcdPreview.line2}</span>
                        </div>
                      </div>
                    )}

                    {msg.speakerQuote && (
                      <button
                        type="button"
                        onClick={() => speakGymRatVoice(msg.speakerQuote!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#FFF8E1] text-[#7C5800] border border-[#FFE082] hover:bg-[#FFECB3] transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>&ldquo;{msg.speakerQuote}&rdquo;</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Suggested Follow-Ups as Gemini quick chips */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => sendPrompt(suggestion)}
                        className="text-left px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-[#ECEEF0] text-[#444746] hover:text-[#1F1F1F] border border-[#E3E3E3] transition-colors cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
      <div ref={chatBottomRef} />
      </div>

      {/* Floating Bottom Prompt Bar (Google Gemini Style) */}
      <div className="sticky bottom-0 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA]/90 to-transparent pt-4 pb-6 px-4">
        <div className="max-w-4xl mx-auto space-y-2.5">
          {/* Quick Prompt Carousel Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {QUICK_PROMPTS.map((qp, qIdx) => (
              <button
                key={qIdx}
                type="button"
                onClick={() => sendPrompt(qp.prompt)}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  qp.isGuardrailTest
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    : 'bg-white text-[#444746] hover:text-[#1F1F1F] border border-[#E3E3E3] hover:border-[#C4C7C5] shadow-2xs'
                }`}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Gemini Capsule Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendPrompt(inputVal);
            }}
            className="relative flex items-center bg-white border border-[#C4C7C5] rounded-3xl shadow-sm hover:shadow-md focus-within:border-[#1A73E8] focus-within:ring-2 focus-within:ring-[#1A73E8]/20 transition-all p-2 pl-5"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask GymBot about pull-ups, 12s lock rule, 4 phases, or scaling up..."
              className="flex-1 bg-transparent border-0 outline-none text-sm text-[#1F1F1F] placeholder-[#747775] pr-3"
            />

            <button
              type="submit"
              disabled={!inputVal.trim()}
              aria-label="Send message to GymBot"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                inputVal.trim()
                  ? 'bg-[#141517] text-white hover:bg-[#2F333B]'
                  : 'bg-[#F1F3F4] text-[#BDC1C6] cursor-not-allowed'
              }`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>

          {/* Scope Guardrail Footer */}
          <div className="flex items-center justify-between text-[11px] text-[#5F6368] px-2">
            <span>
              GymBot answers in structured <strong>POINTERS</strong> · Scope strictly restricted to
              GymRat &amp; Scaling Up
            </span>
            <span className="hidden sm:inline">Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
};
