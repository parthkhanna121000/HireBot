import { useId } from "react";

/**
 * HireBotLogo — unified logo used across all pages.
 *
 * Props:
 *   size      — mark size in px (default 32)
 *   showText  — show "HireBot" wordmark (default true)
 *   textColor — wordmark colour (default #f4f4ff)
 *   textSize  — font size in px (default: size × 0.52)
 *   variant   — "default" | "mono" | "glow"  (visual treatment)
 *   style     — extra wrapper styles
 */
const HireBotLogo = ({
  size = 32,
  showText = true,
  textColor = "#f4f4ff",
  textSize,
  variant = "default",
  style = {},
}) => {
  const uid    = useId().replace(/:/g, "");
  const gradId = `hb-grad-${uid}`;
  const glowId = `hb-glow-${uid}`;
  const ts     = textSize ?? Math.round(size * 0.52);
  const gap    = Math.max(8, Math.round(size * 0.28));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap,
        flexShrink: 0,
        textDecoration: "none",
        ...style,
      }}
    >
      {/* ── Mark ────────────────────────────────────────────────── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="HireBot logo mark"
        style={{
          filter: variant === "glow"
            ? `drop-shadow(0 0 ${Math.round(size * 0.35)}px rgba(0,168,224,0.55))`
            : undefined,
        }}
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="2" y1="2" x2="38" y2="38"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%"   stopColor="#00e5a0" />
            <stop offset="52%"  stopColor="#00a8e0" />
            <stop offset="100%" stopColor="#4060ff" />
          </linearGradient>
          {variant === "glow" && (
            <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Squircle background */}
        <rect width="40" height="40" rx="10" fill={`url(#${gradId})`} />

        {/* Subtle inner highlight */}
        <rect
          width="40" height="20" rx="10"
          fill="rgba(255,255,255,0.07)"
          style={{ maskImage: "linear-gradient(to bottom, white, transparent)" }}
        />

        {/* ── H letterform ── */}
        {/* Left pillar */}
        <rect x="9.5"  y="10" width="5" height="20" rx="2.5" fill="rgba(0,0,0,0.82)" />
        {/* Right pillar */}
        <rect x="25.5" y="10" width="5" height="20" rx="2.5" fill="rgba(0,0,0,0.82)" />
        {/* Crossbar */}
        <rect x="9.5" y="17.5" width="21" height="5" rx="2.5" fill="rgba(0,0,0,0.82)" />

        {/* ── Spark accent — top-right ── */}
        <circle cx="33.5" cy="6.5" r="2.2" fill="white" opacity="0.95" />
        <line x1="33.5" y1="2.5"  x2="33.5" y2="4.0"
              stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
        <line x1="37.5" y1="6.5"  x2="36.0" y2="6.5"
              stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
        <line x1="36.4" y1="3.6"  x2="35.3" y2="4.7"
              stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
      </svg>

{/* ── Wordmark ─────────────────────────────────────────────── */}
{showText && (
  <span
    style={{
      fontFamily: "'Cabinet Grotesk', 'Bricolage Grotesque', sans-serif",
      fontWeight: 900,
      fontSize: ts,
      color: textColor,
      letterSpacing: "-0.03em",
      lineHeight: 1,
      userSelect: "none",
    }}
  >
    Hire
    <span
      style={{
        background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      Bot
    </span>
  </span>
)}


    </div>
  );
};

export default HireBotLogo;