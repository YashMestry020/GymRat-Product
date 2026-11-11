import React from 'react';

interface GymRatLogoProps {
  className?: string;
  size?: number | string;
  accentColor?: string;
  monogram?: boolean;
}

export const GymRatLogo: React.FC<GymRatLogoProps> = ({
  className = 'w-4 h-4',
  accentColor = '#F5B800',
  monogram = false,
}) => {
  if (monogram) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="GymRat Logo"
      >
        {/* Athletic Hex Shield Base */}
        <polygon
          points="16,2 29,8 29,24 16,30 3,24 3,8"
          fill="#141517"
          stroke={accentColor}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Barbell Crossbar */}
        <line x1="6" y1="16" x2="26" y2="16" stroke={accentColor} strokeWidth="1.5" strokeDasharray="2 1" />
        {/* GR Bold Athletic Monogram */}
        <text
          x="16"
          y="20"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="'Barlow Condensed', sans-serif"
          fontWeight="900"
          fontSize="13"
          letterSpacing="0.5"
        >
          GR
        </text>
        {/* Top & Bottom Optical Sensor Dots */}
        <circle cx="16" cy="6" r="1.5" fill={accentColor} />
        <circle cx="16" cy="26" r="1.5" fill={accentColor} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="GymRat Logo"
    >
      {/* Outer Hexagonal Barbell Weight Plate - Left */}
      <path
        d="M2.5 8L4.5 5H6V19H4.5L2.5 16V8Z"
        fill="currentColor"
      />
      {/* Precision Collar Band Left */}
      <rect x="7" y="6.5" width="1.5" height="11" rx="0.5" fill={accentColor} />

      {/* Heavy-Duty Calisthenics Bar */}
      <rect x="6" y="10.8" width="12" height="2.4" rx="1.2" fill="currentColor" />

      {/* Knurled Grip Texture on Bar */}
      <line x1="9" y1="11" x2="9" y2="13" stroke={accentColor} strokeWidth="0.8" />
      <line x1="15" y1="11" x2="15" y2="13" stroke={accentColor} strokeWidth="0.8" />

      {/* Precision Collar Band Right */}
      <rect x="15.5" y="6.5" width="1.5" height="11" rx="0.5" fill={accentColor} />
      {/* Outer Hexagonal Barbell Weight Plate - Right */}
      <path
        d="M21.5 8L19.5 5H18V19H19.5L21.5 16V8Z"
        fill="currentColor"
      />

      {/* Center GymRat Optical Sensor Housing */}
      <rect
        x="9.5"
        y="8.5"
        width="5"
        height="7"
        rx="1.5"
        fill="#141517"
        stroke={accentColor}
        strokeWidth="1"
      />
      {/* Central IR Optical Laser Core */}
      <circle cx="12" cy="12" r="1.2" fill={accentColor} />
    </svg>
  );
};
