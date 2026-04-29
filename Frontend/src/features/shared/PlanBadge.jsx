import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSubscriptionStatus } from "../payments/services/payments.api";
import "./plan-badge.scss";

/**
 * PlanBadge — drops into any sidebar or header.
 * Shows "FREE" or "PRO" chip + upgrade CTA for free users.
 *
 * Usage:
 *   import PlanBadge from "../../shared/PlanBadge";
 *   <PlanBadge />
 */
export default function PlanBadge() {
  const navigate              = useNavigate();
  const [status, setStatus]   = useState(null);

  useEffect(() => {
    getSubscriptionStatus()
      .then(setStatus)
      .catch(() => {});
  }, []);

  if (!status) return null;

  if (status.plan === "pro") {
    return (
      <div className="plan-badge plan-badge--pro">
        <span className="plan-badge__icon">⚡</span>
        <span className="plan-badge__label">Pro Active</span>
        {status.planExpiryDate && (
          <span className="plan-badge__expiry">
            until {new Date(status.planExpiryDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="plan-badge plan-badge--free">
      <div className="plan-badge__top">
        <span className="plan-badge__chip">FREE</span>
        <span className="plan-badge__usage">
          {status.usage?.resumeAnalyses ?? 0}/3 analyses
        </span>
      </div>
      <button
        className="plan-badge__upgrade"
        onClick={() => navigate("/pricing")}
      >
        ⚡ Upgrade to Pro
      </button>
    </div>
  );
}