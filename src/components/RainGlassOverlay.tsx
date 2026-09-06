import type { CSSProperties } from 'react';

type Drop = {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  fall: number;
  rot: number;
  variant: 'a' | 'b' | 'c' | 'd';
};

const droplets: Drop[] = [
  { x: 3, y: 8, size: 22, delay: -4, duration: 24, drift: 9, fall: 14, rot: -6, variant: 'a' },
  { x: 9, y: 34, size: 11, delay: -12, duration: 19, drift: -5, fall: 10, rot: 12, variant: 'b' },
  { x: 15, y: 62, size: 8, delay: -7, duration: 26, drift: 4, fall: 8, rot: -3, variant: 'c' },
  { x: 20, y: 14, size: 16, delay: -18, duration: 24, drift: -7, fall: 12, rot: 8, variant: 'd' },
  { x: 26, y: 47, size: 6, delay: -2, duration: 21, drift: 6, fall: 7, rot: -10, variant: 'a' },
  { x: 32, y: 78, size: 13, delay: -15, duration: 28, drift: -4, fall: 11, rot: 4, variant: 'b' },
  { x: 37, y: 24, size: 28, delay: -9, duration: 25, drift: 7, fall: 18, rot: -7, variant: 'c' },
  { x: 43, y: 5, size: 7, delay: -20, duration: 18, drift: -3, fall: 6, rot: 15, variant: 'd' },
  { x: 48, y: 55, size: 10, delay: -6, duration: 23, drift: 5, fall: 9, rot: -5, variant: 'a' },
  { x: 53, y: 88, size: 18, delay: -14, duration: 27, drift: -6, fall: 15, rot: 9, variant: 'b' },
  { x: 58, y: 31, size: 5, delay: -3, duration: 20, drift: 4, fall: 5, rot: -12, variant: 'c' },
  { x: 63, y: 71, size: 14, delay: -21, duration: 24, drift: -5, fall: 12, rot: 6, variant: 'd' },
  { x: 68, y: 18, size: 20, delay: -10, duration: 29, drift: 7, fall: 16, rot: -8, variant: 'a' },
  { x: 73, y: 42, size: 9, delay: -16, duration: 17, drift: -4, fall: 8, rot: 3, variant: 'b' },
  { x: 78, y: 67, size: 12, delay: -5, duration: 26, drift: 5, fall: 10, rot: -9, variant: 'c' },
  { x: 83, y: 10, size: 6, delay: -23, duration: 19, drift: -3, fall: 6, rot: 11, variant: 'd' },
  { x: 87, y: 50, size: 24, delay: -8, duration: 22, drift: 6, fall: 17, rot: -4, variant: 'a' },
  { x: 92, y: 25, size: 8, delay: -19, duration: 18, drift: -5, fall: 7, rot: 7, variant: 'b' },
  { x: 96, y: 80, size: 15, delay: -1, duration: 25, drift: 6, fall: 13, rot: -6, variant: 'c' },
  { x: 6, y: 90, size: 10, delay: -11, duration: 23, drift: -4, fall: 9, rot: 10, variant: 'd' },
  { x: 29, y: 38, size: 4, delay: -17, duration: 16, drift: 3, fall: 4, rot: -14, variant: 'a' },
  { x: 45, y: 15, size: 9, delay: -22, duration: 21, drift: -6, fall: 8, rot: 5, variant: 'b' },
  { x: 61, y: 49, size: 6, delay: -13, duration: 20, drift: 4, fall: 6, rot: -7, variant: 'c' },
  { x: 76, y: 85, size: 11, delay: -25, duration: 24, drift: -5, fall: 10, rot: 8, variant: 'd' },
  { x: 89, y: 60, size: 7, delay: -7, duration: 19, drift: 3, fall: 7, rot: -11, variant: 'a' },
  { x: 12, y: 22, size: 5, delay: -14, duration: 18, drift: -3, fall: 5, rot: 13, variant: 'b' },
  { x: 35, y: 93, size: 8, delay: -4, duration: 22, drift: 5, fall: 7, rot: -5, variant: 'c' },
  { x: 55, y: 12, size: 13, delay: -18, duration: 26, drift: -7, fall: 11, rot: 9, variant: 'd' },
  { x: 71, y: 30, size: 17, delay: -6, duration: 28, drift: 6, fall: 14, rot: -8, variant: 'a' },
  { x: 94, y: 45, size: 6, delay: -20, duration: 17, drift: -4, fall: 6, rot: 4, variant: 'b' },
  { x: 4, y: -2, size: 38, delay: -8, duration: 31, drift: 8, fall: 22, rot: -5, variant: 'd' },
  { x: 18, y: 28, size: 33, delay: -17, duration: 27, drift: -6, fall: 20, rot: 7, variant: 'a' },
  { x: 44, y: -4, size: 45, delay: -24, duration: 34, drift: 7, fall: 27, rot: -4, variant: 'b' },
  { x: 65, y: 36, size: 36, delay: -11, duration: 30, drift: -8, fall: 24, rot: 6, variant: 'c' },
  { x: 84, y: -3, size: 42, delay: -20, duration: 33, drift: 6, fall: 26, rot: -7, variant: 'd' },
  { x: 97, y: 68, size: 31, delay: -5, duration: 28, drift: -5, fall: 19, rot: 5, variant: 'a' },
  { x: 13, y: 52, size: 26, delay: -13, duration: 26, drift: 5, fall: 18, rot: -6, variant: 'b' },
  { x: 39, y: 60, size: 22, delay: -27, duration: 24, drift: -4, fall: 16, rot: 8, variant: 'c' },
  { x: 57, y: 18, size: 29, delay: -16, duration: 29, drift: 6, fall: 20, rot: -5, variant: 'd' },
  { x: 75, y: 42, size: 25, delay: -9, duration: 27, drift: -7, fall: 18, rot: 7, variant: 'a' },
];

