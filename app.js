const toolbarButtons = document.querySelectorAll(".toolbar-btn");
const actionPills = document.querySelectorAll(".action-pill");
const infoBtn = document.getElementById("infoBtn");
const infoDialog = document.getElementById("infoDialog");
const creditsDialog = document.getElementById("creditsDialog");
const profileDialog = document.getElementById("profileDialog");
const settingsDialog = document.getElementById("settingsDialog");
const contentPanels = document.getElementById("contentPanels");
const bgColorInput = document.getElementById("bgColorInput");
const bgColorHex = document.getElementById("bgColorHex");
const resetBgBtn = document.getElementById("resetBgBtn");
const fontSizeInput = document.getElementById("fontSizeInput");
const fontSizeLabel = document.getElementById("fontSizeLabel");
const resetFontBtn = document.getElementById("resetFontBtn");
const saveFontBtn = document.getElementById("saveFontBtn");
let fontSizeSimulation = null;

const DEFAULT_BG = "#d6f0ff";
const DEFAULT_FONT = 16;

const profileName = document.getElementById("profileName");
const profileImage = document.getElementById("profileImage");
const nameInput = document.getElementById("nameInput");
const imageInput = document.getElementById("imageInput");
const imageStatus = document.getElementById("imageStatus");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const headerProfileImage = document.getElementById("headerProfileImage");
const headerProfileName = document.getElementById("headerProfileName");
const profilePageImage = document.getElementById("profilePageImage");
const profilePageName = document.getElementById("profilePageName");
const rocketTitle = document.getElementById("rocketTitle");
const rocketIntro = document.getElementById("rocketIntro");
const rocketFacts = document.getElementById("rocketFacts");
const rocketParts = document.getElementById("rocketParts");
const rocketBlueprintHeading = document.getElementById("rocketBlueprintHeading");
const blueprintPiece1 = document.getElementById("blueprintPiece1");
const blueprintPiece2 = document.getElementById("blueprintPiece2");
const blueprintPiece3 = document.getElementById("blueprintPiece3");
const blueprintPiece4 = document.getElementById("blueprintPiece4");
const blueprintPiece5 = document.getElementById("blueprintPiece5");
const bpOutlineGroup = document.getElementById("bpOutlineGroup");
const bpBody = document.getElementById("bpBody");
const bpRightBooster = document.getElementById("bpRightBooster");
const bpLeftBooster = document.getElementById("bpLeftBooster");
const bpCoreBlock = document.getElementById("bpCoreBlock");
const bpNozzle = document.getElementById("bpNozzle");
const bpPlume = document.getElementById("bpPlume");

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' fill='#c7e8ff'/><circle cx='40' cy='30' r='14' fill='#5a9bc8'/><path d='M14 74c4-14 17-22 26-22s22 8 26 22' fill='#5a9bc8'/></svg>`
  );

// If the user refreshes while on an internal page, send them back to the landing page.
const navEntry = performance.getEntriesByType("navigation")[0];
const isReload = navEntry && navEntry.type === "reload";
const onLandingPage = window.location.pathname.toLowerCase().endsWith("/index.html") || window.location.pathname === "/";
if (isReload && !onLandingPage) {
  window.location.replace("index.html");
}

