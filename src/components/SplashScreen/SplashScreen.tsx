import React, { useState, useEffect } from 'react';
import '../../styles/splash.css';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number; // duration in milliseconds before fade out begins
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 2200,
}) => {
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  useEffect(() => {
    // 1. Trigger smooth fade-out after display duration
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, duration);

    // 2. Complete unmount after CSS fade-out transition (550ms)
    const finishTimer = setTimeout(() => {
      setIsDone(true);
      if (onFinish) {
        onFinish();
      }
    }, duration + 550);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  if (isDone) return null;

  return (
    <div
      className={`splash-screen-container ${isFadingOut ? 'fading-out' : ''}`}
      aria-label="Memuat aplikasi CityReport..."
    >
      {/* Background Subtle Radar Wave Circles */}
      <div className="splash-bg-rings" aria-hidden="true">
        <div className="splash-radar-ring ring-1" />
        <div className="splash-radar-ring ring-2" />
        <div className="splash-radar-ring ring-3" />
      </div>

      {/* Center Brand & Logo Section */}
      <div className="splash-center-content">
        {/* Logo Badge with Glowing Ambient Ring */}
        <div className="splash-logo-wrapper">
          <div className="splash-logo-glow" />
          <div className="splash-logo-badge">
            <svg
              width="46"
              height="46"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Modern City / Road Waypoint Geometry */}
              <path
                d="M22 5C14.82 5 9 10.82 9 18C9 27.2 22 39 22 39C22 39 35 27.2 35 18C35 10.82 29.18 5 22 5Z"
                stroke="url(#splash_pin_grad)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="22"
                cy="18"
                r="4.5"
                fill="url(#splash_core_grad)"
              />
              <path
                d="M16 28.5L22 35L28 28.5"
                stroke="#38BDF8"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
              <defs>
                <linearGradient
                  id="splash_pin_grad"
                  x1="9"
                  y1="5"
                  x2="35"
                  y2="39"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#38BDF8" />
                  <stop offset="1" stopColor="#2563EB" />
                </linearGradient>
                <linearGradient
                  id="splash_core_grad"
                  x1="17.5"
                  y1="13.5"
                  x2="26.5"
                  y2="22.5"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#60A5FA" />
                  <stop offset="1" stopColor="#38BDF8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Clean Modern Typography */}
        <div className="splash-brand-text-group">
          <h1 className="splash-title">CITY REPORT</h1>
          <p className="splash-subtitle">Smart Road & Incident Monitor</p>
          
          {/* Subtle Progress Bar */}
          <div className="splash-progress-track">
            <div className="splash-progress-bar" />
          </div>
        </div>
      </div>

      {/* Bottom Footer (Transjakarta Style Management Unit) */}
      <footer className="splash-footer">
        <div className="splash-footer-line" />
        <p className="splash-footer-text">SMART CITY MANAGEMENT UNIT</p>
      </footer>
    </div>
  );
};