const mist: { x: number; y: number; size: number; delay: number }[] = [
  { x: 8, y: 15, size: 3, delay: -2 }, { x: 19, y: 53, size: 2, delay: -5 },
  { x: 27, y: 8, size: 2, delay: -8 }, { x: 34, y: 36, size: 3, delay: -3 },
  { x: 41, y: 72, size: 2, delay: -11 }, { x: 49, y: 28, size: 3, delay: -6 },
  { x: 56, y: 64, size: 2, delay: -9 }, { x: 63, y: 41, size: 3, delay: -4 },
  { x: 70, y: 56, size: 2, delay: -12 }, { x: 77, y: 20, size: 3, delay: -7 },
  { x: 84, y: 75, size: 2, delay: -10 }, { x: 91, y: 38, size: 3, delay: -1 },
  { x: 14, y: 76, size: 2, delay: -15 }, { x: 24, y: 85, size: 3, delay: -13 },
  { x: 38, y: 58, size: 2, delay: -17 }, { x: 47, y: 82, size: 3, delay: -14 },
  { x: 59, y: 6, size: 2, delay: -16 }, { x: 67, y: 93, size: 3, delay: -19 },
  { x: 80, y: 48, size: 2, delay: -18 }, { x: 88, y: 70, size: 3, delay: -21 },
  { x: 5, y: 48, size: 2, delay: -22 }, { x: 31, y: 16, size: 3, delay: -24 },
  { x: 52, y: 38, size: 2, delay: -20 }, { x: 73, y: 12, size: 3, delay: -23 },
  { x: 86, y: 92, size: 2, delay: -25 }, { x: 17, y: 68, size: 3, delay: -26 },
  { x: 42, y: 23, size: 2, delay: -27 }, { x: 65, y: 82, size: 3, delay: -28 },
  { x: 79, y: 34, size: 2, delay: -29 }, { x: 95, y: 15, size: 3, delay: -30 },
];

const streaks: { x: number; y: number; h: number; delay: number; duration: number; drift: number }[] = [
  { x: 11, y: 20, h: 40, delay: -5, duration: 18, drift: 6 },
  { x: 36, y: 10, h: 55, delay: -12, duration: 22, drift: -4 },
  { x: 60, y: 30, h: 35, delay: -8, duration: 20, drift: 5 },
  { x: 81, y: 15, h: 48, delay: -15, duration: 24, drift: -6 },
  { x: 24, y: 65, h: 30, delay: -3, duration: 19, drift: 4 },
  { x: 72, y: 58, h: 42, delay: -18, duration: 21, drift: -5 },
];

