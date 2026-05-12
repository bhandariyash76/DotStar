import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleBackground from './ParticleBackground';
import Logo3D from './Logo3D';

const VALID_CODES = ['DOTSTAR2026', 'EARLYACCESS', 'VIP2026', 'DOTSTAR', 'EXCLUSIVEACCESS'];

interface WaitingListPageProps {
  onUnlock: () => void;
}

/* Custom SVG letters matching the reference DOT.STAR font style */

function LetterD({ className }: { className?: string }) {
  return (
    <svg className={`brand-svg-letter ${className || ''}`} viewBox="0 0 78 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 16H44C60 16 70 27 70 39C70 51 60 56 44 56H8" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LetterT({ className }: { className?: string }) {
  return (
    <svg className={`brand-svg-letter brand-svg-letter-t ${className || ''}`} viewBox="0 0 66 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 16H60M33 16V56" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LetterS({ className }: { className?: string }) {
  return (
    <svg className={`brand-svg-letter ${className || ''}`} viewBox="0 0 72 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M62 16H22C13 16 8 21 8 28C8 35 13 39 22 39H50C59 39 64 43 64 50C64 55 59 56 50 56H10" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LetterA({ className }: { className?: string }) {
  return (
    <svg className={`brand-svg-letter ${className || ''}`} viewBox="0 0 72 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Triangle A without crossbar — matching reference */}
      <path d="M8 56L31 18C34 13 38 13 41 18L64 56" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LetterR({ className }: { className?: string }) {
  return (
    <svg className={`brand-svg-letter ${className || ''}`} viewBox="0 0 76 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M10 56V16H46C60 16 68 22 68 31C68 40 60 44 46 44H10M46 44L68 56" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Eclipse "O" — the glowing circle that replaces the letter O in DOT */
function EclipseO() {
  return (
    <span className="eclipse-o-wrapper">
      <span className="eclipse-o">
        <span className="eclipse-glow" />
        <span className="eclipse-center" />
      </span>
    </span>
  );
}

export default function WaitingListPage({ onUnlock }: WaitingListPageProps) {
  const [accessCode, setAccessCode] = useState('');
  const [email, setEmail] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [codeSuccess, setCodeSuccess] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [pageExiting, setPageExiting] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Animation phases
  const [phase, setPhase] = useState(0);
  // phase 0: nothing visible
  // phase 1: DOT STAR text appears (together, centered)
  // phase 2: text splits apart + 3D logo rotates in
  // phase 3: tagline + waitlist form + access code fade in

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),    // Text appears
      setTimeout(() => {
        setPhase(2);
        requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
      }, 1200),   // Split + 3D logo reveal
      setTimeout(() => setPhase(3), 2600),   // Waitlist content appears
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleAccessCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = accessCode.trim().toUpperCase();

    if (VALID_CODES.includes(code)) {
      setCodeSuccess(true);
      setCodeError(false);
      setPageExiting(true);
      setTimeout(() => {
        onUnlock();
      }, 1200);
    } else {
      setCodeError(true);
      setCodeSuccess(false);
      setTimeout(() => setCodeError(false), 1500);
    }
  };

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@') && email.includes('.')) {
      setEmailSubmitted(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="waitlist-page"
        initial={{ opacity: 0 }}
        animate={{
          opacity: pageExiting ? 0 : 1,
          scale: pageExiting ? 1.05 : 1,
          filter: pageExiting ? 'brightness(2)' : 'brightness(1)',
        }}
        transition={{ duration: pageExiting ? 1.0 : 0.8 }}
      >
        {/* Particle Background */}
        <ParticleBackground />

        {/* Subtle radial vignette */}
        <div className="waitlist-vignette" />

        {/* Main Content */}
        <div className="waitlist-content">
          {/* DOT · [LOGO] · STAR */}
          <div className="waitlist-brand">
            {/* DOT text — with eclipse O */}
            <motion.div
              className="waitlist-text-group waitlist-text-dot"
              initial={{ opacity: 0 }}
              animate={{
                opacity: phase >= 1 ? 1 : 0,
                x: phase >= 2 ? '-56px' : '0px',
              }}
              transition={{
                opacity: { duration: 1, ease: 'easeOut' },
                x: { duration: 1.6, ease: [0.16, 1, 0.3, 1] },
              }}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
                transition={{ duration: 0.7, delay: 0, ease: [0.16, 1, 0.3, 1] }}
              >
                <LetterD />
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <EclipseO />
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <LetterT />
              </motion.span>
            </motion.div>

            {/* 3D Logo — appears simultaneously with text split */}
            <motion.div
              className="waitlist-logo-container"
              initial={{ opacity: 0, scale: 0.72, rotateY: -90 }}
              animate={{
                opacity: phase >= 2 ? 1 : 0,
                scale: phase >= 2 ? 1 : 0.72,
                rotateY: phase >= 2 ? 0 : -90,
              }}
              transition={{
                duration: 1.05,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Logo3D className="waitlist-logo-3d" />
            </motion.div>

            {/* STAR text */}
            <motion.div
              className="waitlist-text-group waitlist-text-star"
              initial={{ opacity: 0 }}
              animate={{
                opacity: phase >= 1 ? 1 : 0,
                x: phase >= 2 ? '28px' : '0px',
              }}
              transition={{
                opacity: { duration: 1, ease: 'easeOut' },
                x: { duration: 1.6, ease: [0.16, 1, 0.3, 1] },
              }}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <LetterS />
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
                transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <LetterT />
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <LetterA />
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
                transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <LetterR />
              </motion.span>
            </motion.div>
          </div>

          {/* Tagline */}
          <motion.p
            className="waitlist-tagline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase >= 3 ? 1 : 0, y: phase >= 3 ? 0 : 20 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            Luxury Streetwear · Coming Soon
          </motion.p>

          {/* Waitlist Form */}
          <motion.div
            className="waitlist-form-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: phase >= 3 ? 1 : 0, y: phase >= 3 ? 0 : 30 }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          >
            <AnimatePresence mode="wait">
              {!emailSubmitted ? (
                <motion.form
                  key="email-form"
                  onSubmit={handleWaitlist}
                  className="waitlist-email-form"
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="waitlist-input-group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="waitlist-email-input"
                      id="waitlist-email-input"
                      required
                    />
                    <button type="submit" className="waitlist-submit-btn" id="waitlist-submit-btn">
                      Join Waitlist
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success-msg"
                  className="waitlist-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>You're on the list. We'll be in touch.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Access Code Section */}
          <motion.div
            className="waitlist-access-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 3 ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <p className="waitlist-access-label">Already have access?</p>
            <form onSubmit={handleAccessCode} className="waitlist-access-form">
              <div className={`waitlist-access-input-wrapper ${codeError ? 'shake' : ''} ${codeSuccess ? 'success' : ''}`}>
                <input
                  ref={codeInputRef}
                  type="text"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value.toUpperCase());
                    setCodeError(false);
                  }}
                  placeholder="ENTER ACCESS CODE"
                  className="waitlist-access-input"
                  id="access-code-input"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  className="waitlist-access-btn"
                  id="access-code-submit"
                  aria-label="Submit access code"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
              <AnimatePresence>
                {codeError && (
                  <motion.p
                    className="waitlist-code-error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    Invalid access code
                  </motion.p>
                )}
                {codeSuccess && (
                  <motion.p
                    className="waitlist-code-success"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    Access granted ✦
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* Footer line */}
          <motion.div
            className="waitlist-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 3 ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <p>© 2026 DOT.STAR — All rights reserved</p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