const NASA_ROCKETS = {
  "mercury-redstone": {
    name: "Mercury-Redstone",
    intro: "Mercury-Redstone launched the first US crewed suborbital missions in 1961, proving life-support and launch escape systems under real flight conditions.",
    facts: [
      "First crewed launch: Mercury-Redstone 3 (Freedom 7), 5 May 1961.",
      "Height: about 25.4 m.",
      "Single-stage liquid-fuel rocket adapted from a military Redstone missile.",
      "Carried Alan Shepard and Gus Grissom on suborbital flights.",
      "Set the baseline for later orbital Mercury missions."
    ],
    parts: [
      "Escape tower and capsule",
      "Instrument compartment",
      "Liquid oxygen and alcohol tanks",
      "Tail section and guidance fins",
      "A-7 engine section"
    ]
  },
  "atlas-lv3b": {
    name: "Atlas LV-3B",
    intro: "Atlas LV-3B launched Project Mercury orbital flights and became NASA's first operational crewed orbital launcher.",
    facts: [
      "First US crewed orbital launch vehicle.",
      "Used for Mercury-Atlas missions including John Glenn's Friendship 7.",
      "Stage-and-a-half design with booster and sustainer engines.",
      "Approximate height: 29 m.",
      "Introduced high-energy ascent profiles for orbital insertion."
    ],
    parts: [
      "Mercury capsule and escape system",
      "Pressurized thin-wall tank structure",
      "RP-1 and liquid oxygen propellant tanks",
      "Booster engine skirt and jettison section",
      "Sustainer and vernier engine cluster"
    ]
  },
  "titan-ii-glv": {
    name: "Titan II GLV",
    intro: "Titan II GLV carried Gemini crews into orbit and enabled rendezvous, EVA, and long-duration flight techniques used for Apollo.",
    facts: [
      "Launch vehicle for all Gemini crewed missions.",
      "Two-stage rocket using hypergolic propellants.",
      "Height: roughly 33 m.",
      "Supported critical orbital rendezvous and docking practice.",
      "Modified guidance and vibration damping for crew safety."
    ],
    parts: [
      "Gemini spacecraft and adapter",
      "Inertial guidance and instrument unit",
      "First-stage fuel and oxidizer tanks",
      "Interstage and second-stage tank section",
      "Dual engine propulsion section"
    ]
  },
  "saturn-i": {
    name: "Saturn I",
    intro: "Saturn I was NASA's first heavy-lift rocket family and validated clustered engines and upper-stage operations before Apollo.",
    facts: [
      "First flown in 1961 as part of Apollo program buildup.",
      "Used clustered first-stage tanks and eight H-1 engines.",
      "Height: around 55 m.",
      "Demonstrated large-payload launch capabilities.",
      "Bridge design between early test vehicles and Saturn IB/V."
    ],
    parts: [
      "Apollo boilerplate/payload adapter",
      "S-IV upper stage",
      "S-I first-stage tank cluster",
      "Interstage and control instrumentation",
      "Eight-engine thrust structure"
    ]
  },
  "saturn-ib": {
    name: "Saturn IB",
    intro: "Saturn IB launched early Apollo Earth-orbit missions and later sent crews to Skylab during the 1970s.",
    facts: [
      "Carried Apollo 7 and Skylab crewed missions.",
      "First stage: S-IB with eight H-1 engines.",
      "Second stage: S-IVB with a single J-2 engine.",
      "Height: about 68 m.",
      "Delivered crewed spacecraft to low Earth orbit."
    ],
    parts: [
      "Apollo command-service spacecraft",
      "Instrument unit and guidance ring",
      "S-IVB liquid hydrogen/oxygen stage",
      "S-IB clustered first stage",
      "Engine and aft skirt section"
    ]
  },
  "saturn-v": {
    name: "Saturn V",
    intro: "Saturn V powered Apollo lunar missions and remains one of the most powerful operational launch vehicles ever flown.",
    facts: [
      "Height: about 110.6 m.",
      "Total thrust at liftoff: roughly 7.6 million pounds-force.",
      "Launched Apollo crews to the Moon from 1968 to 1972.",
      "Three-stage architecture: S-IC, S-II, and S-IVB.",
      "Also launched Skylab in 1973."
    ],
    parts: [
      "Apollo spacecraft and launch escape tower",
      "S-IVB third stage",
      "S-II second stage",
      "Interstage and avionics instrumentation",
      "S-IC first stage with five F-1 engines"
    ]
  },
  "space-shuttle": {
    name: "Space Shuttle Stack",
    intro: "NASA's Space Shuttle stack combined an orbiter, external tank, and solid boosters for reusable crew and cargo missions to low Earth orbit.",
    facts: [
      "Operational period: 1981 to 2011.",
      "Stack included orbiter, external tank, and two SRBs.",
      "Delivered and serviced payloads including ISS modules and Hubble missions.",
      "SRBs were recovered and refurbished after launch.",
      "Main engines burned liquid hydrogen and oxygen from the external tank."
    ],
    parts: [
      "Orbiter nose and payload bay",
      "Crew module and avionics deck",
      "External tank (LH2/LOX)",
      "Twin solid rocket boosters",
      "Orbiter main engine cluster"
    ]
  },
  "ares-i-x": {
    name: "Ares I-X",
    intro: "Ares I-X was a 2009 NASA test flight that validated aerodynamics and control concepts for the planned Constellation crew launcher.",
    facts: [
      "Single developmental test flight in October 2009.",
      "Used a four-segment SRB first stage with simulator hardware above.",
      "Collected high-value ascent and loads data.",
      "Approximate vehicle height: 99.6 m.",
      "Provided guidance for later SLS-era engineering tradeoffs."
    ],
    parts: [
      "Crew module and launch abort simulator",
      "Upper stage simulator",
      "Avionics and roll-control section",
      "Interstage adapter hardware",
      "First-stage solid rocket motor"
    ]
  },
  "sls-block-1": {
    name: "SLS Block 1",
    intro: "Space Launch System Block 1 is NASA's current deep-space launch vehicle family used for Artemis missions beyond low Earth orbit.",
    facts: [
      "First launch: Artemis I in November 2022.",
      "Core stage uses four RS-25 engines.",
      "Two five-segment solid rocket boosters provide most liftoff thrust.",
      "Upper stage for Block 1 is the Interim Cryogenic Propulsion Stage.",
      "Designed for Orion missions to lunar and deep-space trajectories."
    ],
    parts: [
      "Orion spacecraft and launch abort system",
      "Interim Cryogenic Propulsion Stage",
      "Core stage liquid hydrogen and oxygen tanks",
      "Twin five-segment solid boosters",
      "RS-25 engine section and aft skirt"
    ]
  }
};