const fallingRain: { x: number; length: number; delay: number; duration: number; opacity: number; slant: number }[] = [
  { x: 2, length: 26, delay: -2, duration: 4.8, opacity: 0.22, slant: -2 },
  { x: 5, length: 42, delay: -3.4, duration: 6.2, opacity: 0.16, slant: -3 },
  { x: 8, length: 18, delay: -5.5, duration: 4.1, opacity: 0.24, slant: -1 },
  { x: 12, length: 34, delay: -1.1, duration: 5.4, opacity: 0.18, slant: -2 },
  { x: 16, length: 22, delay: -4.7, duration: 4.5, opacity: 0.2, slant: -2 },
  { x: 19, length: 50, delay: -6, duration: 7, opacity: 0.14, slant: -4 },
  { x: 23, length: 28, delay: -2.8, duration: 5.1, opacity: 0.21, slant: -2 },
  { x: 27, length: 16, delay: -4.1, duration: 4, opacity: 0.25, slant: -1 },
  { x: 30, length: 39, delay: -7.2, duration: 6.5, opacity: 0.15, slant: -3 },
  { x: 34, length: 24, delay: -0.4, duration: 4.4, opacity: 0.2, slant: -2 },
  { x: 38, length: 46, delay: -5.1, duration: 6.8, opacity: 0.16, slant: -3 },
  { x: 42, length: 19, delay: -3.2, duration: 4.2, opacity: 0.23, slant: -1 },
  { x: 46, length: 31, delay: -6.4, duration: 5.8, opacity: 0.18, slant: -2 },
  { x: 50, length: 23, delay: -1.8, duration: 4.7, opacity: 0.22, slant: -2 },
  { x: 54, length: 54, delay: -4.5, duration: 7.3, opacity: 0.13, slant: -4 },
  { x: 58, length: 17, delay: -7, duration: 4.3, opacity: 0.24, slant: -1 },
  { x: 62, length: 36, delay: -2.3, duration: 5.6, opacity: 0.17, slant: -3 },
  { x: 66, length: 25, delay: -5.8, duration: 4.9, opacity: 0.21, slant: -2 },
  { x: 70, length: 48, delay: -3.7, duration: 6.6, opacity: 0.15, slant: -3 },
  { x: 74, length: 20, delay: -6.9, duration: 4.1, opacity: 0.23, slant: -1 },
  { x: 78, length: 32, delay: -1.5, duration: 5.3, opacity: 0.18, slant: -2 },
  { x: 82, length: 44, delay: -4.3, duration: 6.4, opacity: 0.15, slant: -3 },
  { x: 86, length: 18, delay: -7.5, duration: 4.2, opacity: 0.25, slant: -1 },
  { x: 90, length: 38, delay: -2.1, duration: 5.9, opacity: 0.17, slant: -3 },
  { x: 94, length: 27, delay: -5.4, duration: 4.8, opacity: 0.21, slant: -2 },
  { x: 98, length: 49, delay: -3, duration: 6.9, opacity: 0.14, slant: -4 },
];

export default function RainGlassOverlay() {
  return (
    <div className="rain-glass-overlay" aria-hidden="true">
      <svg className="rain-glass-turbulence" width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="rain-glass-refract" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="1.5" result="softNoise" />
            <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="rain-glass-refract-lg" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.014" numOctaves="3" seed="11" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="2" result="softNoise" />
            <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div className="rain-glass-sheen" />
      <div className="rain-glass-falling-layer">
        {fallingRain.map((rain, i) => {
          const style = {
            '--rain-x': `${rain.x}%`,
            '--rain-length': `${rain.length}px`,
            '--rain-delay': `${rain.delay}s`,
            '--rain-duration': `${rain.duration}s`,
            '--rain-opacity': rain.opacity,
            '--rain-slant': `${rain.slant}px`,
          } as CSSProperties;
          return <span className="rain-glass-falling-drop" style={style} key={`rain-${i}`} />;
        })}
      </div>
      <div className="rain-glass-streaks-layer">
        {streaks.map((s, i) => {
          const style = {
            '--streak-x': `${s.x}%`,
            '--streak-y': `${s.y}%`,
            '--streak-h': `${s.h}px`,
            '--streak-delay': `${s.delay}s`,
            '--streak-duration': `${s.duration}s`,
            '--streak-drift': `${s.drift}px`,
          } as CSSProperties;
          return <span className="rain-glass-streak" style={style} key={`streak-${i}`} />;
        })}
      </div>
      <div className="rain-glass-drops-layer">
        {droplets.map((drop, index) => {
          const style = {
            '--drop-x': `${drop.x}%`,
            '--drop-y': `${drop.y}%`,
            '--drop-size': `${drop.size}px`,
            '--drop-delay': `${drop.delay}s`,
            '--drop-duration': `${drop.duration}s`,
            '--drop-drift': `${drop.drift}px`,
            '--drop-fall': `${drop.fall}px`,
            '--drop-rot': `${drop.rot}deg`,
          } as CSSProperties;
          return (
            <span className={`rain-glass-drop rain-glass-drop-${drop.variant}`} style={style} key={`drop-${index}`}>
              <span className="rain-glass-drop-highlight" />
              <span className="rain-glass-drop-trail" />
            </span>
          );
        })}
      </div>
      <div className="rain-glass-mist-layer">
        {mist.map((m, i) => {
          const style = {
            '--mist-x': `${m.x}%`,
            '--mist-y': `${m.y}%`,
            '--mist-size': `${m.size}px`,
            '--mist-delay': `${m.delay}s`,
          } as CSSProperties;
          return <span className="rain-glass-mist" style={style} key={`mist-${i}`} />;
        })}
      </div>
    </div>
  );
}
