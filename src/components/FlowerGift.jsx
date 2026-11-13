import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ArrowLeft, Flower2, Heart, RotateCcw } from 'lucide-react';
import BloomFlower from './BloomFlower';
import './FlowerGift.css';

gsap.registerPlugin(useGSAP);
const BALLOONS = [7, 87, 18, 78, 3, 93, 13, 84, 23, 73];
const PETALS = [-.28, .22, -.16, .32, -.36, .12, .38];

function PaperBook() {
  return <div className="popup-book" aria-hidden="true">
    <div className="popup-page popup-page--right">
      <div className="popup-page-stock" />
      <div className="popup-page-face popup-page-face--right">
        <div className="popup-page-inscription"><Flower2 size={22} strokeWidth={.8} /><span>cứ từ từ mà nở hoa.</span></div>
        <span className="popup-page-number">02</span>
      </div>
    </div>
    <div className="popup-page popup-page--left">
      <div className="popup-page-stock" />
      <div className="popup-page-face popup-page-face--left"><span className="popup-page-dedication">một chút dịu dàng,<br /><em>gửi riêng chị.</em></span><span className="popup-page-number">01</span></div>
      <div className="popup-book-cover"><div className="popup-cover-frame"><Flower2 size={37} strokeWidth={.8} /><span>Một mùa hoa<br /><em>em gửi chị.</em></span><Heart size={15} strokeWidth={1} /></div></div>
    </div>
    <span className="popup-book-gutter" />
    <span className="popup-book-ribbon" />
  </div>;
}

