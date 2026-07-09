const timeDisplay = document.getElementById("timeDisplay");
const stateText = document.getElementById("stateText");
const cubeText = document.getElementById("cubeText");
const spaceBtn = document.getElementById("spaceBtn");
const resetBtn = document.getElementById("resetBtn");
const pickCubeBtn = document.getElementById("pickCubeBtn");
const saveBtn = document.getElementById("saveBtn");
const timesBtn = document.getElementById("timesBtn");
const savedTimesEl = document.getElementById("savedTimes");
const savedWrap = document.getElementById("savedWrap");
const cubeDialog = document.getElementById("cubeDialog");
const cubeInput = document.getElementById("cubeInput");
const cubeSaveBtn = document.getElementById("cubeSaveBtn");
const cubeCancelBtn = document.getElementById("cubeCancelBtn");

const STORAGE_KEY = "fast-cube-saved-times";
const CUBE_STORAGE_KEY = "fast-cube-selected-cube";

let running = false;
let startMs = 0;
let elapsedMs = 0;
let rafId = 0;
let savedTimes = [];
let selectedCube = "Default Cube";
let solveFinished = false;
let cubeDialogOpen = false;

function formatTime(totalMs) {
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const millis = totalMs % 1000;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const mmm = String(millis).padStart(3, "0");

  return `${mm}:${ss}.${mmm}`;
}

function render() {
  timeDisplay.textContent = formatTime(elapsedMs);
}

function tick(now) {
  if (!running) {
    return;
  }
  elapsedMs = Math.max(0, Math.floor(now - startMs));
  render();
  rafId = requestAnimationFrame(tick);
}

function startTimer() {
  if (running || solveFinished) {
    if (solveFinished) {
      stateText.textContent = "Press Enter or Reset to start a new solve";
    }
    return;
  }
  running = true;
  startMs = performance.now() - elapsedMs;
  stateText.textContent = "Timer running";
  rafId = requestAnimationFrame(tick);
}

function stopTimer() {
  if (!running) {
    return;
  }
  running = false;
  solveFinished = true;
  cancelAnimationFrame(rafId);
  stateText.textContent = "Timer stopped";
  render();
}

function toggleTimer() {
  if (running) {
    stopTimer();
  } else {
    startTimer();
  }
}

function resetTimer() {
  running = false;
  solveFinished = false;
  cancelAnimationFrame(rafId);
  elapsedMs = 0;
  render();
  stateText.textContent = "Ready to solve";
}

function setCubeText() {
  if (cubeText) {
    cubeText.textContent = `Cube: ${selectedCube}`;
  }
}

function loadSelectedCube() {
  try {
    const savedCube = window.localStorage.getItem(CUBE_STORAGE_KEY);
    if (savedCube && savedCube.trim()) {
      selectedCube = savedCube.trim();
    }
  } catch {
    selectedCube = "Default Cube";
  }
}

function persistSelectedCube() {
  try {
    window.localStorage.setItem(CUBE_STORAGE_KEY, selectedCube);
  } catch {
    // Ignore storage failures.
  }
}

function pickCube() {
  if (!cubeDialog || !cubeInput) {
    return;
  }

  cubeInput.value = selectedCube;
  cubeDialog.classList.remove("hidden");
  cubeDialog.setAttribute("aria-hidden", "false");
  cubeDialogOpen = true;
  cubeInput.focus();
  cubeInput.select();
}

function closeCubeDialog() {
  if (!cubeDialog) {
    return;
  }
  cubeDialog.classList.add("hidden");
  cubeDialog.setAttribute("aria-hidden", "true");
  cubeDialogOpen = false;
}

function saveCubeFromDialog() {
  if (!cubeInput) {
    return;
  }
  const cleaned = cubeInput.value.trim();
  selectedCube = cleaned || "Default Cube";
  persistSelectedCube();
  setCubeText();
  stateText.textContent = `Cube set to ${selectedCube}`;
  closeCubeDialog();
}

function loadSavedTimes() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      savedTimes = [];
      return;
    }

    savedTimes = parsed
      .map((entry) => {
        if (Number.isFinite(entry) && entry >= 0) {
          return { ms: entry, cube: "Unknown Cube" };
        }
        if (
          entry &&
          typeof entry === "object" &&
          Number.isFinite(entry.ms) &&
          entry.ms >= 0
        ) {
          const cube = typeof entry.cube === "string" && entry.cube.trim()
            ? entry.cube.trim()
            : "Unknown Cube";
          return { ms: entry.ms, cube };
        }
        return null;
      })
      .filter(Boolean);
  } catch {
    savedTimes = [];
  }
}

function persistSavedTimes() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTimes));
  } catch {
    // Ignore storage failures.
  }
}

function renderSavedTimes() {
  if (!savedTimesEl) {
    return;
  }

  savedTimesEl.textContent = "";
  if (savedTimes.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No saved times yet";
    savedTimesEl.appendChild(item);
    return;
  }

  for (const entry of savedTimes) {
    const item = document.createElement("li");
    item.textContent = `${formatTime(entry.ms)} - ${entry.cube}`;
    savedTimesEl.appendChild(item);
  }
}

function saveCurrentTime() {
  if (running) {
    stateText.textContent = "Stop timer before saving";
    return;
  }
  if (elapsedMs <= 0) {
    stateText.textContent = "No time to save yet";
    return;
  }

  savedTimes.unshift({ ms: elapsedMs, cube: selectedCube });
  savedTimes = savedTimes.slice(0, 20);
  persistSavedTimes();
  renderSavedTimes();
  if (savedWrap) {
    savedWrap.classList.remove("hidden");
  }
  stateText.textContent = `Saved ${formatTime(elapsedMs)}`;
}

function toggleTimesPanel() {
  if (!savedWrap) {
    return;
  }
  loadSavedTimes();
  renderSavedTimes();
  savedWrap.classList.toggle("hidden");
}

window.addEventListener("keydown", (event) => {
  if (cubeDialogOpen) {
    if (event.code === "Enter") {
      event.preventDefault();
      saveCubeFromDialog();
      return;
    }
    if (event.code === "Escape") {
      event.preventDefault();
      closeCubeDialog();
      return;
    }
  }

  if (event.code === "Enter") {
    event.preventDefault();
    resetTimer();
    return;
  }

  if (event.code !== "Space") {
    return;
  }
  event.preventDefault();
  toggleTimer();
});

spaceBtn.addEventListener("click", () => {
  toggleTimer();
});

resetBtn.addEventListener("click", () => {
  resetTimer();
});

if (pickCubeBtn) {
  pickCubeBtn.addEventListener("click", () => {
    pickCube();
  });
}

if (cubeSaveBtn) {
  cubeSaveBtn.addEventListener("click", () => {
    saveCubeFromDialog();
  });
}

if (cubeCancelBtn) {
  cubeCancelBtn.addEventListener("click", () => {
    closeCubeDialog();
  });
}

if (cubeDialog) {
  cubeDialog.addEventListener("click", (event) => {
    if (event.target === cubeDialog) {
      closeCubeDialog();
    }
  });
}

if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    saveCurrentTime();
  });
}

if (timesBtn) {
  timesBtn.addEventListener("click", () => {
    toggleTimesPanel();
  });
}

loadSelectedCube();
setCubeText();
loadSavedTimes();
renderSavedTimes();
if (savedWrap && savedTimes.length > 0) {
  savedWrap.classList.remove("hidden");
}
render();
