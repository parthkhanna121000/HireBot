import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder, verifyPayment, getSubscriptionStatus } from "../services/payments.api";
import "./../../payments/styles/pricing.scss";

const PLANS = [
  {
    key:       null,
    name:      "Free",
    price:     "₹0",
    period:    "forever",
    badge:     null,
    highlight: false,
    tag:       "Get started",
    features: [
      { text: "Limited resume analyses / month",   included: true  },
      { text: "Limited interview report / day",    included: true  },
      { text: "Job listings & apply",        included: true  },
      { text: "Application tracker",         included: true  },
      { text: "Unlimited analyses",          included: false },
      { text: "Unlimited interview prep",    included: false },
      { text: "Priority AI processing",      included: false },
      { text: "Advanced hiring insights",    included: false },
    ],
    cta: "Current Plan",
  },
  {
    key:       "pro_monthly",
    name:      "Pro",
    price:     "₹499",
    period:    "/month",
    badge:     "Most Popular",
    highlight: true,
    tag:       "For serious job seekers",
    features: [
      { text: "Unlimited resume analyses",       included: true },
      { text: "Unlimited interview prep",        included: true },
      { text: "All Free features",               included: true },
      { text: "Priority AI processing",          included: true },
      { text: "Advanced hiring insights",        included: true },
      { text: "PDF exports",                     included: true },
      { text: "AI bullet rewriter",              included: true },
      { text: "Interview history & tracking",    included: true },
    ],
    cta: "Upgrade to Pro",
  },
  {
    key:       "pro_annual",
    name:      "Pro Annual",
    price:     "₹3,999",
    period:    "/year",
    badge:     "Save 33%",
    highlight: false,
    tag:       "Best value",
    features: [
      { text: "Everything in Pro",              included: true },
      { text: "12 months access",               included: true },
      { text: "Lowest cost per month",          included: true },
      { text: "Priority AI processing",         included: true },
      { text: "Advanced hiring insights",       included: true },
      { text: "PDF exports",                    included: true },
      { text: "AI bullet rewriter",             included: true },
      { text: "Interview history & tracking",   included: true },
    ],
    cta: "Get Annual Pro",
  },
];

