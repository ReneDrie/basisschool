/** A short rising two-note sound for a correct answer. Sound is optional, so any failure is ignored. */
export function playChime() {
  try {
    const ctx = new window.AudioContext();
    const oscillator = ctx.createOscillator(),
      gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(660, ctx.currentTime);
    oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.09);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.25);
    oscillator.onended = () => void ctx.close();
  } catch {
    /* Sound is optional. */
  }
}