const BLUEPRINT_PRESETS = {
  default: {
    body: "M310 72 C284 98 270 142 270 220 V310 C270 386 286 430 310 456 C334 430 350 386 350 310 V220 C350 142 336 98 310 72 Z",
    right: "M350 220 C366 230 384 248 396 273 C412 308 412 358 398 387",
    left: "M270 220 C254 230 236 248 224 273 C208 308 208 358 222 387",
    core: { x: "288", y: "302", width: "44", height: "76", rx: "8" },
    nozzle: "M292 456 L282 490 L338 490 L328 456 Z",
    plume: { cx: "310", cy: "490", rx: "28", ry: "7" },
    stroke: "rgba(184, 220, 255, 0.74)",
    plumeFill: "rgba(124, 194, 255, 0.22)",
  },
  slim: {
    body: "M310 44 C296 72 290 132 290 246 V336 C290 404 298 448 310 482 C322 448 330 404 330 336 V246 C330 132 324 72 310 44 Z",
    right: "M330 246 C346 258 354 278 358 306 C364 344 362 370 356 392",
    left: "M290 246 C274 258 266 278 262 306 C256 344 258 370 264 392",
    core: { x: "297", y: "332", width: "26", height: "92", rx: "8" },
    nozzle: "M298 482 L292 510 L328 510 L322 482 Z",
    plume: { cx: "310", cy: "510", rx: "18", ry: "5" },
    stroke: "rgba(165, 232, 255, 0.76)",
    plumeFill: "rgba(131, 218, 255, 0.24)",
  },
  heavy: {
    body: "M310 66 C282 90 266 142 266 228 V318 C266 390 286 436 310 462 C334 436 354 390 354 318 V228 C354 142 338 90 310 66 Z",
    right: "M354 172 L392 172 L402 430 L366 430 Z",
    left: "M266 172 L228 172 L218 430 L254 430 Z",
    core: { x: "286", y: "294", width: "48", height: "94", rx: "4" },
    nozzle: "M292 462 L278 506 L342 506 L328 462 Z",
    plume: { cx: "310", cy: "508", rx: "36", ry: "9" },
    stroke: "rgba(207, 229, 255, 0.78)",
    plumeFill: "rgba(142, 184, 255, 0.23)",
  },
  shuttle: {
    body: "M310 118 C294 138 286 176 286 230 V288 C286 330 296 356 310 374 C324 356 334 330 334 288 V230 C334 176 326 138 310 118 Z",
    right: "M334 224 L418 286 L404 328 L334 296 Z",
    left: "M286 224 L202 286 L216 328 L286 296 Z",
    core: { x: "296", y: "264", width: "28", height: "68", rx: "6" },
    nozzle: "M298 374 L290 404 L330 404 L322 374 Z",
    plume: { cx: "310", cy: "412", rx: "24", ry: "6" },
    stroke: "rgba(201, 246, 255, 0.8)",
    plumeFill: "rgba(132, 228, 255, 0.24)",
  },
  tall: {
    body: "M310 34 C300 62 296 122 296 248 V348 C296 418 302 456 310 492 C318 456 324 418 324 348 V248 C324 122 320 62 310 34 Z",
    right: "M324 256 L346 272 L350 412 L332 412 Z",
    left: "M296 256 L274 272 L270 412 L288 412 Z",
    core: { x: "300", y: "342", width: "20", height: "106", rx: "6" },
    nozzle: "M301 492 L294 514 L326 514 L319 492 Z",
    plume: { cx: "310", cy: "516", rx: "16", ry: "4" },
    stroke: "rgba(189, 238, 255, 0.78)",
    plumeFill: "rgba(130, 221, 255, 0.24)",
  },
};

