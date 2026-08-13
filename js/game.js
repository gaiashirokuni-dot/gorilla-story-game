(() => {
  "use strict";

  const TEXT = window.GORILLA_TEXT;
  const CONFIG = window.GORILLA_CONFIG;
  const SCENES = window.GORILLA_SCENES;
  const FLOW = window.GORILLA_FLOW;

  if (!TEXT || !CONFIG || !SCENES || !FLOW) {
    throw new Error("KUNIO STORY の設定ファイル読み込みに失敗しました。");
  }

  const game = document.getElementById("game");
  const stage = document.getElementById("stage");
  const backdrop = document.getElementById("backdrop");
  const standingLayer = document.getElementById("standingLayer");
  const standingImage = document.getElementById("standingImage");
  const flash = document.getElementById("flash");
  const chapterCurtain = document.getElementById("chapterCurtain");
  const systemAlert = document.getElementById("systemAlert");
  const collectionBtn = document.getElementById("collectionBtn");
  const homeBtn = document.getElementById("homeBtn");
  const gorillaMeter = document.getElementById("gorillaMeter");
  const brand = document.getElementById("brand");

  const MAX_GORILLA_SCORE = computeMaxGorillaScore();

  let state = freshState();
  let typingTimer = null;
  let lastChapter = null;

  function freshState() {
    const score = {};
    CONFIG.scoreKeys.forEach(key => score[key] = 0);

    return {
      name: "ハニー",
      nodeId: FLOW.startNode,
      score,
      flags: {},
      history: [],
      ending: null
    };
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[c]));
  }

  function html(value) {
    return esc(value).replace(/\n/g, "<br>");
  }

  function replaceName(value) {
    return String(value ?? "")
      .replaceAll("○○", state.name)
      .replaceAll("ハニー", state.name)
      .replaceAll("{name}", state.name);
  }

  function template(value, vars = {}) {
    let out = String(value ?? "");

    Object.entries(vars).forEach(([key, val]) => {
      out = out.replaceAll(`{${key}}`, String(val));
    });

    return out;
  }

  function computeMaxGorillaScore() {
    const memo = new Map();

    function walk(nodeId) {
      if (memo.has(nodeId)) return memo.get(nodeId);

      const node = FLOW.nodes[nodeId];
      let best = 0;

      for (const action of Object.values(node.choices)) {
        const here = action.score?.gorilla || 0;

        const total = action.end
          ? here
          : here + walk(action.next);

        if (total > best) best = total;
      }

      memo.set(nodeId, best);
      return best;
    }

    return Math.max(1, walk(FLOW.startNode));
  }

  function gorillaLevel() {
    return Math.min(
      100,
      Math.round((state.score.gorilla / MAX_GORILLA_SCORE) * 100)
    );
  }

  function updateMeter() {
    const level = gorillaLevel();

    if (level >= 20) {
      gorillaMeter.hidden = false;
      gorillaMeter.textContent = `GORILLA LEVEL ${level}%`;

      if (level >= 80) {
        brand.textContent = "GORILLA SYSTEM";
      } else {
        brand.textContent = TEXT.ui.brand;
      }
    } else {
      gorillaMeter.hidden = true;
      brand.textContent = TEXT.ui.brand;
    }
  }

  function setBackground(key) {
    game.classList.remove("event-mode");

    const src = SCENES.backgrounds[key];

    backdrop.style.backgroundImage = src
      ? `url("${src}")`
      : "";

    backdrop.style.backgroundPosition = "center";
  }

  function setStanding(key) {
    const cfg = SCENES.standing[key];

    if (!cfg) {
      hideStanding();
      return;
    }

    standingLayer.hidden = false;
    standingImage.src = cfg.src;
    standingImage.style.left = `${cfg.x ?? 50}%`;
    standingImage.style.bottom = `${100 - (cfg.y ?? 100)}%`;
    standingImage.style.transform =
      `translateX(-50%) scale(${cfg.scale ?? 1})`;

    standingImage.style.filter =
      `${cfg.filter ?? "none"} drop-shadow(0 18px 26px rgba(0,0,0,.38))`;

    requestAnimationFrame(() => {
      standingImage.classList.add("show");
    });
  }

  function hideStanding() {
    standingImage.classList.remove("show");
    standingLayer.hidden = true;
  }

  function showAlert(text, duration = 1250) {
    systemAlert.innerHTML = html(text);
    systemAlert.classList.add("on");

    setTimeout(() => {
      systemAlert.classList.remove("on");
    }, duration);
  }

  function getFound() {
    try {
      return JSON.parse(
        localStorage.getItem(CONFIG.storageKey) || "[]"
      );
    } catch {
      return [];
    }
  }

  function saveEnding(id) {
    const list = getFound();

    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(
        CONFIG.storageKey,
        JSON.stringify(list)
      );
    }
  }

  function stopTyping() {
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
  }

  function typeDialogue(element, rawText, onComplete) {
    stopTyping();

    const text = replaceName(rawText);
    let index = 0;

    element.textContent = "";
    element.classList.add("typing");

    const finish = () => {
      stopTyping();
      element.textContent = text;
      element.classList.remove("typing");
      if (onComplete) onComplete();
    };

    element.onclick = finish;

    typingTimer = setInterval(() => {
      if (index >= text.length) {
        finish();
        return;
      }

      element.textContent += text[index];
      index++;
    }, 28);
  }

  function showChapterCurtain(chapter, title, callback) {
    if (!chapter || chapter === lastChapter) {
      callback();
      return;
    }

    lastChapter = chapter;

    chapterCurtain.hidden = false;
    chapterCurtain.innerHTML = `
      <div class="cc-kicker">${esc(chapter)}</div>
      <div class="cc-title">${esc(title)}</div>
    `;

    requestAnimationFrame(() => {
      chapterCurtain.classList.add("show");
    });

    setTimeout(() => {
      chapterCurtain.classList.remove("show");

      setTimeout(() => {
        chapterCurtain.hidden = true;
        callback();
      }, 300);
    }, 850);
  }

  function titleScreen() {
    state = freshState();
    lastChapter = null;
    stopTyping();

    game.classList.remove("event-mode");
    hideStanding();
    backdrop.style.backgroundImage = "";

    gorillaMeter.hidden = true;
    brand.textContent = TEXT.ui.brand;
    homeBtn.hidden = true;

    stage.innerHTML = `
      <section class="menu-card center">
        <div class="kicker">${esc(TEXT.ui.titleKicker)}</div>

        <h1 class="title">${html(TEXT.ui.title)}</h1>

        <p class="lead">${html(TEXT.ui.lead)}</p>

        <p class="muted">
          ${getFound().length} / ${CONFIG.endingOrder.length} END FOUND
        </p>

        <div class="actions">
          <button id="startBtn" class="btn primary">
            ${esc(TEXT.ui.start)}
          </button>

          <button id="startCollection" class="btn">
            ${esc(TEXT.ui.collection)}
          </button>
        </div>
      </section>
    `;

    document.getElementById("startBtn").onclick = nameScreen;
    document.getElementById("startCollection").onclick = collectionScreen;
  }

  function nameScreen() {
    homeBtn.hidden = false;

    stage.innerHTML = `
      <section class="menu-card">
        <div class="kicker">${esc(TEXT.ui.nameKicker)}</div>

        <h2 class="title" style="font-size:21px">
          ${html(TEXT.ui.nameQuestion)}
        </h2>

        <p class="muted">${html(TEXT.ui.nameHelp)}</p>

        <input
          id="nameInput"
          class="name-input"
          maxlength="12"
          placeholder="${esc(TEXT.ui.namePlaceholder)}"
        >

        <div class="actions">
          <button id="nameSubmit" class="btn primary">
            ${esc(TEXT.ui.nameSubmit)}
          </button>

          <button id="nameSkip" class="btn">
            ${esc(TEXT.ui.nameSkip)}
          </button>
        </div>
      </section>
    `;

    const input = document.getElementById("nameInput");

    const go = () => {
      state.name = input.value.trim() || "ハニー";
      renderNode(FLOW.startNode);
    };

    document.getElementById("nameSubmit").onclick = go;

    document.getElementById("nameSkip").onclick = () => {
      state.name = "ハニー";
      renderNode(FLOW.startNode);
    };

    input.addEventListener("keydown", e => {
      if (e.key === "Enter") go();
    });

    input.focus();
  }

  function renderNode(nodeId) {
    state.nodeId = nodeId;

    const flowNode = FLOW.nodes[nodeId];
    const textNode = TEXT.nodes[nodeId];

    if (!flowNode || !textNode) {
      throw new Error(`Unknown node: ${nodeId}`);
    }

    updateMeter();

    showChapterCurtain(
      textNode.chapter,
      textNode.title,
      () => renderNovelScene(nodeId, flowNode, textNode)
    );
  }

  function renderNovelScene(nodeId, flowNode, textNode) {
    setBackground(flowNode.background);
    setStanding(flowNode.standing);

    const choiceButtons = Object.keys(flowNode.choices)
      .map(choiceId => `
        <button class="choice" data-choice="${choiceId}">
          ${esc(textNode.choices[choiceId])}
        </button>
      `)
      .join("");

    stage.innerHTML = `
      <section class="vn-box">
        <div class="vn-nameplate">${esc(textNode.speaker)}</div>

        <div class="vn-chapter">
          ${esc(textNode.chapter)}
        </div>

        <div id="dialogueText" class="vn-dialogue"></div>

        <div id="tapHint" class="vn-tap">
          TAP TO SKIP
          <span class="triangle">▼</span>
        </div>

        <div id="choiceStack" class="choice-stack">
          ${choiceButtons}
        </div>
      </section>
    `;

    const dialogue = document.getElementById("dialogueText");
    const choices = document.getElementById("choiceStack");
    const tapHint = document.getElementById("tapHint");

    typeDialogue(
      dialogue,
      textNode.text,
      () => {
        tapHint.textContent = "SELECT";
        choices.classList.add("show");
      }
    );

    stage.querySelectorAll("[data-choice]").forEach(button => {
      button.onclick = () => {
        choose(nodeId, button.dataset.choice);
      };
    });
  }

  function applyChoice(action) {
    if (action.score) {
      Object.entries(action.score).forEach(([key, value]) => {
        state.score[key] = (state.score[key] || 0) + value;
      });
    }

    if (action.flags) {
      Object.assign(state.flags, action.flags);
    }
  }

  function choose(nodeId, choiceId) {
    stopTyping();

    const node = FLOW.nodes[nodeId];
    const action = node.choices[choiceId];

    state.history.push({
      nodeId,
      choiceId
    });

    applyChoice(action);

    const level = gorillaLevel();

    if (level >= 82 && state.history.length >= 7) {
      showAlert(TEXT.ui.gorillaWarning);
    }

    flash.classList.add("on");

    setTimeout(() => {
      if (action.end) {
        resolveEnding();
      } else {
        renderNode(action.next);
      }

      setTimeout(() => {
        flash.classList.remove("on");
      }, 100);
    }, 300);
  }

  function resolveEnding() {
    const s = state.score;
    const f = state.flags;

    let ending = "normal";

    if (s.gorilla >= MAX_GORILLA_SCORE) {
      ending = "true";
    }
    else if (
      f.collarInterest &&
      s.chaos >= 6 &&
      s.trust >= 5
    ) {
      ending = "collar";
    }
    else if (
      f.arm &&
      s.love >= 6
    ) {
      ending = "armLove";
    }
    else if (
      s.dark >= 7 &&
      s.trust >= 5
    ) {
      ending = "dark";
    }
    else if (
      f.gym &&
      s.muscle >= 5
    ) {
      ending = "muscle";
    }
    else if (f.pokeca) {
      ending = "pokeca";
    }
    else if (
      s.love >= 7 &&
      s.trust >= 6
    ) {
      ending = "love";
    }

    state.ending = ending;

    if (ending === "true") {
      trueEndingWarning();
    } else {
      endingScreen(ending);
    }
  }

  function trueEndingWarning() {
    hideStanding();
    backdrop.style.backgroundImage = "";
    brand.textContent = "GORILLA SYSTEM";
    gorillaMeter.hidden = false;
    gorillaMeter.textContent = "GORILLA LEVEL 100%";

    stage.innerHTML = `
      <section class="menu-card center">
        <div class="kicker">SYSTEM ERROR</div>

        <h2 class="title">
          ${html(TEXT.ui.trueWarningTitle)}
        </h2>

        <p class="lead">
          ${html(TEXT.ui.trueWarningLead)}
        </p>

        <div class="actions">
          <button id="trueProceed" class="btn primary">
            ${esc(TEXT.ui.trueWarningButton)}
          </button>
        </div>
      </section>
    `;

    document.getElementById("trueProceed").onclick = () => {
      endingScreen("true");
    };
  }

  function endingScreen(id) {
    const endingText = TEXT.endings[id];
    const cg = CONFIG.endingCG[id];

    saveEnding(id);

    game.classList.add("event-mode");
    hideStanding();

    backdrop.style.backgroundImage = `url("${cg}")`;
    backdrop.style.backgroundPosition = "center";

    flash.classList.add("on");

    setTimeout(() => {
      flash.classList.remove("on");

      const displayName =
        id === "true"
          ? "ゴリラ"
          : "くにお";

      stage.innerHTML = `
        <section class="ending-panel center">
          <div class="ending-kicker">ENDING</div>

          <div class="result-name">${displayName}</div>

          <div class="result-label">
            ${esc(endingText.label)}
          </div>

          <h2 class="ending-title">
            ${html(endingText.title)}
          </h2>

          <p class="ending-line">
            ${html(replaceName(endingText.line))}
          </p>

          <p class="ending-body">
            ${html(endingText.body)}
          </p>

          <div class="ending-actions">
            <button id="retryBtn" class="ending-link-btn">
              REPLAY
            </button>

            <button id="endingCollectionBtn" class="ending-link-btn">
              END COLLECTION
            </button>
          </div>

          <a
            class="x-link"
            href="${esc(CONFIG.xUrl)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            ${esc(TEXT.ui.xLink)} ↗
          </a>
        </section>
      `;

      document.getElementById("retryBtn").onclick = titleScreen;
      document.getElementById("endingCollectionBtn").onclick = collectionScreen;
    }, 400);
  }

  function collectionScreen() {
    stopTyping();
    game.classList.remove("event-mode");
    hideStanding();

    backdrop.style.backgroundImage = "";
    homeBtn.hidden = false;
    gorillaMeter.hidden = true;
    brand.textContent = TEXT.ui.brand;

    const found = getFound();

    const rows = CONFIG.endingOrder
      .map((id, index) => {
        const isFound = found.includes(id);

        const label = isFound
          ? TEXT.endings[id].label
          : TEXT.ui.unknown;

        return `
          <div class="end-row ${isFound ? "found" : ""}">
            <span>
              ${String(index + 1).padStart(2, "0")}　
              ${esc(label)}
            </span>

            <span>
              ${isFound ? esc(TEXT.ui.found) : esc(TEXT.ui.notFound)}
            </span>
          </div>
        `;
      })
      .join("");

    stage.innerHTML = `
      <section class="menu-card">
        <div class="kicker">COLLECTION</div>

        <h2 class="title" style="font-size:21px">
          ${esc(TEXT.ui.collectionTitle)}
        </h2>

        <p class="muted">
          ${esc(template(TEXT.ui.collectionHelp, {
            found: found.length,
            total: CONFIG.endingOrder.length
          }))}
        </p>

        <div class="collection-grid">
          ${rows}
        </div>

        <div class="actions">
          <button id="collectionPlay" class="btn primary">
            ${esc(TEXT.ui.start)}
          </button>

          <button id="collectionHome" class="btn">
            タイトルへ戻る
          </button>
        </div>
      </section>
    `;

    document.getElementById("collectionPlay").onclick = nameScreen;
    document.getElementById("collectionHome").onclick = titleScreen;
  }

  collectionBtn.onclick = collectionScreen;
  homeBtn.onclick = titleScreen;

  titleScreen();
})();
