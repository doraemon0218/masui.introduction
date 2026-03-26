const REMI_ORDER_GAMMA = [0.05, 0.1, 0.15, 0.2, 0.25];
const NORA_ORDER_GAMMA = [0.03, 0.05, 0.08, 0.1, 0.15];
const WEIGHTS = [45, 50, 55, 60, 65, 70, 75, 80];
const BLOCK_SIZE = 5;
const SESSION_SECONDS = {
  study: 9999,
  challenge: 240
};
const LEVEL_1_SECONDS = 45;
const MIN_QUESTION_SECONDS = 5;
const TARGET_BLOCK_ACCURACY = 0.8;
const BLOCK_SECONDS_SHRINK = 0.84;
const EASIER_SECONDS_BONUS = 12;
const ROUND_RESULT_MS = 1400;

const RPG_TIERS = ["村人", "戦士", "魔法戦士", "勇者"];

/** コンテンツ選択画面用：DQ風ピクセル風SVG（村人〜勇者） */
const GAMMA_RPG_SPRITES_SVG = [
  // 村人
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" shape-rendering="crispEdges"><rect width="48" height="48" fill="#0a1740"/><rect x="18" y="10" width="12" height="10" fill="#e8b88a"/><rect x="16" y="8" width="16" height="6" fill="#6b4423"/><rect x="14" y="20" width="20" height="14" fill="#4a7c3a"/><rect x="18" y="34" width="4" height="8" fill="#3d2914"/><rect x="26" y="34" width="4" height="8" fill="#3d2914"/><rect x="10" y="22" width="4" height="8" fill="#e8b88a"/><rect x="34" y="22" width="4" height="8" fill="#e8b88a"/><rect x="20" y="14" width="3" height="2" fill="#2a1810"/><rect x="25" y="14" width="3" height="2" fill="#2a1810"/></svg>`,
  // 戦士
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" shape-rendering="crispEdges"><rect width="48" height="48" fill="#0a1740"/><rect x="17" y="9" width="14" height="10" fill="#e8b88a"/><rect x="15" y="6" width="18" height="6" fill="#6b6b6b"/><rect x="13" y="19" width="22" height="14" fill="#5c6bc0"/><rect x="8" y="24" width="6" height="4" fill="#c0c0c0"/><rect x="34" y="20" width="3" height="14" fill="#e0e0e0"/><rect x="17" y="33" width="5" height="9" fill="#3d2914"/><rect x="26" y="33" width="5" height="9" fill="#3d2914"/><rect x="19" y="13" width="3" height="2" fill="#1a1a1a"/><rect x="26" y="13" width="3" height="2" fill="#1a1a1a"/></svg>`,
  // 魔法戦士
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" shape-rendering="crispEdges"><rect width="48" height="48" fill="#0a1740"/><rect x="16" y="8" width="16" height="10" fill="#e8b88a"/><rect x="14" y="5" width="20" height="6" fill="#4a148c"/><rect x="12" y="18" width="24" height="14" fill="#7e57c2"/><rect x="6" y="22" width="8" height="6" fill="#ffd54a"/><rect x="30" y="20" width="4" height="12" fill="#90caf9"/><rect x="18" y="32" width="5" height="10" fill="#3d2914"/><rect x="25" y="32" width="5" height="10" fill="#3d2914"/><rect x="19" y="12" width="3" height="2" fill="#1a1a1a"/><rect x="26" y="12" width="3" height="2" fill="#1a1a1a"/><rect x="36" y="10" width="4" height="4" fill="#fff59d"/></svg>`,
  // 勇者
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" shape-rendering="crispEdges"><rect width="48" height="48" fill="#0a1740"/><rect x="16" y="6" width="16" height="8" fill="#ffd54a"/><rect x="17" y="10" width="14" height="10" fill="#e8b88a"/><rect x="13" y="20" width="22" height="14" fill="#d32f2f"/><rect x="8" y="14" width="8" height="6" fill="#ffd54a"/><rect x="32" y="18" width="4" height="16" fill="#eceff1"/><rect x="17" y="34" width="6" height="10" fill="#3d2914"/><rect x="25" y="34" width="6" height="10" fill="#3d2914"/><rect x="19" y="14" width="3" height="2" fill="#1a1a1a"/><rect x="26" y="14" width="3" height="2" fill="#1a1a1a"/><rect x="20" y="4" width="8" height="4" fill="#ffd54a"/></svg>`
];
// 次の進化（tier+1）までに上げたい目標を、序盤のあなたの能力（baseline）からの差分として持つ
const RPG_NEXT_DELTAS = [
  { accAdd: 0.1, timeSubSec: 6 }, // 村人 -> 戦士
  { accAdd: 0.15, timeSubSec: 8 }, // 戦士 -> 魔法戦士
  { accAdd: 0.2, timeSubSec: 10 } // 魔法戦士 -> 勇者
];
const RPG_PROMOTE_THRESHOLD = 0.78;
const RPG_PROGRESS_W_ACC = 0.45;
const RPG_PROGRESS_W_SPEED = 0.35;
const RPG_PROGRESS_W_DIFFICULTY = 0.2;
const RPG_ADVANCED_PROB_BY_TIER = [0.35, 0.45, 0.6, 0.75];
const WEIGHTS_BY_TIER = [
  WEIGHTS,
  [55, 60, 65, 70, 75, 80],
  [60, 65, 70, 75, 80],
  [65, 70, 75, 80]
];

let pendingGameMode = null;
let roundResultTimerId = null;

const state = {
  playerName: "",
  mode: null,
  status: "idle",
  questionIndex: 0,
  totalQuestionCount: 0,
  lastBlockIndex: -1,
  blockWeightKg: null,
  level: 1,
  rpgTierIdx: 0,
  baselineAcc: null, // 序盤（block0）での正答率 [0..1]
  baselineAvgTimeSec: null, // 序盤（block0）での平均解答秒
  currentQuestionLimit: LEVEL_1_SECONDS,
  currentQuestion: null,
  score: 0,
  streak: 0,
  startAt: null,
  remainSec: 0,
  sessionTimerId: null,
  questionRemainSec: LEVEL_1_SECONDS,
  questionTimerId: null,
  answers: [],
  timeoutCount: 0,
  pendingAttempt: null,
  questionStartedAt: null,
  consecutiveBelowHalfAcc: 0,
  recoveryOpen: false,
  pendingSetQuestionSeconds: null,
  pendingAddQuestionSecondsSec: 0
};

