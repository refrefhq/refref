import React from 'react';

interface VisualProps {
  className?: string;
}

/**
 * Single-Sided Referral Program Visual
 * Shows one person (referrer) earning a reward
 * Represents: Affiliate-style, referrer-only rewards
 */
export function SingleSidedVisual({ className = '' }: VisualProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="personGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="rewardGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>

      {/* Person (Referrer) */}
      <circle cx="50" cy="60" r="18" fill="url(#personGradient1)" opacity="0.9" />
      <circle cx="50" cy="45" r="12" fill="url(#personGradient1)" />

      {/* Arrow */}
      <path
        d="M 80 60 L 120 60"
        stroke="#94a3b8"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 115 55 L 125 60 L 115 65"
        fill="#94a3b8"
      />

      {/* Reward (Dollar Sign) */}
      <circle cx="155" cy="60" r="22" fill="url(#rewardGradient1)" opacity="0.15" />
      <circle cx="155" cy="60" r="16" fill="url(#rewardGradient1)" opacity="0.3" />
      <text
        x="155"
        y="68"
        fontSize="24"
        fontWeight="bold"
        fill="url(#rewardGradient1)"
        textAnchor="middle"
      >
        $
      </text>
    </svg>
  );
}

/**
 * Double-Sided Referral Program Visual
 * Shows two people (referrer + referee) both earning rewards
 * Represents: Classic referral with two-way rewards
 */
export function DoubleSidedVisual({ className = '' }: VisualProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="personGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="person2Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="giftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>

      {/* Left Person (Referrer) */}
      <circle cx="40" cy="75" r="16" fill="url(#personGradient2)" opacity="0.9" />
      <circle cx="40" cy="62" r="11" fill="url(#personGradient2)" />

      {/* Left Gift */}
      <g transform="translate(25, 15)">
        <rect
          x="0"
          y="8"
          width="18"
          height="16"
          rx="2"
          fill="url(#giftGradient)"
          opacity="0.8"
        />
        <rect x="7" y="8" width="4" height="16" fill="url(#giftGradient)" />
        <path
          d="M 0 8 Q 9 0 18 8"
          fill="none"
          stroke="url(#giftGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* Connecting Line */}
      <path
        d="M 60 70 Q 100 70 140 70"
        stroke="#94a3b8"
        strokeWidth="2.5"
        strokeDasharray="4 3"
        fill="none"
        opacity="0.6"
      />

      {/* Right Person (Referee) */}
      <circle cx="160" cy="75" r="16" fill="url(#person2Gradient)" opacity="0.9" />
      <circle cx="160" cy="62" r="11" fill="url(#person2Gradient)" />

      {/* Right Gift */}
      <g transform="translate(157, 15)">
        <rect
          x="0"
          y="8"
          width="18"
          height="16"
          rx="2"
          fill="url(#giftGradient)"
          opacity="0.8"
        />
        <rect x="7" y="8" width="4" height="16" fill="url(#giftGradient)" />
        <path
          d="M 0 8 Q 9 0 18 8"
          fill="none"
          stroke="url(#giftGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* Heart icon in the middle */}
      <path
        d="M 100 65 L 103 70 L 100 74 L 97 70 Z"
        fill="#f472b6"
        opacity="0.6"
      />
    </svg>
  );
}

/**
 * Affiliate Program Visual
 * Shows person with percentage symbol and commission indicators
 * Represents: Commission-based affiliate/partner programs
 */
export function AffiliateVisual({ className = '' }: VisualProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="personGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="commissionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="dollarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Person (Affiliate) */}
      <circle cx="50" cy="70" r="18" fill="url(#personGradient3)" opacity="0.9" />
      <circle cx="50" cy="55" r="12" fill="url(#personGradient3)" />

      {/* Percentage Symbol - Large */}
      <circle cx="115" cy="50" r="24" fill="url(#commissionGradient)" opacity="0.15" />
      <text
        x="115"
        y="60"
        fontSize="32"
        fontWeight="bold"
        fill="url(#commissionGradient)"
        textAnchor="middle"
      >
        %
      </text>

      {/* Small Dollar Icons (Multiple Conversions) */}
      <g opacity="0.7">
        {/* Top right dollar */}
        <circle cx="155" cy="30" r="12" fill="url(#dollarGradient)" opacity="0.25" />
        <text
          x="155"
          y="36"
          fontSize="14"
          fontWeight="bold"
          fill="url(#dollarGradient)"
          textAnchor="middle"
        >
          $
        </text>

        {/* Middle right dollar */}
        <circle cx="170" cy="60" r="12" fill="url(#dollarGradient)" opacity="0.25" />
        <text
          x="170"
          y="66"
          fontSize="14"
          fontWeight="bold"
          fill="url(#dollarGradient)"
          textAnchor="middle"
        >
          $
        </text>

        {/* Bottom right dollar */}
        <circle cx="155" cy="90" r="12" fill="url(#dollarGradient)" opacity="0.25" />
        <text
          x="155"
          y="96"
          fontSize="14"
          fontWeight="bold"
          fill="url(#dollarGradient)"
          textAnchor="middle"
        >
          $
        </text>
      </g>

      {/* Connecting lines from person to percentage */}
      <path
        d="M 70 60 L 90 55"
        stroke="#94a3b8"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}
