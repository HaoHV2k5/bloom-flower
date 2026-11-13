import { useCallback, useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight, ArrowUpRight, Flower2, Heart } from 'lucide-react';
import FlowerGift from './FlowerGift';
import EncouragementTimeline from './EncouragementTimeline';

gsap.registerPlugin(useGSAP);

function SealedEnvelope({ onOpen, disabled, reducedMotion, paused }) {
  const root = useRef(null);
  const drag = useRef(null);
  const attention = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [inView, setInView] = useState(true);
  const { contextSafe } = useGSAP(() => {
    attention.current = gsap.timeline({ paused: true, delay: .75, repeat: -1, repeatDelay: 1.8, defaults: { ease: 'sine.inOut' } })
      .to('.envelope-tease', { rotation: -2.8, y: -6, duration: .55 }, 0)
      .to('.envelope-tease', { rotation: 2.6, duration: .8 }, .55)
      .to('.envelope-tease', { rotation: -1.2, duration: .55 }, 1.35)
      .to('.envelope-tease', { rotation: 0, y: 0, duration: .6 }, 1.9)
      .to('.ribbon-tail', { rotation: 7, duration: .7 }, .15)
      .to('.ribbon-tail', { rotation: -5.5, duration: .8 }, .85)
      .to('.ribbon-tail', { rotation: 0, duration: .7 }, 1.65)
      .to('.seal-button > svg', { scale: 1.17, duration: .7 }, .25)
      .to('.seal-button > svg', { scale: 1, duration: .8 }, .95);
  }, { scope: root });
  const stopAttention = contextSafe(() => {
    attention.current?.pause();
    gsap.set('.envelope-tease', { rotation: 0, y: 0 });
    gsap.set('.ribbon-tail', { rotation: 0 });
    gsap.set('.seal-button > svg', { scale: 1 });
  });
  useEffect(() => {
    const sync = () => {
      if (disabled || reducedMotion || paused || hovered || focused || dragging || !inView || document.hidden) stopAttention();
      else attention.current?.restart(true);
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [disabled, reducedMotion, paused, hovered, focused, dragging, inView, stopAttention]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .15 });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  const reset = contextSafe(() => gsap.to('.seal-button, .ribbon-tail', { y: 0, duration: reducedMotion || paused ? 0 : .25, overwrite: 'auto' }));
  const move = contextSafe(event => {
    if (!drag.current || disabled || reducedMotion || paused) return;
    drag.current.distance = Math.max(0, Math.min(65, event.clientY - drag.current.y));
    gsap.set('.seal-button, .ribbon-tail', { y: drag.current.distance });
  });
  function release(event) {
    if (!drag.current) return;
    const distance = drag.current.distance;
    const owner = drag.current.owner;
    drag.current = null;
    setDragging(false);
    if (owner.hasPointerCapture(event.pointerId)) owner.releasePointerCapture(event.pointerId);
    if (distance > 36) onOpen();
    else reset();
  }
  return <div ref={root} className="envelope-wrap"
    onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="envelope-tease">
    <div className="secret-envelope"
      onPointerDown={event => { if (disabled || !event.target.closest('.seal-button, .envelope-ribbon, .ribbon-tail')) return; stopAttention(); setDragging(true); const owner = event.target.closest('.seal-button') || event.currentTarget; drag.current = { y: event.clientY, distance: 0, owner }; owner.setPointerCapture(event.pointerId); }}
      onPointerMove={move} onPointerUp={release} onPointerCancel={() => { drag.current = null; setDragging(false); reset(); }}>
      <div className="envelope-letter" aria-hidden="true"><Flower2 size={30} strokeWidth={1} /><span>Một chút thương.</span></div>
      <div className="envelope-pocket" aria-hidden="true" />
      <div className="envelope-flap" aria-hidden="true" />
      <div className="envelope-ribbon" aria-hidden="true" />
      <div className="ribbon-tail" aria-hidden="true" />
      <button type="button" className="seal-button" data-sound="none" disabled={disabled} aria-label="Mở phong thư bí mật" onClick={onOpen}>
        <Heart size={28} strokeWidth={1} aria-hidden="true" />
      </button>
    </div>
    </div>
    <p className="envelope-instruction">Chạm dấu niêm phong để mở<span>hoặc kéo nhẹ dải ruy băng xuống</span></p>
  </div>;
}

function OpeningLetter({ onFlowers, reducedMotion, paused, alreadyOpened, playSound }) {
  const root = useRef(null);
  const heading = useRef(null);
  const secretHeading = useRef(null);
  const timelines = useRef([]);
  const opening = useRef(null);
  const flip = useRef(null);
  const wishFlip = useRef(null);
  const wishTurning = useRef(false);
  const unsealing = useRef(false);
  const [ready, setReady] = useState(reducedMotion || alreadyOpened);
  const [page, setPage] = useState('wishes');
  const [openingGift, setOpeningGift] = useState(false);
  const [compactReading, setCompactReading] = useState(() => window.matchMedia('(max-width: 760px) and (max-height: 760px) and (orientation: portrait)').matches);
  const [wishPage, setWishPage] = useState(0);
  const [wishTurn, setWishTurn] = useState(null);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px) and (max-height: 760px) and (orientation: portrait)');
    const update = () => { wishFlip.current?.progress(1); setCompactReading(query.matches); };
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const motion = useRef({ reducedMotion, paused });
  motion.current = { reducedMotion, paused };
  const finishOpening = useCallback(() => setReady(true), []);
  const finishFlip = useCallback(() => setPage('secret'), []);
  const { contextSafe } = useGSAP(() => {
    root.current.focus({ preventScroll: true });
    if (alreadyOpened || reducedMotion) return;
    const desktop = getComputedStyle(root.current.querySelector('.letter-art-page')).display !== 'none';
    gsap.set('.letter-book', { xPercent: desktop ? -25 : 0, rotationX: 5, rotationY: desktop ? -5 : 0 });
    gsap.set('.letter-art-page, .wish-line, .letter-action', { autoAlpha: 0 });
    gsap.set('.letter-cover', { autoAlpha: 1, rotationY: 0 });
    const tl = gsap.timeline({ paused, defaults: { ease: 'power3.inOut' }, onComplete: finishOpening });
    opening.current = tl;
    timelines.current.push(tl);
    tl.from('.letter-book', { y: 24, autoAlpha: 0, duration: .6, ease: 'power3.out' })
      .addLabel('unfold', '+=.2')
      .to('.letter-cover', { rotationY: desktop ? -180 : -125, duration: 1.35, ease: 'sine.inOut' }, 'unfold')
      .to('.letter-book', { xPercent: 0, rotationX: 0, rotationY: 0, duration: 1.35, ease: 'sine.inOut' }, 'unfold')
      .to('.letter-art-page', { autoAlpha: 1, duration: .5 }, 'unfold+=.8')
      .to('.letter-cover-front, .letter-cover-back', { opacity: 0, duration: .3 }, desktop ? 'unfold+=1.05' : 'unfold+=.85')
      .fromTo('.book-page-edges, .book-spine, .book-bookmark', { autoAlpha: 0 }, { autoAlpha: 1, duration: .45 }, 'unfold+=.7')
      .fromTo('.wish-line', { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .65, stagger: .19, ease: 'power2.out' }, 'unfold+=1')
      .fromTo('.letter-action', { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .45 }, '-=.1');
    // Resizing during the opening settles the same spread rather than replaying it.
    const resize = () => { if (tl.progress() < 1) tl.progress(1); };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, { scope: root });

  useGSAP(() => {
    if (!wishTurn) return;
    const forwards = wishTurn.direction > 0;
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        setWishPage(wishTurn.next);
        wishTurning.current = false;
        setWishTurn(null);
      },
    });
    wishFlip.current = tl;
    tl.fromTo('.wish-turn-sheet', { rotationY: forwards ? 0 : -180 }, { rotationY: forwards ? -180 : 0, duration: 1.15 }, 0)
      .fromTo('.wish-turn-shadow', { opacity: forwards ? 0 : .15 }, { opacity: forwards ? .15 : 0, duration: 1.15 }, 0);
    return () => { wishFlip.current = null; };
  }, { scope: root, dependencies: [wishTurn], revertOnUpdate: true });

  useEffect(() => {
    if (ready && page === 'wishes' && !wishTurn) heading.current?.focus({ preventScroll: true });
  }, [wishPage, wishTurn, ready, page]);

  useEffect(() => {
    for (const tl of [...timelines.current, wishFlip.current].filter(Boolean)) {
      if (reducedMotion) tl.progress(tl.reversed() ? 0 : 1);
      else tl.paused(paused);
    }
  }, [paused, reducedMotion]);
  useEffect(() => { if (page === 'secret') secretHeading.current?.focus({ preventScroll: true }); }, [page]);

  const turnPage = contextSafe(() => {
    if (!ready || page !== 'wishes' || flip.current) return;
    playSound('page');
    if (motion.current.reducedMotion || motion.current.paused) { finishFlip(); return; }
    setPage('turning');
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: finishFlip });
    flip.current = tl;
    timelines.current.push(tl);
    tl.to('.turning-leaf', { rotationY: -180, duration: 1.25, ease: 'sine.inOut' }, 0)
      .to('.leaf-reverse', { opacity: 0, duration: .28, ease: 'sine.out' }, .97)
      .to('.leaf-shade', { autoAlpha: .18, duration: .6 }, 0)
      .to('.leaf-shade', { autoAlpha: 0, duration: .6 }, .6)
      .to('.art-page-content', { autoAlpha: 0, duration: .45 }, .35)
      .fromTo('.secret-dedication', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .6 }, .75)
      .fromTo('.secret-envelope', { y: 16 }, { y: 0, duration: .8 }, .65);
  });
  const previousPage = contextSafe(() => {
    if (page !== 'secret' || openingGift) return;
    playSound('page');
    if (motion.current.reducedMotion || motion.current.paused || !flip.current) {
      flip.current = null;
      gsap.set('.turning-leaf, .leaf-reverse, .leaf-shade, .art-page-content, .secret-dedication, .secret-envelope', { clearProps: 'all' });
      setPage('wishes');
      return;
    }
    setPage('returning');
    flip.current.eventCallback('onReverseComplete', () => { flip.current = null; setPage('wishes'); }).reverse();
  });
  const changeWishPage = contextSafe(next => {
    if (!ready || page !== 'wishes' || wishTurning.current || next === wishPage) return;
    playSound('page');
    if (motion.current.reducedMotion || motion.current.paused) {
      setWishPage(next);
      return;
    }
    const direction = next > wishPage ? 1 : -1;
    wishTurning.current = true;
    setWishTurn({ sheet: direction > 0 ? wishPage : next, next, direction });
    // The next page sits under the outgoing sheet; backwards brings the old sheet back.
    if (direction > 0) setWishPage(next);
  });
  const advanceWishes = contextSafe(() => {
    if (compactReading && wishPage === 0) changeWishPage(1);
    else if (!wishTurning.current) turnPage();
  });
  const openGift = contextSafe(() => {
    if (unsealing.current || page !== 'secret') return;
    unsealing.current = true;
    playSound('seal');
    setOpeningGift(true);
    if (motion.current.reducedMotion || motion.current.paused) { onFlowers(); return; }
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: onFlowers });
    timelines.current.push(tl);
    tl.to('.envelope-instruction', { autoAlpha: 0, duration: .2 }, 0)
      .to('.seal-button', { y: -16, rotation: -12, scale: 1.12, duration: .35 }, 0)
      .to('.seal-button', { y: 60, autoAlpha: 0, scale: .7, duration: .4 }, .3)
      .to('.envelope-ribbon, .ribbon-tail', { y: 150, autoAlpha: 0, duration: .75 }, .2)
      .to('.envelope-flap', { rotationX: 180, duration: .85 }, .55)
      .to('.envelope-letter', { yPercent: -55, duration: .8 }, .9)
      .to('.letter-book', { y: 24, rotationX: 12, scale: .94, autoAlpha: 0, duration: .7 }, 1.35)
      .to('.letter-postscript', { autoAlpha: 0, duration: .3 }, 1.35);
  });

  function renderWishPaper(sheet, decorative = false) {
    return (
            <article className="letter-paper wishes-paper" aria-busy={!decorative && (!ready || Boolean(wishTurn))}>
              <div className="letter-ornament wish-line" aria-hidden="true"><Flower2 size={26} strokeWidth={1} /></div>
              <h1 className="wish-line" ref={decorative ? undefined : heading} tabIndex="-1">Gửi chị,</h1>
              <div className="wish-body">
                {(!compactReading || sheet === 0) && <p className="wish-line wish-paragraph-first">Em mong chị dám thử điều mình thích, và vẫn thương mình khi chưa làm tốt. Một lần chưa được không nói hết khả năng của chị. Phía trước còn nhiều cơ hội, đừng vội gạch tên mình nhé.</p>}
                {(!compactReading || sheet === 1) && <p className="wish-line wish-paragraph-last">Em thích chị lúc rạng rỡ, và vẫn quý cả những ngày chị ít nói. Không cần hoàn hảo mới được thương đâu. Nếu cần một người đứng về phía mình, chị nhớ tính em vào nhé.</p>}
                {(!compactReading || sheet === 1) && <p className="letter-signature wish-line">Người hơi thiên vị chị,<br /><em>là em.</em><Heart size={16} strokeWidth={1.2} aria-hidden="true" /></p>}
              </div>
              <div className="letter-action"><p>Khoan khép sách nhé…</p>{compactReading && sheet === 1 && <button type="button" className="previous-wish" aria-label="Đọc lại trang đầu" data-sound="none" disabled={decorative || Boolean(wishTurn)} onClick={() => changeWishPage(0)}><ArrowLeft size={16} aria-hidden="true" /></button>}<button type="button" className="turn-page" data-sound="none" disabled={decorative || !ready || page !== 'wishes' || Boolean(wishTurn)} onClick={advanceWishes}><span>{compactReading && sheet === 0 ? 'Lật tiếp lời chúc' : 'Còn một trang nữa'}</span><ArrowRight size={20} strokeWidth={1.2} aria-hidden="true" /><span className="page-corner" aria-hidden="true" /></button></div>
            </article>
    );
  }

  return <section className="letter-scene" ref={root} tabIndex="-1" aria-label="Cuốn sách nhỏ dành cho Huyền Trang">
    <div className="letter-stage">
      <div className={`letter-book storybook${ready ? ' is-readable' : ''}${page !== 'wishes' ? ' is-last-page' : ''}${compactReading ? ' is-compact-reading' : ''}`} data-page={page}>
        <div className="book-page-edges" aria-hidden="true" /><div className="book-spine" aria-hidden="true" /><div className="book-bookmark" aria-hidden="true" />
        <div className="letter-art-page" aria-hidden="true">
          <div className="art-page-content"><div className="letter-art-window"><img src={`${import.meta.env.BASE_URL}assets/secret-garden.png`} alt="" width="1024" height="1536" /></div><p>Mong những điều dịu dàng<br /><em>luôn tìm đến chị.</em></p><Flower2 size={23} strokeWidth={1} /></div>
          <div className="secret-dedication"><Heart size={32} strokeWidth={.8} /><p>Có những điều<br />không nằm<br /><em>trên trang giấy.</em></p><span>Mà đang chờ được mở ra.</span></div>
        </div>
        <div className="book-page-stack">
          <article className="letter-paper secret-paper" inert={page !== 'secret' || openingGift} aria-hidden={page !== 'secret'}>
            <h2 ref={secretHeading} tabIndex="-1">Một điều nhỏ,<br /><em>cất riêng cho chị.</em></h2><p>Mới là trang cuối.<br />Chưa phải hết thương đâu.</p>
            <SealedEnvelope onOpen={openGift} disabled={page !== 'secret' || openingGift} reducedMotion={reducedMotion} paused={paused} />
            <button className="previous-page" data-sound="none" type="button" disabled={openingGift || page !== 'secret'} onClick={previousPage}><ArrowLeft size={14} aria-hidden="true" /> Trang trước</button>
          </article>
          <div className="turning-leaf" aria-hidden={page === 'secret'} inert={!ready || page !== 'wishes' || Boolean(wishTurn)}>
            {renderWishPaper(wishPage)}
            <div className="leaf-reverse" aria-hidden="true"><Flower2 size={52} strokeWidth={.7} /></div>
            <div className="leaf-shade" aria-hidden="true" />
          </div>
          {wishTurn && <div className="wish-turn-layer" aria-hidden="true" inert>
            <div className="wish-turn-sheet" style={{ transform: `rotateY(${wishTurn.direction > 0 ? 0 : -180}deg)` }}>
              {renderWishPaper(wishTurn.sheet, true)}
              <div className="wish-turn-back"><Flower2 size={40} strokeWidth={.8} /></div>
              <div className="wish-turn-shadow" />
            </div>
          </div>}
        </div>
        <div className="letter-cover" aria-hidden="true" style={ready ? { visibility: 'hidden' } : undefined}>
          <div className="letter-cover-front"><Flower2 size={46} strokeWidth={.85} /><p>Một cuốn sách<br />nhỏ xíu,<br /><em>em gửi chị.</em></p><span className="cover-dedication">Cất một chút thương, mở một nụ cười.</span><Heart size={16} strokeWidth={1} /></div><div className="letter-cover-back" />
        </div>
      </div>
    </div>
    <div className="letter-postscript">{!ready ? <button type="button" className="skip-letter" onClick={() => opening.current?.progress(1)}>Xem ngay lời chúc <ArrowUpRight size={14} /></button> : page === 'turning' || page === 'returning' ? <button type="button" className="skip-letter" onClick={() => flip.current?.progress(page === 'returning' ? 0 : 1)}>{page === 'returning' ? 'Xem lại lời chúc' : 'Xem trang cuối'} <ArrowUpRight size={14} /></button> : openingGift ? <p role="status">Một điều dịu dàng đang thức giấc…</p> : <p>{page === 'secret' ? 'Có những bất ngờ, chỉ dành cho một người.' : 'Trang sau còn một điều em chưa kể.'}</p>}</div>
  </section>;
}

export default function GardenReveal({ onBack, reducedMotion, paused, playSound }) {
  const [journeyComplete, setJourneyComplete] = useState(false);
  const [flowersVisible, setFlowersVisible] = useState(false);
  const [alreadyOpened, setAlreadyOpened] = useState(false);
  const showFlowers = useCallback(() => setFlowersVisible(true), []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [flowersVisible, journeyComplete]);
  if (!journeyComplete) return <EncouragementTimeline onComplete={() => { playSound('page'); setJourneyComplete(true); }} onBack={onBack} reducedMotion={reducedMotion} paused={paused} playSound={playSound} />;
  return <main className="keepsake-reveal">
    {!flowersVisible && <button type="button" className="letter-back" onClick={() => setJourneyComplete(false)}><ArrowLeft size={16} aria-hidden="true" /> Đọc lại hành trình</button>}
    {flowersVisible ? <FlowerGift playSound={playSound} reducedMotion={reducedMotion} paused={paused} onReadLetter={() => { setAlreadyOpened(true); setFlowersVisible(false); }} /> : <OpeningLetter playSound={playSound} reducedMotion={reducedMotion} paused={paused} alreadyOpened={alreadyOpened} onFlowers={showFlowers} />}
  </main>;
}
