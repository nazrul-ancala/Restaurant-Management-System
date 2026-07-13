export function elapsedMinutes(createdAt) {
  if (!createdAt) return 0;
  const diffMs = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(diffMs / 60000));
}

export function formatElapsed(createdAt) {
  if (!createdAt) return "";
  const minutes = elapsedMinutes(createdAt);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// A short attention tone for new-ticket/new-order alerts (no audio asset
// needed). Wrapped in try/catch since audio can be blocked before any user
// gesture on the page -- failing silently is fine, it's a nice-to-have.
export function playBeep() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2);
    oscillator.onended = () => ctx.close();
  } catch (e) {
    // audio blocked -- not critical, ignore
  }
}