const calc = {
  expr: "0"
};

const els = {
  playerName: document.getElementById("playerName"),
  enterBtn: document.getElementById("enterBtn"),
  topPage: document.getElementById("topPage"),
  contentPage: document.getElementById("contentPage"),
  welcomeName: document.getElementById("welcomeName"),
  startStudyBtn: document.getElementById("startStudyBtn"),
  startChallengeBtn: document.getElementById("startChallengeBtn"),
  gameFullscreen: document.getElementById("gameFullscreen"),
  gameMain: document.getElementById("gameMain"),
  gameLevel: document.getElementById("gameLevel"),
  gameLimitPerQuestion: document.getElementById("gameLimitPerQuestion"),
  sessionMeta: document.getElementById("sessionMeta"),
  questionTimer: document.getElementById("questionTimer"),
  rpgStageName: document.getElementById("rpgStageName"),
  nextEvolutionGoals: document.getElementById("nextEvolutionGoals"),
  questionArea: document.getElementById("questionArea"),
  gameIntro: document.getElementById("gameIntro"),
  introWeight: document.getElementById("introWeight"),
  introDrug: document.getElementById("introDrug"),
  goBtn: document.getElementById("goBtn"),
  questionContextWeight: document.getElementById("questionContextWeight"),
  questionText: document.getElementById("questionText"),
  answerInput: document.getElementById("answerInput"),
  submitAnswerBtn: document.getElementById("submitAnswerBtn"),
  leaderboard: document.getElementById("leaderboard"),
  dashboard: document.getElementById("dashboard"),
  gameEndFooter: document.getElementById("gameEndFooter"),
  gameEndRpgSprite: document.getElementById("gameEndRpgSprite"),
  gameEndRpgTierLine: document.getElementById("gameEndRpgTierLine"),
  gameEndSessionStats: document.getElementById("gameEndSessionStats"),
  gameEndNextEvolution: document.getElementById("gameEndNextEvolution"),
  gameEndScoreLine: document.getElementById("gameEndScoreLine"),
  gameEndAccuracyBig: document.getElementById("gameEndAccuracyBig"),
  gameEndDetail: document.getElementById("gameEndDetail"),
  saveLogBtn: document.getElementById("saveLogBtn"),
  saveLogStatus: document.getElementById("saveLogStatus"),
  gameCloseBtn: document.getElementById("gameCloseBtn"),
  roundResultOverlay: document.getElementById("roundResultOverlay"),
  roundResultBig: document.getElementById("roundResultBig"),
  roundResultSub: document.getElementById("roundResultSub"),
  calcDisplay: document.getElementById("calcDisplay"),
  calcGrid: document.getElementById("calcGrid"),
  calcToAnswerBtn: document.getElementById("calcToAnswerBtn"),
  sessionLengthOverlay: document.getElementById("sessionLengthOverlay"),
  sessionLen5Btn: document.getElementById("sessionLen5Btn"),
  sessionLen10Btn: document.getElementById("sessionLen10Btn"),
  sessionLenCancelBtn: document.getElementById("sessionLenCancelBtn"),
  remainQuestionCount: document.getElementById("remainQuestionCount"),
  introRemainQuestions: document.getElementById("introRemainQuestions"),
  abortSessionBtn: document.getElementById("abortSessionBtn"),
  recoveryOverlay: document.getElementById("recoveryOverlay"),
  recoveryEasierBtn: document.getElementById("recoveryEasierBtn"),
  recoveryContinueBtn: document.getElementById("recoveryContinueBtn"),
  gammaRpgSprite: document.getElementById("gammaRpgSprite"),
  gammaRpgTierName: document.getElementById("gammaRpgTierName"),
  gammaRpgTierLevel: document.getElementById("gammaRpgTierLevel"),
  gammaRpgTierHint: document.getElementById("gammaRpgTierHint")
};

function attemptsStorageKey(playerId) {
  return `masui_attempts_${playerId}`;
}

function leaderboardStorageKey(playerId) {
  return `masui_leaderboard_${playerId}`;
}

function loadLeaderboardForPlayer(playerId) {
  if (!playerId) return [];
  try {
    return JSON.parse(localStorage.getItem(leaderboardStorageKey(playerId)) || "[]");
  } catch {
    return [];
  }
}

function saveLeaderboardForPlayer(playerId, items) {
  if (!playerId) return;
  localStorage.setItem(leaderboardStorageKey(playerId), JSON.stringify(items));
}

function loadAttemptsForPlayer(playerId) {
  if (!playerId) return [];
  try {
    return JSON.parse(localStorage.getItem(attemptsStorageKey(playerId)) || "[]");
  } catch {
    return [];
  }
}

function saveAttemptForPlayer(playerId, attempt) {
  if (!playerId) return;
  const items = loadAttemptsForPlayer(playerId);
  items.push({ ...attempt, playerId });
  localStorage.setItem(attemptsStorageKey(playerId), JSON.stringify(items));
}

function hideRoundResultOverlay() {
  if (roundResultTimerId != null) {
    clearTimeout(roundResultTimerId);
    roundResultTimerId = null;
  }
  els.roundResultOverlay.classList.add("hidden");
}

function showRoundResultThen(headline, subline, resultClass, onDone) {
  hideRoundResultOverlay();
  els.roundResultBig.textContent = headline;
  els.roundResultSub.textContent = subline;
  els.roundResultBig.className = `round-result-big ${resultClass}`;
  els.roundResultOverlay.classList.remove("hidden");
  roundResultTimerId = window.setTimeout(() => {
    roundResultTimerId = null;
    els.roundResultOverlay.classList.add("hidden");
    onDone();
  }, ROUND_RESULT_MS);
}