function applyRocketBlueprintShape(rocketKey) {
  if (!bpBody || !bpRightBooster || !bpLeftBooster || !bpCoreBlock || !bpNozzle || !bpPlume) {
    return;
  }

  let presetKey = "default";
  if (["mercury-redstone", "atlas-lv3b", "titan-ii-glv"].includes(rocketKey)) {
    presetKey = "slim";
  } else if (["saturn-i", "saturn-ib", "saturn-v", "sls-block-1"].includes(rocketKey)) {
    presetKey = "heavy";
  } else if (rocketKey === "space-shuttle") {
    presetKey = "shuttle";
  } else if (rocketKey === "ares-i-x") {
    presetKey = "tall";
  }

  const preset = BLUEPRINT_PRESETS[presetKey] || BLUEPRINT_PRESETS.default;

  bpBody.setAttribute("d", preset.body);
  bpRightBooster.setAttribute("d", preset.right);
  bpLeftBooster.setAttribute("d", preset.left);
  bpCoreBlock.setAttribute("x", preset.core.x);
  bpCoreBlock.setAttribute("y", preset.core.y);
  bpCoreBlock.setAttribute("width", preset.core.width);
  bpCoreBlock.setAttribute("height", preset.core.height);
  bpCoreBlock.setAttribute("rx", preset.core.rx);
  bpNozzle.setAttribute("d", preset.nozzle);
  bpPlume.setAttribute("cx", preset.plume.cx);
  bpPlume.setAttribute("cy", preset.plume.cy);
  bpPlume.setAttribute("rx", preset.plume.rx);
  bpPlume.setAttribute("ry", preset.plume.ry);

  if (bpOutlineGroup) {
    bpOutlineGroup.setAttribute("stroke", preset.stroke);
  }
  bpPlume.setAttribute("fill", preset.plumeFill);
}

function renderRocketDetailPage() {
  if (!rocketTitle || !rocketIntro || !rocketFacts || !rocketParts) {
    return;
  }

  const query = new URLSearchParams(window.location.search);
  const rocketKey = query.get("rocket") || "saturn-v";
  const rocket = NASA_ROCKETS[rocketKey] || NASA_ROCKETS["saturn-v"];

  document.title = `Glex | ${rocket.name}`;
  rocketTitle.textContent = rocket.name;
  rocketIntro.textContent = rocket.intro;
  if (rocketBlueprintHeading) {
    rocketBlueprintHeading.textContent = `Blueprint: ${rocket.name}`;
  }

  rocketFacts.innerHTML = "";
  rocket.facts.forEach((fact) => {
    const li = document.createElement("li");
    li.textContent = fact;
    rocketFacts.appendChild(li);
  });

  rocketParts.innerHTML = "";
  rocket.parts.forEach((part) => {
    const li = document.createElement("li");
    li.textContent = part;
    rocketParts.appendChild(li);
  });

  if (blueprintPiece1) blueprintPiece1.textContent = `1. ${rocket.parts[0] || "Payload section"}`;
  if (blueprintPiece2) blueprintPiece2.textContent = `2. ${rocket.parts[1] || "Guidance section"}`;
  if (blueprintPiece3) blueprintPiece3.textContent = `3. ${rocket.parts[2] || "Tank section"}`;
  if (blueprintPiece4) blueprintPiece4.textContent = `4. ${rocket.parts[3] || "Booster/interstage"}`;
  if (blueprintPiece5) blueprintPiece5.textContent = `5. ${rocket.parts[4] || "Engine section"}`;
  applyRocketBlueprintShape(rocketKey);
}