const FAQ_ITEMS = [
  { q: "Can I cancel anytime?", a: "Your Pro access stays active until your plan expiry date. No recurring charges — each payment is a one-time purchase." },
  { q: "Is payment secure?",    a: "All payments are processed by Razorpay, PCI DSS compliant. HireBot never stores your card details." },
  { q: "What counts as a 'resume analysis'?", a: "Each time you upload a resume + job description and click Analyze, that counts as one use. Free plan includes 3 per month." },
  { q: "What happens to my data?", a: "Your analyses, interview reports, and applications are stored securely. Deleting your account removes all data permanently." },
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="7" fill="rgba(139,92,246,0.15)"/>
      <path d="M4 7l2 2 4-4" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="7" fill="rgba(255,255,255,0.03)"/>
      <path d="M5 5l4 4M9 5l-4 4" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}>
      <path d="M4 6l4 4 4-4" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "faq-item--open" : ""}`} onClick={() => setOpen(!open)}>
      <div className="faq-item__q">
        <span>{item.q}</span>
        <ChevronIcon open={open} />
      </div>
      <div className="faq-item__a" style={{ maxHeight: open ? "200px" : "0px" }}>
        <p>{item.a}</p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const navigate      = useNavigate();
  const [status,      setStatus]      = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [successPlan, setSuccessPlan] = useState(null);
  const [error,       setError]       = useState(null);
  const heroRef = useRef(null);

  useEffect(() => {
    getSubscriptionStatus().then(setStatus).catch(() => {});
  }, []);

  // Parallax orbs on mouse move
  useEffect(() => {
    const handler = (e) => {
      const orbs = document.querySelectorAll(".orb");
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 12;
        orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
      });
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src    = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload  = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleUpgrade = async (planKey) => {
    if (!planKey) return;
    setError(null);
    setLoadingPlan(planKey);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { setError("Failed to load payment gateway."); setLoadingPlan(null); return; }

      const orderData = await createOrder(planKey);

      const options = {
        key:         orderData.keyId,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        "HireBot",
        description: orderData.plan,
        order_id:    orderData.orderId,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              planKey,
            });
            setSuccessPlan(planKey);
            setStatus((prev) => ({ ...prev, plan: "pro" }));
            setTimeout(() => navigate("/dashboard"), 2500);
          } catch { setError("Payment verification failed. Contact support."); }
        },
        modal: { ondismiss: () => setLoadingPlan(null) },
        theme: { color: "#7c3aed" },
        prefill: {},
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to initiate payment.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (plan) => {
    if (plan.key === null) return status?.plan === "free" || !status?.plan;
    if (plan.key === "pro_monthly" || plan.key === "pro_annual") return status?.plan === "pro";
    return false;
  };

  return (
    <div className="pricing-page">

      {/* ── Ambient Background ─────────────────────────────────────────── */}
      <div className="pricing-bg" aria-hidden="true">
        <div className="orb orb--1" />
        <div className="orb orb--2" />
        <div className="orb orb--3" />
        <div className="pricing-bg__grid" />
      </div>

      <div className="pricing-wrap">

        {/* ── Back ────────────────────────────────────────────────────── */}
        <button className="pricing-back" onClick={() => navigate(-1)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <header className="pricing-hero" ref={heroRef}>
          <div className="pricing-hero__pill">
            <span className="pricing-hero__pill-dot" />
            Transparent pricing · No hidden fees
          </div>
          <h1 className="pricing-hero__title">
            Land your dream job<br />
            <em>without limits</em>
          </h1>
          <p className="pricing-hero__sub">
            Start free. When you're ready to go all-in, Pro gives you<br />
            unlimited AI power — resume analysis, interview prep, and more.
          </p>
        </header>

        {/* ── Alerts ──────────────────────────────────────────────────── */}
        {error && (
          <div className="alert alert--error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#f87171" strokeWidth="1.5"/><path d="M8 5v3M8 10.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {error}
            <button onClick={() => setError(null)} aria-label="Dismiss">×</button>
          </div>
        )}
        {successPlan && (
          <div className="alert alert--success">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#4ade80" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Pro plan activated! Redirecting you to dashboard…
          </div>
        )}

        {/* ── Pro Status Banner ────────────────────────────────────────── */}
        {status?.plan === "pro" && status?.planExpiryDate && (
          <div className="pro-banner">
            <div className="pro-banner__icon">⚡</div>
            <div>
              <p className="pro-banner__title">You're on <strong>Pro</strong></p>
              <p className="pro-banner__sub">Active until {new Date(status.planExpiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>
        )}

        {/* ── Plans Grid ──────────────────────────────────────────────── */}
        <div className="plans-grid">
          {PLANS.map((plan, idx) => {
            const active  = isCurrentPlan(plan);
            const loading = loadingPlan === plan.key;

            return (
              <div
                key={plan.key ?? "free"}
                className={[
                  "plan-card",
                  plan.highlight  ? "plan-card--featured" : "",
                  active          ? "plan-card--active"   : "",
                ].join(" ")}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Glow layer for featured card */}
                {plan.highlight && <div className="plan-card__glow" aria-hidden="true" />}

                {/* Badge */}
                {plan.badge && (
                  <div className={`plan-card__badge ${plan.key === "pro_annual" ? "plan-card__badge--gold" : ""}`}>
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div className="plan-card__head">
                  <div>
                    <p className="plan-card__tag">{plan.tag}</p>
                    <h2 className="plan-card__name">{plan.name}</h2>
                  </div>
                  <div className="plan-card__price-wrap">
                    <span className="plan-card__price">{plan.price}</span>
                    <span className="plan-card__period">{plan.period}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="plan-card__divider" />

                {/* Features */}
                <ul className="plan-card__features">
                  {plan.features.map((f, i) => (
                    <li key={i} className={`plan-card__feature ${!f.included ? "plan-card__feature--off" : ""}`}>
                      {f.included ? <CheckIcon /> : <CrossIcon />}
                      {f.text}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={[
                    "plan-card__cta",
                    plan.highlight ? "plan-card__cta--primary" : "",
                    active         ? "plan-card__cta--current"  : "",
                  ].join(" ")}
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={active || !plan.key || loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Activating Pro…
                    </>
                  ) : active ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="#4ade80" strokeWidth="1.2"/><path d="M3.5 6.5l2 2 4-4" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Current Plan
                    </>
                  ) : plan.key === "pro_monthly" ? (
                    <>Upgrade to Pro <span className="plan-card__cta-arrow">→</span></>
                  ) : (
                    <>{plan.cta} <span className="plan-card__cta-arrow">→</span></>
                  )}
                </button>

                {plan.key === "pro_monthly" && (
                  <p className="plan-card__note">Billed monthly · Cancel anytime</p>
                )}
                {plan.key === "pro_annual" && (
                  <p className="plan-card__note">~₹333/month billed annually</p>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Trust Strip ─────────────────────────────────────────────── */}
        <div className="trust-strip">
          {["Razorpay secured", "PCI DSS compliant", "No auto-renewal", "Cancel anytime"].map((t) => (
            <span key={t} className="trust-strip__item">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1l1.2 3.6H11L8.4 6.8l1 3.2L6 8.2l-3.4 1.8 1-3.2L1 4.6h3.8L6 1z" fill="#4f46e5" opacity=".7"/></svg>
              {t}
            </span>
          ))}
        </div>

        {/* ── FAQ Accordion ───────────────────────────────────────────── */}
        <section className="faq-section">
          <h3 className="faq-section__title">Common questions</h3>
          <div className="faq-list">
            {FAQ_ITEMS.map((item, i) => <FaqItem key={i} item={item} />)}
          </div>
        </section>

      </div>
    </div>
  );
}