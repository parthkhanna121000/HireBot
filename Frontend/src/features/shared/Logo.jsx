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
  const uid      = useId().replace(/:/g, "");
  const gradId   = `hb-grad-${uid}`;
  const sheenId  = `hb-sheen-${uid}`;
  const glowId   = `hb-glow-${uid}`;
  const ts       = textSize ?? Math.round(size * 0.52);
  const gap      = Math.max(8, Math.round(size * 0.28));
  const isMono   = variant === "mono";
  const isGlow   = variant === "glow";

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
        aria-label="HireBotAI logo mark"
        style={{
          filter: isGlow
            ? `drop-shadow(0 0 ${Math.round(size * 0.4)}px rgba(124,58,237,0.55)) drop-shadow(0 2px 6px rgba(0,0,0,0.3))`
            : `drop-shadow(0 2px 8px rgba(79,70,229,0.25))`,
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="3" y1="2" x2="37" y2="38" gradientUnits="userSpaceOnUse">
            {isMono ? (
              <>
                <stop offset="0%"   stopColor="#e8e8f5" />
                <stop offset="100%" stopColor="#c4c4dd" />
              </>
            ) : (
              <>
                <stop offset="0%"   stopColor="#6366f1" />
                <stop offset="48%"  stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </>
            )}
          </linearGradient>

          {/* glass sheen across the top */}
          <linearGradient id={sheenId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {isGlow && (
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Squircle background */}
        <rect width="40" height="40" rx="11" fill={`url(#${gradId})`} />
        {/* faint inner ring for depth */}
        <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="10.5"
              fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.75" />
        {/* top glass sheen */}
        <rect width="40" height="19" rx="11" fill={`url(#${sheenId})`} opacity="0.5" />

        {/* ── H letterform — cleaner, evenly-weighted strokes ── */}
        <g filter={isGlow ? `url(#${glowId})` : undefined}>
          <rect x="10" y="9.5"  width="4.6" height="21" rx="2.3" fill="rgba(6,6,16,0.86)" />
          <rect x="25.4" y="9.5" width="4.6" height="21" rx="2.3" fill="rgba(6,6,16,0.86)" />
          <rect x="10" y="17.7" width="20" height="4.6" rx="2.3" fill="rgba(6,6,16,0.86)" />
        </g>

        {/* ── AI node accent — pulsing intelligence dot instead of a generic sparkle ── */}
        <g>
          <circle cx="32" cy="8" r="4.2" fill="rgba(6,6,16,0.86)" opacity="0.18" />
          <circle cx="32" cy="8" r="2.3" fill="#ffffff">
            <animate attributeName="opacity" values="1;0.45;1" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="32" cy="8" r="2.3" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1">
            <animate attributeName="r" values="2.3;5.5;2.3" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="2.4s" repeatCount="indefinite" />
          </circle>
        </g>
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
            display: "inline-flex",
            alignItems: "baseline",
          }}
        >
          Hire
          <span
            style={{
              background: "linear-gradient(90deg, #6366f1, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Bot
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: Math.round(ts * 0.42),
              fontWeight: 600,
              color: "#0ea5e9",
              opacity: 0.85,
              marginLeft: 2,
              alignSelf: "flex-start",
            }}
          >
            AI
          </span>
        </span>
      )}
    </div>
  );
};

export default HireBotLogo;