function renderLeaderboard() {
  const pid = state.playerName;
  els.leaderboard.innerHTML = "";
  if (!pid) {
    const li = document.createElement("li");
    li.textContent = "入室後に個人ランキングが表示されます";
    els.leaderboard.appendChild(li);
    return;
  }
  const items = loadLeaderboardForPlayer(pid);
  if (items.length === 0) {
    const li = document.createElement("li");
    li.textContent = "まだ記録がありません（応用編のスコアが保存されます）";
    els.leaderboard.appendChild(li);
    return;
  }
  items.forEach((item, idx) => {
    const li = document.createElement("li");
    li.textContent = `${idx + 1}. ${item.score}点 (${item.elapsedSec}秒)`;
    els.leaderboard.appendChild(li);
  });
}

function renderDashboard() {
  const pid = state.playerName;
  if (!pid) {
    els.dashboard.textContent = "入室後に、あなたのログのみが表示されます。";
    return;
  }
  const attempts = loadAttemptsForPlayer(pid);
  if (attempts.length === 0) {
    els.dashboard.textContent = `受講者 ${pid} の保存データはまだありません。セッション終了後に「ログに登録」を押すとここに表示されます。`;
    return;
  }
  const byCategory = {};
  let totalScore = 0;
  let completion = 0;
  let aborted = 0;
  let totalTimeout = 0;
  attempts.forEach((a) => {
    totalScore += a.score;
    if (a.status === "completed") completion += 1;
    else if (a.status === "aborted") aborted += 1;
    totalTimeout += a.timeoutCount || 0;
    (a.answers || []).forEach((ans) => {
      if (!byCategory[ans.category]) byCategory[ans.category] = { ok: 0, ng: 0 };
      if (ans.correct) byCategory[ans.category].ok += 1;
      else byCategory[ans.category].ng += 1;
    });
  });

  const avg = Math.round(totalScore / attempts.length);
  const list = Object.entries(byCategory)
    .map(([category, v]) => {
      const total = v.ok + v.ng;
      const wrongRate = total ? Math.round((v.ng / total) * 100) : 0;
      return `<li>${category}: 誤答率 ${wrongRate}% (${v.ng}/${total})</li>`;
    })
    .join("");

  els.dashboard.innerHTML = `
    <p><strong>受講者 ${pid}</strong> の保存ログ（この端末のブラウザ内）</p>
    <p>完了セッション数: ${completion}</p>
    <p>中止セッション数: ${aborted}</p>
    <p>タイムアウト総数: ${totalTimeout}</p>
    <p>平均スコア: ${avg}点</p>
    <p>分野別弱点:</p>
    <ul>${list}</ul>
  `;
}

function getGammaRpgMaxTierForPlayer(playerId) {
  if (!playerId) return 0;
  const attempts = loadAttemptsForPlayer(playerId);
  let maxIdx = 0;
  attempts.forEach((a) => {
    if (typeof a.rpgTierIdx === "number") {
      maxIdx = Math.max(maxIdx, a.rpgTierIdx);
    }
  });
  return Math.min(RPG_TIERS.length - 1, maxIdx);
}

function renderGammaRpgOnContentPage() {
  if (!els.gammaRpgTierName || !els.gammaRpgTierLevel) return;
  const pid = state.playerName || els.playerName?.value || "";

  if (!pid) {
    els.gammaRpgTierName.textContent = RPG_TIERS[0];
    els.gammaRpgTierLevel.textContent = "1";
    if (els.gammaRpgTierHint) {
      els.gammaRpgTierHint.textContent = "入室すると、あなたの到達位が表示されます。";
    }
    if (els.gammaRpgSprite) els.gammaRpgSprite.innerHTML = GAMMA_RPG_SPRITES_SVG[0];
    return;
  }

  const maxIdx = getGammaRpgMaxTierForPlayer(pid);
  const name = RPG_TIERS[maxIdx] || RPG_TIERS[0];
  els.gammaRpgTierName.textContent = name;
  els.gammaRpgTierLevel.textContent = String(maxIdx + 1);
  const attempts = loadAttemptsForPlayer(pid);
  const hasRpg = attempts.some((a) => typeof a.rpgTierIdx === "number");
  if (els.gammaRpgTierHint) {
    els.gammaRpgTierHint.textContent = hasRpg
      ? "保存ログに基づく最高位です（位はセッション終了時の記録を比較）。"
      : "プレイ後に「ログに登録」を押すと、冒険の位が記録されます。";
  }
  if (els.gammaRpgSprite) {
    els.gammaRpgSprite.innerHTML = GAMMA_RPG_SPRITES_SVG[maxIdx] || GAMMA_RPG_SPRITES_SVG[0];
  }
}

function clampQuestionSeconds(sec) {
  return Math.max(MIN_QUESTION_SECONDS, Math.min(LEVEL_1_SECONDS, Math.round(sec)));
}

