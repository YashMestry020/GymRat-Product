import React, { useEffect, useRef, useState } from 'react';

export const GymBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parallax target and current interpolated coordinates for smooth 60fps motion
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  const [bgLoaded, setBgLoaded] = useState(false);

  // Track cursor position normalized to [-1, 1]
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (typeof window === 'undefined') return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mousePos.current = { x: nx, y: ny };
    };

    // Also support subtle scroll parallax
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFactor = docHeight > 0 ? (scrollY / docHeight) * 2 - 1 : 0;
      mousePos.current.y = mousePos.current.y * 0.7 + scrollFactor * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Smooth lerp animation loop for multi-layer camera depth & chalk motes
  useEffect(() => {
    let animId: number;

    // Chalk dust particles drifting softly in gym lights
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      baseAlpha: number;
    }[] = [];

    const initParticles = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.length = 0;
      const count = Math.min(36, Math.floor(window.innerWidth / 40));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.2 - Math.random() * 0.35,
          size: 1 + Math.random() * 2.2,
          alpha: 0.15 + Math.random() * 0.3,
          baseAlpha: 0.15 + Math.random() * 0.3,
        });
      }
    };

    initParticles();
    const handleResize = () => initParticles();
    window.addEventListener('resize', handleResize);

    const bgLayer = containerRef.current?.querySelector('.gym-photo-layer') as HTMLElement;
    const midLayer = containerRef.current?.querySelector('.gym-mid-layer') as HTMLElement;
    const spotLayer = containerRef.current?.querySelector('.gym-spotlight-layer') as HTMLElement;

    const render = () => {
      // Linear interpolation (lerp) for smooth cinematic camera inertia
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.05;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.05;

      const px = currentPos.current.x;
      const py = currentPos.current.y;

      // Deep Layer (Gym Facility with Dumbbell Racks & Cable Machines)
      if (bgLayer) {
        bgLayer.style.transform = `scale(1.08) translate3d(${-px * 16}px, ${-py * 12}px, 0)`;
      }

      // Midground Structural Rig & Plates
      if (midLayer) {
        midLayer.style.transform = `translate3d(${px * 24}px, ${py * 18}px, 0)`;
      }

      // Overhead Arena Spotlight cone shifts gently with mouse
      if (spotLayer) {
        spotLayer.style.transform = `translate3d(${px * 45}px, ${py * 30}px, 0)`;
      }

      // Render drifting gym chalk particles
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
          p.x += p.vx + px * 0.4;
          p.y += p.vy;

          if (p.y < -10) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < -10) p.x = canvas.width + 10;
          if (p.x > canvas.width + 10) p.x = -10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 184, 0, ${p.alpha})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#111215]"
    >
      {/* LAYER 1: Deep Background — Cinematic Luxury Gym Photo (Dumbbells, Cable Machines, Power Racks) */}
      <div
        className="gym-photo-layer absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-700 ease-out will-change-transform opacity-30 mix-blend-luminosity filter contrast-125 brightness-95"
        style={{
          backgroundImage: 'url(/assets/gym_facility_bg.jpg)',
        }}
        onLoad={() => setBgLoaded(true)}
      />

      {/* Atmospheric Warm Vignette & Contrast Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#141517]/85 via-[#F6F6F4]/92 to-[#141517]/80 mix-blend-normal" />

      {/* Fine Vulcanized Rubber Mat & Knurl Micro-Texture Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 mix-blend-multiply pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="pro-gym-mat-pattern"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="3" cy="3" r="0.75" fill="#141517" opacity="0.35" />
            <circle cx="15" cy="5" r="0.6" fill="#F5B800" opacity="0.45" />
            <circle cx="21" cy="19" r="0.8" fill="#141517" opacity="0.30" />
            <circle cx="9" cy="15" r="0.7" fill="#141517" opacity="0.4" />
            <line
              x1="0"
              y1="12"
              x2="24"
              y2="12"
              stroke="#141517"
              strokeWidth="0.5"
              strokeDasharray="1 5"
              opacity="0.15"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pro-gym-mat-pattern)" />
      </svg>

      {/* LAYER 2: Arena Spotlight Cones that shift dynamically with viewer movement */}
      <div className="gym-spotlight-layer absolute inset-0 pointer-events-none will-change-transform">
        <div
          className="absolute -top-36 left-1/2 -translate-x-1/2 w-[980px] h-[600px] rounded-full opacity-45 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(245, 184, 0, 0.22) 0%, rgba(245, 184, 0, 0.06) 50%, transparent 75%)',
          }}
        />
        <div
          className="absolute top-1/2 -left-36 w-[650px] h-[650px] rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(245, 184, 0, 0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-10 -right-36 w-[700px] h-[700px] rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(245, 184, 0, 0.18) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* LAYER 3: Midground Technical Rig, Barbell Laser Calibration, and Plate Outlines */}
      <div className="gym-mid-layer absolute inset-0 pointer-events-none will-change-transform">
        {/* Left Side: Heavy Duty Power Rack Steel Upright */}
        <div className="hidden xl:flex absolute left-6 top-16 bottom-16 w-10 border-r-2 border-[#141517]/15 flex-col justify-between items-center py-6 opacity-35">
          <div className="text-[9px] font-mono font-bold tracking-widest text-[#B48300] uppercase -rotate-90 origin-center whitespace-nowrap mb-6">
            RACK-A · 3x3 STEEL
          </div>
          <div className="flex-1 flex flex-col justify-around items-center">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={`rack-l-${i}`} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-[#141517]/40 bg-white/40 shadow-inner" />
                <span className="text-[8px] font-mono font-bold text-[#141517]/35 select-none">
                  {String(16 - i).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Cable Machine & Pulley Elevation Guide */}
        <div className="hidden xl:flex absolute right-6 top-16 bottom-16 w-10 border-l-2 border-[#141517]/15 flex-col justify-between items-center py-6 opacity-35">
          <div className="text-[9px] font-mono font-bold tracking-widest text-[#B48300] uppercase rotate-90 origin-center whitespace-nowrap mb-6">
            PULLEY · 70KG STACK
          </div>
          <div className="flex-1 flex flex-col justify-around items-center">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={`rack-r-${i}`} className="flex items-center gap-1.5 flex-row-reverse">
                <span className="w-2.5 h-2.5 rounded-full border border-[#141517]/40 bg-white/40 shadow-inner" />
                <span className="text-[8px] font-mono font-bold text-[#141517]/35 select-none">
                  {String(16 - i).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top-Right: Olympic 20KG Bumper Plate Blueprint Watermark */}
        <svg
          className="hidden lg:block absolute -top-12 -right-12 w-72 h-72 opacity-[0.08] pointer-events-none text-[#141517]"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="100" cy="100" r="94" strokeWidth="4" />
          <circle cx="100" cy="100" r="82" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="62" strokeWidth="3" />
          <circle cx="100" cy="100" r="28" strokeWidth="2.5" />
          <circle cx="100" cy="100" r="14" strokeWidth="4" fill="currentColor" fillOpacity="0.1" />
          <text
            x="100"
            y="70"
            textAnchor="middle"
            fontSize="10"
            fontWeight="900"
            fontFamily="'Barlow Condensed', sans-serif"
            fill="currentColor"
            letterSpacing="1.5"
          >
            20 KG · BUMPER
          </text>
          <text
            x="100"
            y="138"
            textAnchor="middle"
            fontSize="9"
            fontWeight="800"
            fontFamily="'Barlow Condensed', sans-serif"
            fill="currentColor"
            letterSpacing="1.2"
          >
            GYMRAT OLYMPIC
          </text>
        </svg>

        {/* Bottom-Left: Olympic Barbell & Precision Knurled Grip Blueprint */}
        <svg
          className="hidden lg:block absolute -bottom-10 -left-10 w-80 h-80 opacity-[0.07] pointer-events-none text-[#141517]"
          viewBox="0 0 240 240"
          fill="none"
          stroke="currentColor"
        >
          <line x1="20" y1="120" x2="220" y2="120" strokeWidth="6" strokeLinecap="round" />
          <rect x="18" y="90" width="16" height="60" rx="3" strokeWidth="3" />
          <rect x="38" y="96" width="10" height="48" rx="2" strokeWidth="2.5" />
          <rect x="206" y="90" width="16" height="60" rx="3" strokeWidth="3" />
          <rect x="192" y="96" width="10" height="48" rx="2" strokeWidth="2.5" />
          <line x1="70" y1="116" x2="70" y2="124" strokeWidth="2" />
          <line x1="85" y1="116" x2="85" y2="124" strokeWidth="2" />
          <line x1="155" y1="116" x2="155" y2="124" strokeWidth="2" />
          <line x1="170" y1="116" x2="170" y2="124" strokeWidth="2" />
          <circle cx="120" cy="120" r="18" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="120" cy="120" r="5" fill="currentColor" />
        </svg>
      </div>

      {/* LAYER 4: Subtle Atmospheric Airborne Chalk Dust Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10 opacity-70"
      />

      {/* High-Performance Safety-Yellow Athletic Turf Boundary Line along Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F5B800]/50 to-transparent" />
    </div>
  );
};
