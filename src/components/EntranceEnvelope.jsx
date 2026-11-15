import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Flower2, Heart } from 'lucide-react';
import './EntranceEnvelope.css';

gsap.registerPlugin(useGSAP);

export default function EntranceEnvelope({ onOpenStart, onOpen, reducedMotion, paused, playSound }) {
  const root = useRef(null);
  const hovering = useRef(null);
  const opening = useRef(null);
  const locked = useRef(false);
  const motion = useRef({ reducedMotion, paused });
  motion.current = { reducedMotion, paused };
  const [isOpening, setIsOpening] = useState(false);

  const { contextSafe } = useGSAP(() => {
    // The letter waits in view; its flight and sound begin together on a tap.
    hovering.current = gsap.to('.arrival-envelope', {
      x: 3, y: -9, rotation: 1.6, duration: 2.8, repeat: -1, yoyo: true,
      ease: 'sine.inOut', paused: true,
    });
  }, { scope: root });

  useEffect(() => {
    const sync = () => {
      if (reducedMotion) hovering.current?.pause(0);
      else hovering.current?.paused(paused || document.hidden || locked.current);
      if (reducedMotion) opening.current?.progress(1);
      else opening.current?.paused(paused || document.hidden);
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [paused, reducedMotion]);

  const startOpening = contextSafe(() => {
    if (!root.current) return;
    if (motion.current.reducedMotion || motion.current.paused) { onOpen(); return; }
    opening.current = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: onOpen })
      .to('.arrival-flight', { x: -12, y: -26, scale: .94, rotation: -4, duration: .55, ease: 'sine.inOut' }, 0)
      .to('.arrival-flight', { x: 0, y: -8, scale: 1, rotation: 0, duration: .65, ease: 'power2.out' }, .55)
      .to('.arrival-envelope', { x: 0, y: 0, rotation: 0, duration: .5 }, 0)
      .addLabel('unseal', 1.2)
      .call(() => playSound('seal'), [], 'unseal')
      .to('.arrival-seal', { rotation: -18, scale: 1.12, duration: .2 }, 'unseal')
      .to('.arrival-seal', { y: -18, rotation: 12, scale: .7, autoAlpha: 0, duration: .35 }, 'unseal+=.2')
      .to('.arrival-petal', { opacity: .8, scale: 1, duration: .18, stagger: .025 }, 'unseal+=.2')
      .to('.arrival-petal', {
        x: i => [-.34, -.22, -.1, .1, .22, .34][i] * root.current.querySelector('.arrival-flight').clientWidth,
        y: i => [-.18, -.32, -.4, -.38, -.3, -.15][i] * root.current.querySelector('.arrival-flight').clientWidth,
        rotation: i => i * 57 - 100, duration: 1.3, stagger: .025, ease: 'power2.out',
      }, 'unseal+=.2')
      .to('.arrival-petal', { opacity: 0, scale: .55, duration: .55, stagger: .025 }, 'unseal+=.95')
      .to('.arrival-flap', { rotationX: 180, duration: .8 }, 'unseal+=.35')
      .set('.arrival-flap', { zIndex: 1 }, 'unseal+=.77')
      .addLabel('letterLift', 'unseal+=.8')
      .to('.arrival-letter', { yPercent: -62, duration: 1.85, ease: 'sine.inOut' }, 'letterLift')
      .to('.arrival-letter', { rotation: -1.5, duration: .7 }, 'letterLift')
      .to('.arrival-letter', { rotation: 0, duration: 1.15 }, 'letterLift+=.7')
      .call(() => playSound('letter'), [], 'letterLift')
      .addLabel('letterShown')
      .to('.arrival-instruction', { autoAlpha: 0, duration: .2 }, .1)
      .to('.arrival-copy', { autoAlpha: 0, y: -8, duration: .3 }, .1)
      .to('.arrival-flight', { y: 30, autoAlpha: 0, duration: .35 }, 'letterShown+=.2');
  });

  async function openLetter(event) {
    if (locked.current) return;
    locked.current = true;
    setIsOpening(true);
    hovering.current?.pause();
    onOpenStart();
    // Wait for the gesture to unlock audio, then begin the matching motion.
    try { await playSound(motion.current.reducedMotion || motion.current.paused ? 'seal' : 'arrival', event); }
    catch { /* The invitation remains available if sound is unavailable. */ }
    startOpening();
  }

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
        <span className="arrival-petals" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <i className="arrival-petal" key={i} />)}</span>
      </div>
    </div>
    <p className="arrival-instruction" id="arrival-instruction">Chạm vào thư, có điều dành cho chị.<span>Một chút vui, một chút thương đang đợi bên trong.</span></p>
  </main>;
}