/** ブロック0終了時: 正解時の平均回答秒と正答率から、おおよそ TARGET_BLOCK_ACCURACY になる秒数を推定 */
function computeSecondsForTargetAccuracy(blockAnswers) {
  if (!blockAnswers.length) {
    return LEVEL_1_SECONDS;
  }
  const n = blockAnswers.length;
  const correctOnes = blockAnswers.filter((a) => a.correct);
  const accuracy = correctOnes.length / n;
  const withTime = correctOnes.filter((a) => typeof a.timeUsedSec === "number" && !Number.isNaN(a.timeUsedSec));
  let meanCorrectSec =
    withTime.length > 0
      ? withTime.reduce((s, a) => s + a.timeUsedSec, 0) / withTime.length
      : LEVEL_1_SECONDS * 0.85;
  const p = Math.max(accuracy, 0.07);
  const t = meanCorrectSec * (TARGET_BLOCK_ACCURACY / p);
  return clampQuestionSeconds(t);
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function computeAnswersBlockStats(answers) {
  const n = answers.length;
  if (n <= 0) return { acc: 0, avgTimeSec: LEVEL_1_SECONDS };
  const correctN = answers.filter((a) => a.correct).length;
  const acc = correctN / n;
  const times = answers.map((a) => (typeof a.timeUsedSec === "number" ? a.timeUsedSec : state.currentQuestionLimit));
  const avgTimeSec = times.reduce((s, t) => s + t, 0) / Math.max(1, n);
  return { acc, avgTimeSec };
}

function getNextEvolutionTargets() {
  if (state.rpgTierIdx >= RPG_TIERS.length - 1) return null;
  const nextIdx = state.rpgTierIdx; // 次の tier = current + 1
  const delta = RPG_NEXT_DELTAS[nextIdx] || RPG_NEXT_DELTAS[RPG_NEXT_DELTAS.length - 1];
  const baseAcc = typeof state.baselineAcc === "number" ? state.baselineAcc : 0.6;
  const baseTime = typeof state.baselineAvgTimeSec === "number" ? state.baselineAvgTimeSec : 35;
  const targetAcc = clamp01(baseAcc + delta.accAdd);
  const targetTimeSec = Math.max(
    MIN_QUESTION_SECONDS,
    Math.min(LEVEL_1_SECONDS, Math.round(baseTime - delta.timeSubSec))
  );
  return { targetAcc, targetTimeSec };
}

function updateRpgUi() {
  if (els.rpgStageName) {
    els.rpgStageName.textContent = RPG_TIERS[state.rpgTierIdx] || RPG_TIERS[0];
  }
  if (!els.nextEvolutionGoals) return;

  if (state.rpgTierIdx >= RPG_TIERS.length - 1) {
    els.nextEvolutionGoals.textContent = "勇者に到達しました。これ以上の進化はありません。";
    return;
  }

  const targets = getNextEvolutionTargets();
  if (!targets) {
    els.nextEvolutionGoals.textContent = "次の進化目標：—";
    return;
  }
  const accPct = Math.round(targets.targetAcc * 100);
  els.nextEvolutionGoals.textContent = `次の進化に必要：正答率 ${accPct}% 以上、平均解答 ${targets.targetTimeSec}秒 以内（直近${BLOCK_SIZE}問）`;
}

function renderGameEndRpgSummary() {
  if (!els.gameEndRpgSprite) return;
  const idx = Math.min(RPG_TIERS.length - 1, Math.max(0, state.rpgTierIdx));
  els.gameEndRpgSprite.innerHTML = GAMMA_RPG_SPRITES_SVG[idx] || GAMMA_RPG_SPRITES_SVG[0];
  if (els.gameEndRpgTierLine) {
    els.gameEndRpgTierLine.textContent = `${RPG_TIERS[idx]} · Lv${idx + 1}（このセッション終了時）`;
  }
  const answers = state.answers || [];
  if (els.gameEndSessionStats) {
    if (answers.length > 0) {
      const st = computeAnswersBlockStats(answers);
      els.gameEndSessionStats.textContent = `今回の成績：正答率 ${Math.round(st.acc * 100)}% · 平均解答 ${st.avgTimeSec.toFixed(1)}秒`;
    } else {
      els.gameEndSessionStats.textContent = "";
    }
  }
  if (els.gameEndNextEvolution) {
    if (idx >= RPG_TIERS.length - 1) {
      els.gameEndNextEvolution.textContent = "次の進化：なし（勇者に到達済み）";
    } else {
      const t = getNextEvolutionTargets();
      if (t) {
        const accPct = Math.round(t.targetAcc * 100);
        els.gameEndNextEvolution.textContent = `次の進化の目安（直近${BLOCK_SIZE}問）：正答率 ${accPct}% 以上、平均解答 ${t.targetTimeSec} 秒以内`;
      } else {
        els.gameEndNextEvolution.textContent = "次の進化目標：—";
      }
    }
  }
}

// 直近ブロック（BLOCK_SIZE問）の正答率・平均解答秒・現在の難易度（=残り秒の短さ）からtierを1段階進める
function maybeAdvanceRpgTier() {
  if (state.rpgTierIdx >= RPG_TIERS.length - 1) return;
  const recent = state.answers.slice(-BLOCK_SIZE);
  if (recent.length < BLOCK_SIZE) return;

  const recentStats = computeAnswersBlockStats(recent);

  // baselineは最初のブロック（block0）時点の能力推定として固定
  if (state.baselineAcc == null || state.baselineAvgTimeSec == null) {
    state.baselineAcc = recentStats.acc;
    state.baselineAvgTimeSec = recentStats.avgTimeSec;
  }

  const targets = getNextEvolutionTargets();
  if (!targets) return;

  const accScore = Math.min(1, recentStats.acc / Math.max(0.001, targets.targetAcc));
  const speedScore = Math.min(1, targets.targetTimeSec / Math.max(0.001, recentStats.avgTimeSec));
  const difficultyScore = clamp01(
    (LEVEL_1_SECONDS - state.currentQuestionLimit) / Math.max(1, LEVEL_1_SECONDS - MIN_QUESTION_SECONDS)
  );

  const progress =
    RPG_PROGRESS_W_ACC * accScore + RPG_PROGRESS_W_SPEED * speedScore + RPG_PROGRESS_W_DIFFICULTY * difficultyScore;

  if (progress >= RPG_PROMOTE_THRESHOLD) {
    state.rpgTierIdx = Math.min(RPG_TIERS.length - 1, state.rpgTierIdx + 1);
  }
}

function hideRecoveryOverlay() {
  state.recoveryOpen = false;
  if (els.recoveryOverlay) els.recoveryOverlay.classList.add("hidden");
}

function showRecoveryOverlay() {
  state.recoveryOpen = true;
  if (els.recoveryOverlay) els.recoveryOverlay.classList.remove("hidden");
}

function applyConsecutiveLowAccuracyCheck() {
  const n = state.answers.length;
  if (n === 0) return false;
  const correctN = state.answers.filter((a) => a.correct).length;
  const acc = correctN / n;
  if (acc < 0.5) {
    state.consecutiveBelowHalfAcc += 1;
  } else {
    state.consecutiveBelowHalfAcc = 0;
  }
  if (state.consecutiveBelowHalfAcc >= 2) {
    state.consecutiveBelowHalfAcc = 0;
    return true;
  }
  return false;
}

function proceedToNextQuestionIntroFromAnswer() {
  els.questionArea.classList.add("hidden");
  els.submitAnswerBtn.disabled = true;
  els.gameIntro.classList.remove("hidden");
  els.gameMain.classList.add("game-main--intro-only");
  prepareIntroAndWaitGo();
  renderMeta();
}

function openSessionLengthPicker(mode) {
  const name = state.playerName;
  if (!name) {
    alert("先に入室してください。");
    return;
  }
  pendingGameMode = mode;
  els.sessionLengthOverlay.classList.remove("hidden");
}

function closeSessionLengthPicker() {
  els.sessionLengthOverlay.classList.add("hidden");
  pendingGameMode = null;
}

function openGameFullscreen() {
  els.gameFullscreen.classList.remove("hidden");
  els.gameFullscreen.setAttribute("aria-hidden", "false");
  document.body.classList.add("game-active");
  els.gameEndFooter.classList.add("hidden");
}

function closeGameFullscreen() {
  els.gameFullscreen.classList.add("hidden");
  els.gameFullscreen.setAttribute("aria-hidden", "true");
  document.body.classList.remove("game-active");
}

function startMode(mode, totalQuestions) {
  clearInterval(state.sessionTimerId);
  clearInterval(state.questionTimerId);
  hideRoundResultOverlay();
  hideRecoveryOverlay();

  const name = state.playerName;
  state.playerName = name;
  state.mode = mode;
  state.status = "running";
  state.questionIndex = 0;
  state.totalQuestionCount = totalQuestions;
  state.lastBlockIndex = -1;
  state.blockWeightKg = null;
  state.level = 1;
  state.rpgTierIdx = 0;
  state.baselineAcc = null;
  state.baselineAvgTimeSec = null;
  state.currentQuestionLimit = LEVEL_1_SECONDS;
  state.currentQuestion = null;
  state.score = 0;
  state.streak = 0;
  state.timeoutCount = 0;
  state.answers = [];
  state.pendingAttempt = null;
  state.questionStartedAt = null;
  state.consecutiveBelowHalfAcc = 0;
  state.pendingSetQuestionSeconds = null;
  state.pendingAddQuestionSecondsSec = 0;
  state.startAt = Date.now();
  state.remainSec = SESSION_SECONDS[mode];
  state.sessionTimerId = setInterval(tickSession, 1000);

  els.saveLogBtn.disabled = false;
  els.saveLogStatus.classList.add("hidden");
  els.saveLogStatus.textContent = "";
  els.answerInput.value = "";
  els.submitAnswerBtn.disabled = true;
  els.questionArea.classList.add("hidden");
  els.gameIntro.classList.remove("hidden");
  els.gameMain.classList.add("game-main--intro-only");

  calcReset();
  openGameFullscreen();
  updateRemainQuestionsUi();
  renderMeta();
  updateRpgUi();
  prepareIntroAndWaitGo();
}

function tickSession() {
  if (state.status !== "running" || state.recoveryOpen) return;
  state.remainSec -= 1;
  renderMeta();
  if (state.remainSec <= 0) finishSession();
}

function updateLevelLine() {
  els.gameLevel.textContent = String(state.rpgTierIdx + 1);
  els.gameLimitPerQuestion.textContent = String(state.currentQuestionLimit);
}

function updateRemainQuestionsUi() {
  const left = Math.max(0, state.totalQuestionCount - state.questionIndex);
  els.remainQuestionCount.textContent = String(left);
  if (els.introRemainQuestions) {
    els.introRemainQuestions.textContent = String(left);
  }
}

function renderMeta() {
  const modeText = state.mode === "challenge" ? "応用編" : "基本編";
  const total = state.totalQuestionCount || 0;
  const current = Math.min(state.questionIndex + 1, total);
  const left = Math.max(0, state.totalQuestionCount - state.questionIndex);
  updateRemainQuestionsUi();
  els.sessionMeta.textContent = `${modeText} | ${current}/${total} | 残り${left}問 | ${state.score}点 | セッション残り${state.remainSec}秒`;
}

function renderQuestionTimer() {
  const limit = state.currentQuestionLimit;
  els.questionTimer.textContent = `回答: ${state.questionRemainSec}秒（上限${limit}秒）`;
}

function prepareIntroAndWaitGo() {
  if (state.questionIndex >= state.totalQuestionCount) {
    finishSession();
    return;
  }
  ensureBlockForCurrentIndex();
  if (state.pendingSetQuestionSeconds != null) {
    state.currentQuestionLimit = state.pendingSetQuestionSeconds;
    state.pendingSetQuestionSeconds = null;
  }
  if (state.pendingAddQuestionSecondsSec) {
    state.currentQuestionLimit = clampQuestionSeconds(state.currentQuestionLimit + state.pendingAddQuestionSecondsSec);
    state.pendingAddQuestionSecondsSec = 0;
  }
  state.currentQuestion = makeQuestionForSlot(state.questionIndex, state.blockWeightKg, state.mode);
  els.introWeight.textContent = String(state.blockWeightKg);
  els.introDrug.textContent = `${state.currentQuestion.drug}　${state.currentQuestion.mgPer50ml}mg／50ml`;
  updateLevelLine();
  updateRpgUi();
  updateRemainQuestionsUi();
  els.questionTimer.textContent = "GO で指導医の指示";
  els.goBtn.focus();
}

function ensureBlockForCurrentIndex() {
  const blockIdx = Math.floor(state.questionIndex / BLOCK_SIZE);
  if (blockIdx === state.lastBlockIndex) {
    return false;
  }

  // 前のブロック（直近BLOCK_SIZE問）の成績を見てtier昇格判定
  if (blockIdx >= 1) {
    maybeAdvanceRpgTier();
  }
  state.lastBlockIndex = blockIdx;

  const weightPool = WEIGHTS_BY_TIER[state.rpgTierIdx] || WEIGHTS;
  state.blockWeightKg = pick(weightPool);

  if (blockIdx === 0) {
    state.level = 1;
    state.currentQuestionLimit = LEVEL_1_SECONDS;
  } else if (blockIdx === 1) {
    const block0 = state.answers.slice(0, BLOCK_SIZE);
    state.currentQuestionLimit = computeSecondsForTargetAccuracy(block0);
    state.level = 2;
    const tierFactor = 1 - state.rpgTierIdx * 0.02;
    state.currentQuestionLimit = clampQuestionSeconds(state.currentQuestionLimit * tierFactor);
  } else {
    state.level += 1;
    const tierFactor = 1 - state.rpgTierIdx * 0.015;
    state.currentQuestionLimit = clampQuestionSeconds(state.currentQuestionLimit * BLOCK_SECONDS_SHRINK * tierFactor);
  }
  updateLevelLine();
  updateRpgUi();
  return true;
}

function renderQuestion() {
  const q = state.currentQuestion;
  if (!q) return;
  els.gameLimitPerQuestion.textContent = String(state.currentQuestionLimit);
  els.questionContextWeight.textContent = `体重 ${state.blockWeightKg} kg（このブロック共通）`;
  els.questionText.textContent = q.text;
  els.answerInput.value = "";
  els.answerInput.focus();

  state.questionStartedAt = Date.now();
  state.questionRemainSec = state.currentQuestionLimit;
  renderQuestionTimer();
  clearInterval(state.questionTimerId);
  state.questionTimerId = setInterval(tickQuestion, 1000);
  renderMeta();
}

function tickQuestion() {
  if (state.status !== "running" || state.recoveryOpen) return;
  state.questionRemainSec -= 1;
  renderQuestionTimer();
  if (state.questionRemainSec <= 0) {
    state.timeoutCount += 1;
    evaluateAnswer({ forcedTimeout: true });
  }
}

function gradeAnswer() {
  if (state.recoveryOpen) return;
  if (!els.roundResultOverlay.classList.contains("hidden")) return;
  evaluateAnswer({ forcedTimeout: false });
}

function evaluateAnswer({ forcedTimeout }) {
  if (!forcedTimeout && state.status !== "running") return;
  if (forcedTimeout && state.status !== "running") return;
  if (!els.roundResultOverlay.classList.contains("hidden")) return;

  const q = state.currentQuestion;
  let roundedInput = null;
  let correct = false;

  if (!forcedTimeout) {
    const raw = els.answerInput.value;
    if (!raw) {
      alert("回答を入力してください。");
      return;
    }
    const inputRate = Number(raw);
    if (Number.isNaN(inputRate) || inputRate < 0) {
      alert("0以上の数値を入力してください。");
      return;
    }
    roundedInput = round1(inputRate);
  }
  const roundedAnswer = round1(q.answerMlPerHour);
  if (!forcedTimeout) {
    const delta = Math.abs(roundedInput - roundedAnswer);
    correct = delta <= 0.1;
  }

  if (correct) {
    state.score += 100;
    state.streak += 1;
    if (state.streak > 0 && state.streak % 3 === 0) state.score += 40;
  } else {
    state.score -= 30;
    if (q.drug === "ノルアドレナリン") state.score -= 30;
    state.streak = 0;
  }

  const limitMs = state.currentQuestionLimit * 1000;
  const startAt = state.questionStartedAt || Date.now();
  const elapsedMs = forcedTimeout ? limitMs : Math.min(limitMs, Date.now() - startAt);
  const timeUsedSec = Math.round((elapsedMs / 1000) * 10) / 10;

  clearInterval(state.questionTimerId);

  const subline = `正答 ${roundedAnswer.toFixed(1)} ml/h`;
  let headline;
  let resultClass;
  if (correct) {
    headline = "正解";
    resultClass = "is-correct";
  } else if (forcedTimeout) {
    headline = "時間切れ";
    resultClass = "is-timeout";
  } else {
    headline = "不正解";
    resultClass = "is-wrong";
  }

  const answerRow = {
    questionId: q.id,
    category: q.category,
    drug: q.drug,
    weightKg: q.weightKg,
    orderGamma: q.orderGamma,
    answerMlPerHour: roundedAnswer,
    inputMlPerHour: roundedInput,
    timeout: forcedTimeout,
    correct,
    level: state.level,
    timeUsedSec
  };

  showRoundResultThen(headline, subline, resultClass, () => {
    state.answers.push(answerRow);
    state.questionIndex += 1;
    state.questionStartedAt = null;
    if (state.questionIndex >= state.totalQuestionCount) {
      finishSession();
      return;
    }
    if (applyConsecutiveLowAccuracyCheck()) {
      els.questionArea.classList.add("hidden");
      els.submitAnswerBtn.disabled = true;
      els.gameIntro.classList.add("hidden");
      els.gameMain.classList.remove("game-main--intro-only");
      showRecoveryOverlay();
      renderMeta();
      return;
    }
    proceedToNextQuestionIntroFromAnswer();
  });
}

function finishSession() {
  clearInterval(state.sessionTimerId);
  clearInterval(state.questionTimerId);
  hideRoundResultOverlay();
  hideRecoveryOverlay();
  const elapsedSec = Math.max(1, Math.round((Date.now() - state.startAt) / 1000));
  const timeFactor = state.mode === "challenge" ? Math.max(0.7, 1 - elapsedSec / 1000) : 1;
  const finalScore = Math.round(state.score * timeFactor);
  const passText = finalScore >= 70 ? "到達基準クリア" : "再受講推奨";
  state.status = "completed";
  els.sessionMeta.textContent = `終了 | 最終スコア ${finalScore} | ${passText}`;
  els.questionTimer.textContent = "終了";
  els.questionArea.classList.add("hidden");
  els.gameIntro.classList.add("hidden");
  els.gameMain.classList.remove("game-main--intro-only");
  els.submitAnswerBtn.disabled = true;

  const totalQ = state.totalQuestionCount;
  const correctCount = state.answers.filter((a) => a.correct).length;
  const accuracyPct = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

  state.pendingAttempt = {
    name: state.playerName,
    mode: state.mode,
    status: "completed",
    score: finalScore,
    elapsedSec,
    timeoutCount: state.timeoutCount,
    totalQuestions: totalQ,
    correctCount,
    accuracyPct,
    answers: state.answers,
    at: new Date().toISOString(),
    rpgTierIdx: state.rpgTierIdx,
    rpgTierName: RPG_TIERS[state.rpgTierIdx] || RPG_TIERS[0]
  };

  els.gameEndScoreLine.textContent = `最終スコア ${finalScore}点（${passText}）`;
  els.gameEndAccuracyBig.textContent = `正答率 ${accuracyPct}%`;
  els.gameEndDetail.textContent = `${correctCount} / ${totalQ} 問 正解`;
  renderGameEndRpgSummary();
  els.saveLogBtn.disabled = false;
  els.saveLogStatus.classList.add("hidden");
  els.saveLogStatus.textContent = "";
  els.gameEndFooter.classList.remove("hidden");
}

function resolveRecoveryChoice(easier) {
  hideRecoveryOverlay();
  if (easier) {
    state.level = Math.max(1, state.level - 1);
    // RPGでも1段階戻す（「LVを落とす」体験に合わせる）
    state.rpgTierIdx = Math.max(0, state.rpgTierIdx - 1);

    if (state.level <= 1) {
      state.pendingSetQuestionSeconds = LEVEL_1_SECONDS;
      state.pendingAddQuestionSecondsSec = 0;
    } else {
      state.pendingAddQuestionSecondsSec = EASIER_SECONDS_BONUS;
      state.pendingSetQuestionSeconds = null;
    }

    updateRpgUi();
  }
  proceedToNextQuestionIntroFromAnswer();
}

function abortSession() {
  if (state.status !== "running") return;
  clearInterval(state.sessionTimerId);
  clearInterval(state.questionTimerId);
  hideRoundResultOverlay();
  hideRecoveryOverlay();
  const elapsedSec = Math.max(1, Math.round((Date.now() - state.startAt) / 1000));
  const timeFactor = state.mode === "challenge" ? Math.max(0.7, 1 - elapsedSec / 1000) : 1;
  const provisionalScore = Math.round(state.score * timeFactor);
  const totalQ = state.totalQuestionCount;
  const answered = state.answers.length;
  const correctCount = state.answers.filter((a) => a.correct).length;
  const accuracyPct = answered > 0 ? Math.round((correctCount / answered) * 100) : 0;
  state.status = "aborted";
  els.sessionMeta.textContent = `中止 | 回答 ${answered}/${totalQ} 問 | 換算スコア ${provisionalScore}`;
  els.questionTimer.textContent = "中止";
  els.questionArea.classList.add("hidden");
  els.gameIntro.classList.add("hidden");
  els.gameMain.classList.remove("game-main--intro-only");
  els.submitAnswerBtn.disabled = true;

  state.pendingAttempt = {
    name: state.playerName,
    mode: state.mode,
    status: "aborted",
    score: provisionalScore,
    elapsedSec,
    timeoutCount: state.timeoutCount,
    totalQuestions: totalQ,
    answeredQuestions: answered,
    correctCount,
    accuracyPct,
    answers: state.answers,
    at: new Date().toISOString(),
    rpgTierIdx: state.rpgTierIdx,
    rpgTierName: RPG_TIERS[state.rpgTierIdx] || RPG_TIERS[0]
  };

  els.gameEndScoreLine.textContent = `セッション中止（回答 ${answered} / ${totalQ} 問・換算スコア ${provisionalScore}点）`;
  els.gameEndAccuracyBig.textContent = `正答率 ${accuracyPct}%`;
  els.gameEndDetail.textContent = `${correctCount} / ${answered} 問 正解`;
  renderGameEndRpgSummary();
  els.saveLogBtn.disabled = false;
  els.saveLogStatus.classList.add("hidden");
  els.saveLogStatus.textContent = "";
  els.gameEndFooter.classList.remove("hidden");
}

function makeQuestionForSlot(index, weightKg, mode) {
  if (mode === "study") {
    return makeRemiQuestion(index + 1, weightKg);
  }
  // RPGのtierに応じて「応用（nora）」が出やすくなる
  const tier = state.rpgTierIdx;
  const prob = RPG_ADVANCED_PROB_BY_TIER[tier] || RPG_ADVANCED_PROB_BY_TIER[0];
  const x = Math.sin((index + 1) * 999 + tier * 1234) * 10000;
  const frac = Math.abs(x) % 1;
  const advanced = frac < prob;
  return advanced ? makeNoraQuestion(index + 1, weightKg) : makeRemiQuestion(index + 1, weightKg);
}

function pickGammaForTier(list, tier) {
  const startIdx = Math.min(list.length - 1, tier);
  return pick(list.slice(startIdx));
}

function makeRemiQuestion(seq, weightKg) {
  const orderGamma = pickGammaForTier(REMI_ORDER_GAMMA, state.rpgTierIdx);
  return makeQuestion({
    seq,
    category: "基本編",
    drug: "レミフェンタニル",
    mgPer50ml: 5,
    weightKg,
    orderGamma
  });
}

function makeNoraQuestion(seq, weightKg) {
  const orderGamma = pickGammaForTier(NORA_ORDER_GAMMA, state.rpgTierIdx);
  const mgPer50ml = Math.random() < 0.5 ? 3 : 5;
  return makeQuestion({
    seq,
    category: "応用編",
    drug: "ノルアドレナリン",
    mgPer50ml,
    weightKg,
    orderGamma
  });
}

function makeQuestion({ seq, category, drug, mgPer50ml, weightKg, orderGamma }) {
  const concentrationMcgPerMl = (mgPer50ml * 1000) / 50;
  const answerMlPerHour = (orderGamma * weightKg * 60) / concentrationMcgPerMl;
  const text = `「${orderGamma}γ（μg/kg/min）で持続しろ」。何 ml/h？`;
  return {
    id: `q${seq}`,
    category,
    drug,
    mgPer50ml,
    weightKg,
    orderGamma,
    answerMlPerHour,
    text,
    explanation: "式: ml/h = γ(μg/kg/min) × 体重(kg) × 60 ÷ 濃度(μg/ml)"
  };
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function calcRender() {
  els.calcDisplay.textContent = calc.expr || "0";
}

function calcReset() {
  calc.expr = "0";
  calcRender();
}

function safeEvalArithmetic(str) {
  const compact = str.replace(/\s/g, "");
  if (!/^[\d.+\-*/]+$/.test(compact)) return NaN;
  try {
    return Function(`"use strict"; return (${compact})`)();
  } catch {
    return NaN;
  }
}

function calcPress(key) {
  if (key === "C") {
    calc.expr = "0";
    calcRender();
    return;
  }
  if (key === "⌫") {
    if (calc.expr.length <= 1) calc.expr = "0";
    else calc.expr = calc.expr.slice(0, -1);
    calcRender();
    return;
  }
  if (key === "=") {
    const v = safeEvalArithmetic(calc.expr);
    if (!Number.isFinite(v)) {
      calc.expr = "Error";
    } else {
      const rounded = Math.round(v * 1e6) / 1e6;
      calc.expr = String(rounded);
    }
    calcRender();
    return;
  }

  if (calc.expr === "Error") calc.expr = "0";
  if (calc.expr === "0" && /[0-9]/.test(key)) {
    calc.expr = key;
    calcRender();
    return;
  }
  if (key === "." && calc.expr.includes(".") && !/[+\-*/]/.test(calc.expr.slice(-1))) {
    const parts = calc.expr.split(/[+\-*/]/);
    const last = parts[parts.length - 1];
    if (last.includes(".")) return;
  }
  calc.expr += key;
  calcRender();
}

function calcToAnswer() {
  if (calc.expr === "Error") return;
  const v = Number(calc.expr);
  if (!Number.isFinite(v)) return;
  els.answerInput.value = String(round1(v));
}

function startQuestionFromIntro() {
  if (state.status !== "running" || state.recoveryOpen) return;
  els.gameIntro.classList.add("hidden");
  els.gameMain.classList.remove("game-main--intro-only");
  els.questionArea.classList.remove("hidden");
  els.submitAnswerBtn.disabled = false;
  renderQuestion();
}

function enterTopPage() {
  const name = els.playerName.value;
  if (!name) {
    alert("受講者を選択してください。");
    return;
  }
  state.playerName = name;
  els.welcomeName.textContent = state.playerName;
  els.topPage.classList.add("hidden");
  els.contentPage.classList.remove("hidden");
  renderLeaderboard();
  renderDashboard();
  renderGammaRpgOnContentPage();
}

els.calcGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-calc]");
  if (!btn) return;
  calcPress(btn.dataset.calc);
});

