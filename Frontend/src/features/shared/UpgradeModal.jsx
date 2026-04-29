import { useNavigate } from "react-router-dom";
import "./upgrade-modal.scss";

const FEATURE_LABELS = {
  resumeAnalyses:   { icon: "📄", name: "Resume Analyses",   limit: "3/month",    pro: "Unlimited" },
  interviewReports: { icon: "🎤", name: "Interview Reports", limit: "1/day",      pro: "Unlimited" },
};

export default function UpgradeModal({ feature, onClose }) {
  const navigate = useNavigate();
  const info = FEATURE_LABELS[feature] || { icon: "✦", name: "This feature", limit: "Limited", pro: "Unlimited" };

  const handleUpgrade = () => {
    onClose?.();
    navigate("/pricing");
  };

  return (
    <div className="upgrade-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <button className="upgrade-modal__close" onClick={onClose}>×</button>

        <div className="upgrade-modal__icon">⚡</div>

        <h2 className="upgrade-modal__title">Upgrade to Pro</h2>
        <p className="upgrade-modal__subtitle">
          You've reached the limit for <strong>{info.name}</strong> on the Free plan.
        </p>

        <div className="upgrade-modal__compare">
          <div className="plan-col plan-col--free">
            <div className="plan-col__label">Free</div>
            <div className="plan-col__feature">
              <span>{info.icon}</span>
              <span>{info.name}</span>
            </div>
            <div className="plan-col__value plan-col__value--limited">{info.limit}</div>
          </div>
          <div className="plan-col__arrow">→</div>
          <div className="plan-col plan-col--pro">
            <div className="plan-col__label">Pro ✦</div>
            <div className="plan-col__feature">
              <span>{info.icon}</span>
              <span>{info.name}</span>
            </div>
            <div className="plan-col__value plan-col__value--unlimited">{info.pro}</div>
          </div>
        </div>

        <ul className="upgrade-modal__perks">
          <li>✓ Unlimited AI resume analyses</li>
          <li>✓ Unlimited interview prep reports</li>
          <li>✓ Priority AI processing</li>
          <li>✓ Advanced hiring insights</li>
        </ul>

        <button className="upgrade-modal__cta" onClick={handleUpgrade}>
          View Plans & Pricing →
        </button>

        <button className="upgrade-modal__dismiss" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  );
}