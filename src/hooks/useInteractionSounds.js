import { useCallback, useEffect, useRef, useState } from 'react';

// Locally synthesized foley; a locked browser stays silent until a user gesture.
export default function useInteractionSounds() {
  const [enabled, setEnabled] = useState(true);
  const enabledRef = useRef(enabled);
  const engine = useRef(null);
  const lastTap = useRef(-Infinity);
  const stopVoices = useCallback(() => {
    engine.current?.voices.forEach(voice => { try { voice.stop(); } catch {} });
    engine.current?.voices.clear();
  }, []);
  const prime = useCallback(event => {
    if (!enabledRef.current || (event && !event.isTrusted) || document.hidden) return;
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
      // Do not queue a blocked arrival sound to play late on the opening click.
      if (context.state === 'suspended' && event?.isTrusted) return context.resume().catch(() => {});
    } catch { /* Audio is optional; the book remains fully usable. */ }
  }, []);
  const play = useCallback(async (kind = 'tap', event) => {
    // A first click (including keyboard/assistive activation) must finish resuming audio.
    if (event) await prime(event);
    else prime();
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
    const tone = (frequency, offset, duration, volume, attack = .018) => {
      const source = context.createOscillator();
      const gain = context.createGain();
      source.type = 'sine';
      source.frequency.setValueAtTime(frequency, now + offset);
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(volume, now + offset + attack);
      gain.gain.exponentialRampToValueAtTime(.0001, now + offset + duration);
      source.connect(gain); gain.connect(master); track(source, [gain]);
      source.start(now + offset); source.stop(now + offset + duration + .025);
    };
    const rustle = (offset, duration, volume, frequency, endFrequency = frequency, type = 'bandpass', attack = .04) => {
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = noise;
      source.loop = true;
      filter.type = type; filter.Q.value = .65;
      filter.frequency.setValueAtTime(frequency, now + offset);
      filter.frequency.exponentialRampToValueAtTime(endFrequency, now + offset + duration);
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(volume, now + offset + attack);
      gain.gain.exponentialRampToValueAtTime(.0001, now + offset + duration);
      source.connect(filter); filter.connect(gain); gain.connect(master); track(source, [filter, gain]);
      source.start(now + offset); source.stop(now + offset + duration + .025);
    };
    // Soft paper and rounded notes replace the sharp, sweeping wind hiss.
    if (kind === 'arrival') {
      rustle(0, .95, .055, 850, 550, 'lowpass', .14);
      tone(523.25, .02, .85, .035, .1);
      tone(659.25, .18, .95, .018, .12);
    }
    else if (kind === 'letter') { rustle(0, 1.3, .08, 1000, 650, 'lowpass', .16); rustle(.4, .9, .045, 1200, 700, 'lowpass', .14); }
    else if (kind === 'page') { rustle(0, .42, .075, 1200); rustle(.11, .27, .035, 2300); }
    else if (kind === 'seal') { tone(392, 0, .35, .035, .04); rustle(.04, .5, .07, 1100, 650, 'lowpass', .1); }
    else if (kind === 'bloom') {
      [523.25, 659.25, 783.99, 1046.5].forEach((note, i) => {
        tone(note, i * .17, 1.25, .035 - i * .004);
        tone(note * 2, i * .17, .75, .006);
      });
    } else if (kind === 'unlock') { tone(523.25, 0, .45, .025); tone(783.99, .12, .6, .022); }
    else { tone(740, 0, .075, .018); }
  }, [prime]);
  const toggle = useCallback(event => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
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
