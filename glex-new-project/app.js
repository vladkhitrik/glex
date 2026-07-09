const canvas = document.getElementById("game");
const ctx = canvas ? canvas.getContext("2d") : null;
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const continueBtn = document.getElementById("continueBtn");
const refreshBtn = document.getElementById("refreshBtn");
const fullBtn = document.getElementById("fullBtn");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const ammoEl = document.getElementById("ammo");
const livesEl = document.getElementById("lives");
const bestEl = document.getElementById("best");
const controlsText = document.getElementById("controlsText");
const tapStart = document.getElementById("tapStart");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const finalLevel = document.getElementById("finalLevel");
const restartBtn = document.getElementById("restartBtn");
const modeBlaster = document.getElementById("modeBlaster");
const modeDodge = document.getElementById("modeDodge");
const modeRush = document.getElementById("modeRush");
const gameWrap = document.querySelector(".game-wrap");
const launchScreen = document.getElementById("launchScreen");
const launchPlay = document.getElementById("launchPlay");

if (!canvas || !ctx || !startBtn || !statusEl || !scoreEl || !livesEl || !bestEl) {
  console.error("Game UI elements are missing.");
}

const MODES = {
  blaster: {
    title: "Rocket Blaster",
    controls: "Move: Arrow keys or A/D | Shoot: Space | Pause: P | Restart: Enter",
    canShoot: true,
    baseLives: 3,
    scorePerHit: 1,
    survivalRate: 0,
    spawnBase: 130,
    spawnVariance: 36,
    enemySpeedBase: 1.7,
    enemySpeedGain: 0.2,
    maxLevel: 15,
    levelEveryFrames: 780
    ,ammoStart: 20,
    ammoGain: 4
  },
  dodge: {
    title: "Asteroid Dodge",
    controls: "Move: Arrow keys or A/D | Survive as long as possible | Pause: P | Restart: Enter",
    canShoot: false,
    baseLives: 4,
    scorePerHit: 0,
    survivalRate: 0.24,
    spawnBase: 76,
    spawnVariance: 24,
    enemySpeedBase: 2.2,
    enemySpeedGain: 0.22,
    maxLevel: 18,
    levelEveryFrames: 660
    ,ammoStart: 0,
    ammoGain: 0
  },
  rush: {
    title: "Rapid Assault",
    controls: "Move: Arrow keys or A/D | Shoot: Space | Pause: P | Restart: Enter",
    canShoot: true,
    baseLives: 2,
    scorePerHit: 1,
    survivalRate: 0,
    spawnBase: 72,
    spawnVariance: 24,
    enemySpeedBase: 2.4,
    enemySpeedGain: 0.28,
    maxLevel: 20,
    levelEveryFrames: 520
    ,ammoStart: 26,
    ammoGain: 5
  }
};

const modeButtons = {
  blaster: modeBlaster,
  dodge: modeDodge,
  rush: modeRush
};

const ROCKET_STYLES = {
  starter: { body: "#dcecff", stripe: "#4fa2ff", flame: "#ffb067", wingScale: 1, noseScale: 1 },
  crimson: { body: "#ffe1dd", stripe: "#e35454", flame: "#ffc27a", wingScale: 1.05, noseScale: 1.05 },
  emerald: { body: "#e4ffe8", stripe: "#3daf6f", flame: "#ffd178", wingScale: 1.08, noseScale: 1 },
  shadow: { body: "#d4dbe6", stripe: "#4d5b73", flame: "#ff9f68", wingScale: 1.14, noseScale: 1.08 },
  nova: { body: "#efe6ff", stripe: "#8d67ff", flame: "#ffd07a", wingScale: 1.2, noseScale: 1.12 }
};

const stars = Array.from({ length: 130 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  z: 0.4 + Math.random() * 1.2
}));

const keys = {};
let running = false;
let paused = false;
let intro = false;
let introFrame = 0;
let gameOver = false;
let waitingTapStart = false;
let score = 0;
let scoreFloat = 0;
let level = 1;
let levelFlash = 0;
let framesSinceLevel = 0;
let lives = 3;
let best = 0;
let localFull = false;
let mode = "blaster";
let spawnTimer = 0;
let ammo = 0;
let maxAmmo = 0;
let bossSpawned = false;
let bossDefeated = false;
let starsEarned = 0;
let totalStars = 0;
let starSpawnTimer = 0;
let starToastFrames = 0;
let equippedRocketId = "starter";

