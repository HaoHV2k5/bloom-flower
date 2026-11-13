import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// Native SVG keeps the wing detail sharp at every screen size.
function Butterfly({ index }) {
  const wing = `petal-wing-${index}`;
  return <div className={`garden-butterfly garden-butterfly--${index + 1}`}><svg viewBox="0 0 140 120" focusable="false">
    <defs>
      <linearGradient id={wing} x1="0" y1="1" x2="1" y2="0"><stop stopColor="#e6b38f"/><stop offset=".35" stopColor="#ecc5c5"/><stop offset="1" stopColor="#f9e1e5"/></linearGradient>
      <g id={`wing-shape-${index}`}>
        <path d="M69 75C50 65 12 35 18 15C24-7 52 20 61 41C67 53 69 66 69 75ZM69 75C50 50 16 50 17 73C18 92 41 106 54 94Z" fill={`url(#${wing})`} stroke="#c78b98" strokeWidth=".65"/>
        <g fill="none" stroke="#fff5e7" strokeWidth=".7" opacity=".8"><path d="M69 75C49 50 32 28 23 15M69 75C42 58 26 61 18 69M69 75C42 72 34 86 31 91M59 54C43 44 31 39 24 41M50 70C38 67 28 70 20 76"/></g>
        <g fill="#fff8ed"><circle cx="31" cy="30" r="1.1"/><circle cx="42" cy="45" r=".9"/><circle cx="28" cy="72" r="1"/><circle cx="42" cy="84" r="1.2"/><circle cx="53" cy="66" r=".8"/></g>
      </g>
    </defs>
    <g className="butterfly-wing butterfly-wing--left"><use href={`#wing-shape-${index}`} /></g>
    <g className="butterfly-wing butterfly-wing--right"><use href={`#wing-shape-${index}`} transform="translate(140 0) scale(-1 1)" /></g>
    <g fill="none" stroke="#a77877" strokeLinecap="round"><path d="m70 65 0 24M69 64C66 53 60 52 58 49M71 64C74 53 80 52 82 49" strokeWidth="1.4"/></g>
    <ellipse cx="70" cy="65" rx="2.5" ry="4" fill="#a77877"/>
  </svg></div>;
}

export default function ButterflyField({ paused, reducedMotion }) {
  const field = useRef(null);
  const timeline = useRef(null);
  useGSAP(() => {
    const elements = [...field.current.querySelectorAll('.garden-butterfly')];
    const loop = gsap.timeline({ paused: paused || document.hidden });
    timeline.current = loop;
    // This fixed layer spans the viewport on both the invitation and wishes.
    // Measure only on resize; each frame updates transforms without layout reads.
    const bounds = { width: field.current.clientWidth, height: field.current.clientHeight };
    const observer = new ResizeObserver(([entry]) => {
      bounds.width = entry.contentRect.width;
      bounds.height = entry.contentRect.height;
    });
    observer.observe(field.current);
    elements.forEach((element, i) => {
      const startTime = [0, 16.4, 31.6, 48.7][i];
      const clock = { time: startTime };
      const size = element.clientWidth;
      const padding = 18;
      const setX = gsap.quickSetter(element, 'x', 'px');
      const setY = gsap.quickSetter(element, 'y', 'px');
      const setAngle = gsap.quickSetter(element, 'rotation', 'deg');
      const wings = [...element.querySelectorAll('.butterfly-wing')];
      gsap.set(wings, { svgOrigin: '70 75' });
      const wingSetters = wings.map(wing => gsap.quickSetter(wing, 'scaleX'));
      const update = () => {
        const t = clock.time;
        const orbit = t / (8.5 + i * 1.1);
        const spanX = Math.max(0, bounds.width - size - padding * 2);
        const spanY = Math.max(0, bounds.height - size - padding * 2);
        const x = .5 + Math.sin(orbit) * .42 + Math.sin(orbit * 2 + i) * .035;
        const y = .5 + Math.sin(orbit * .8 + i * 1.7) * .38 + Math.sin(orbit * 2) * .055;
        setX(padding + x * spanX);
        setY(padding + y * spanY + Math.sin(t * 18) * .7);
        const dx = spanX * (.42 * Math.cos(orbit) + .07 * Math.cos(orbit * 2 + i));
        const dy = spanY * (.304 * Math.cos(orbit * .8 + i * 1.7) + .11 * Math.cos(orbit * 2));
        setAngle(Math.atan2(dx, Math.abs(dy) + 100) * 180 / Math.PI * .55);
        const opening = .74 + Math.sin(t * (18 + i * 1.1)) * .22;
        wingSetters.forEach(set => set(opening));
      };
      update();
      loop.to(clock, { time: startTime + 100000, duration: 100000, ease: 'none', onUpdate: update }, 0);
    });
    return () => { observer.disconnect(); timeline.current = null; };
  }, { scope: field, dependencies: [reducedMotion], revertOnUpdate: true });
  useGSAP(() => { timeline.current?.paused(paused || document.hidden); }, { dependencies: [paused], scope: field });
  // The ref keeps visibility handling up to date without resetting flight progress.
  useGSAP(() => {
    const visibility = () => timeline.current?.paused(document.hidden || paused);
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, { dependencies: [paused], revertOnUpdate: true });
  return <div ref={field} className="butterfly-field" aria-hidden="true">{[0, 1, 2, 3].map(index => <Butterfly key={index} index={index} />)}</div>;
}
