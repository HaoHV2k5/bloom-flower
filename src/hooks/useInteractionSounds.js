import { useCallback, useEffect, useRef, useState } from 'react';

// Short, locally synthesized foley: no downloads and no audio before a user gesture.
export default function useInteractionSounds() {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem('dear-you-effects') !== 'off'; } catch { return true; }
  });
  const enabledRef = useRef(enabled);
  const engine = useRef(null);
  const lastTap = useRef(-Infinity);
  const stopVoices = useCallback(() => {
    engine.current?.voices.forEach(voice => { try { voice.stop(); } catch {} });
    engine.current?.voices.clear();
  }, []);
  const prime = useCallback(event => {
    if (!enabledRef.current || !event?.isTrusted || document.hidden) return;
    try {
      if (!engine.current) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) return;
        const context = new Context();
        const master = context.createGain();
        master.gain.value = .55;
        master.connect(context.destination);
        const noise = context.createBuffer(1, Math.ceil(context.sampleRate * .7), context.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        engine.current = { context, master, noise, voices: new Set() };
      }
      const { context } = engine.current;
      if (context.state === 'suspended') void context.resume().catch(() => {});
    } catch { /* Audio is optional; the book remains fully usable. */ }
  }, []);
  const play = useCallback((kind = 'tap') => {
    const audio = engine.current;
    if (!enabledRef.current || !audio || audio.context.state !== 'running' || document.hidden) return;
    const { context, master, noise, voices } = audio;
    const now = context.currentTime;
    if (kind === 'tap' && now - lastTap.current < .055) return;
    if (kind === 'tap') lastTap.current = now;
    const track = (source, nodes) => {
      voices.add(source);
      source.onended = () => { voices.delete(source); source.disconnect(); nodes.forEach(node => node.disconnect()); };
    };
    const tone = (frequency, offset, duration, volume) => {
      const source = context.createOscillator();
      const gain = context.createGain();
      source.type = 'sine';
      source.frequency.setValueAtTime(frequency, now + offset);
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(volume, now + offset + .018);
      gain.gain.exponentialRampToValueAtTime(.0001, now + offset + duration);
      source.connect(gain); gain.connect(master); track(source, [gain]);
      source.start(now + offset); source.stop(now + offset + duration + .025);
    };
    const rustle = (offset, duration, volume, frequency) => {
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = noise;
      filter.type = 'bandpass'; filter.frequency.value = frequency; filter.Q.value = .65;
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(volume, now + offset + .04);
      gain.gain.exponentialRampToValueAtTime(.0001, now + offset + duration);
      source.connect(filter); filter.connect(gain); gain.connect(master); track(source, [filter, gain]);
      source.start(now + offset); source.stop(now + offset + duration + .025);
    };
    if (kind === 'page') { rustle(0, .42, .075, 1200); rustle(.11, .27, .035, 2300); }
    else if (kind === 'seal') { tone(290, 0, .14, .028); rustle(.04, .48, .055, 1700); }
    else if (kind === 'bloom') {
      [523.25, 659.25, 783.99, 1046.5].forEach((note, i) => {
        tone(note, i * .17, 1.25, .035 - i * .004);
        tone(note * 2, i * .17, .75, .006);
      });
    } else if (kind === 'unlock') { tone(523.25, 0, .45, .025); tone(783.99, .12, .6, .022); }
    else { tone(740, 0, .075, .018); }
  }, []);
  const toggle = useCallback(event => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    try { localStorage.setItem('dear-you-effects', next ? 'on' : 'off'); } catch {}
    if (!next) { stopVoices(); }
    else { prime(event); }
  }, [prime, stopVoices]);
  useEffect(() => {
    const hide = () => {
      if (!document.hidden) return;
      stopVoices();
      void engine.current?.context.suspend().catch(() => {});
    };
    document.addEventListener('visibilitychange', hide);
    return () => {
      document.removeEventListener('visibilitychange', hide);
      stopVoices();
      void engine.current?.context.close().catch(() => {});
      engine.current = null;
    };
  }, [stopVoices]);
  return { enabled, toggle, prime, play };
}