let audioCtx = null;
let audioMaster = null;
let musicGain = null;
let sfxGain = null;
let musicOscA = null;
let musicOscB = null;
let musicLfo = null;
let musicStep = -1;

const player = {
  x: canvas.width * 0.5,
  y: canvas.height - 48,
  speed: 6,
  cooldown: 0
};

const bullets = [];
const enemies = [];
const bossShots = [];
const starPickups = [];

function getMode() {
  return MODES[mode];
}

function setStatus(text) {
  statusEl.textContent = text;
}

function showGameOver(scoreValue, levelValue) {
  if (finalScore) {
    finalScore.textContent = String(Math.floor(scoreValue));
  }
  if (finalLevel) {
    finalLevel.textContent = String(levelValue);
  }
  if (gameOverScreen) {
    gameOverScreen.classList.remove("hidden");
  }
}

function hideGameOver() {
  if (gameOverScreen) {
    gameOverScreen.classList.add("hidden");
  }
}

function syncPauseButtons() {
  if (pauseBtn) {
    pauseBtn.disabled = !running || intro || gameOver || paused;
  }
  if (continueBtn) {
    continueBtn.disabled = !running || intro || gameOver || !paused;
  }
}

function pauseGame() {
  if (!running || intro || gameOver || paused) {
    return;
  }
  paused = true;
  setStatus("Paused. Click Continue to keep playing.");
  syncPauseButtons();
}

function continueGame() {
  if (!running || intro || gameOver || !paused) {
    return;
  }
  paused = false;
  setStatus(`${getMode().title} live. Push for high score.`);
  syncPauseButtons();
}

function loadBestScore() {
  try {
    best = Number(window.localStorage.getItem("glex-games-best") || 0);
  } catch {
    best = 0;
  }
}

function saveBestScore(value) {
  try {
    window.localStorage.setItem("glex-games-best", String(value));
  } catch {
    // Ignore storage failures in restricted sessions.
  }
}

function loadTotalStars() {
  try {
    totalStars = Number(window.localStorage.getItem("glex-games-stars-wallet") || 0);
  } catch {
    totalStars = 0;
  }
}

function saveTotalStars() {
  try {
    window.localStorage.setItem("glex-games-stars-wallet", String(totalStars));
  } catch {
    // Ignore storage failures in restricted sessions.
  }
}

function loadEquippedRocket() {
  try {
    const stored = window.localStorage.getItem("glex-games-equipped-rocket") || "starter";
    equippedRocketId = ROCKET_STYLES[stored] ? stored : "starter";
  } catch {
    equippedRocketId = "starter";
  }
}

function initAudio() {
  if (audioCtx) {
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) {
    return;
  }

  audioCtx = new AC();
  audioMaster = audioCtx.createGain();
  musicGain = audioCtx.createGain();
  sfxGain = audioCtx.createGain();

  audioMaster.gain.value = 0.34;
  musicGain.gain.value = 0;
  sfxGain.gain.value = 0.9;

  musicOscA = audioCtx.createOscillator();
  musicOscA.type = "triangle";
  musicOscA.frequency.value = 220;

  musicOscB = audioCtx.createOscillator();
  musicOscB.type = "sine";
  musicOscB.frequency.value = 330;

  musicLfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  musicLfo.type = "sine";
  musicLfo.frequency.value = 0.12;
  lfoGain.gain.value = 18;

  musicLfo.connect(lfoGain);
  lfoGain.connect(musicOscB.frequency);

  musicOscA.connect(musicGain);
  musicOscB.connect(musicGain);
  musicGain.connect(audioMaster);
  sfxGain.connect(audioMaster);
  audioMaster.connect(audioCtx.destination);

  musicOscA.start();
  musicOscB.start();
  musicLfo.start();
}

function resumeAudio() {
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}