function setActivePanel(section) {
  const panelMap = {
    learn: "panel-rockets",
    boats: "panel-boats",
    drones: "panel-drones"
  };

  const targetId = panelMap[section] || "panel-rockets";
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });
}

function openDialog(dialog) {
  if (dialog && typeof dialog.showModal === "function") {
    if (!dialog.open) {
      document.body.classList.add("modal-open");
      dialog.showModal();
    }
  }
}

function scrollToPanels() {
  if (contentPanels) {
    contentPanels.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function runAction(action) {
  if (action === "learn" || action === "boats" || action === "drones") {
    const pageMap = {
      learn: "rockets.html",
      boats: "boats.html",
      drones: "drones.html"
    };

    window.location.href = pageMap[action] || "rockets.html";
    return;
  }

  if (action === "credits") {
    openDialog(creditsDialog);
    return;
  }

  if (action === "profile") {
    openDialog(profileDialog);
  }

  if (action === "settings") {
    openDialog(settingsDialog);
  }
}

function loadProfile() {
  const savedName = localStorage.getItem("glex.profile.name") || "Pilot";
  const savedImage = localStorage.getItem("glex.profile.image") || DEFAULT_AVATAR;

  if (profileName) profileName.textContent = savedName;
  if (profileImage) profileImage.src = savedImage;
  if (nameInput) nameInput.value = savedName;
  if (headerProfileImage) headerProfileImage.src = savedImage;
  if (headerProfileName) headerProfileName.textContent = savedName;
  if (profilePageImage) profilePageImage.src = savedImage;
  if (profilePageName) profilePageName.textContent = savedName;
  if (imageStatus) {
    imageStatus.textContent =
      savedImage !== DEFAULT_AVATAR ? "Picture selected and saved" : "No picture chosen yet";
  }
}

function persistProfile() {
  if (!nameInput) {
    return;
  }

  const newName = nameInput.value.trim() || "Pilot";
  if (profileName) profileName.textContent = newName;
  if (headerProfileName) headerProfileName.textContent = newName;
  if (profilePageName) profilePageName.textContent = newName;
  const currentImage = profileImage ? profileImage.src : DEFAULT_AVATAR;
  if (headerProfileImage) headerProfileImage.src = currentImage;
  if (profilePageImage) profilePageImage.src = currentImage;
  localStorage.setItem("glex.profile.name", newName);
  if (profileDialog) {
    profileDialog.close();
  } else {
    window.location.href = "home.html";
  }
}

toolbarButtons.forEach((button) => {
  button.addEventListener("click", () => {
    runAction(button.dataset.action);
  });
});

actionPills.forEach((button) => {
  button.addEventListener("click", () => {
    runAction(button.dataset.action);
  });
});

if (infoBtn) {
  infoBtn.addEventListener("click", () => openDialog(infoDialog));
}

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.getAttribute("data-close");
    const dialog = document.getElementById(id);
    if (dialog) {
      if (id === "settingsDialog") {
        applyFontSize(committedFontSize);
      }
      dialog.close();
    }
  });
});

if (settingsDialog) {
  settingsDialog.addEventListener("close", () => {
    applyFontSize(committedFontSize);
    if (!document.querySelector("dialog[open]")) {
      document.body.classList.remove("modal-open");
    }
  });
}

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("close", () => {
    if (!document.querySelector("dialog[open]")) {
      document.body.classList.remove("modal-open");
    }
  });
});

if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", persistProfile);
}

if (imageInput) {
  imageInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (imageStatus) imageStatus.textContent = "No picture chosen yet";
      return;
    }

    if (imageStatus) imageStatus.textContent = `Picture selected: ${file.name}`;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || DEFAULT_AVATAR);
      if (profileImage) profileImage.src = dataUrl;
      if (headerProfileImage) headerProfileImage.src = dataUrl;
      if (profilePageImage) profilePageImage.src = dataUrl;
      if (imageStatus) imageStatus.textContent = `Picture selected: ${file.name}`;
      localStorage.setItem("glex.profile.image", dataUrl);
    };
    reader.readAsDataURL(file);
  });
}

loadProfile();
setActivePanel("learn");
renderRocketDetailPage();

function updateScrollBackgroundEffects() {
  document.body.classList.toggle("hide-launch-glow", window.scrollY > 80);
}

