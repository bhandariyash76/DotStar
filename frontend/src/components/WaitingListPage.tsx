import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleBackground from './ParticleBackground';
import Logo3D from './Logo3D';
import { LetterD, LetterT, LetterS, LetterA, LetterR, MoonEclipseO, MetallicGradient } from './BrandText';

const VALID_CODES = ['DOTSTAR2026', 'EARLYACCESS', 'VIP2026', 'DOTSTAR', 'EXCLUSIVEACCESS'];

interface WaitingListPageProps {
  onUnlock: () => void;
}

export default function WaitingListPage({ onUnlock }: WaitingListPageProps) {
  const [accessCode, setAccessCode] = useState('');
  const [email, setEmail] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [codeSuccess, setCodeSuccess] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [pageExiting, setPageExiting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Animation phases
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    const timers = [
      setTimeout(() => setPhase(1), 400),    // Text appears
      setTimeout(() => {
        setPhase(2);
        requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
      }, 1200),   // Split + 3D logo reveal
      setTimeout(() => setPhase(3), 2600),   // Waitlist content appears
    ];
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
    };
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
    <AnimatePresence mode="wait">
      <motion.div
        className="waitlist-page dark" // Forced Dark Class
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
        <MetallicGradient />

        {/* Subtle radial vignette */}
        <div className="waitlist-vignette" />

        {/* Main Content */}
        <div className="waitlist-content text-[#FAFAF8]">
          {/* DOT · [LOGO] · STAR */}
          <div className="waitlist-brand" style={{ gap: 'clamp(1rem, 3.5vw, 2.5rem)' }}>
            <motion.div
              className="waitlist-text-group waitlist-text-dot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: phase >= 1 ? 1 : 0, 
                x: phase >= 2 ? (isMobile ? -24 : -60) : 0,
                scale: phase >= 2 ? 0.82 : 1
              }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{ zIndex: 10 }}
            >
              <div className="flex items-center h-[clamp(22px,4.2vw,54px)] gap-[0.4em] text-[#FAFAF8]">
                <LetterD metallic={true} />
                <MoonEclipseO />
                <LetterT metallic={true} />
              </div>
            </motion.div>

            {/* 3D Logo — centered between DOT and STAR */}
            <motion.div
              className="waitlist-logo-container"
              initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
              animate={{
                opacity: phase >= 2 ? 1 : 0,
                scale: phase >= 2 ? 1 : 0.5,
                rotateY: phase >= 2 ? 0 : -90,
              }}
              style={{ x: '-50%', y: '-50%' }}
              transition={{
                duration: 1.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Logo3D className="waitlist-logo-3d" />
            </motion.div>

            <motion.div
              className="waitlist-text-group waitlist-text-star"
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: phase >= 1 ? 1 : 0, 
                x: phase >= 2 ? (isMobile ? 24 : 60) : 0,
                scale: phase >= 2 ? 0.82 : 1
              }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{ zIndex: 10 }}
            >
              <div className="flex items-center h-[clamp(22px,4.2vw,54px)] gap-[0.4em] text-[#FAFAF8]">
                <LetterS metallic={true} />
                <LetterT metallic={true} />
                <LetterA metallic={true} />
                <LetterR metallic={true} />
              </div>
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
