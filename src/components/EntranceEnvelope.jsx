import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Flower2, Heart } from 'lucide-react';
import './EntranceEnvelope.css';

gsap.registerPlugin(useGSAP);

export default function EntranceEnvelope({ onOpenStart, onOpen, reducedMotion, paused, playSound }) {
  const root = useRef(null);
  const flight = useRef(null);
  const hovering = useRef(null);
  const opening = useRef(null);
  const locked = useRef(false);
  const motion = useRef({ reducedMotion, paused });
  motion.current = { reducedMotion, paused };
  const [isOpening, setIsOpening] = useState(false);

  const { contextSafe } = useGSAP(() => {
    // Arrival and gentle hovering use separate targets so opening can settle the paper.
    flight.current = gsap.timeline({
      paused: true, defaults: { ease: 'power3.out' },
    })
      .addLabel('arrival', 1)
      .from('.arrival-flight', { autoAlpha: 0, x: () => -Math.min(window.innerWidth * .7, 720), y: () => window.innerHeight * .38, rotation: -24, scale: .72, duration: 1.35 }, 'arrival')
      .call(() => playSound('arrival'), [], 'arrival')
      .from('.arrival-copy', { autoAlpha: 0, y: 12, duration: .7 }, 0)
      .from('.arrival-instruction', { autoAlpha: 0, y: 7, duration: .55 }, 'arrival+=.95');
    hovering.current = gsap.to('.arrival-envelope', {
      y: -10, rotation: 1.4, duration: 2.4, repeat: -1, yoyo: true,
      ease: 'sine.inOut', paused: true,
    });
    if (motion.current.reducedMotion || motion.current.paused) flight.current.progress(1, true);
  }, { scope: root });

  useEffect(() => {
    const sync = () => {
      if (reducedMotion) hovering.current?.pause(0);
      else hovering.current?.paused(paused || document.hidden || locked.current);
      for (const timeline of [flight.current, opening.current]) {
        if (!timeline) continue;
        if (reducedMotion) timeline.progress(1, timeline === flight.current);
        else timeline.paused(paused || document.hidden);
      }
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [paused, reducedMotion]);

  const openLetter = contextSafe(event => {
    if (locked.current) return;
    locked.current = true;
    setIsOpening(true);
    onOpenStart();
    flight.current?.progress(1, true);
    hovering.current?.pause();
    playSound('seal', event);
    if (motion.current.reducedMotion || motion.current.paused) { onOpen(); return; }
    opening.current = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: onOpen })
      .to('.arrival-envelope', { y: 0, rotation: 0, duration: .25 }, 0)
      .to('.arrival-seal', { y: 12, scale: .8, autoAlpha: 0, duration: .25 }, 0)
      .to('.arrival-flap', { rotationX: 180, duration: .8, ease: 'power2.inOut' }, .15)
      .set('.arrival-flap', { zIndex: 1 }, .57)
      .addLabel('letterLift', .65)
      .to('.arrival-letter', { yPercent: -62, duration: 1.85, ease: 'sine.inOut' }, 'letterLift')
      .call(() => playSound('letter'), [], 'letterLift')
      .addLabel('letterShown')
      .to('.arrival-instruction', { autoAlpha: 0, duration: .2 }, .1)
      .to('.arrival-copy', { autoAlpha: 0, y: -8, duration: .3 }, .1)
      .to('.arrival-flight', { y: 30, autoAlpha: 0, duration: .35 }, 'letterShown+=.2');
  });

  return <main className="letter-arrival" ref={root} aria-labelledby="arrival-title">
    <div className="arrival-copy">
      <h1 id="arrival-title">Có một lá thư<br /><em>em gửi chị.</em></h1>
      <p>Yên tâm, không phải hóa đơn đâu chị.</p>
    </div>
    <div className="arrival-stage">
      <div className="arrival-flight">
        <button type="button" className="arrival-envelope" aria-label="Mở thư em gửi chị" aria-describedby="arrival-instruction" disabled={isOpening} onClick={openLetter} data-sound="none">
          <span className="arrival-envelope-back" aria-hidden="true" />
          <span className="arrival-letter" aria-hidden="true"><Flower2 size={28} strokeWidth={1} /><span>Gửi chị,</span><em>Em gửi một chút vui.<br />Và một chút thương nữa.</em><Heart size={15} strokeWidth={1} /></span>
          <span className="arrival-pocket" aria-hidden="true"><span className="arrival-address">gửi chị<em>Huyền Trang</em></span><Flower2 className="arrival-pocket-flower" size={31} strokeWidth={.8} /></span>
          <span className="arrival-flap" aria-hidden="true" />
          <span className="arrival-seal" aria-hidden="true"><Heart size={25} strokeWidth={1} /></span>
        </button>
      </div>
    </div>
    <p className="arrival-instruction" id="arrival-instruction">Chạm vào phong thư để mở<span>Có một điều nhỏ đang đợi chị bên trong.</span></p>
  </main>;
}