export default function FlowerGift({ onReadLetter, reducedMotion, paused, playSound }) {
  const gift = useRef(null);
  const theatre = useRef(null);
  const opening = useRef(null);
  const balloonFlight = useRef(null);
  const tilt = useRef(null);
  const bounds = useRef(null);
  const [replay, setReplay] = useState(0);
  const [bloomStarted, setBloomStarted] = useState(reducedMotion || paused);
  const [opened, setOpened] = useState(reducedMotion || paused);
  const motion = useRef({ reducedMotion, paused });
  motion.current = { reducedMotion, paused };

  useGSAP(() => {
    gift.current.focus({ preventScroll: true });
    opening.current = null;
    balloonFlight.current = null;
    tilt.current = null;
    if (reducedMotion || paused) {
      setBloomStarted(true);
      setOpened(true);
      return;
    }
    setBloomStarted(false);
    setOpened(false);
    const width = theatre.current.clientWidth;
    // One clock opens the cover, reveals the fold, and lifts the garden from it.
    opening.current = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => setOpened(true) })
      .from('.gift-heading', { autoAlpha: 0, y: 8, duration: .6, ease: 'power2.out' }, 0)
      .fromTo('.popup-book', { xPercent: -22, y: -25, rotationX: 42, scale: .94 }, { xPercent: -22, y: -38, rotationX: 42, scale: .94, duration: .5 }, 0)
      .fromTo('.popup-page--left', { rotationY: 176 }, { rotationY: -5, duration: 1.9 }, .4)
      .fromTo('.popup-page--right', { rotationY: 0 }, { rotationY: 5, duration: 1.9 }, .4)
      .to('.popup-book', { xPercent: 0, y: 0, rotationX: 48, scale: 1, duration: 1.9 }, .4)
      .fromTo('.popup-book-shadow', { autoAlpha: .12, scaleX: .48 }, { autoAlpha: 1, scaleX: 1, duration: 1.9 }, .4)
      .from('.popup-book-gutter, .popup-book-ribbon', { autoAlpha: 0, duration: .65 }, 1.45)
      .set('.popup-flower-rise', { autoAlpha: 0, scaleY: .04, scaleX: .72 }, 0)
      .call(() => { setBloomStarted(true); playSound('bloom'); }, null, 1.4)
      .to('.popup-flower-rise', { autoAlpha: 1, scaleY: 1, scaleX: 1, duration: 1.45, ease: 'power3.out' }, 1.4)
      .from('.garden-sprig', { scale: 0, duration: 1.6, stagger: { each: .14, from: 'center' }, ease: 'power3.out' }, 1.8)
      .from('.popup-gift-caption', { autoAlpha: 0, y: 5, duration: .7, ease: 'power2.out' }, 2.6)
      .set('.garden-petal', { autoAlpha: .65, scale: .5 }, 3.2)
      .to('.garden-petal', { x: i => PETALS[i] * width, y: i => -90 - (i % 3) * 42, rotation: i => (i % 2 ? 1 : -1) * (75 + i * 17), scale: 1, duration: 2, stagger: .035, ease: 'power2.out' }, 3.2)
      .to('.garden-petal', { autoAlpha: 0, duration: .6, stagger: .025 }, 4.4);
    balloonFlight.current = gsap.timeline().fromTo('.gift-balloon',
      { y: 160, autoAlpha: .8, rotation: -7 },
      { y: -theatre.current.clientHeight - 180, autoAlpha: .8, x: i => i % 2 ? 20 : -20, rotation: 8, duration: 8, stagger: .45, ease: 'none' },
      1.4);
    tilt.current = {
      x: gsap.quickTo('.garden-parallax', 'rotationY', { duration: .9, ease: 'power2.out' }),
      y: gsap.quickTo('.garden-parallax', 'rotationX', { duration: .9, ease: 'power2.out' }),
    };
  }, { scope: gift, dependencies: [replay, reducedMotion], revertOnUpdate: true });

  useEffect(() => {
    // Start the sequence if motion was initially disabled and is now enabled.
    if (!paused && !reducedMotion && !opening.current) {
      setReplay(value => value + 1);
      return;
    }
    const sync = () => {
      opening.current?.paused(paused || document.hidden);
      balloonFlight.current?.paused(paused || document.hidden);
      if (paused || reducedMotion || document.hidden) {
        tilt.current?.x(0); tilt.current?.y(0);
        tilt.current?.x.tween.progress(1).pause(); tilt.current?.y.tween.progress(1).pause();
      }
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [paused, reducedMotion, replay]);

  function followPointer(event) {
    if (!opened || event.pointerType !== 'mouse' || motion.current.paused || motion.current.reducedMotion || !bounds.current) return;
    const box = bounds.current;
    tilt.current?.x(((event.clientX - box.left) / box.width - .5) * 3);
    tilt.current?.y(((event.clientY - box.top) / box.height - .5) * -1.5);
  }
  return <section className="gift-scene popup-gift crafted-gift" ref={gift} tabIndex={-1} aria-label="Khu vườn pop-up dành tặng Huyền Trang">
    <button type="button" className="letter-back" onClick={onReadLetter}><ArrowLeft size={16} aria-hidden="true" /> Đọc lại cuốn sách</button>
    <div className="gift-heading"><h1>Hoa nở, <br />gửi chị.</h1><p>Hoa này không cần tưới.<br />Chỉ cần chị thấy vui là được.</p></div>
    <figure className="flower-gift">
      <div className="popup-theatre" ref={theatre} onPointerEnter={() => { bounds.current = theatre.current.getBoundingClientRect(); }} onPointerMove={followPointer} onPointerLeave={() => { tilt.current?.x(0); tilt.current?.y(0); }}>
        <div className="gift-balloons" aria-hidden="true">{BALLOONS.map((left, i) => <svg key={i} className={`gift-balloon gift-balloon--${i % 3}`} style={{ left: `${left}%` }} viewBox="0 0 60 150" fill="none">
          <path d="M30 66 C12 90 48 112 27 148" stroke="#bba296" strokeWidth="1" />
          <ellipse cx="30" cy="30" rx="25" ry="30" fill="currentColor" />
          <path d="M30 59 L25 66 L35 66 Z" fill="currentColor" />
          <path d="M16 16 Q11 24 13 32" stroke="#fffaf4" strokeOpacity=".65" strokeWidth="4" strokeLinecap="round" />
        </svg>)}</div>
        <div className="garden-parallax">
          <div className="popup-book-shadow" aria-hidden="true" />
          <PaperBook />
          <div className="popup-flower-rise"><div className="popup-flowers"><BloomFlower key={replay} expanded reducedMotion={reducedMotion} paused={paused || !bloomStarted} /></div></div>
          <div className="garden-petals" aria-hidden="true">{PETALS.map((_, i) => <span className={`garden-petal garden-petal--${i % 3}`} key={i} />)}</div>
        </div>
      </div>
      <figcaption className="popup-gift-caption"><p>Mong chị gặp nhiều ngày vui, theo cách của riêng mình.</p><button type="button" className="replay-flowers" data-sound="none" onClick={() => setReplay(value => value + 1)}><RotateCcw size={15} strokeWidth={1.4} aria-hidden="true" /> Ngắm hoa nở lần nữa</button></figcaption>
    </figure>
  </section>;
}
