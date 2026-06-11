"use client";

import { useRef, useState } from "react";
import confetti from "canvas-confetti";

const MONTHLY_PRICE = 19;
const ANNUAL_PRICE = 15; // billed at $180/yr
const ORIGINAL_PRICE = 29;

const FREE_FEATURES = [
  "Up to 3 subscriptions",
  "1 group",
  "Basic renewal reminders",
  "Email notifications",
];

const PRO_FEATURES = [
  "Unlimited subscriptions & groups",
  "Multi-currency tracking",
  "Boopy AI Assistant",
  "Push + email reminders",
  "Receipt & document scanning",
  "Renewal calendar",
  "Priority support",
];

interface PricingSectionProps {
  appUrl: string;
  upgradeUrl: string;
}

export function PricingSection({ appUrl, upgradeUrl }: PricingSectionProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const switchRef = useRef<HTMLButtonElement>(null);

  const price = isAnnual ? ANNUAL_PRICE : MONTHLY_PRICE;

  function toggleBilling(toAnnual: boolean) {
    setIsAnnual(toAnnual);
    if (toAnnual && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      void confetti({
        particleCount: 60,
        spread: 70,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ["#6d5df6", "#a78bfa", "#c4b5fd", "#8b7cf8", "#ffffff"],
        ticks: 220,
        gravity: 1.3,
        decay: 0.93,
        startVelocity: 28,
        shapes: ["circle"],
      });
    }
  }

  const CheckIcon = () => (
    <svg viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg" width={10} height={8}>
      <path
        d="M1 4l2.5 2.5L9 1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <>
      {/* billing toggle */}
      <div className="pricing-toggle-wrap">
        <button
          type="button"
          className={`pricing-toggle-pill${!isAnnual ? "active" : ""}`}
          onClick={() => toggleBilling(false)}
        >
          Monthly
        </button>
        <button
          ref={switchRef}
          type="button"
          className={`pricing-toggle-pill${isAnnual ? "active" : ""}`}
          onClick={() => toggleBilling(true)}
        >
          Annual
          <span className="pricing-toggle-badge">Save 20%</span>
        </button>
      </div>

      <div className="pricing-grid">
        {/* Free */}
        <div className="panel pricing-card">
          <span className="price-tier">Free</span>
          <h3>$0</h3>
          <p className="muted">Forever free — no credit card needed.</p>
          <ul className="feature-list">
            {FREE_FEATURES.map((f) => (
              <li key={f}>
                <span className="check-icon">
                  <CheckIcon />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <a
            className="btn btn-ghost"
            href={appUrl}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Get started free
          </a>
        </div>

        {/* Pro */}
        <div className="panel pricing-card pricing-card-featured">
          <span className="pricing-badge">Most Popular</span>
          <div className="pricing-trial-badge">7-day free trial</div>
          <span className="price-tier">Pro</span>
          <h3>
            <span className="pricing-price-current">${price}</span>
            <span className="pricing-price-period">/mo</span>
            <span className="pricing-price-was">${ORIGINAL_PRICE}</span>
          </h3>
          <p className="muted">
            {isAnnual
              ? `Billed annually at $${ANNUAL_PRICE * 12}/yr — you save $${(MONTHLY_PRICE - ANNUAL_PRICE) * 12}/yr.`
              : "Billed monthly. Cancel anytime."}
          </p>
          <ul className="feature-list">
            {PRO_FEATURES.map((f) => (
              <li key={f}>
                <span className="check-icon">
                  <CheckIcon />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <a
            className="btn btn-primary"
            href={upgradeUrl}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Start free trial
          </a>
          <p className="pricing-cancel-note">No credit card during trial · Cancel anytime</p>
        </div>
      </div>
    </>
  );
}