els.calcToAnswerBtn.addEventListener("click", calcToAnswer);
els.goBtn.addEventListener("click", startQuestionFromIntro);

els.enterBtn.addEventListener("click", enterTopPage);
els.startStudyBtn.addEventListener("click", () => openSessionLengthPicker("study"));
els.startChallengeBtn.addEventListener("click", () => openSessionLengthPicker("challenge"));

els.sessionLen5Btn.addEventListener("click", () => {
  const m = pendingGameMode;
  if (!m) return;
  closeSessionLengthPicker();
  startMode(m, 5);
});

els.sessionLen10Btn.addEventListener("click", () => {
  const m = pendingGameMode;
  if (!m) return;
  closeSessionLengthPicker();
  startMode(m, 10);
});

els.sessionLenCancelBtn.addEventListener("click", () => {
  closeSessionLengthPicker();
});
els.submitAnswerBtn.addEventListener("click", gradeAnswer);
els.answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !els.submitAnswerBtn.disabled) {
    e.preventDefault();
    e.stopPropagation();
    gradeAnswer();
  }
});

els.saveLogBtn.addEventListener("click", () => {
  const attempt = state.pendingAttempt;
  if (!attempt || !state.playerName) return;
  saveAttemptForPlayer(state.playerName, attempt);
  if (attempt.mode === "challenge") {
    const leaders = loadLeaderboardForPlayer(state.playerName);
    leaders.push({
      score: attempt.score,
      elapsedSec: attempt.elapsedSec,
      at: attempt.at,
      totalQuestions: attempt.totalQuestions,
      accuracyPct: attempt.accuracyPct
    });
    leaders.sort((a, b) => (b.score - a.score) || (a.elapsedSec - b.elapsedSec));
    saveLeaderboardForPlayer(state.playerName, leaders.slice(0, 10));
  }
  state.pendingAttempt = null;
  els.saveLogBtn.disabled = true;
  els.saveLogStatus.textContent = "ログに登録しました。この端末のブラウザに保存されています。";
  els.saveLogStatus.classList.remove("hidden");
  renderLeaderboard();
  renderDashboard();
  renderGammaRpgOnContentPage();
});

