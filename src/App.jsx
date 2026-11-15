import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp';
import { ArrowUpRight, Delete, Flower2, Heart, LockKeyhole, Music2, Pause, Play, Volume2, VolumeX, Keyboard, ChevronDown } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ButterflyField from './components/ButterflyField';
import GardenReveal from './components/GardenReveal';
import EntranceEnvelope from './components/EntranceEnvelope';
import { HelpDialog, IconButton } from './components/Controls';
import useInteractionSounds from './hooks/useInteractionSounds';

const INVITATION_PIN = '1305';
const WRONG_PIN_MESSAGES = [
  'Úi, lệch một xíu rồi. Chị đoán tiếp, em chờ nè!',
  'Sai mã thôi, không trừ điểm dễ thương đâu chị!',
  'Chưa đúng rồi, em giấu quà hơi kỹ hả chị?',
  'Bốn số này đi lạc rồi. Chị thử lại nha!',
  'Mã chưa đúng, quà vẫn còn. Em chờ chị đoán tiếp!',
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = event => setReduced(event.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

function PinInvitation({ onUnlock, reducedMotion }) {
  const [pin, setPin] = useState('');
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [state, setState] = useState('idle');
  const [pinError, setPinError] = useState(false);
  const failedAttempts = useRef(0);
  const timer = useRef(null);
  const root = useRef(null);
  const otp = useRef(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const { contextSafe } = useGSAP(() => {
    root.current.querySelector('h1')?.focus({ preventScroll: true });
    if (reducedMotion) return;
    gsap.from('.invitation-copy > *, .pin-form', { y: 12, opacity: 0, duration: .55, stagger: .055, ease: 'power2.out' });
  }, { scope: root });
  const shake = contextSafe(() => {
    if (!reducedMotion) gsap.fromTo('.otp-group', { x: -3 }, { x: 3, duration: .07, repeat: 3, yoyo: true, clearProps: 'transform' });
  });
  const changePin = useCallback(next => {
    if (state !== 'idle') return;
    const digits = next.replace(/\D/g, '').slice(0, 4);
    setPin(digits);
    setMessage('');
    setPinError(false);
    if (digits.length < 4) return;
    if (digits === INVITATION_PIN) {
      setState('opening');
      setMessage('Đúng rồi! Có một chút thương đang chờ chị.');
      onUnlock();
    } else {
      setState('error');
      setPinError(true);
      setMessage(WRONG_PIN_MESSAGES[failedAttempts.current % WRONG_PIN_MESSAGES.length]);
      failedAttempts.current += 1;
      shake();
      timer.current = window.setTimeout(() => { setPin(''); setState('idle'); }, 850);
    }
  }, [state, onUnlock, shake]);
  useEffect(() => {
    const key = event => {
      if (document.querySelector('[role="dialog"]') || event.target instanceof HTMLInputElement || event.metaKey || event.ctrlKey || event.altKey) return;
      if (/^\d$/.test(event.key)) { event.preventDefault(); changePin(pin + event.key); }
      else if (event.key === 'Backspace') { event.preventDefault(); changePin(pin.slice(0, -1)); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [changePin, pin]);
  function submit(event) {
    event.preventDefault();
    if (state !== 'idle') return;
    if (pin.length !== 4) {
      setPinError(true);
      setMessage('Chị điền đủ 4 con số nhỏ xinh nhé.');
      otp.current?.focus({ preventScroll: true });
    } else changePin(pin);
  }
  return <section ref={root} className="invitation-panel" aria-labelledby="pin-title">
    <div className="invitation-copy">
      <h1 id="pin-title" tabIndex={-1}>Dành tặng<br /> Huyền Trang.</h1>
      <p>Quà có mật mã.<br />Còn tình cảm này thì em để lộ luôn.</p>
    </div>
    <form className="pin-form" onSubmit={submit} autoComplete="off">
      <label htmlFor="pin-input" className="pin-label"><LockKeyhole size={14} strokeWidth={1.5} /> Mật mã của hai chị em</label>
      <OTPInput ref={otp} id="pin-input" maxLength={4} value={pin} onChange={changePin} pattern={REGEXP_ONLY_DIGITS} inputMode="numeric" autoComplete="off" disabled={state !== 'idle'} aria-label="Nhập mật mã 4 chữ số" aria-invalid={pinError} aria-describedby="pin-status pin-help" containerClassName="otp-container" pushPasswordManagerStrategy="none" render={({ slots }) => <div className={`otp-group${pinError ? ' has-error' : ''}`}>
        {slots.map((slot, index) => <div key={index} className={`otp-slot${slot.isActive ? ' is-active' : ''}${slot.char ? ' is-filled' : ''}`} aria-hidden="true">{slot.char ? <span className="pin-dot" /> : <span className="slot-placeholder">·</span>}{slot.hasFakeCaret && <span className="otp-caret" />}</div>)}
      </div>} />
      <p className="pin-helper" id="pin-help">4 con số, cất một điều đặc biệt.</p>
      <button className="keypad-toggle" type="button" aria-expanded={keypadOpen} aria-controls="number-pad" onClick={() => setKeypadOpen(value => !value)}><Keyboard size={16} /> Bàn phím số <ChevronDown size={14} /></button>
      <div id="number-pad" className="number-pad" data-mobile-open={keypadOpen} aria-label="Bàn phím số" data-ui="keypad">
        {Array.from({ length: 9 }, (_, i) => <button type="button" key={i + 1} data-digit={i + 1} onClick={() => changePin(pin + (i + 1))} disabled={state !== 'idle'}>{i + 1}</button>)}
        <IconButton label="Xóa chữ số cuối" className="delete-key" onClick={() => changePin(pin.slice(0, -1))} disabled={state !== 'idle'}><Delete size={21} strokeWidth={1.5} /></IconButton>
        <button type="button" data-digit="0" onClick={() => changePin(pin + '0')} disabled={state !== 'idle'}>0</button>
        <span className="keypad-flower" aria-hidden="true"><Flower2 size={23} strokeWidth={1} /></span>
      </div>
      <p id="pin-status" className={`pin-message${pinError ? ' is-error' : ''}`} role="status" aria-live="polite">{message}</p>
      <button type="submit" className="primary-button" disabled={state !== 'idle'}>{state === 'opening' ? 'Một chút thương đang đến…' : 'Mở lời nhắn'}<ArrowUpRight size={18} strokeWidth={1.5} /></button>
      <HelpDialog />
    </form>
  </section>;
}

function GardenIllustration() {
  return <section className="illustration-panel" aria-label="Một lời mời từ khu vườn">
    <div className="garden-art-frame"><img className="garden-art" src={`${import.meta.env.BASE_URL}assets/secret-garden.png`} width="1024" height="1536" alt="Khu vườn hoa màu nước với lối đi nhỏ, hoa hồng phấn và vòm cổng giữa nắng sớm." fetchPriority="high" />
    </div>
    <p className="illustration-caption">Có những điều nhỏ bé, chỉ dành cho một người.</p>
  </section>;
}

export default function App() {
  const sounds = useInteractionSounds();
  const reducedMotion = useReducedMotion();
  const [motionPaused, setMotionPaused] = useState(reducedMotion);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [audioMessage, setAudioMessage] = useState('');
  const [screen, setScreen] = useState('envelope');
  const audio = useRef(null);
  const preference = useRef(true);
  const invitationOpened = useRef(false);
  const root = useRef(null);
  useEffect(() => { setMotionPaused(reducedMotion); }, [reducedMotion]);
  useGSAP(() => {
    if (screen !== 'opening') return;
    const skipMotion = reducedMotion || motionPaused;
    gsap.to('.invitation-layout', {
      autoAlpha: 0, y: skipMotion ? 0 : -10,
      duration: skipMotion ? 0 : .45, ease: 'power2.in',
      onComplete: () => setScreen('wishes'),
    });
  }, { scope: root, dependencies: [screen, reducedMotion, motionPaused], revertOnUpdate: true });
  const playMusic = useCallback(async (reportFailure = true) => {
    if (!preference.current || !invitationOpened.current || !audio.current) return;
    try {
      audio.current.volume = .24;
      audio.current.muted = false;
      if (audio.current.paused) await audio.current.play();
      setAudioMessage('');
    } catch {
      if (reportFailure && preference.current) setAudioMessage('Chạm vào nốt nhạc để nghe một chút dịu dàng nhé.');
    }
  }, []);
  const prepareMusic = useCallback(() => {
    if (!preference.current || !audio.current) return;
    // Authorize playback in the opening click, keeping music silent until the PIN.
    audio.current.muted = true;
    audio.current.currentTime = 0;
    void audio.current.play().catch(() => {});
  }, []);
  useEffect(() => {
    // Only retry after the letter has opened; arbitrary clicks cannot start music.
    const startMusic = () => { void playMusic(false); };
    document.addEventListener('click', startMusic);
    document.addEventListener('keydown', startMusic);
    return () => {
      document.removeEventListener('click', startMusic);
      document.removeEventListener('keydown', startMusic);
    };
  }, [playMusic]);
  function toggleMusic() {
    const enabled = !preference.current;
    preference.current = enabled;
    setMusicEnabled(enabled);
    if (enabled) void playMusic();
    else { audio.current.pause(); setAudioMessage(''); }
  }
  const openInvitation = useCallback(() => {
    invitationOpened.current = true;
    setScreen('invitation');
    if (audio.current) audio.current.currentTime = 0;
    void playMusic();
  }, [playMusic]);
  const returnToEnvelope = useCallback(() => {
    invitationOpened.current = false;
    audio.current?.pause();
    setAudioMessage('');
    setScreen('envelope');
  }, []);
  const returnToInvitation = useCallback(() => {
    setScreen('invitation');
  }, []);
  const unlock = useCallback(() => {
    sounds.play('unlock');
    if (preference.current !== false) void playMusic();
    setScreen('opening');
  }, [playMusic, sounds.play]);
  return <Tooltip.Provider delayDuration={250}>
    <div ref={root} className={`app-shell${screen === 'wishes' ? ' is-garden' : ''}${screen === 'opening' ? ' is-opening' : ''}`}
      onPointerDownCapture={sounds.prime} onKeyDownCapture={sounds.prime}
      onClickCapture={event => { const control = event.target.closest('button, a'); if (control && !control.disabled && control.dataset.sound !== 'none') sounds.play('tap'); }}>
      <header className="site-header">
        <a className="wordmark" href="#" onClick={event => { event.preventDefault(); returnToEnvelope(); }} aria-label="Dear you, về phong thư"><Flower2 size={25} strokeWidth={1.1} />dear you<span>.</span></a>
        <div className="header-controls"><span className="header-note">một chút dịu dàng, gửi Huyền Trang</span>
          <IconButton label={motionPaused ? 'Bật chuyển động' : 'Tạm dừng chuyển động'} aria-pressed={motionPaused} onClick={() => setMotionPaused(value => !value)}>{motionPaused ? <Play size={17} strokeWidth={1.5} /> : <Pause size={17} strokeWidth={1.5} />}</IconButton>
          <IconButton label={musicEnabled ? 'Tắt nhạc' : 'Bật nhạc'} aria-pressed={musicEnabled} onClick={toggleMusic}>{musicEnabled ? <Music2 size={18} strokeWidth={1.5} /> : <VolumeX size={18} strokeWidth={1.5} />}</IconButton>
          <IconButton label={sounds.enabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'} aria-pressed={sounds.enabled} data-sound="none" onClick={sounds.toggle}>{sounds.enabled ? <Volume2 size={18} strokeWidth={1.5} /> : <VolumeX size={18} strokeWidth={1.5} />}</IconButton>
        </div>
      </header>
      {screen === 'envelope' ? <EntranceEnvelope onOpenStart={prepareMusic} onOpen={openInvitation} reducedMotion={reducedMotion} paused={motionPaused} playSound={sounds.play} /> : screen === 'wishes' ? <GardenReveal onBack={returnToInvitation} reducedMotion={reducedMotion} paused={motionPaused} playSound={sounds.play} /> : <main className="invitation-layout"><GardenIllustration/><PinInvitation reducedMotion={reducedMotion || motionPaused} onUnlock={unlock}/></main>}
      <ButterflyField paused={motionPaused} reducedMotion={reducedMotion} />
      <footer className="site-footer"><span>Một khoảng trời nhỏ, em gửi chị.</span><span>made with a little love <Heart size={12} strokeWidth={1.25} /></span></footer>
      <audio ref={audio} className="song" src={`${import.meta.env.BASE_URL}assets/hbd.mp3`} loop preload="auto" />
      <p className="audio-message" role="status">{audioMessage}</p>
    </div>
  </Tooltip.Provider>;
}