function playTone(freq, duration = 0.12, type = "sine", gainValue = 0.15) {
  if (!audioCtx || !sfxGain) {
    return;
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(sfxGain);

  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(gainValue, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playShootSfx() {
  playTone(560, 0.06, "square", 0.12);
}

function playHitSfx() {
  playTone(220, 0.09, "sawtooth", 0.14);
  playTone(160, 0.12, "triangle", 0.1);
}

function playStarSfx() {
  playTone(880, 0.08, "triangle", 0.12);
  setTimeout(() => playTone(1174, 0.09, "triangle", 0.1), 45);
}

function playLevelSfx() {
  playTone(392, 0.09, "triangle", 0.12);
  setTimeout(() => playTone(523, 0.1, "triangle", 0.12), 70);
  setTimeout(() => playTone(659, 0.11, "triangle", 0.12), 140);
}

function playBossSpawnSfx() {
  playTone(130, 0.22, "sawtooth", 0.18);
  setTimeout(() => playTone(98, 0.24, "sawtooth", 0.16), 120);
}

function playGameOverSfx() {
  playTone(240, 0.16, "triangle", 0.14);
  setTimeout(() => playTone(190, 0.18, "triangle", 0.13), 120);
  setTimeout(() => playTone(150, 0.22, "triangle", 0.12), 250);
}

function updateMusic() {
  if (!audioCtx || !musicGain || !musicOscA || !musicOscB) {
    return;
  }
  const target = running || intro ? 0.055 : 0.018;
  musicGain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.25);

  const step = Math.floor(performance.now() / 360) % 8;
  if (step !== musicStep) {
    musicStep = step;
    const seq = [196, 220, 246.94, 220, 196, 174.61, 164.81, 174.61];
    const base = seq[step];
    musicOscA.frequency.setTargetAtTime(base, audioCtx.currentTime, 0.08);
    musicOscB.frequency.setTargetAtTime(base * 1.5, audioCtx.currentTime, 0.08);
  }
}

function syncHud() {
  scoreEl.textContent = String(Math.floor(score));
  if (levelEl) {
    levelEl.textContent = String(level);
  }
  if (ammoEl) {
    ammoEl.textContent = getMode().canShoot ? `${ammo}/${maxAmmo}` : "N/A";
  }
  livesEl.textContent = String(lives);
  bestEl.textContent = String(best);
}

function clearWorld() {
  bullets.length = 0;
  enemies.length = 0;
  bossShots.length = 0;
  starPickups.length = 0;
  spawnTimer = 0;
  starSpawnTimer = 0;
  player.cooldown = 0;
  player.x = canvas.width * 0.5;
  player.y = canvas.height - 48;
  bossSpawned = false;
  bossDefeated = false;
}

function resetGameState() {
  running = false;
  paused = false;
  intro = false;
  gameOver = false;
  introFrame = 0;
  waitingTapStart = false;
  level = 1;
  levelFlash = 0;
  framesSinceLevel = 0;
  score = 0;
  scoreFloat = 0;
  starsEarned = 0;
  starToastFrames = 0;
  lives = getMode().baseLives;
  maxAmmo = getMode().ammoStart;
  ammo = maxAmmo;
  if (tapStart) {
    tapStart.classList.add("hidden");
  }
  hideGameOver();
  clearWorld();
  syncHud();
  syncPauseButtons();
}

function updateModeUi() {
  const config = getMode();
  for (const [k, btn] of Object.entries(modeButtons)) {
    if (!btn) continue;
    btn.classList.toggle("active", k === mode);
  }
  if (controlsText) {
    controlsText.textContent = config.controls;
  }
  if (startBtn) {
    startBtn.textContent = `Start ${config.title}`;
  }
}

function setMode(nextMode) {
  if (!MODES[nextMode]) {
    return;
  }
  mode = nextMode;
  updateModeUi();
  resetGameState();
  setStatus(`${getMode().title} selected. Press Play or Start.`);
}

function armTapToStart(message) {
  waitingTapStart = true;
  if (tapStart) {
    tapStart.textContent = message || "GLEX GAMES - Click screen to start";
    tapStart.classList.remove("hidden");
  }
  setStatus("Waiting for touch/click to start...");
}

function startIntro() {
  resetGameState();
  initAudio();
  resumeAudio();
  intro = true;
  setStatus(`Launching ${getMode().title}...`);
}

function beginExperience() {
  gameOver = false;
  hideGameOver();
  if (launchScreen) {
    launchScreen.classList.add("hidden");
    document.body.classList.remove("lock-scroll");
  }
  armTapToStart("GLEX GAMES - Click screen to start");
}

function startGame() {
  intro = false;
  running = true;
  paused = false;
  if (tapStart) {
    tapStart.classList.add("hidden");
  }
  setStatus(`${getMode().title} live. Level ${level} | Score ${Math.floor(score)} | Hearts ${lives}`);
  syncPauseButtons();
}

function endGame() {
  running = false;
  paused = false;
  gameOver = true;
  playGameOverSfx();
  showGameOver(score, level);
  if (score > best) {
    best = Math.floor(score);
    saveBestScore(best);
  }
  syncHud();
  syncPauseButtons();
  setStatus("Game over. Press Enter or Start to play again.");
}

function toggleLocalFullscreen() {
  if (!gameWrap) {
    return;
  }
  localFull = !localFull;
  gameWrap.classList.toggle("local-full", localFull);
  document.body.classList.toggle("lock-scroll", localFull);
  if (fullBtn) {
    fullBtn.textContent = localFull ? "Exit Full Screen" : "Full Screen";
  }
}

function drawStars(speedMul = 1) {
  for (const s of stars) {
    s.y += s.z * speedMul;
    if (s.y > canvas.height + 1) {
      s.y = -2;
      s.x = Math.random() * canvas.width;
    }
    ctx.globalAlpha = 0.25 + s.z * 0.35;
    ctx.fillStyle = "#d9ecff";
    ctx.fillRect(s.x, s.y, s.z * 1.7, s.z * 1.7);
  }
  ctx.globalAlpha = 1;
}

function drawShip() {
  const style = ROCKET_STYLES[equippedRocketId] || ROCKET_STYLES.starter;
  const wingW = 13 * style.wingScale;
  const noseH = 20 * style.noseScale;

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = style.body;
  ctx.beginPath();
  ctx.moveTo(0, -noseH);
  ctx.lineTo(wingW, 14);
  ctx.lineTo(0, 8);
  ctx.lineTo(-wingW, 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = style.stripe;
  ctx.fillRect(-3, -8, 6, 18);
  ctx.fillStyle = style.flame;
  ctx.fillRect(-2, 14, 4, 10);
  ctx.restore();
}

function drawEnemy(enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  if (enemy.kind === "boss") {
    ctx.fillStyle = "#ff8d6d";
    ctx.beginPath();
    ctx.moveTo(0, 24);
    ctx.lineTo(24, -16);
    ctx.lineTo(0, -5);
    ctx.lineTo(-24, -16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffd39b";
    ctx.fillRect(-4, -7, 8, 18);
    ctx.fillStyle = "#3f1f17";
    const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillRect(-24, -28, 48, 5);
    ctx.fillStyle = "#6dff9f";
    ctx.fillRect(-24, -28, 48 * hpRatio, 5);
    ctx.restore();
    return;
  }
  if (enemy.kind === "asteroid") {
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.r, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.moveTo(0, 13);
    ctx.lineTo(15, -10);
    ctx.lineTo(0, -2);
    ctx.lineTo(-15, -10);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function shoot() {
  if (!running || !getMode().canShoot || player.cooldown > 0 || ammo <= 0) {
    return;
  }
  const spread = mode === "rush" ? [-7, 0, 7] : [0];
  for (const offset of spread) {
    bullets.push({ x: player.x + offset, y: player.y - 22, v: mode === "rush" ? 10 : 8.5 });
  }
  ammo -= 1;
  playShootSfx();
  syncHud();
  player.cooldown = mode === "rush" ? 7 : 11;
}

function updateLevelByScore() {
  const cfg = getMode();
  if (level >= cfg.maxLevel) {
    return;
  }
  framesSinceLevel += 1;
  if (framesSinceLevel >= cfg.levelEveryFrames) {
    framesSinceLevel = 0;
    level += 1;
    if (cfg.canShoot) {
      maxAmmo += cfg.ammoGain;
      ammo = maxAmmo;
    }
    syncHud();
    playLevelSfx();
    setStatus(`Level ${level} | Score ${Math.floor(score)}`);
  }
}

function spawnEnemyWave() {
  const cfg = getMode();
  let batch = mode === "rush" ? 1 + Math.floor(level / 5) : 1 + (level > 6 && Math.random() < 0.4 ? 1 : 0);
  if (mode === "dodge") {
    // Add more asteroids every few levels.
    batch = 1 + Math.floor((level - 1) / 3);
  }

  for (let i = 0; i < batch; i += 1) {
    const isAsteroid = mode === "dodge";
    const e = {
      x: 24 + Math.random() * (canvas.width - 48),
      y: -22 - i * 16,
      v: cfg.enemySpeedBase + level * cfg.enemySpeedGain * (0.75 + Math.random() * 0.5),
      vx: (Math.random() - 0.5) * (mode === "rush" ? 1.7 : 1),
      hp: mode === "rush" && Math.random() < 0.25 ? 2 : 1,
      kind: isAsteroid ? "asteroid" : "fighter",
      r: isAsteroid ? 8 + Math.random() * 12 : 12,
      color: isAsteroid ? (Math.random() < 0.5 ? "#d28b62" : "#b56f4d") : (Math.random() > 0.5 ? "#ff6f7f" : "#ff9a62")
    };
    if (mode === "dodge") {
      // Stronger speed ramp in dodge mode so each level feels faster.
      e.v += level * 0.18;
    }
    enemies.push(e);
  }
}

function maybeSpawnBoss() {
  const cfg = getMode();
  if (!cfg.canShoot || bossSpawned || bossDefeated) {
    return;
  }
  // Boss appears at level 10 in shooter modes.
  const bossLevel = Math.min(10, cfg.maxLevel);
  if (level < bossLevel) {
    return;
  }
  bossSpawned = true;
  enemies.push({
    x: canvas.width * 0.5,
    y: 72,
    v: 0.45,
    vx: 0,
    hp: 10,
    maxHp: 10,
    fireCooldown: 40,
    kind: "boss",
    r: 28,
    color: "#ff8d6d"
  });
  playBossSpawnSfx();
  setStatus("Level 10 reached. Final Boss has arrived.");
}

function spawnStarPickup() {
  const margin = 36;
  const cornerChance = Math.random() < 0.55;
  let x;
  let y;
  if (cornerChance) {
    const corner = Math.floor(Math.random() * 4);
    if (corner === 0) {
      x = margin;
      y = margin;
    } else if (corner === 1) {
      x = canvas.width - margin;
      y = margin;
    } else if (corner === 2) {
      x = margin;
      y = canvas.height - margin;
    } else {
      x = canvas.width - margin;
      y = canvas.height - margin;
    }
  } else {
    x = margin + Math.random() * (canvas.width - margin * 2);
    y = margin + Math.random() * (canvas.height - margin * 2);
  }

  starPickups.push({
    x,
    y,
    r: 10,
    pulse: Math.random() * Math.PI * 2,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.45,
    life: 900
  });
}

function updateStarPickups() {
  if (!running) {
    return;
  }

  starSpawnTimer -= 1;
  if (starSpawnTimer <= 0 && starPickups.length < 3) {
    spawnStarPickup();
    starSpawnTimer = Math.floor(340 + Math.random() * 220);
  }

  for (let i = starPickups.length - 1; i >= 0; i -= 1) {
    const s = starPickups[i];
    s.life -= 1;
    s.pulse += 0.08;
    s.x += s.vx;
    s.y += s.vy;

    // Keep pickup stars moving slowly within view.
    if (s.x < 18 || s.x > canvas.width - 18) {
      s.vx *= -1;
    }
    if (s.y < 18 || s.y > canvas.height - 18) {
      s.vy *= -1;
    }

    s.x = Math.max(18, Math.min(canvas.width - 18, s.x));
    s.y = Math.max(18, Math.min(canvas.height - 18, s.y));

    const dx = player.x - s.x;
    const dy = player.y - s.y;
    if (dx * dx + dy * dy < 20 * 20) {
      starPickups.splice(i, 1);
      starsEarned += 1;
      totalStars += 1;
      saveTotalStars();
      playStarSfx();
      starToastFrames = 85;
      setStatus("You got 1 star");
      continue;
    }

    if (s.life <= 0) {
      starPickups.splice(i, 1);
    }
  }
}

function hitPlayer(enemy) {
  const radius = enemy.kind === "asteroid" ? enemy.r + 9 : enemy.kind === "boss" ? 34 : 20;
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  return dx * dx + dy * dy < radius * radius;
}

function updateCommonMovement() {
  if (keys.ArrowLeft || keys.a || keys.A) {
    player.x -= player.speed;
  }
  if (keys.ArrowRight || keys.d || keys.D) {
    player.x += player.speed;
  }
  if (keys.ArrowUp || keys.w || keys.W) {
    player.y -= player.speed * 0.9;
  }
  if (keys.ArrowDown || keys.s || keys.S) {
    player.y += player.speed * 0.9;
  }
  player.x = Math.max(20, Math.min(canvas.width - 20, player.x));
  player.y = Math.max(28, Math.min(canvas.height - 28, player.y));

  if (player.cooldown > 0) {
    player.cooldown -= 1;
  }

  if ((keys[" "] || keys.Spacebar) && getMode().canShoot) {
    shoot();
  }

  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const b = bullets[i];
    b.y -= b.v;
    if (b.y < -24) {
      bullets.splice(i, 1);
    }
  }
}

function updateModeGame() {
  const cfg = getMode();
  updateCommonMovement();
  updateStarPickups();

  scoreFloat += cfg.survivalRate;
  if (cfg.survivalRate > 0) {
    score = scoreFloat;
    syncHud();
  }

  spawnTimer -= 1;
  if (spawnTimer <= 0) {
    spawnEnemyWave();
    if (mode === "dodge") {
      // Spawn asteroids more frequently as dodge levels increase.
      spawnTimer = Math.floor(
        Math.max(10, cfg.spawnBase - level * 7) + Math.random() * Math.max(8, cfg.spawnVariance * 0.7)
      );
    } else {
      spawnTimer = Math.floor(
        Math.max(24, cfg.spawnBase - level * 4) + Math.random() * cfg.spawnVariance
      );
    }
  }

  maybeSpawnBoss();

  for (let i = bossShots.length - 1; i >= 0; i -= 1) {
    const shot = bossShots[i];
    shot.x += shot.vx;
    shot.y += shot.vy;

    const dx = player.x - shot.x;
    const dy = player.y - shot.y;
    if (dx * dx + dy * dy < 19 * 19) {
      bossShots.splice(i, 1);
      lives -= 1;
      syncHud();
      if (lives > 0) {
        setStatus(`Lost 1 life, ${lives} hearts to go | Level ${level} | Score ${Math.floor(score)}`);
      }
      if (lives <= 0) {
        endGame();
        return;
      }
      continue;
    }

    if (shot.y > canvas.height + 30 || shot.x < -30 || shot.x > canvas.width + 30) {
      bossShots.splice(i, 1);
    }
  }

  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const e = enemies[i];
    if (e.kind !== "boss") {
      e.y += e.v;
    }

    if (e.kind === "boss") {
      // Keep boss fixed at top center so it is easier to target.
      e.x = canvas.width * 0.5;
      e.vx = 0;
    } else {
      e.x += e.vx;
    }

    if (e.kind === "boss") {
      // Boss has unlimited ammo and continuously fires toward player.
      e.fireCooldown -= 1;
      if (e.fireCooldown <= 0) {
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const speed = 3.2 + level * 0.08;
        bossShots.push({
          x: e.x,
          y: e.y + 18,
          vx: (dx / dist) * speed,
          vy: Math.max(2.2, (dy / dist) * speed)
        });
        e.fireCooldown = Math.max(16, 44 - level);
      }
    } else if (mode !== "dodge") {
      // Fighters continuously steer toward player X for a homing feel.
      const targetDir = Math.sign(player.x - e.x);
      const trackSpeed = Math.min(3.2, 1 + level * 0.08);
      e.vx += (targetDir * trackSpeed - e.vx) * 0.08;
      e.vx = Math.max(-3.3, Math.min(3.3, e.vx));
    }

    if (e.x < 8 || e.x > canvas.width - 8) {
      e.vx *= -1;
    }

    if (cfg.canShoot) {
      let gotHit = false;
      for (let j = bullets.length - 1; j >= 0; j -= 1) {
        const b = bullets[j];
        const radius = e.kind === "asteroid" ? e.r + 5 : e.kind === "boss" ? 30 : 16;
        const dx = b.x - e.x;
        const dy = b.y - e.y;
        if (dx * dx + dy * dy < radius * radius) {
          bullets.splice(j, 1);
          e.hp -= 1;
          if (e.hp <= 0) {
            gotHit = true;
            score += cfg.scorePerHit;
            scoreFloat = score;
            playHitSfx();
            syncHud();
            if (e.kind === "boss") {
              bossDefeated = true;
              setStatus("Boss defeated. You win this run.");
            }
          } else if (e.kind === "boss") {
            setStatus(`Final Boss: ${e.hp} hits left`);
          }
          break;
        }
      }
      if (gotHit) {
        enemies.splice(i, 1);
        continue;
      }
    }

    if (hitPlayer(e)) {
      enemies.splice(i, 1);
      lives -= 1;
      syncHud();
      if (lives > 0) {
        setStatus(`Lost 1 life, ${lives} hearts to go | Level ${level} | Score ${Math.floor(score)}`);
      }
      if (lives <= 0) {
        endGame();
        return;
      }
      continue;
    }

    if (e.kind !== "boss" && e.y > canvas.height + 25) {
      enemies.splice(i, 1);
      if (mode === "rush") {
        lives -= 1;
        syncHud();
        if (lives > 0) {
          setStatus(`Lost 1 life, ${lives} hearts to go | Level ${level} | Score ${Math.floor(score)}`);
        }
        if (lives <= 0) {
          endGame();
          return;
        }
      }
    }
  }

  updateLevelByScore();
}

function drawHudText(top, large, sub, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = "center";
  ctx.fillStyle = "#dfefff";
  ctx.font = "700 14px Space Grotesk";
  ctx.fillText(top, canvas.width * 0.5, canvas.height * 0.5 - 70);
  ctx.font = "800 58px Syne";
  ctx.fillStyle = "#93c7ff";
  ctx.fillText(large, canvas.width * 0.5, canvas.height * 0.5);
  ctx.font = "600 18px Space Grotesk";
  ctx.fillStyle = "#c7dff8";
  ctx.fillText(sub, canvas.width * 0.5, canvas.height * 0.5 + 40);
  ctx.restore();
}

function drawIntro() {
  introFrame += 1;
  ctx.fillStyle = "#02070f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawStars(2.6);

  const pulse = 0.65 + Math.sin(introFrame * 0.06) * 0.25;
  drawHudText("WELCOME TO", "GLEX GAMES", `${getMode().title} Loading`, pulse);

  const barH = 56;
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(0, 0, canvas.width, barH);
  ctx.fillRect(0, canvas.height - barH, canvas.width, barH);

  if (introFrame > 130) {
    startGame();
  }
}

function drawGame() {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#030d17");
  bg.addColorStop(1, "#071423");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawStars(mode === "rush" ? 1.9 : 1.2);

  for (const b of bullets) {
    ctx.fillStyle = "#7ad2ff";
    ctx.fillRect(b.x - 1.5, b.y - 7, 3, 11);
  }

  for (const s of starPickups) {
    const pulse = 1 + Math.sin(s.pulse) * 0.18;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "#ffd96a";
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(3, -3);
    ctx.lineTo(10, -3);
    ctx.lineTo(4.5, 2);
    ctx.lineTo(7, 10);
    ctx.lineTo(0, 5);
    ctx.lineTo(-7, 10);
    ctx.lineTo(-4.5, 2);
    ctx.lineTo(-10, -3);
    ctx.lineTo(-3, -3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  for (const shot of bossShots) {
    ctx.fillStyle = "#ffb57d";
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, 4.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff6f4a";
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, 2.3, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const e of enemies) {
    drawEnemy(e);
  }

  drawShip();

  ctx.save();
  ctx.fillStyle = "rgba(8, 23, 38, 0.78)";
  ctx.fillRect(12, 10, 150, 34);
  ctx.strokeStyle = "rgba(142, 197, 255, 0.65)";
  ctx.strokeRect(12, 10, 150, 34);
  ctx.fillStyle = "#ffdb7f";
  ctx.font = "700 16px Space Grotesk";
  ctx.textAlign = "left";
  ctx.fillText(`Stars: ${totalStars}`, 22, 32);
  if (starToastFrames > 0) {
    starToastFrames -= 1;
    ctx.globalAlpha = Math.min(1, starToastFrames / 22);
    ctx.fillStyle = "#fff4c8";
    ctx.font = "700 18px Space Grotesk";
    ctx.fillText("+1 Star!", 22, 58);
  }
  ctx.restore();
}

function drawIdle() {
  ctx.fillStyle = "#050f1b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawStars(0.4);
  drawHudText("READY", "GLEX GAMES", `Mode: ${getMode().title}`);
}

function tick() {
  updateMusic();
  if (intro) {
    drawIntro();
  } else if (running) {
    drawGame();
    if (paused) {
      drawHudText("PAUSED", "CONTINUE", "Press P or click Continue");
    } else {
      updateModeGame();
    }
  } else {
    drawIdle();
    if (gameOver) {
      drawHudText("MISSION FAILED", "TRY AGAIN", "Press Enter or Start");
    }
  }
  requestAnimationFrame(tick);
}

function consumeTapToStart() {
  if (!waitingTapStart) {
    return;
  }
  waitingTapStart = false;
  startIntro();
}

startBtn.addEventListener("click", () => {
  beginExperience();
});

if (launchPlay) {
  launchPlay.addEventListener("click", (e) => {
    e.stopPropagation();
    beginExperience();
  });
}

if (launchScreen) {
  launchScreen.addEventListener("pointerdown", () => {
    beginExperience();
  });
}

if (modeBlaster) {
  modeBlaster.addEventListener("click", () => setMode("blaster"));
}
if (modeDodge) {
  modeDodge.addEventListener("click", () => setMode("dodge"));
}
if (modeRush) {
  modeRush.addEventListener("click", () => setMode("rush"));
}

if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    beginExperience();
  });
}

if (fullBtn) {
  fullBtn.addEventListener("click", async () => {
    const host = gameWrap || canvas;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (host.requestFullscreen) {
        await host.requestFullscreen();
      } else {
        toggleLocalFullscreen();
      }
    } catch {
      toggleLocalFullscreen();
      setStatus("Using local fullscreen mode.");
    }

    if (!running) {
      armTapToStart("Tap or click anywhere to start in fullscreen");
    }
  });
}

if (pauseBtn) {
  pauseBtn.addEventListener("click", () => {
    pauseGame();
  });
}

if (continueBtn) {
  continueBtn.addEventListener("click", () => {
    continueGame();
  });
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    window.location.reload();
  });
}

document.addEventListener("fullscreenchange", () => {
  if (fullBtn) {
    fullBtn.textContent = document.fullscreenElement ? "Exit Full Screen" : "Full Screen";
  }
});

window.addEventListener("pointerdown", () => {
  initAudio();
  resumeAudio();
  consumeTapToStart();
});

window.addEventListener("keydown", (e) => {
  initAudio();
  resumeAudio();
  keys[e.key] = true;
  if (e.key === " " || e.key.startsWith("Arrow")) {
    e.preventDefault();
  }

  if ((e.key === "Enter" || e.key === " ") && waitingTapStart) {
    consumeTapToStart();
    return;
  }

  if (e.key === "p" || e.key === "P") {
    if (paused) {
      continueGame();
    } else {
      pauseGame();
    }
    return;
  }

  if (e.key === "Enter" && !running) {
    beginExperience();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

loadBestScore();
loadTotalStars();
loadEquippedRocket();
updateModeUi();
syncHud();
syncPauseButtons();
drawIdle();
tick();

if (launchScreen) {
  document.body.classList.add("lock-scroll");
}