updateScrollBackgroundEffects();
window.addEventListener("scroll", updateScrollBackgroundEffects, { passive: true });

function initScrollReveal() {
  const revealTargets = document.querySelectorAll(".fun-facts-group, .nasa-archive-section");
  if (!revealTargets.length) {
    return;
  }

  const elementsToObserve = [];

  revealTargets.forEach((el, index) => {
    const rect = el.getBoundingClientRect();
    const startsVisible = rect.top < window.innerHeight;

    if (startsVisible) {
      el.classList.add("is-visible");
      return;
    }

    el.classList.add("scroll-reveal");
    el.style.transitionDelay = `${Math.min(index * 70, 210)}ms`;
    elementsToObserve.push(el);
  });

  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  if (!elementsToObserve.length) {
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  elementsToObserve.forEach((el) => revealObserver.observe(el));
}

initScrollReveal();

// Background colour settings
function applyBgColor(color) {
  if (
    document.body.classList.contains("earth-home") ||
    document.body.classList.contains("mars-landing") ||
    document.body.classList.contains("space-theme")
  ) {
    return;
  }

  document.body.style.background = color;
  if (bgColorInput) bgColorInput.value = color;
  if (bgColorHex) bgColorHex.textContent = color;
}

const savedBg = localStorage.getItem("glex.bg") || DEFAULT_BG;
applyBgColor(savedBg);

// Font size settings
function applyFontSize(size) {
  document.documentElement.style.fontSize = size + "px";
  if (fontSizeInput) fontSizeInput.value = size;
  if (fontSizeLabel) fontSizeLabel.textContent = size + "px";
  if (fontSizeSimulation) {
    fontSizeSimulation.style.fontSize = size + "px";
    fontSizeSimulation.textContent = `Simulation ${size}px`;
  }
}

function ensureTextSizeSimulation() {
  if (!settingsDialog) {
    return null;
  }

  const existing = settingsDialog.querySelector(".text-size-simulation");
  if (existing) {
    settingsDialog.appendChild(existing);
    return existing;
  }

  const marker = document.createElement("div");
  marker.className = "text-size-simulation";
  marker.setAttribute("aria-live", "polite");
  marker.textContent = "Simulation";
  settingsDialog.appendChild(marker);
  return marker;
}

const savedFont = parseInt(localStorage.getItem("glex.fontSize") || DEFAULT_FONT, 10);
fontSizeSimulation = ensureTextSizeSimulation();
applyFontSize(savedFont);

let committedFontSize = savedFont;
let draftFontSize = savedFont;

if (settingsDialog) {
  settingsDialog.addEventListener("show", () => {
    draftFontSize = committedFontSize;
    applyFontSize(committedFontSize);
  });

  settingsDialog.addEventListener("cancel", () => {
    draftFontSize = committedFontSize;
    applyFontSize(committedFontSize);
  });
}

if (fontSizeInput) {
  fontSizeInput.addEventListener("input", () => {
    const size = parseInt(fontSizeInput.value, 10);
    draftFontSize = size;
    applyFontSize(draftFontSize);
  });
}

if (resetFontBtn) {
  resetFontBtn.addEventListener("click", () => {
    draftFontSize = DEFAULT_FONT;
    applyFontSize(draftFontSize);
  });
}

if (saveFontBtn) {
  saveFontBtn.addEventListener("click", () => {
    committedFontSize = draftFontSize;
    if (committedFontSize === DEFAULT_FONT) {
      localStorage.removeItem("glex.fontSize");
    } else {
      localStorage.setItem("glex.fontSize", committedFontSize);
    }
    applyFontSize(committedFontSize);
    window.location.href = "home.html";
  });
}

if (bgColorInput) {
  bgColorInput.addEventListener("input", () => {
    const color = bgColorInput.value;
    if (bgColorHex) bgColorHex.textContent = color;
    if (
      !document.body.classList.contains("earth-home") &&
      !document.body.classList.contains("mars-landing") &&
      !document.body.classList.contains("space-theme")
    ) {
      document.body.style.background = color;
    }
    localStorage.setItem("glex.bg", color);
  });
}

if (resetBgBtn) {
  resetBgBtn.addEventListener("click", () => {
    localStorage.removeItem("glex.bg");
    applyBgColor(DEFAULT_BG);
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // Ignore registration errors for local file previews.
    });
  });
}
