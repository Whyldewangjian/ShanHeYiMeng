/* ============================================================
   山河一梦 · 环境音乐（纯 Web Audio 合成，零外部资源，离线可用）
   安全版：无反馈环、带限幅保护；古筝式拨弦 + 笛 + 低音长垫，
        五声音阶抒情慢板，安静而有江湖气。
   ============================================================ */
(function () {
  'use strict';

  const KEY = 'wuxia_music_v1';   // 音乐开关偏好（与存档分离）
  const VOLUME = 0.2;             // 总音量
  const BEAT = 0.9;               // 一拍 ≈ 0.9 秒（约 67 BPM）
  const BASS_BEAT = 4;            // 低音每 4 拍一记

  // D 宫五声音阶（D4 E4 F#4 A4 B4 D5 E5）
  const SCALE = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 659.25];
  // 低音走句：D2 A2 D3 A2
  const BASS = [73.42, 110.0, 146.83, 110.0];
  // 主旋律（音阶下标 + 拍数）：抒情慢板，有起有落
  const MELODY = [
    [5, 1.5], [3, 0.5], [4, 2], [3, 1], [2, 1], [1, 2],
    [0, 1], [1, 1], [2, 1.5], [3, 0.5], [2, 2], [1, 1], [0, 3]
  ];

  let ctx = null, master = null;
  let timer = null, drone = [];
  let melodyTime = 0, melodyStep = 0, bassTime = 0, bassStep = 0;

  function ensureCtx() {
    if (ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      // 安全限幅：压住任何意外过载，保护喇叭
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -6;
      limiter.knee.value = 0;
      limiter.ratio.value = 20;
      limiter.attack.value = 0.001;
      limiter.release.value = 0.3;
      master.connect(limiter);
      limiter.connect(ctx.destination);
      return true;
    } catch (e) { return false; }
  }

  // 低音长垫：D2 / A2 / D3，极轻
  function startDrone() {
    stopDrone();
    const freqs = [73.42, 110.0, 146.83];
    drone = freqs.map((f, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.024 - i * 0.006;
      o.connect(g); g.connect(master);
      o.start();
      return { o, g };
    });
  }
  function stopDrone() {
    drone.forEach((d) => { try { d.o.stop(); } catch (e) {} });
    drone = [];
  }

  // 拨弦：三角波（基础）+ 高八度正弦（清亮），快速起音、指数衰减；无反馈环
  function pluck(freq, when, vel, dur) {
    if (when < ctx.currentTime + 0.01) when = ctx.currentTime + 0.01;
    const o1 = ctx.createOscillator();
    o1.type = 'triangle';
    o1.frequency.value = freq;
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2;
    const g2 = ctx.createGain(); g2.gain.value = 0.35;
    o2.connect(g2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vel, when + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o1.connect(g); g2.connect(g); g.connect(master);
    o1.start(when); o1.stop(when + dur + 0.05);
    o2.start(when); o2.stop(when + dur + 0.05);
  }

  // 笛：正弦 + 轻颤音，柔和绵长
  function flute(freq, when, vel, dur) {
    if (when < ctx.currentTime + 0.01) when = ctx.currentTime + 0.01;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    const vib = ctx.createOscillator();
    vib.frequency.value = 5.0;
    const vibGain = ctx.createGain();
    vibGain.gain.value = freq * 0.004;
    vib.connect(vibGain); vibGain.connect(o.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vel, when + 0.15);
    g.gain.setValueAtTime(vel, when + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(master);
    o.start(when); o.stop(when + dur + 0.05);
    vib.start(when); vib.stop(when + dur + 0.05);
  }

  // 前瞻调度：主旋律（拨弦 + 高八度笛）+ 低音走句
  function schedule() {
    while (melodyTime < ctx.currentTime + 1.5) {
      const idx = MELODY[melodyStep][0];
      const beats = MELODY[melodyStep][1];
      const dur = Math.min(2.4, beats * BEAT * 1.1);
      pluck(SCALE[idx], melodyTime, 0.26, dur);
      flute(SCALE[idx] * 2, melodyTime, 0.06, dur * 1.3);
      melodyTime += beats * BEAT;
      melodyStep = (melodyStep + 1) % MELODY.length;
    }
    while (bassTime < ctx.currentTime + 1.5) {
      pluck(BASS[bassStep], bassTime, 0.18, 2.0);
      bassTime += BASS_BEAT * BEAT;
      bassStep = (bassStep + 1) % BASS.length;
    }
  }

  function start() {
    if (!ensureCtx()) return;
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    if (timer) return;
    startDrone();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(VOLUME, ctx.currentTime, 0.6);
    melodyTime = ctx.currentTime + 0.1;
    melodyStep = 0;
    bassTime = ctx.currentTime + 0.1;
    bassStep = 0;
    schedule();
    timer = setInterval(schedule, 300);
  }

  function stop() {
    if (!ctx) return;
    if (timer) { clearInterval(timer); timer = null; }
    stopDrone();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
  }

  function isOn() { try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; } }
  function setOn(on) { try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {} if (on) start(); else stop(); }

  window.WuxiaMusic = { start: start, stop: stop, isOn: isOn, setOn: setOn, toggle: function () { setOn(!isOn()); } };
})();