els.gameFullscreen.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (els.gameFullscreen.classList.contains("hidden")) return;
  if (!els.gameEndFooter.classList.contains("hidden")) return;
  if (!els.roundResultOverlay.classList.contains("hidden")) return;
  if (els.recoveryOverlay && !els.recoveryOverlay.classList.contains("hidden")) return;
  if (!els.gameIntro.classList.contains("hidden") && state.status === "running") {
    e.preventDefault();
    startQuestionFromIntro();
  }
});

els.recoveryEasierBtn.addEventListener("click", () => {
  if (state.status !== "running") return;
  resolveRecoveryChoice(true);
});
els.recoveryContinueBtn.addEventListener("click", () => {
  if (state.status !== "running") return;
  resolveRecoveryChoice(false);
});

els.abortSessionBtn.addEventListener("click", () => {
  if (state.status !== "running") return;
  if (!window.confirm("セッションを中止しますか？（入力済みの回答はログ保存まで保持されます）")) return;
  abortSession();
});

els.gameCloseBtn.addEventListener("click", () => {
  state.status = "idle";
  state.pendingAttempt = null;
  hideRoundResultOverlay();
  hideRecoveryOverlay();
  closeGameFullscreen();
  els.questionArea.classList.add("hidden");
  els.gameIntro.classList.add("hidden");
  els.gameMain.classList.remove("game-main--intro-only");
  els.gameEndFooter.classList.add("hidden");
  renderGammaRpgOnContentPage();
});

renderLeaderboard();
renderDashboard();
renderGammaRpgOnContentPage();
