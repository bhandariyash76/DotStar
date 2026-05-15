import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  life: number;
  maxLife: number;
}

// Star color palette — mostly white with subtle warm/cool tints
const STAR_COLORS = [
  '255, 255, 255',   // pure white
  '255, 255, 255',   // pure white (weighted more)
  '255, 255, 255',   // pure white
  '220, 235, 255',   // cool blue-white
  '255, 245, 220',   // warm yellow-white
  '200, 220, 255',   // blue
  '255, 230, 200',   // orange-white
  '230, 220, 255',   // lavender
];

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const buildStars = (w: number, h: number) => {
      const stars: Star[] = [];
      const total = Math.floor((w * h) / 900);

      // Milky Way band — diagonal swath of denser stars
      const bandAngle = Math.PI * 0.28;
      const bandWidth = Math.min(w, h) * 0.7;
      const bandCx = w * 0.5;
      const bandCy = h * 0.45;

      for (let i = 0; i < total; i++) {
        let x: number, y: number;
        const inBand = Math.random() < 0.45;

        if (inBand) {
          const t = (Math.random() - 0.5) * Math.sqrt(w * w + h * h);
          const offset = (Math.random() - 0.5) * bandWidth;
          x = bandCx + t * Math.cos(bandAngle) + offset * Math.sin(bandAngle);
          y = bandCy + t * Math.sin(bandAngle) - offset * Math.cos(bandAngle);
        } else {
          x = Math.random() * w;
          y = Math.random() * h;
        }

        x = Math.max(0, Math.min(w, x));
        y = Math.max(0, Math.min(h, y));

        const sizeRoll = Math.random();
        let radius: number;
        if (sizeRoll < 0.70) radius = Math.random() * 0.5 + 0.2;
        else if (sizeRoll < 0.90) radius = Math.random() * 0.7 + 0.6;
        else if (sizeRoll < 0.97) radius = Math.random() * 0.8 + 1.1;
        else radius = Math.random() * 1.0 + 1.8;

        const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];

        stars.push({
          x, y, baseX: x, baseY: y, vx: 0, vy: 0,
          radius,
          opacity: Math.random() * 0.6 + (inBand ? 0.3 : 0.1),
          twinkleSpeed: Math.random() * 0.025 + 0.003,
          twinklePhase: Math.random() * Math.PI * 2,
          color,
        });
      }

      starsRef.current = stars;
      shootingStarsRef.current = [];
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      buildStars(w, h);
    };

    const spawnShootingStar = (w: number, h: number) => {
      const angle = (Math.random() * 40 + 20) * (Math.PI / 180); // 20–60° downward
      const speed = Math.random() * 8 + 5;
      shootingStarsRef.current.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: Math.random() * 80 + 60,
        opacity: 1,
        life: 0,
        maxLife: Math.random() * 40 + 30,
      });
    };

    const drawNebula = (w: number, h: number) => {
      // Soft nebula blobs
      const nebulae = [
        { x: w * 0.3,  y: h * 0.35, r: w * 0.25, color: '80, 40, 120',   a: 0.045 },
        { x: w * 0.65, y: h * 0.55, r: w * 0.20, color: '20, 60, 110',   a: 0.038 },
        { x: w * 0.5,  y: h * 0.25, r: w * 0.18, color: '120, 60, 40',   a: 0.030 },
        { x: w * 0.15, y: h * 0.65, r: w * 0.15, color: '40, 80, 120',   a: 0.025 },
        { x: w * 0.8,  y: h * 0.3,  r: w * 0.12, color: '90, 30, 90',    a: 0.020 },
      ];

      for (const n of nebulae) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0,   `rgba(${n.color}, ${n.a})`);
        g.addColorStop(0.5, `rgba(${n.color}, ${n.a * 0.4})`);
        g.addColorStop(1,   `rgba(${n.color}, 0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
    };

    const animate = () => {
      const t = timeRef.current++;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Pure black background
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // Nebula blobs
      drawNebula(w, h);

      // Draw stars with mouse repulsion
      const mouse = mouseRef.current;
      for (const s of starsRef.current) {
        // Mouse repulsion
        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160 && dist > 0) {
          const force = (160 - dist) / 160;
          s.vx += (dx / dist) * force * 0.25;
          s.vy += (dy / dist) * force * 0.25;
        }

        // Damping + drift back toward base position
        s.vx *= 0.92;
        s.vy *= 0.92;
        s.x += s.vx;
        s.y += s.vy;

        // Wrap edges
        if (s.x < -10) s.x = window.innerWidth + 10;
        if (s.x > window.innerWidth + 10) s.x = -10;
        if (s.y < -10) s.y = window.innerHeight + 10;
        if (s.y > window.innerHeight + 10) s.y = -10;

        const twinkle = Math.sin(t * s.twinkleSpeed + s.twinklePhase) * 0.4 + 0.6;
        const alpha = s.opacity * twinkle;

        // Glow halo for brighter stars
        if (s.radius > 1.0) {
          const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius * 5);
          halo.addColorStop(0,   `rgba(${s.color}, ${alpha * 0.5})`);
          halo.addColorStop(0.4, `rgba(${s.color}, ${alpha * 0.15})`);
          halo.addColorStop(1,   `rgba(${s.color}, 0)`);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius * 5, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();
        }

        // Star core
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color}, ${alpha})`;
        ctx.fill();

        // Cross-spike for big stars
        if (s.radius > 1.6) {
          const spike = s.radius * 3;
          ctx.save();
          ctx.globalAlpha = alpha * 0.4;
          ctx.strokeStyle = `rgba(${s.color}, 1)`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - spike, s.y);
          ctx.lineTo(s.x + spike, s.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(s.x, s.y - spike);
          ctx.lineTo(s.x, s.y + spike);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Spawn shooting stars occasionally
      if (Math.random() < 0.03 && shootingStarsRef.current.length < 15) {
        spawnShootingStar(w, h);
      }

      // Draw & update shooting stars
      shootingStarsRef.current = shootingStarsRef.current.filter((ss) => {
        const progress = ss.life / ss.maxLife;
        const alpha = (1 - progress) * ss.opacity * 0.9;

        const tailX = ss.x - ss.vx * (ss.length / 12);
        const tailY = ss.y - ss.vy * (ss.length / 12);

        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0,   `rgba(200, 220, 255, 0)`);
        grad.addColorStop(0.6, `rgba(220, 235, 255, ${alpha * 0.5})`);
        grad.addColorStop(1,   `rgba(255, 255, 255, ${alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life++;
        return ss.life < ss.maxLife && ss.x < w + 100 && ss.y < h + 100;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
