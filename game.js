(() => {
  "use strict";

  const T = window.GORILLA_TEXT;
  const C = window.GORILLA_CONFIG;
  const S = window.GORILLA_SCENES;
  const F = window.GORILLA_FLOW;
  const $ = (id) => document.getElementById(id);

  if (!T || !C || !S || !F) {
    document.body.innerHTML = "<p style='padding:24px;color:white'>ゲームデータを読み込めませんでした。ファイルをすべて同じ場所へアップロードしてください。</p>";
    return;
  }

  const game = $("game");
  const stage = $("stage");
  const backdrop = $("backdrop");
  const standingLayer = $("standingLayer");
  const standingImage = $("standingImage");
  const flash = $("flash");
  const curtain = $("chapterCurtain");
  const alertBox = $("systemAlert");
  const collectionBtn = $("collectionBtn");
  const meter = $("gorillaMeter");
  const brand = $("brand");
  const modal = $("modalLayer");
  const autoBtn = $("autoBtn");
  const skipBtn = $("skipBtn");
  const logBtn = $("logBtn");
  const menuBtn = $("menuBtn");

  const storage = {
    get(key, fallback = null) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* Storage can be unavailable in private browsing. */
      }
    }
  };

  let textTimer = null;
  let autoTimer = null;
  let chapterTimer = null;
  let alertTimer = null;
  let lastChapter = null;
  let previousLevel = 0;
  let autoMode = false;
  let skipMode = false;
  let currentScreen = "title";
  let reactionAdvance = null;
  let currentResumeState = null;
  let audioContext = null;
  let settings = loadSettings();
  let state = freshState();

  const MAX_GORILLA = maxGorilla(F.startNode);

  function freshState() {
    const score = {};
    C.scoreKeys.forEach((key) => { score[key] = 0; });
    return {
      name: "ハニー",
      nodeId: F.startNode,
      score,
      flags: {},
      history: [],
      log: [],
      ending: null
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function asHtml(value) {
    return esc(value).replace(/\n/g, "<br>");
  }

  function replaceName(value) {
    return String(value ?? "")
      .replaceAll("{name}", state.name)
      .replaceAll("○○", state.name)
      .replaceAll("ハニー", state.name);
  }

  function template(value, replacements) {
    let output = value;
    Object.entries(replacements).forEach(([key, replacement]) => {
      output = output.replaceAll(`{${key}}`, replacement);
    });
    return output;
  }

  function loadSettings() {
    return { ...C.defaultSettings, ...storage.get(C.settingsKey, {}) };
  }

  function saveSettings() {
    storage.set(C.settingsKey, settings);
  }

  function foundEndings() {
    const value = storage.get(C.storageKey, []);
    return Array.isArray(value) ? value.filter((id) => C.endingOrder.includes(id)) : [];
  }

  function seenNodes() {
    const value = storage.get(C.seenKey, []);
    return new Set(Array.isArray(value) ? value : []);
  }

  function markSeen(id) {
    const values = seenNodes();
    values.add(id);
    storage.set(C.seenKey, [...values]);
  }

  function saveEnding(id) {
    const endings = foundEndings();
    const isNew = !endings.includes(id);
    if (isNew) {
      endings.push(id);
      storage.set(C.storageKey, endings);
    }
    return isNew;
  }

  function saveScene(saveState = state) {
    return storage.set(C.saveKey, {
      version: C.version,
      state: clone(saveState),
      lastChapter,
      previousLevel
    });
  }

  function hasSave() {
    return Boolean(storage.get(C.saveKey));
  }

  function normalizeLoadedState(candidate) {
    if (!candidate || !F.nodes[candidate.nodeId]) return null;
    const base = freshState();
    return {
      ...base,
      ...candidate,
      name: String(candidate.name || "ハニー").slice(0, 12),
      score: { ...base.score, ...(candidate.score || {}) },
      flags: { ...(candidate.flags || {}) },
      history: Array.isArray(candidate.history) ? candidate.history : [],
      log: Array.isArray(candidate.log) ? candidate.log.slice(-120) : []
    };
  }

  function loadGame() {
    const data = storage.get(C.saveKey);
    const loaded = normalizeLoadedState(data?.state);
    if (!loaded) {
      notify("セーブデータを読み込めませんでした");
      return false;
    }
    state = loaded;
    lastChapter = data.lastChapter || null;
    previousLevel = Number(data.previousLevel) || 0;
    playSound("open");
    renderNode(state.nodeId, { skipCurtain: true });
    return true;
  }

  function maxGorilla(id, memo = new Map()) {
    if (memo.has(id)) return memo.get(id);
    const node = F.nodes[id];
    if (!node) return 0;
    let best = 0;
    memo.set(id, 0);
    Object.values(node.choices).forEach((action) => {
      const own = Number(action.score?.gorilla || 0);
      const total = action.end ? own : own + maxGorilla(action.next, memo);
      best = Math.max(best, total);
    });
    memo.set(id, best);
    return best;
  }

  function gorillaLevel() {
    if (!MAX_GORILLA) return 0;
    return Math.min(100, Math.round((state.score.gorilla / MAX_GORILLA) * 100));
  }

  function updateGameStateUI() {
    const level = gorillaLevel();
    meter.hidden = level < 15 || currentScreen === "title" || currentScreen === "collection";
    meter.textContent = `GORILLA ${level}%`;
    meter.setAttribute("aria-label", `ゴリラレベル ${level}パーセント`);
    game.classList.toggle("gorilla-awake", level >= 80);
    brand.textContent = level >= 80 ? "GORILLA SYSTEM" : T.ui.brand;

    if (level > previousLevel && !meter.hidden) {
      meter.classList.remove("level-up");
      void meter.offsetWidth;
      meter.classList.add("level-up");
    }
    previousLevel = level;
  }

  function setMode(...classes) {
    game.className = ["game-shell", ...classes].join(" ");
  }

  function setBackground(key, position = "center") {
    const src = S.backgrounds[key];
    backdrop.style.backgroundImage = src ? `url("${src}")` : "";
    backdrop.style.backgroundPosition = position;
  }

  function standingConfig(key, backgroundKey, nodeId) {
    const gymConfig = backgroundKey === "gym" ? S.gymStanding?.[nodeId] : null;
    return gymConfig || S.standing[key];
  }

  function showStandingConfig(config) {
    standingImage.classList.remove("show");
    if (!config) {
      standingLayer.hidden = true;
      standingImage.removeAttribute("src");
      return;
    }
    standingLayer.hidden = false;
    standingImage.src = config.src;
    standingImage.style.left = `${config.x || 50}%`;
    standingImage.style.bottom = `${100 - (config.y || 100)}%`;
    standingImage.style.transform = `translateX(-50%) scale(${config.scale || 1})`;
    standingImage.style.filter = `${config.filter || "none"} drop-shadow(0 22px 34px rgba(0,0,0,.44))`;
    requestAnimationFrame(() => requestAnimationFrame(() => standingImage.classList.add("show")));
  }

  function showStanding(key, backgroundKey, nodeId) {
    showStandingConfig(standingConfig(key, backgroundKey, nodeId));
  }

  function showOpeningStanding(screen) {
    showStandingConfig(S.openingStanding?.[screen]);
  }

  function hideStanding() {
    standingImage.classList.remove("show");
    standingLayer.hidden = true;
  }

  function notify(message, duration = 1000) {
    clearTimeout(alertTimer);
    alertBox.innerHTML = asHtml(message);
    alertBox.classList.add("on");
    alertTimer = setTimeout(() => alertBox.classList.remove("on"), duration);
  }

  function stopTextTimers() {
    clearInterval(textTimer);
    clearTimeout(autoTimer);
    textTimer = null;
    autoTimer = null;
  }

  function clearChapterTimer() {
    clearTimeout(chapterTimer);
    chapterTimer = null;
    curtain.classList.remove("show");
    curtain.hidden = true;
  }

  function appendLog(speaker, text) {
    state.log.push({ speaker, text: replaceName(text) });
    if (state.log.length > 120) state.log.shift();
  }

  function typeText(element, rawText, onDone, instant = false) {
    stopTextTimers();
    const characters = [...replaceName(rawText)];
    let index = 0;
    let finished = false;
    element.textContent = "";
    element.classList.add("typing");

    const finish = () => {
      if (finished) return;
      finished = true;
      clearInterval(textTimer);
      textTimer = null;
      element.textContent = characters.join("");
      element.classList.remove("typing");
      onDone?.();
    };

    element._finishTyping = finish;
    if (instant || settings.textSpeed <= 8) {
      finish();
      return;
    }

    textTimer = setInterval(() => {
      if (index >= characters.length) {
        finish();
        return;
      }
      element.textContent += characters[index];
      index += 1;
    }, Math.max(8, Number(settings.textSpeed) || 24));
  }

  function tapToFinish(container, element) {
    container.addEventListener("click", (event) => {
      if (event.target.closest("button,a,input,textarea,[data-choice]")) return;
      if (element.classList.contains("typing")) {
        playSound("tap");
        element._finishTyping?.();
      }
    });
  }

  function showChapter(chapter, title, callback, skipCurtain = false) {
    clearChapterTimer();
    if (skipCurtain || !chapter || chapter === lastChapter) {
      callback();
      return;
    }
    lastChapter = chapter;
    curtain.hidden = false;
    curtain.innerHTML = `<div class="cc-kicker">${esc(chapter)}</div><div class="cc-title">${esc(title)}</div>`;
    requestAnimationFrame(() => curtain.classList.add("show"));
    playSound("chapter");
    chapterTimer = setTimeout(() => {
      curtain.classList.remove("show");
      chapterTimer = setTimeout(() => {
        curtain.hidden = true;
        callback();
      }, 260);
    }, 780);
  }

  function renderTitle() {
    stopTextTimers();
    clearChapterTimer();
    closeModal();
    currentScreen = "title";
    currentResumeState = null;
    autoMode = false;
    skipMode = false;
    syncToggles();
    state = freshState();
    lastChapter = null;
    previousLevel = 0;
    setMode("title-mode");
    setBackground("cityDay", "center");
    showOpeningStanding("title");
    meter.hidden = true;
    brand.textContent = T.ui.brand;

    const found = foundEndings().length;
    stage.innerHTML = `
      <section class="title-screen" aria-labelledby="gameTitle">
        <div class="title-kicker">${esc(T.ui.titleKicker)}</div>
        <div class="title-logo" id="gameTitle" aria-label="KUNIO STORY V2.0">
          <span class="title-logo-kunio">KUNIO</span>
          <span class="title-logo-story">STORY <b>V2.0</b></span>
          <i></i>
        </div>
        <h1>${asHtml(T.ui.title)}</h1>
        <p class="title-lead">${asHtml(T.ui.lead)}</p>
        <div class="title-progress" aria-label="エンディング回収数 ${found}/${C.endingOrder.length}">
          <span>END COLLECTION</span><strong>${found}/${C.endingOrder.length}</strong>
        </div>
        <div class="title-actions">
          <button id="newBtn" class="game-btn primary" type="button">${esc(T.ui.start)}</button>
          ${hasSave() ? `<button id="continueBtn" class="game-btn continue" type="button">${esc(T.ui.continueGame)}</button>` : ""}
          <button id="titleCollection" class="game-btn ghost" type="button">${esc(T.ui.collection)}</button>
        </div>
      </section>`;

    $("newBtn").onclick = () => {
      playSound("select");
      renderNameEntry();
    };
    if ($("continueBtn")) $("continueBtn").onclick = loadGame;
    $("titleCollection").onclick = () => {
      playSound("open");
      renderCollection();
    };
  }

  function renderNameEntry() {
    currentScreen = "name";
    currentResumeState = null;
    setMode("name-mode");
    setBackground("cityDay");
    showOpeningStanding("name");
    stage.innerHTML = `
      <section class="menu-card name-card" aria-labelledby="nameQuestion">
        <div class="kicker">${esc(T.ui.nameKicker)}</div>
        <h2 id="nameQuestion">${esc(T.ui.nameQuestion)}</h2>
        <p class="muted">${esc(T.ui.nameHelp)}</p>
        <label class="sr-only" for="nameInput">ゲーム内で呼ばれたい名前</label>
        <input id="nameInput" class="name-input" maxlength="12" autocomplete="off" enterkeyhint="done" placeholder="${esc(T.ui.namePlaceholder)}">
        <div class="actions">
          <button id="nameSubmit" class="game-btn primary" type="button">${esc(T.ui.nameSubmit)}</button>
          <button id="nameSkip" class="game-btn ghost" type="button">${esc(T.ui.nameSkip)}</button>
          <button id="nameBack" class="text-btn" type="button">← TITLE</button>
        </div>
      </section>`;

    const input = $("nameInput");
    const start = () => {
      state = freshState();
      state.name = input.value.trim().slice(0, 12) || "ハニー";
      playSound("select");
      renderNode(F.startNode);
    };
    $("nameSubmit").onclick = start;
    $("nameSkip").onclick = () => {
      input.value = "";
      start();
    };
    $("nameBack").onclick = renderTitle;
    input.onkeydown = (event) => {
      if (event.key === "Enter") start();
    };
  }

  function dynamicText(id, text) {
    if (id !== "gap_scene") return text;
    if (state.flags.gymRoute) return `${text}\n\n筋トレ中とは違う静かな表情に、少しだけドキッとする。`;
    if (state.flags.pokecaRoute) return `${text}\n\nカードを語っていた時とのギャップが大きい。`;
    if (state.flags.weirdRoute) return `${text}\n\n変なことほど確認を怠らない。その真面目さが少し意外だった。`;
    return text;
  }

  function renderNode(id, options = {}) {
    const flowNode = F.nodes[id];
    const textNode = T.nodes[id];
    if (!flowNode || !textNode) {
      notify("シーンデータを読み込めませんでした");
      renderTitle();
      return;
    }

    stopTextTimers();
    closeModal();
    currentScreen = "scene";
    currentResumeState = null;
    state.nodeId = id;
    setMode("play-mode");
    updateGameStateUI();
    saveScene();
    showChapter(textNode.chapter, textNode.title, () => renderScene(id, flowNode, textNode), options.skipCurtain);
  }

  function renderScene(id, flowNode, textNode) {
    setBackground(flowNode.background);
    showStanding(flowNode.standing, flowNode.background, id);
    const choices = Object.keys(flowNode.choices).map((choiceId, index) => `
      <button class="choice" type="button" data-choice="${choiceId}" aria-label="選択肢${index + 1}：${esc(textNode.choices[choiceId])}">
        <span class="choice-number">${String(index + 1).padStart(2, "0")}</span>
        <span>${esc(textNode.choices[choiceId])}</span>
      </button>`).join("");

    stage.innerHTML = `
      <section class="vn-box" aria-labelledby="sceneTitle">
        <div class="vn-nameplate">${esc(textNode.speaker)}</div>
        <div class="vn-chapter" id="sceneTitle">${esc(textNode.chapter)} · ${esc(textNode.title)}</div>
        <div id="dialogueText" class="vn-dialogue"></div>
        <div id="tapHint" class="vn-tap" aria-hidden="true">
          <span class="tap-label">TAP</span><span class="advance-icon"><i></i></span>
        </div>
        <div id="choiceStack" class="choice-stack">${choices}</div>
      </section>`;

    const dialogue = $("dialogueText");
    const choiceStack = $("choiceStack");
    const hint = $("tapHint");
    const raw = dynamicText(id, textNode.text);
    const alreadySeen = seenNodes().has(id);
    appendLog(textNode.speaker, raw);
    typeText(dialogue, raw, () => {
      markSeen(id);
      hint.classList.add("select-mode");
      hint.querySelector(".tap-label").textContent = "SELECT";
      choiceStack.classList.add("show");
      choiceStack.querySelector("button")?.focus({ preventScroll: true });
    }, skipMode && alreadySeen);
    tapToFinish(stage, dialogue);
    stage.querySelectorAll("[data-choice]").forEach((button) => {
      button.onclick = () => choose(id, button.dataset.choice, button);
    });
  }

  function applyAction(action) {
    Object.entries(action.score || {}).forEach(([key, value]) => {
      state.score[key] = (state.score[key] || 0) + value;
    });
    Object.assign(state.flags, action.flags || {});
  }

  function choose(id, choiceId, button) {
    if (currentScreen !== "scene") return;
    stopTextTimers();
    const action = F.nodes[id].choices[choiceId];
    const textNode = T.nodes[id];
    if (!action) return;

    const before = {
      nodeId: id,
      score: clone(state.score),
      flags: clone(state.flags),
      logLength: Math.max(0, state.log.length - 1)
    };
    currentResumeState = clone(state);
    state.history.push({ nodeId: id, choiceId, before });
    applyAction(action);
    currentScreen = "reaction";
    stage.querySelectorAll(".choice").forEach((element) => { element.disabled = true; });
    button.classList.add("selected");
    playSound("select");
    if (navigator.vibrate && settings.seVolume > 0) navigator.vibrate(12);
    updateGameStateUI();
    if (gorillaLevel() >= 80) notify(T.ui.gorillaWarning, 1250);
    setTimeout(() => renderReaction(id, choiceId, action, textNode), 190);
  }

  function renderReaction(id, choiceId, action, textNode) {
    const reaction = textNode.reactions[choiceId];
    appendLog("くにお", reaction);
    stage.innerHTML = `
      <section class="vn-box reaction-box" aria-label="くにおのリアクション">
        <div class="vn-nameplate accent">くにお</div>
        <div class="vn-chapter">REACTION</div>
        <div id="reactionText" class="vn-dialogue"></div>
        <div id="reactionTapHint" class="vn-tap" aria-hidden="true">
          <span class="tap-label">TAP</span><span class="advance-icon"><i></i></span>
        </div>
        <button id="reactionContinue" class="reaction-continue" type="button" disabled>
          <span>続ける</span><i aria-hidden="true"></i>
        </button>
      </section>`;

    const dialogue = $("reactionText");
    const continueButton = $("reactionContinue");
    let ready = false;
    let moving = false;

    const advance = () => {
      if (!ready || moving) return;
      moving = true;
      reactionAdvance = null;
      stopTextTimers();
      playSound("tap");
      flash.classList.add("on");
      setTimeout(() => {
        if (action.end) resolveEnding();
        else renderNode(action.next);
        setTimeout(() => flash.classList.remove("on"), 90);
      }, 230);
    };

    reactionAdvance = advance;
    const alreadySeen = seenNodes().has(`${id}:${choiceId}:reaction`);
    typeText(dialogue, reaction, () => {
      ready = true;
      continueButton.disabled = false;
      continueButton.classList.add("show");
      $("reactionTapHint").classList.add("ready");
      markSeen(`${id}:${choiceId}:reaction`);
      if (autoMode) autoTimer = setTimeout(advance, Number(settings.autoDelay) || 1150);
    }, skipMode && alreadySeen);
    tapToFinish(stage, dialogue);
    continueButton.onclick = (event) => {
      event.stopPropagation();
      advance();
    };
    stage.querySelector(".reaction-box").onclick = (event) => {
      if (event.target.closest("button,a")) return;
      if (dialogue.classList.contains("typing")) dialogue._finishTyping?.();
      else advance();
    };
  }

  function determineEnding(currentState = state) {
    const score = currentState.score;
    const flags = currentState.flags;
    if (score.gorilla >= MAX_GORILLA) return "true";
    if (flags.collarInterest && flags.weirdRoute && score.chaos >= 8 && score.trust >= 5) return "collar";
    if (flags.arm && score.love >= 7) return "armLove";
    if (flags.weirdRoute && score.dark >= 7 && score.trust >= 5) return "dark";
    if (flags.gymRoute && score.muscle >= 6) return "muscle";
    if (flags.pokecaRoute) return "pokeca";
    if (score.love >= 10 && score.trust >= 9) return "love";
    return "normal";
  }

  function resolveEnding() {
    currentResumeState = null;
    storage.remove(C.saveKey);
    const endingId = determineEnding();
    state.ending = endingId;
    if (endingId === "true") renderSecretWarning();
    else renderEnding(endingId);
  }

  function renderSecretWarning() {
    currentScreen = "secret";
    stopTextTimers();
    hideStanding();
    setBackground("gorillaPhoto", "center 30%");
    setMode("event-mode", "gorilla-awake", "secret-warning");
    meter.hidden = false;
    meter.textContent = "GORILLA 100%";
    stage.innerHTML = `
      <section class="secret-card" aria-labelledby="secretTitle">
        <div class="kicker">SYSTEM OVERRIDE</div>
        <h2 id="secretTitle">${esc(T.ui.trueWarningTitle)}</h2>
        <p>${asHtml(T.ui.trueWarningLead)}</p>
        <button id="trueProceed" class="game-btn danger-primary" type="button">${esc(T.ui.trueWarningButton)}</button>
      </section>`;
    $("trueProceed").onclick = () => renderEnding("true");
  }

  function renderEnding(id) {
    const ending = T.endings[id];
    if (!ending) return renderTitle();
    currentScreen = "ending";
    stopTextTimers();
    const isNew = saveEnding(id);
    state.ending = id;
    hideStanding();
    setMode("event-mode", `ending-${id}`);
    backdrop.style.backgroundImage = `url("${C.endingCG[id]}")`;
    backdrop.style.backgroundPosition = id === "muscle" ? "center" : "center 28%";
    playSound("ending");
    stage.innerHTML = `
      <section class="ending-panel" aria-labelledby="endingTitle">
        ${isNew ? `<div class="new-end-badge">NEW END</div>` : ""}
        <div class="ending-kicker">ENDING</div>
        <div class="result-name">${id === "true" ? "ゴリラ" : "くにお"}</div>
        <div class="result-label">${esc(ending.label)}</div>
        <h2 class="ending-title" id="endingTitle">${asHtml(ending.title)}</h2>
        <p class="ending-line">${asHtml(replaceName(ending.line))}</p>
        <p class="ending-body">${asHtml(ending.body)}</p>
        <div class="ending-actions">
          <button id="retryBtn" class="game-btn compact" type="button">REPLAY</button>
          <button id="endCollectionBtn" class="game-btn compact ghost" type="button">COLLECTION</button>
        </div>
        <a class="x-link" href="${esc(C.xUrl)}" target="_blank" rel="noopener noreferrer">${esc(T.ui.xLink)} <span>↗</span></a>
      </section>`;
    $("retryBtn").onclick = renderTitle;
    $("endCollectionBtn").onclick = renderCollection;
  }

  function renderCollection() {
    stopTextTimers();
    clearChapterTimer();
    closeModal();
    currentScreen = "collection";
    currentResumeState = null;
    setMode("collection-mode");
    setBackground("cityNight");
    hideStanding();
    meter.hidden = true;
    const found = foundEndings();
    const rows = C.endingOrder.map((id, index) => {
      const unlocked = found.includes(id);
      const number = String(index + 1).padStart(2, "0");
      if (unlocked) {
        return `
          <button class="end-card found" type="button" data-ending-id="${id}" style="--cg:url('${C.endingCG[id]}')">
            <span class="end-number">${number}</span>
            <span class="end-name">${esc(T.endings[id].label)}</span>
            <span class="end-status">MEMORY ›</span>
          </button>`;
      }
      return `
        <div class="end-card locked">
          <span class="end-number">${number}</span>
          <span class="end-name">???</span>
          <span class="end-hint">${esc(C.endingHints[id])}</span>
          <span class="end-status">LOCKED</span>
        </div>`;
    }).join("");

    stage.innerHTML = `
      <section class="collection-panel" aria-labelledby="collectionTitle">
        <div class="kicker">COLLECTION</div>
        <div class="collection-head">
          <h2 id="collectionTitle">${esc(T.ui.collectionTitle)}</h2>
          <strong>${found.length}<small> / ${C.endingOrder.length}</small></strong>
        </div>
        <p class="muted">発見済みのENDはタップして、実写CGを見返せます。</p>
        <div class="collection-progressbar"><i style="width:${(found.length / C.endingOrder.length) * 100}%"></i></div>
        <div class="collection-grid">${rows}</div>
        <button id="collectionHome" class="game-btn ghost" type="button">TITLEへ戻る</button>
      </section>`;
    stage.querySelectorAll("[data-ending-id]").forEach((button) => {
      button.onclick = () => renderEndingPreview(button.dataset.endingId);
    });
    $("collectionHome").onclick = renderTitle;
  }

  function renderEndingPreview(id) {
    const ending = T.endings[id];
    currentScreen = "preview";
    setMode("event-mode", "collection-preview");
    backdrop.style.backgroundImage = `url("${C.endingCG[id]}")`;
    backdrop.style.backgroundPosition = id === "muscle" ? "center" : "center 28%";
    stage.innerHTML = `
      <section class="collection-cg-panel" aria-labelledby="memoryTitle">
        <div class="ending-kicker">MEMORY ${String(C.endingOrder.indexOf(id) + 1).padStart(2, "0")}</div>
        <div class="result-label">${esc(ending.label)}</div>
        <h2 class="ending-title" id="memoryTitle">${esc(ending.title)}</h2>
        <button id="backCollectionBtn" class="game-btn compact ghost" type="button">← COLLECTION</button>
      </section>`;
    $("backCollectionBtn").onclick = renderCollection;
  }

  function syncToggles() {
    autoBtn.classList.toggle("active", autoMode);
    skipBtn.classList.toggle("active", skipMode);
    autoBtn.setAttribute("aria-pressed", String(autoMode));
    skipBtn.setAttribute("aria-pressed", String(skipMode));
  }

  function openModal(content, label = "ダイアログ") {
    stage.querySelector(".vn-dialogue.typing")?._finishTyping?.();
    stopTextTimers();
    modal.hidden = false;
    modal.innerHTML = `<div class="modal-scrim"></div><section class="system-modal" role="dialog" aria-modal="true" aria-label="${esc(label)}">${content}</section>`;
    modal.querySelector(".modal-scrim").onclick = closeModal;
    requestAnimationFrame(() => modal.querySelector("button")?.focus({ preventScroll: true }));
    playSound("open");
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    modal.innerHTML = "";
  }

  function modalHeader(title) {
    return `<div class="modal-head"><span>${esc(title)}</span><button id="modalClose" type="button" aria-label="閉じる">×</button></div>`;
  }

  function renderBacklog() {
    const rows = state.log.slice().reverse().map((item) => `
      <div class="log-row"><b>${esc(item.speaker)}</b><p>${asHtml(item.text)}</p></div>`).join("");
    openModal(`${modalHeader("BACKLOG")}<div class="log-list">${rows || `<p class="empty-state">ログはまだありません</p>`}</div>`, "バックログ");
    $("modalClose").onclick = closeModal;
  }

  function textSpeedLabel(value) {
    if (value <= 16) return "FAST";
    if (value >= 40) return "SLOW";
    return "NORMAL";
  }

  function renderSettings() {
    openModal(`
      ${modalHeader("SETTINGS")}
      <div class="setting-row">
        <label for="speedRange"><span>TEXT SPEED</span><strong id="speedVal">${textSpeedLabel(settings.textSpeed)}</strong></label>
        <input id="speedRange" type="range" min="8" max="52" step="4" value="${settings.textSpeed}">
      </div>
      <div class="setting-row">
        <label for="autoRange"><span>AUTO WAIT</span><strong id="autoVal">${settings.autoDelay}ms</strong></label>
        <input id="autoRange" type="range" min="650" max="2200" step="50" value="${settings.autoDelay}">
      </div>
      <div class="setting-row">
        <label for="seRange"><span>SE VOLUME</span><strong id="seVal">${settings.seVolume}%</strong></label>
        <input id="seRange" type="range" min="0" max="100" step="5" value="${settings.seVolume}">
      </div>
      <p class="settings-note">BGMは使用していません。設定はこの端末に保存されます。</p>`, "設定");
    $("modalClose").onclick = closeModal;
    $("speedRange").oninput = (event) => {
      settings.textSpeed = Number(event.target.value);
      $("speedVal").textContent = textSpeedLabel(settings.textSpeed);
      saveSettings();
    };
    $("autoRange").oninput = (event) => {
      settings.autoDelay = Number(event.target.value);
      $("autoVal").textContent = `${settings.autoDelay}ms`;
      saveSettings();
    };
    $("seRange").oninput = (event) => {
      settings.seVolume = Number(event.target.value);
      $("seVal").textContent = `${settings.seVolume}%`;
      saveSettings();
      playSound("tap");
    };
  }

  function canUndo() {
    return state.history.some((entry) => entry?.before);
  }

  function undoChoice() {
    const entry = state.history.pop();
    if (!entry?.before) {
      notify("戻れる選択肢がありません");
      return;
    }
    state.nodeId = entry.before.nodeId;
    state.score = clone(entry.before.score);
    state.flags = clone(entry.before.flags);
    state.log = state.log.slice(0, entry.before.logLength);
    previousLevel = gorillaLevel();
    currentResumeState = null;
    closeModal();
    playSound("open");
    renderNode(state.nodeId, { skipCurtain: true });
    notify("1つ前の選択に戻りました", 850);
  }

  function renderMenu() {
    openModal(`
      ${modalHeader("MENU")}
      <div class="modal-actions">
        <button id="mResume" class="game-btn primary" type="button">ゲームに戻る</button>
        <button id="mUndo" class="game-btn" type="button" ${canUndo() ? "" : "disabled"}>1つ前の選択に戻る</button>
        <button id="mSave" class="game-btn" type="button">この場面を保存</button>
        <button id="mSettings" class="game-btn" type="button">SETTINGS</button>
        <button id="mLog" class="game-btn" type="button">BACKLOG</button>
        <button id="mCollection" class="game-btn" type="button">COLLECTION</button>
        <button id="mTitle" class="game-btn danger" type="button">TITLEへ戻る</button>
      </div>`, "ゲームメニュー");
    $("modalClose").onclick = closeModal;
    $("mResume").onclick = closeModal;
    $("mUndo").onclick = undoChoice;
    $("mSave").onclick = () => {
      const saved = saveScene(currentScreen === "reaction" && currentResumeState ? currentResumeState : state);
      closeModal();
      notify(saved ? "SAVE COMPLETE" : "保存できませんでした");
    };
    $("mSettings").onclick = renderSettings;
    $("mLog").onclick = renderBacklog;
    $("mCollection").onclick = renderCollection;
    $("mTitle").onclick = confirmTitleReturn;
  }

  function confirmTitleReturn() {
    openModal(`
      ${modalHeader("TITLEへ戻る")}
      <p class="confirm-text">現在の場面は自動保存されています。タイトルへ戻りますか？</p>
      <div class="modal-actions two">
        <button id="cancelTitle" class="game-btn" type="button">キャンセル</button>
        <button id="confirmTitle" class="game-btn danger" type="button">タイトルへ戻る</button>
      </div>`, "タイトルへ戻る確認");
    $("modalClose").onclick = closeModal;
    $("cancelTitle").onclick = closeModal;
    $("confirmTitle").onclick = renderTitle;
  }

  function ensureAudioContext() {
    if (settings.seVolume <= 0) return null;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioContext) audioContext = new AudioCtor();
    if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
    return audioContext;
  }

  function tone(frequency, duration, delay = 0, type = "sine", volume = 1) {
    const context = ensureAudioContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    const strength = (settings.seVolume / 100) * 0.035 * volume;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, strength), start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function playSound(kind) {
    if (settings.seVolume <= 0) return;
    if (kind === "tap") tone(470, 0.045, 0, "sine", 0.55);
    if (kind === "select") {
      tone(560, 0.07, 0, "sine", 0.7);
      tone(840, 0.09, 0.045, "sine", 0.55);
    }
    if (kind === "open") tone(320, 0.07, 0, "triangle", 0.5);
    if (kind === "chapter") tone(240, 0.16, 0, "sine", 0.45);
    if (kind === "ending") {
      tone(330, 0.2, 0, "sine", 0.55);
      tone(495, 0.24, 0.08, "sine", 0.5);
      tone(660, 0.3, 0.16, "sine", 0.42);
    }
  }

  function preloadImages() {
    const assets = new Set([
      ...Object.values(S.backgrounds),
      ...Object.values(S.standing).map((item) => item.src),
      ...Object.values(S.openingStanding || {}).map((item) => item.src),
      ...Object.values(S.gymStanding || {}).map((item) => item.src),
      ...Object.values(C.endingCG)
    ]);
    assets.forEach((src) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
    });
  }

  collectionBtn.onclick = () => {
    playSound("open");
    renderCollection();
  };
  brand.onclick = () => {
    if (currentScreen === "title") return;
    if (["collection", "preview", "ending"].includes(currentScreen)) renderTitle();
    else confirmTitleReturn();
  };
  autoBtn.onclick = () => {
    autoMode = !autoMode;
    syncToggles();
    notify(autoMode ? "AUTO ON" : "AUTO OFF", 650);
    playSound("tap");
    if (autoMode && currentScreen === "reaction" && reactionAdvance) {
      clearTimeout(autoTimer);
      autoTimer = setTimeout(reactionAdvance, Number(settings.autoDelay) || 1150);
    }
  };
  skipBtn.onclick = () => {
    skipMode = !skipMode;
    syncToggles();
    notify(skipMode ? "READ SKIP ON" : "READ SKIP OFF", 650);
    playSound("tap");
  };
  logBtn.onclick = renderBacklog;
  menuBtn.onclick = renderMenu;

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
      return;
    }
    if (!modal.hidden || event.target.matches("input,textarea")) return;
    if ((event.key === "Enter" || event.key === " ") && currentScreen === "reaction") {
      event.preventDefault();
      const dialogue = $("reactionText");
      if (dialogue?.classList.contains("typing")) dialogue._finishTyping?.();
      else reactionAdvance?.();
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const choices = [...stage.querySelectorAll(".choice:not(:disabled)")];
      if (!choices.length) return;
      event.preventDefault();
      const currentIndex = choices.indexOf(document.activeElement);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      choices[(currentIndex + direction + choices.length) % choices.length].focus();
    }
  });

  window.KUNIO_STORY_TEST = Object.freeze({
    version: C.version,
    maxGorilla: MAX_GORILLA,
    determineEnding,
    openingStandingSource: (screen) => S.openingStanding?.[screen]?.src || null,
    standingSource: (key, backgroundKey, nodeId) => standingConfig(key, backgroundKey, nodeId)?.src || null
  });

  preloadImages();
  renderTitle();
})();
