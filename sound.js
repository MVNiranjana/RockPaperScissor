(() => {
  let muted = false;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();

  function beep(freq, duration) {
    if (muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = 0.1;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  document.querySelectorAll(".choice").forEach((el) => {
    el.addEventListener("click", () => {
      if (ctx.state === "suspended") ctx.resume();
      beep(600, 0.15);
    });
  });

  const btn = document.getElementById("muteBtn");
  btn.addEventListener("click", () => {
    muted = !muted;
    btn.textContent = muted ? "🔇 Sound Off" : "🔊 Sound On";
  });
})();