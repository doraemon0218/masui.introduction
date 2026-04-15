/** 50kg基準の暗算と相性のよい体重（主に5刻み・25の倍数） */
const STUDY_WEIGHTS = [40, 45, 50, 55, 60, 65, 70];
const STUDY_REMI_ORDER_GAMMA = [0.025, 0.05, 0.125, 0.25, 0.5];
const CHALLENGE_WEIGHTS = [40, 45, 50, 55, 60, 65, 70, 75, 80];
const ADVANCED_WEIGHTS = [5, 10, 12.5, 25, 40, 45, 50];
const CHALLENGE_DRUG_POOL = [
  {
    key: "remi",
    category: "基本編",
    drug: "レミフェンタニル",
    mgPer50ml: 5,
    orderGammaList: [0.05, 0.1, 0.15, 0.2, 0.25]
  },
  {
    key: "nora",
    category: "応用編",
    drug: "ノルアドレナリン",
    mgPer50ml: [3, 5],
    orderGammaList: [0.03, 0.05, 0.08, 0.1, 0.15]
  },
  {
    key: "dobutamine",
    category: "応用編",
    drug: "ドブタミン",
    mgPer50ml: 150,
    orderGammaList: [2, 3, 5, 7, 10]
  },
  {
    key: "hanp",
    category: "応用編",
    drug: "hANP",
    mgPer50ml: 2,
    orderGammaList: [0.01, 0.02, 0.03, 0.05, 0.1]
  }
];
const ADVANCED_DRUG_POOL = [
  {
    key: "dobutamine",
    category: "発展編",
    drug: "ドブタミン",
    mgPer50ml: 150,
    orderGammaList: [2, 3, 5, 7, 10]
  },
  {
    key: "milrinone",
    category: "発展編",
    drug: "ミルリノン",
    mgPer50ml: 10,
    orderGammaList: [0.2, 0.3, 0.5, 0.75]
  },
  {
    key: "hanp",
    category: "発展編",
    drug: "hANP",
    mgPer50ml: 2,
    orderGammaList: [0.01, 0.02, 0.03, 0.05]
  }
];
const PRACTICAL_DILUTION_OPTIONS = {
  hANP: [
    { label: "hANP 1000μg/50ml（20μg/ml）", mgPer50ml: 1, source: "公開例A" },
    { label: "hANP 2000μg/50ml（40μg/ml）", mgPer50ml: 2, source: "公開例B" }
  ],
  nora: [
    { label: "ノルアドレナリン 1mg/50ml（20μg/ml）", mgPer50ml: 1, source: "公開例A" },
    { label: "ノルアドレナリン 3mg/50ml（60μg/ml）", mgPer50ml: 3, source: "公開例B" },
    { label: "ノルアドレナリン 5mg/50ml（100μg/ml）", mgPer50ml: 5, source: "公開例C" }
  ]
};
const ADVANCED_PRACTICAL_DRUG_POOL = [
  {
    key: "hanp",
    category: "発展編（本番）",
    drug: "hANP",
    orderGammaList: [0.01, 0.02, 0.03, 0.05],
    dilutionOptions: PRACTICAL_DILUTION_OPTIONS.hANP
  },
  {
    key: "nora",
    category: "発展編（本番）",
    drug: "ノルアドレナリン",
    orderGammaList: [0.03, 0.05, 0.08, 0.1],
    dilutionOptions: PRACTICAL_DILUTION_OPTIONS.nora
  },
  {
    key: "dobutamine",
    category: "発展編（本番）",
    drug: "ドブタミン",
    orderGammaList: [2, 3, 5, 7, 10],
    dilutionOptions: [{ label: "ドブタミン 150mg/50ml（固定）", mgPer50ml: 150, source: "院内標準" }]
  }
];
const BLOCK_SIZE = 5;
const SESSION_SECONDS = {
  study: 9999,
  challenge: 240,
  advanced: 240
};
const LEVEL_1_SECONDS = 45;
const MIN_QUESTION_SECONDS = 5;
const TARGET_BLOCK_ACCURACY = 0.8;
const BLOCK_SECONDS_SHRINK = 0.84;
const EASIER_SECONDS_BONUS = 12;
/** 正解かつ残り時間がこの割合以上なら速答ボーナス（制限時間の45%以内に回答） */
const SPEED_BONUS_TIME_RATIO = 0.45;
const SPEED_BONUS_POINTS = 15;
const ROUND_RESULT_MS = 2000;

/** ゲーム開始前チュートリアル（コマ送りスライド） */
const TUTORIAL_SLIDES = [
  {
    title: "γ（ガンマ）とは？　どんな単位？",
    paragraphs: [
      { text: "γ の単位は μg/kg/min（マイクログラム／キログラム／分）。" },
      { text: "＝ 体重 1kg あたり、1分間あたりに何 μg 流す速さ、という意味です。" }
    ]
  },
  {
    title: "分母に注目：/kg と /min",
    paragraphs: [
      {
        text: "「体重あたり」「毎分」が分母にあります。1時間（60分）分・体重（例：50kg）でまとめると、係数がはっきりします。"
      },
      { em: "/50kg・/60min のイメージ → 50×60＝3000 → ×3000" }
    ]
  },
  {
    title: "μg → mg と必要投与量",
    paragraphs: [
      { text: "μg を mg に変換します（÷1000）。" },
      { text: "そのうえで ×3 などの関係を掛け合わせると、必要な投与量（mg）が求まります（溶解濃度・手順に合わせる）。" }
    ]
  },
  {
    title: "溶解液の組成を振り返り → 1h あたりの ml",
    paragraphs: [
      { text: "主薬を何 mg / 50ml に溶かしたかで、濃度（μg/ml）が決まります。" },
      { text: "1時間に必要な mg( or μg) ÷ mg/ml( or μg/ml) ＝ その1時間に投与する ml。これが ml/h の考え方です。" }
    ]
  }
];

const AIRWAY_SCENARIOS = [
  {
    title: "症例A: RSIを要する困難気道ハイリスク",
    patient: "56歳男性、170cm 98kg。胃内容残留リスクあり。Mallampati III、開口2横指、頸部伸展制限。",
    steps: [
      {
        prompt: "Step1: 迅速導入（RSI）を行う。ロクロニウム投与量として推奨される action を選択してください。",
        options: [
          {
            text: "ロクロニウム 1.0-1.2mg/kg（実体重を基準に過不足を再評価）で迅速な筋弛緩を狙う",
            correct: true,
            rationale: "RSIで挿管条件を早く作るため、高用量ロクロニウムは標準的選択肢です。"
          },
          {
            text: "低用量（0.3mg/kg）で反応を見てから追加する",
            correct: false,
            rationale: "作用発現が遅くなり、RSIの意図と合いません。"
          },
          {
            text: "投与前に禁忌や術後遷延リスク（神経筋疾患、肝腎機能、拮抗薬準備）を確認する",
            correct: true,
            rationale: "投与量だけでなく安全確認が前提です。"
          },
          {
            text: "筋弛緩薬を使わず鎮静のみでRSIを完遂する",
            correct: false,
            rationale: "条件不良で挿管失敗率が上がります。"
          }
        ]
      },
      {
        prompt: "Step2: ロクロニウム投与後。作用発現〜挿管開始タイミングとして選ぶべき action は？",
        options: [
          {
            text: "無呼吸許容時間を意識しつつ、十分な弛緩発現（目安60-90秒）後に挿管を開始する",
            correct: true,
            rationale: "早すぎる挿管開始は視野不良・失敗を増やします。"
          },
          {
            text: "作用発現を待つ間も高品質プレオキシジェネーション継続を指示する",
            correct: true,
            rationale: "この時間の酸素化管理がその後の余裕を左右します。"
          },
          {
            text: "薬剤投与直後にすぐ喉頭展開して時間短縮する",
            correct: false,
            rationale: "弛緩不十分で失敗が増え、結果として時間損失になります。"
          },
          {
            text: "作用発現確認なしで複数回の展開を許容する",
            correct: false,
            rationale: "試行回数の増加は損傷と低酸素化リスクを上げます。"
          }
        ]
      },
      {
        prompt: "Step3: 相関困難（挿管困難）で1回目失敗。次に取るべき action は？",
        options: [
          {
            text: "同一手技の惰性反復を避け、デバイス/術者変更や体位最適化で次の一手を再構築する",
            correct: true,
            rationale: "DAMは反復ではなく、計画変更で成功率を上げます。"
          },
          {
            text: "試行回数の上限を明示し、酸素化が崩れる前に救済ルートへ移行する",
            correct: true,
            rationale: "“いつ切り替えるか”を先に決めるのが安全です。"
          },
          {
            text: "同じ喉頭鏡・同じ角度で成功するまで繰り返す",
            correct: false,
            rationale: "改善戦略がない反復は有害です。"
          },
          {
            text: "酸素化が保てていても救済器具準備は不要と判断する",
            correct: false,
            rationale: "急変時に間に合わなくなります。"
          }
        ]
      },
      {
        prompt: "Step4: 換気困難へ移行。最優先で選ぶべき action は？",
        options: [
          {
            text: "直ちに“酸素化回復”を最優先にし、声門上器具や二人法マスク換気へ移行する",
            correct: true,
            rationale: "CICV回避には酸素化再開が最優先です。"
          },
          {
            text: "ヘルプコールと前頸部アクセス準備を並行して開始する",
            correct: true,
            rationale: "悪化時に即移行できる準備を同時進行します。"
          },
          {
            text: "挿管成功にこだわり、酸素化が戻らなくても展開を継続する",
            correct: false,
            rationale: "低酸素障害リスクが急増します。"
          },
          {
            text: "チームへの状況共有は不要で、術者のみで継続判断する",
            correct: false,
            rationale: "チーム連携の欠如は対応遅延を招きます。"
          }
        ]
      }
    ]
  },
  {
    title: "症例B: 頸椎可動制限症例の導入判断",
    patient: "68歳女性、145cm 46kg。開口2横指、thyromental短、頸部伸展困難。誤嚥高リスク。",
    steps: [
      {
        prompt: "この症例での初期方針として適切なのは？",
        options: [
          {
            text: "覚醒下挿管の適応を検討し、困難気道宣言を行ってチームで共有する",
            correct: true,
            rationale: "可動制限・開口制限・誤嚥リスクがあり、覚醒下戦略の検討が妥当です。"
          },
          {
            text: "導入失敗時の中止基準（試行回数・SpO2閾値）を先に合意する",
            correct: true,
            rationale: "判断基準を先に明文化すると、緊急時でも迷いにくくなります。"
          },
          {
            text: "通常導入で問題なければそのまま進める",
            correct: false,
            rationale: "予測因子が多い症例で通常導入のみは危険です。"
          },
          {
            text: "導入直前に評価を再確認すれば十分",
            correct: false,
            rationale: "準備と人的配置は前倒しで必要です。"
          }
        ]
      },
      {
        prompt: "準備として優先度が高い組み合わせは？",
        options: [
          {
            text: "ファイバー/ビデオ喉頭鏡、吸引、局所麻酔セット、挿管後確認手段（ETCO2）",
            correct: true,
            rationale: "覚醒下を含む複数プランを実行可能なセットを先に整えます。"
          },
          {
            text: "誤嚥対策（十分な吸引、頭高位、補助者配置）を導入前チェックに組み込む",
            correct: true,
            rationale: "誤嚥高リスク症例では器材だけでなく体位と役割を含めた準備が必要です。"
          },
          {
            text: "ETチューブのみ複数サイズ準備し、他は必要時対応",
            correct: false,
            rationale: "器材不足で失敗時のリカバリーが遅れます。"
          },
          {
            text: "輪状軟骨圧のみ徹底し器具準備は省略",
            correct: false,
            rationale: "単一手段依存は不適切です。"
          }
        ]
      },
      {
        prompt: "導入薬剤の考え方として適切なのは？",
        options: [
          {
            text: "血行動態を見ながら少量漸増（例: フェンタニル + 低用量プロポフォール）し、換気確認後に次段階へ",
            correct: true,
            rationale: "高齢・小柄症例では過鎮静を避け、換気確認を優先します。"
          },
          {
            text: "効果発現待ちの観察時間を確保し、追加投与は反応を見て最小限にする",
            correct: true,
            rationale: "反応前の連続投与は過量化しやすく、循環抑制を招きます。"
          },
          {
            text: "標準成人量を一律で投与し、反応を見ない",
            correct: false,
            rationale: "過量投与リスクが高く危険です。"
          },
          {
            text: "薬剤は使わず手技のみで短時間に終える",
            correct: false,
            rationale: "苦痛・反射亢進・失敗増加の要因になります。"
          }
        ]
      },
      {
        prompt: "CICVに近い状況で取るべき行動は？",
        options: [
          {
            text: "早期にヘルプコールし、アルゴリズムに従って緊急前頸部アクセスへ移行判断する",
            correct: true,
            rationale: "CICVは時間勝負で、躊躇なく次段階へ進むことが重要です。"
          },
          {
            text: "酸素化再開を最優先に、チームで次手順を声に出して同期する",
            correct: true,
            rationale: "手順同期は混乱を減らし、必要手技への移行速度を上げます。"
          },
          {
            text: "SpO2が保てなくても同じ手技を続ける",
            correct: false,
            rationale: "低酸素障害リスクが急速に上昇します。"
          },
          {
            text: "いったん手術を開始して時間を稼ぐ",
            correct: false,
            rationale: "気道未確保での手術開始は不可能です。"
          }
        ]
      }
    ]
  }
];

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

let pendingGameMode = null;
let pendingStudyTotalQuestions = null;
let pendingAdvancedTotalQuestions = null;
let roundResultTimerId = null;

const state = {
  playerName: "",
  mode: null,
  advancedVariant: "standard",
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
  pendingAddQuestionSecondsSec: 0,
  tutorialOpen: false,
  tutorialSlideIndex: 0,
  /** ゲーム開始せずチュートリアルだけ全画面表示 */
  tutorialOnlyPreview: false,
  airway: {
    scenarioIdx: -1,
    stepIdx: 0,
    score: 0,
    answered: false,
    selectedOptionIndexes: [],
    stepSelectedTexts: [],
    durationMin: 0,
    remainSec: 0,
    timerId: null
  }
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
  startAdvancedBtn: document.getElementById("startAdvancedBtn"),
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
  questionPreparation: document.getElementById("questionPreparation"),
  questionConcentration: document.getElementById("questionConcentration"),
  questionGammaHint: document.getElementById("questionGammaHint"),
  dilutionChooser: document.getElementById("dilutionChooser"),
  dilutionSelect: document.getElementById("dilutionSelect"),
  dilutionSourceHint: document.getElementById("dilutionSourceHint"),
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
  advancedModeOverlay: document.getElementById("advancedModeOverlay"),
  advancedModeStandardBtn: document.getElementById("advancedModeStandardBtn"),
  advancedModePracticalBtn: document.getElementById("advancedModePracticalBtn"),
  advancedModeCancelBtn: document.getElementById("advancedModeCancelBtn"),
  airwayDurationOverlay: document.getElementById("airwayDurationOverlay"),
  airwayDur3Btn: document.getElementById("airwayDur3Btn"),
  airwayDur5Btn: document.getElementById("airwayDur5Btn"),
  airwayDur10Btn: document.getElementById("airwayDur10Btn"),
  airwayDurCancelBtn: document.getElementById("airwayDurCancelBtn"),
  studyTutorialChoiceOverlay: document.getElementById("studyTutorialChoiceOverlay"),
  studyWithTutorialBtn: document.getElementById("studyWithTutorialBtn"),
  studySkipTutorialBtn: document.getElementById("studySkipTutorialBtn"),
  studyTutorialCancelBtn: document.getElementById("studyTutorialCancelBtn"),
  openTutorialOnlyBtn: document.getElementById("openTutorialOnlyBtn"),
  startAirwayScenarioBtn: document.getElementById("startAirwayScenarioBtn"),
  airwayFullscreen: document.getElementById("airwayFullscreen"),
  airwayCloseBtn: document.getElementById("airwayCloseBtn"),
  airwayScenarioTitle: document.getElementById("airwayScenarioTitle"),
  airwayScenarioMeta: document.getElementById("airwayScenarioMeta"),
  airwayScenarioPatient: document.getElementById("airwayScenarioPatient"),
  airwayStepPrompt: document.getElementById("airwayStepPrompt"),
  airwayOptions: document.getElementById("airwayOptions"),
  airwayFeedback: document.getElementById("airwayFeedback"),
  airwaySubmitStepBtn: document.getElementById("airwaySubmitStepBtn"),
  airwayNextStepBtn: document.getElementById("airwayNextStepBtn"),
  airwayRestartBtn: document.getElementById("airwayRestartBtn"),
  remainQuestionCount: document.getElementById("remainQuestionCount"),
  introRemainQuestions: document.getElementById("introRemainQuestions"),
  abortSessionBtn: document.getElementById("abortSessionBtn"),
  recoveryOverlay: document.getElementById("recoveryOverlay"),
  recoveryEasierBtn: document.getElementById("recoveryEasierBtn"),
  recoveryContinueBtn: document.getElementById("recoveryContinueBtn"),
  tutorialOverlay: document.getElementById("tutorialOverlay"),
  tutorialProgress: document.getElementById("tutorialProgress"),
  tutorialTitle: document.getElementById("tutorialTitle"),
  tutorialBody: document.getElementById("tutorialBody"),
  tutorialPrevBtn: document.getElementById("tutorialPrevBtn"),
  tutorialNextBtn: document.getElementById("tutorialNextBtn"),
  tutorialSkipBtn: document.getElementById("tutorialSkipBtn"),
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

function openAirwayFullscreen() {
  if (!els.airwayFullscreen) return;
  els.airwayFullscreen.classList.remove("hidden");
  els.airwayFullscreen.setAttribute("aria-hidden", "false");
  document.body.classList.add("airway-active");
}

function closeAirwayFullscreen() {
  if (!els.airwayFullscreen) return;
  clearInterval(state.airway.timerId);
  state.airway.timerId = null;
  els.airwayFullscreen.classList.add("hidden");
  els.airwayFullscreen.setAttribute("aria-hidden", "true");
  document.body.classList.remove("airway-active");
}

function openAirwayDurationPicker() {
  if (!els.airwayDurationOverlay) return;
  els.airwayDurationOverlay.classList.remove("hidden");
}

function closeAirwayDurationPicker() {
  if (!els.airwayDurationOverlay) return;
  els.airwayDurationOverlay.classList.add("hidden");
}

function formatAirwayRemain(sec) {
  const s = Math.max(0, sec);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function tickAirwayTimer() {
  if (state.airway.remainSec <= 0) return;
  state.airway.remainSec -= 1;
  if (els.airwayScenarioMeta) {
    els.airwayScenarioMeta.textContent = `残り ${formatAirwayRemain(state.airway.remainSec)} | Step ${state.airway.stepIdx + 1}`;
  }
  if (state.airway.remainSec <= 0) {
    clearInterval(state.airway.timerId);
    state.airway.timerId = null;
    if (els.airwayFeedback) {
      els.airwayFeedback.classList.remove("hidden", "correct");
      els.airwayFeedback.classList.add("wrong");
      els.airwayFeedback.textContent = "学習時間が終了しました。いったん一覧に戻るか、別症例で再開してください。";
    }
    if (els.airwaySubmitStepBtn) els.airwaySubmitStepBtn.disabled = true;
    if (els.airwayNextStepBtn) els.airwayNextStepBtn.disabled = true;
    if (els.airwayRestartBtn) els.airwayRestartBtn.classList.remove("hidden");
  }
}

function startAirwayScenarioTraining(durationMin) {
  closeAirwayDurationPicker();
  openAirwayFullscreen();
  state.airway.scenarioIdx = Math.floor(Math.random() * AIRWAY_SCENARIOS.length);
  state.airway.stepIdx = 0;
  state.airway.score = 0;
  state.airway.answered = false;
  state.airway.selectedOptionIndexes = [];
  state.airway.stepSelectedTexts = [];
  state.airway.durationMin = durationMin;
  state.airway.remainSec = durationMin * 60;
  clearInterval(state.airway.timerId);
  state.airway.timerId = setInterval(tickAirwayTimer, 1000);
  if (els.airwayRestartBtn) els.airwayRestartBtn.classList.add("hidden");
  if (els.airwaySubmitStepBtn) els.airwaySubmitStepBtn.classList.remove("hidden");
  if (els.airwayNextStepBtn) els.airwayNextStepBtn.disabled = false;
  renderAirwayStep();
}

function renderAirwayStep() {
  const sIdx = state.airway.scenarioIdx;
  if (sIdx < 0 || sIdx >= AIRWAY_SCENARIOS.length) return;
  const scenario = AIRWAY_SCENARIOS[sIdx];
  const step = scenario.steps[state.airway.stepIdx];
  if (!step) {
    renderAirwayResult();
    return;
  }
  if (!els.airwayScenarioTitle || !els.airwayScenarioMeta || !els.airwayScenarioPatient || !els.airwayStepPrompt || !els.airwayOptions) return;
  els.airwayScenarioTitle.textContent = scenario.title;
  els.airwayScenarioMeta.textContent = `残り ${formatAirwayRemain(state.airway.remainSec)} | Step ${state.airway.stepIdx + 1} / ${scenario.steps.length}`;
  els.airwayScenarioPatient.textContent = `患者情報: ${scenario.patient}`;
  const prevTexts = state.airway.stepSelectedTexts[state.airway.stepIdx - 1] || [];
  if (state.airway.stepIdx > 0 && prevTexts.length > 0) {
    els.airwayStepPrompt.textContent = `${step.prompt}\n（前Stepで選択: ${prevTexts.join(" / ")}）`;
  } else {
    els.airwayStepPrompt.textContent = step.prompt;
  }
  if (els.airwayFeedback) {
    els.airwayFeedback.classList.add("hidden");
    els.airwayFeedback.classList.remove("correct", "wrong");
    els.airwayFeedback.textContent = "";
  }
  if (els.airwayNextStepBtn) els.airwayNextStepBtn.classList.add("hidden");
  if (els.airwaySubmitStepBtn) els.airwaySubmitStepBtn.disabled = false;
  els.airwayOptions.replaceChildren();
  step.options.forEach((opt, idx) => {
    const label = document.createElement("label");
    label.className = "airway-option-label";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = String(idx);
    const text = document.createElement("span");
    text.textContent = opt.text;
    label.appendChild(input);
    label.appendChild(text);
    els.airwayOptions.appendChild(label);
  });
  state.airway.answered = false;
}

function submitAirwayStep() {
  if (state.airway.answered || !els.airwayOptions || state.airway.remainSec <= 0) return;
  const checks = Array.from(els.airwayOptions.querySelectorAll("input[type='checkbox']"));
  const selectedIndexes = checks
    .map((input, idx) => ({ idx, checked: input.checked }))
    .filter((x) => x.checked)
    .map((x) => x.idx);
  if (selectedIndexes.length === 0) {
    if (els.airwayFeedback) {
      els.airwayFeedback.classList.remove("hidden", "correct");
      els.airwayFeedback.classList.add("wrong");
      els.airwayFeedback.textContent = "1つ以上の action を選択してから判定してください。";
    }
    return;
  }
  state.airway.answered = true;
  state.airway.selectedOptionIndexes = selectedIndexes;
  state.airway.stepSelectedTexts[state.airway.stepIdx] = selectedIndexes.map((idx) => step.options[idx].text);
  const scenario = AIRWAY_SCENARIOS[state.airway.scenarioIdx];
  const step = scenario.steps[state.airway.stepIdx];
  const recommendedIdx = step.options.map((opt, idx) => ({ idx, ok: opt.correct })).filter((x) => x.ok).map((x) => x.idx);
  const selectedRecommended = selectedIndexes.filter((idx) => recommendedIdx.includes(idx));
  const missed = recommendedIdx.filter((idx) => !selectedIndexes.includes(idx));
  const risky = selectedIndexes.filter((idx) => !recommendedIdx.includes(idx));

  checks.forEach((input) => {
    input.disabled = true;
    const idx = Number(input.value);
    if (recommendedIdx.includes(idx)) {
      input.parentElement?.classList.add("is-recommended");
    }
    if (risky.includes(idx)) {
      input.parentElement?.classList.add("is-risky");
    }
  });

  if (missed.length === 0 && risky.length === 0) {
    state.airway.score += 1;
  }
  if (els.airwayFeedback) {
    els.airwayFeedback.classList.remove("hidden");
    const solved = missed.length === 0 && risky.length === 0;
    els.airwayFeedback.classList.add(solved ? "correct" : "wrong");
    const goodLine = selectedRecommended.length
      ? `選べた推奨 action: ${selectedRecommended.map((idx) => step.options[idx].text).join(" / ")}`
      : "選べた推奨 action: なし";
    const missLine = missed.length
      ? `不足している action: ${missed.map((idx) => step.options[idx].text).join(" / ")}`
      : "不足している action: なし";
    const riskLine = risky.length
      ? `再検討したい action: ${risky.map((idx) => step.options[idx].text).join(" / ")}`
      : "再検討したい action: なし";
    const rationale = step.options
      .filter((opt) => opt.correct)
      .map((opt) => opt.rationale)
      .join(" ");
    els.airwayFeedback.textContent = `${solved ? "整理できています。" : "思考を再整理しましょう。"} ${goodLine} / ${missLine} / ${riskLine} ${rationale}`;
  }
  if (els.airwaySubmitStepBtn) els.airwaySubmitStepBtn.disabled = true;
  if (els.airwayNextStepBtn) {
    const isLast = state.airway.stepIdx >= scenario.steps.length - 1;
    els.airwayNextStepBtn.textContent = isLast ? "症例をふり返る" : "次の判断へ";
    els.airwayNextStepBtn.classList.remove("hidden");
  }
}

function goNextAirwayStep() {
  if (state.airway.remainSec <= 0) return;
  const scenario = AIRWAY_SCENARIOS[state.airway.scenarioIdx];
  if (!scenario) return;
  if (state.airway.stepIdx < scenario.steps.length - 1) {
    state.airway.stepIdx += 1;
    renderAirwayStep();
    return;
  }
  renderAirwayResult();
}

function renderAirwayResult() {
  const scenario = AIRWAY_SCENARIOS[state.airway.scenarioIdx];
  if (!scenario || !els.airwayScenarioMeta || !els.airwayStepPrompt || !els.airwayOptions || !els.airwayFeedback) return;
  const total = scenario.steps.length;
  const score = state.airway.score;
  els.airwayScenarioMeta.textContent = `完了 ${score} / ${total}（残り ${formatAirwayRemain(state.airway.remainSec)}）`;
  els.airwayStepPrompt.textContent = "症例ふり返り: 何を先に考えるべきか";
  els.airwayOptions.replaceChildren();
  const ul = document.createElement("ul");
  ["予測される困難点を最初に言語化する", "Plan A/B/C（酸素化優先）を導入前に共有する", "薬剤量は患者背景に合わせて過量投与を避ける"].forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    ul.appendChild(li);
  });
  els.airwayOptions.appendChild(ul);
  els.airwayFeedback.classList.remove("hidden", "correct", "wrong");
  els.airwayFeedback.textContent = `スコア ${score}/${total}。正解だけでなく、各Stepの解説を読んで判断理由を確認してください。`;
  if (els.airwaySubmitStepBtn) els.airwaySubmitStepBtn.classList.add("hidden");
  if (els.airwayNextStepBtn) els.airwayNextStepBtn.classList.add("hidden");
  if (els.airwayRestartBtn) els.airwayRestartBtn.classList.remove("hidden");
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

function hideTutorialOverlay() {
  state.tutorialOpen = false;
  if (els.tutorialOverlay) els.tutorialOverlay.classList.add("hidden");
}

function renderTutorialSlide() {
  if (!els.tutorialBody || !els.tutorialTitle || !els.tutorialProgress) return;
  const n = TUTORIAL_SLIDES.length;
  const idx = Math.max(0, Math.min(state.tutorialSlideIndex, n - 1));
  state.tutorialSlideIndex = idx;
  const slide = TUTORIAL_SLIDES[idx];
  els.tutorialTitle.textContent = slide.title;
  els.tutorialProgress.textContent = `${idx + 1} / ${n}`;
  els.tutorialBody.replaceChildren();
  slide.paragraphs.forEach((para) => {
    if (para.text) {
      const p = document.createElement("p");
      p.textContent = para.text;
      els.tutorialBody.appendChild(p);
    }
    if (para.em) {
      const em = document.createElement("span");
      em.className = "tutorial-em";
      em.textContent = para.em;
      els.tutorialBody.appendChild(em);
    }
  });
  if (els.tutorialPrevBtn) els.tutorialPrevBtn.disabled = idx === 0;
  if (els.tutorialNextBtn) {
    if (idx >= n - 1) {
      els.tutorialNextBtn.textContent = state.tutorialOnlyPreview ? "閉じる" : "ゲームを始める";
    } else {
      els.tutorialNextBtn.textContent = "次へ";
    }
  }
  if (els.tutorialSkipBtn) {
    els.tutorialSkipBtn.textContent = state.tutorialOnlyPreview ? "閉じる" : "スキップ";
  }
}

function showTutorialBeforeGame() {
  state.tutorialOpen = true;
  state.tutorialSlideIndex = 0;
  if (els.tutorialOverlay) els.tutorialOverlay.classList.remove("hidden");
  els.questionTimer.textContent = "チュートリアル";
  renderTutorialSlide();
  renderMeta();
}

function tutorialGoNext() {
  if (!state.tutorialOpen) return;
  if (state.tutorialSlideIndex >= TUTORIAL_SLIDES.length - 1) {
    finishTutorialAndBeginGame();
    return;
  }
  state.tutorialSlideIndex += 1;
  renderTutorialSlide();
}

function tutorialGoPrev() {
  if (!state.tutorialOpen || state.tutorialSlideIndex <= 0) return;
  state.tutorialSlideIndex -= 1;
  renderTutorialSlide();
}

function beginSessionTimersAndIntro() {
  state.startAt = Date.now();
  clearInterval(state.sessionTimerId);
  state.sessionTimerId = setInterval(tickSession, 1000);
  els.gameIntro.classList.remove("hidden");
  els.gameMain.classList.add("game-main--intro-only");
  prepareIntroAndWaitGo();
  renderMeta();
  updateRpgUi();
}

function finishTutorialAndBeginGame() {
  hideTutorialOverlay();
  if (state.tutorialOnlyPreview) {
    state.tutorialOnlyPreview = false;
    state.tutorialSlideIndex = 0;
    closeGameFullscreen();
    els.questionTimer.textContent = "—";
    renderGammaRpgOnContentPage();
    renderMeta();
    return;
  }
  beginSessionTimersAndIntro();
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

function openAdvancedModePicker(totalQuestions) {
  pendingAdvancedTotalQuestions = totalQuestions;
  if (els.advancedModeOverlay) els.advancedModeOverlay.classList.remove("hidden");
}

function closeAdvancedModePicker() {
  if (els.advancedModeOverlay) els.advancedModeOverlay.classList.add("hidden");
  pendingAdvancedTotalQuestions = null;
}

function showStudyTutorialChoiceOverlay() {
  if (els.studyTutorialChoiceOverlay) els.studyTutorialChoiceOverlay.classList.remove("hidden");
}

function hideStudyTutorialChoiceOverlay() {
  if (els.studyTutorialChoiceOverlay) els.studyTutorialChoiceOverlay.classList.add("hidden");
  pendingStudyTotalQuestions = null;
}

function openTutorialPreviewOnly() {
  const name = state.playerName || (els.playerName && els.playerName.value);
  if (!name) {
    alert("先に入室してください。");
    return;
  }
  state.playerName = name;
  clearInterval(state.sessionTimerId);
  clearInterval(state.questionTimerId);
  hideRoundResultOverlay();
  hideRecoveryOverlay();
  hideTutorialOverlay();
  state.tutorialOnlyPreview = true;
  state.status = "idle";
  state.mode = null;
  state.tutorialSlideIndex = 0;
  state.sessionTimerId = null;
  els.saveLogBtn.disabled = false;
  els.saveLogStatus.classList.add("hidden");
  els.saveLogStatus.textContent = "";
  els.answerInput.value = "";
  els.submitAnswerBtn.disabled = true;
  els.questionArea.classList.add("hidden");
  els.gameIntro.classList.add("hidden");
  els.gameMain.classList.add("game-main--intro-only");
  els.gameEndFooter.classList.add("hidden");
  calcReset();
  openGameFullscreen();
  els.questionTimer.textContent = "チュートリアル";
  showTutorialBeforeGame();
  renderMeta();
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

function startMode(mode, totalQuestions, opts = {}) {
  const showTutorial = mode === "study" && opts.showTutorial === true;
  const advancedVariant = mode === "advanced" && opts.advancedVariant === "practical" ? "practical" : "standard";
  clearInterval(state.sessionTimerId);
  clearInterval(state.questionTimerId);
  hideRoundResultOverlay();
  hideRecoveryOverlay();
  hideTutorialOverlay();
  closeAdvancedModePicker();
  state.tutorialOnlyPreview = false;

  const name = state.playerName;
  state.playerName = name;
  state.mode = mode;
  state.advancedVariant = advancedVariant;
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
  state.startAt = null;
  state.remainSec = SESSION_SECONDS[mode];
  clearInterval(state.sessionTimerId);
  state.sessionTimerId = null;

  els.saveLogBtn.disabled = false;
  els.saveLogStatus.classList.add("hidden");
  els.saveLogStatus.textContent = "";
  els.answerInput.value = "";
  els.submitAnswerBtn.disabled = true;
  els.questionArea.classList.add("hidden");
  els.gameIntro.classList.add("hidden");
  els.gameMain.classList.add("game-main--intro-only");

  calcReset();
  openGameFullscreen();
  updateRemainQuestionsUi();
  updateRpgUi();

  if (showTutorial) {
    showTutorialBeforeGame();
  } else {
    beginSessionTimersAndIntro();
  }
}

function tickSession() {
  if (state.status !== "running" || state.recoveryOpen || state.tutorialOpen) return;
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

function modeLabel(mode) {
  if (mode === "challenge") return "応用編";
  if (mode === "advanced") return state.advancedVariant === "practical" ? "発展編（本番）" : "発展編";
  return "基本編";
}

function renderMeta() {
  if (state.tutorialOpen && state.tutorialOnlyPreview) {
    els.sessionMeta.textContent = "γ計算チュートリアル（閲覧のみ）";
    return;
  }
  const modeText = modeLabel(state.mode);
  const total = state.totalQuestionCount || 0;
  const current = Math.min(state.questionIndex + 1, total);
  const left = Math.max(0, state.totalQuestionCount - state.questionIndex);
  updateRemainQuestionsUi();
  if (state.tutorialOpen) {
    els.sessionMeta.textContent = `${modeText} | チュートリアル（${total}問） | コマ送りで確認`;
    return;
  }
  const streakPart = state.streak > 0 ? ` | 連続正解 ${state.streak}` : "";
  els.sessionMeta.textContent = `${modeText} | ${current}/${total} | 残り${left}問 | ${state.score}点${streakPart} | セッション残り${state.remainSec}秒`;
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
  state.blockWeightKg = pickQuestionWeight(state.mode);
  state.currentQuestion = makeQuestionForSlot(state.questionIndex, state.blockWeightKg, state.mode);
  els.introWeight.textContent = String(state.blockWeightKg);
  if (state.currentQuestion.practicalMode) {
    els.introDrug.textContent = `${state.currentQuestion.drug}　希釈法を選択`;
  } else {
    const introUnit = state.currentQuestion.drug === "hANP" ? "μg" : "mg";
    const introDose =
      state.currentQuestion.drug === "hANP"
        ? state.currentQuestion.mgPer50ml * 1000
        : state.currentQuestion.mgPer50ml;
    els.introDrug.textContent = `${state.currentQuestion.drug}　${introDose}${introUnit}／50ml`;
  }
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
  els.questionContextWeight.textContent = `体重 ${state.blockWeightKg} kg（この問）`;
  if (els.questionPreparation) {
    els.questionPreparation.textContent = q.preparationLine || "";
  }
  const isPractical = q.practicalMode === true && Array.isArray(q.practicalOptions);
  if (els.dilutionChooser && els.dilutionSelect && els.dilutionSourceHint) {
    if (isPractical) {
      els.dilutionChooser.classList.remove("hidden");
      els.dilutionSelect.replaceChildren();
      const ph = document.createElement("option");
      ph.value = "";
      ph.textContent = "希釈法を選択";
      els.dilutionSelect.appendChild(ph);
      q.practicalOptions.forEach((opt, idx) => {
        const o = document.createElement("option");
        o.value = String(idx);
        o.textContent = opt.label;
        els.dilutionSelect.appendChild(o);
      });
      els.dilutionSelect.value = "";
      els.dilutionSourceHint.textContent = "公開されている希釈法から選択してください。";
    } else {
      els.dilutionChooser.classList.add("hidden");
      els.dilutionSelect.replaceChildren();
      els.dilutionSourceHint.textContent = "";
    }
  }
  if (els.questionConcentration) {
    if (isPractical) {
      els.questionConcentration.textContent = "溶解濃度（主薬）: 希釈法を選択すると表示";
    } else if (typeof q.concentrationMcgPerMl === "number") {
      const c = q.concentrationMcgPerMl;
      const cDisp = Math.abs(c - Math.round(c)) < 1e-6 ? String(Math.round(c)) : c.toFixed(1);
      els.questionConcentration.textContent = `溶解濃度（主薬）: ${cDisp} μg/ml`;
    } else {
      els.questionConcentration.textContent = "";
    }
  }
  if (els.questionGammaHint) {
    if (isPractical) {
      els.questionGammaHint.textContent = "式メモ: ml/h ＝ γ(μg/kg/min) × 体重(kg) × 60 ÷ 選択した濃度(μg/ml)";
    } else if (typeof q.concentrationMcgPerMl === "number") {
      els.questionGammaHint.textContent = `式メモ: ml/h ＝ γ(μg/kg/min) × 体重(kg) × 60 ÷ ${q.concentrationMcgPerMl.toFixed(1)}`;
    } else {
      els.questionGammaHint.textContent = "";
    }
  }
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

function refreshPracticalSelectionPreview() {
  const q = state.currentQuestion;
  if (!q || !q.practicalMode || !els.questionConcentration || !els.questionGammaHint) return;
  const qMath = resolveQuestionMath(q);
  if (!qMath.selected) {
    els.questionConcentration.textContent = "溶解濃度（主薬）: 希釈法を選択すると表示";
    els.questionGammaHint.textContent = "式メモ: ml/h ＝ γ(μg/kg/min) × 体重(kg) × 60 ÷ 選択した濃度(μg/ml)";
    if (els.dilutionSourceHint) {
      els.dilutionSourceHint.textContent = "公開されている希釈法から選択してください。";
    }
    return;
  }
  const c = qMath.concentrationMcgPerMl;
  const cDisp = Math.abs(c - Math.round(c)) < 1e-6 ? String(Math.round(c)) : c.toFixed(1);
  els.questionConcentration.textContent = `溶解濃度（主薬）: ${cDisp} μg/ml`;
  els.questionGammaHint.textContent = `式メモ: ml/h ＝ γ(μg/kg/min) × 体重(kg) × 60 ÷ ${c.toFixed(1)}`;
  if (els.dilutionSourceHint) {
    const src = qMath.selected.source ? `（${qMath.selected.source}）` : "";
    els.dilutionSourceHint.textContent = `選択中: ${qMath.selected.label}${src}`;
  }
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
  const qMath = resolveQuestionMath(q);

  if (!forcedTimeout) {
    if (q.practicalMode && !qMath.selected) {
      alert("先に希釈法を選択してください。");
      return;
    }
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
  const roundedAnswer = round1(qMath.answerMlPerHour);
  if (!forcedTimeout) {
    correct = isCorrectMlPerHourAnswer(roundedInput, qMath.answerMlPerHour);
  }

  const limitMs = state.currentQuestionLimit * 1000;
  const startAt = state.questionStartedAt || Date.now();
  const elapsedMs = forcedTimeout ? limitMs : Math.min(limitMs, Date.now() - startAt);
  const timeUsedSec = Math.round((elapsedMs / 1000) * 10) / 10;

  let speedBonus = 0;
  if (correct) {
    state.score += 100;
    state.streak += 1;
    if (state.streak > 0 && state.streak % 3 === 0) state.score += 40;
    if (!forcedTimeout && timeUsedSec <= state.currentQuestionLimit * SPEED_BONUS_TIME_RATIO) {
      speedBonus = SPEED_BONUS_POINTS;
      state.score += speedBonus;
    }
  } else {
    state.score -= 30;
    if (q.drug === "ノルアドレナリン") state.score -= 30;
    state.streak = 0;
  }

  clearInterval(state.questionTimerId);

  const subline = buildRoundFeedbackSubline(q, {
    correct,
    forcedTimeout,
    roundedInput,
    speedBonus,
    answerMlPerHour: qMath.answerMlPerHour,
    concentrationMcgPerMl: qMath.concentrationMcgPerMl,
    selectedDilutionLabel: qMath.selected ? qMath.selected.label : null
  });
  let headline;
  let resultClass;
  if (correct) {
    headline = speedBonus > 0 ? `正解（速答 +${speedBonus}）` : "正解";
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
    selectedDilution: qMath.selected ? qMath.selected.label : null,
    selectedDilutionSource: qMath.selected ? qMath.selected.source : null,
    selectedMgPer50ml: qMath.mgPer50ml,
    answerMlPerHour: roundedAnswer,
    answerTrunc1ml: trunc1ml(qMath.answerMlPerHour),
    answerCeil1ml: ceil1ml(qMath.answerMlPerHour),
    inputMlPerHour: roundedInput,
    timeout: forcedTimeout,
    correct,
    level: state.level,
    timeUsedSec,
    speedBonus
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
  hideTutorialOverlay();
  const elapsedSec =
    state.startAt != null
      ? Math.max(1, Math.round((Date.now() - state.startAt) / 1000))
      : 1;
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
  hideTutorialOverlay();
  const elapsedSec =
    state.startAt != null
      ? Math.max(1, Math.round((Date.now() - state.startAt) / 1000))
      : 1;
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
    return makeQuestionBySpec({
      seq: index + 1,
      weightKg,
      category: "基本編",
      drug: "レミフェンタニル",
      mgPer50ml: 5,
      orderGammaList: STUDY_REMI_ORDER_GAMMA
    });
  }
  if (mode === "advanced") {
    if (state.advancedVariant === "practical") {
      const spec = pick(ADVANCED_PRACTICAL_DRUG_POOL);
      return makePracticalQuestionBySpec({ seq: index + 1, weightKg, ...spec });
    }
    const spec = pick(ADVANCED_DRUG_POOL);
    return makeQuestionBySpec({ seq: index + 1, weightKg, ...spec });
  }
  // tierに応じて、応用モードで「成人カテコラミン薬」の出題割合を上げる
  const tier = state.rpgTierIdx;
  const prob = RPG_ADVANCED_PROB_BY_TIER[tier] || RPG_ADVANCED_PROB_BY_TIER[0];
  const x = Math.sin((index + 1) * 999 + tier * 1234) * 10000;
  const frac = Math.abs(x) % 1;
  const advanced = frac < prob;
  if (!advanced) {
    return makeQuestionBySpec({
      seq: index + 1,
      weightKg,
      category: "基本編",
      drug: "レミフェンタニル",
      mgPer50ml: 5,
      orderGammaList: CHALLENGE_DRUG_POOL[0].orderGammaList
    });
  }
  const catecholaminePool = CHALLENGE_DRUG_POOL.slice(1);
  const spec = pick(catecholaminePool);
  return makeQuestionBySpec({ seq: index + 1, weightKg, ...spec });
}

function pickGammaForTier(list, tier) {
  const startIdx = Math.min(list.length - 1, tier);
  return pick(list.slice(startIdx));
}

function makeQuestionBySpec({ seq, category, drug, mgPer50ml, weightKg, orderGammaList }) {
  const selectedMgPer50ml = Array.isArray(mgPer50ml) ? pick(mgPer50ml) : mgPer50ml;
  const orderGamma = pickGammaForTier(orderGammaList, state.rpgTierIdx);
  return makeQuestion({
    seq,
    category,
    drug,
    mgPer50ml: selectedMgPer50ml,
    weightKg,
    orderGamma
  });
}

function makePracticalQuestionBySpec({ seq, category, drug, weightKg, orderGammaList, dilutionOptions }) {
  const orderGamma = pickGammaForTier(orderGammaList, state.rpgTierIdx);
  return makeQuestion({
    seq,
    category,
    drug,
    mgPer50ml: dilutionOptions[0].mgPer50ml,
    weightKg,
    orderGamma,
    practicalOptions: dilutionOptions
  });
}

function preparationLineForQuestion(drug, mgPer50ml) {
  if (drug === "レミフェンタニル") {
    return "レミフェンタニル 5mg／50ml";
  }
  if (drug === "ノルアドレナリン") {
    return `ノルアド ${mgPer50ml}mg／50ml`;
  }
  if (drug === "ドブタミン") {
    return `ドブタミン ${mgPer50ml}mg／50ml`;
  }
  if (drug === "ミルリノン") {
    return `ミルリノン ${mgPer50ml}mg／50ml`;
  }
  if (drug === "hANP") {
    const mcgPer50ml = mgPer50ml * 1000;
    return `hANP ${mcgPer50ml}μg／50ml`;
  }
  return `主薬 ${mgPer50ml}mg／50ml`;
}

function makeQuestion({ seq, category, drug, mgPer50ml, weightKg, orderGamma, practicalOptions = null }) {
  const practicalMode = Array.isArray(practicalOptions) && practicalOptions.length > 0;
  const concentrationMcgPerMl = (mgPer50ml * 1000) / 50;
  const answerMlPerHour = (orderGamma * weightKg * 60) / concentrationMcgPerMl;
  const text = practicalMode
    ? `指示\n${orderGamma} γ（μg/kg/min）\n持続\n\n希釈法を選択して\nml/h？\n※小数第1位`
    : `指示\n${orderGamma} γ（μg/kg/min）\n持続\n\nml/h？\n※小数第1位`;
  return {
    id: `q${seq}`,
    category,
    drug,
    mgPer50ml,
    weightKg,
    orderGamma,
    concentrationMcgPerMl,
    answerMlPerHour,
    text,
    preparationLine: practicalMode ? `${drug} の希釈法を選択` : preparationLineForQuestion(drug, mgPer50ml),
    practicalMode,
    practicalOptions,
    explanation: "式: ml/h = γ(μg/kg/min) × 体重(kg) × 60 ÷ 濃度(μg/ml)"
  };
}

function getSelectedPracticalOption(q) {
  if (!q || !q.practicalMode || !Array.isArray(q.practicalOptions) || !els.dilutionSelect) return null;
  const idx = Number(els.dilutionSelect.value);
  if (!Number.isInteger(idx) || idx < 0 || idx >= q.practicalOptions.length) return null;
  return q.practicalOptions[idx];
}

function resolveQuestionMath(q) {
  const selected = getSelectedPracticalOption(q);
  const mgPer50ml = selected ? selected.mgPer50ml : q.mgPer50ml;
  const concentrationMcgPerMl = (mgPer50ml * 1000) / 50;
  const answerMlPerHour = (q.orderGamma * q.weightKg * 60) / concentrationMcgPerMl;
  return { selected, mgPer50ml, concentrationMcgPerMl, answerMlPerHour };
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickQuestionWeight(mode) {
  const pool =
    mode === "study" ? STUDY_WEIGHTS : mode === "advanced" ? ADVANCED_WEIGHTS : CHALLENGE_WEIGHTS;
  if (pool.length <= 1) return pool[0];
  let w;
  let guard = 0;
  do {
    w = pick(pool);
    guard += 1;
  } while (guard < 14 && state.blockWeightKg != null && w === state.blockWeightKg);
  return w;
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

const MLH_1DEC_EPS = 1e-9;

function trunc1ml(x) {
  const v = Number(x);
  if (!Number.isFinite(v) || v < 0) return NaN;
  return Math.floor(v * 10 + MLH_1DEC_EPS) / 10;
}

function ceil1ml(x) {
  const v = Number(x);
  if (!Number.isFinite(v) || v < 0) return NaN;
  return Math.ceil(v * 10 - MLH_1DEC_EPS) / 10;
}

function isCorrectMlPerHourAnswer(userRounded1, trueMlPerHour) {
  const t = trunc1ml(trueMlPerHour);
  const c = ceil1ml(trueMlPerHour);
  const u = userRounded1;
  const match1 = (a, b) => Math.abs(a - b) < 0.05;
  return match1(u, t) || match1(u, c);
}

function formatCorrectMlSubline(trueMlPerHour) {
  const t = trunc1ml(trueMlPerHour);
  const c = ceil1ml(trueMlPerHour);
  if (Math.abs(t - c) < 0.05) {
    return `正答 ${t.toFixed(1)} ml/h`;
  }
  return `正答 ${t.toFixed(1)} ml/h（第2位切り捨て）または ${c.toFixed(1)} ml/h（第2位繰り上げ）`;
}

function formatGammaCalculationMemo(q, concentrationMcgPerMl) {
  const c = concentrationMcgPerMl;
  const raw = (q.orderGamma * q.weightKg * 60) / c;
  const cDisp = Number.isFinite(c) ? (Math.abs(c - Math.round(c)) < 1e-6 ? String(Math.round(c)) : c.toFixed(1)) : "—";
  return `内訳: ${q.orderGamma}×${q.weightKg}×60÷${cDisp} ≒ ${raw.toFixed(2)} ml/h（表示は小数第1位）`;
}

function buildRoundFeedbackSubline(
  q,
  { correct, forcedTimeout, roundedInput, speedBonus, answerMlPerHour, concentrationMcgPerMl, selectedDilutionLabel }
) {
  const lines = [formatCorrectMlSubline(answerMlPerHour)];
  if (selectedDilutionLabel) {
    lines.push(`選択した希釈法: ${selectedDilutionLabel}`);
  }
  if (!forcedTimeout && roundedInput != null && !correct) {
    lines.push(`あなたの回答: ${roundedInput.toFixed(1)} ml/h`);
  }
  lines.push(formatGammaCalculationMemo(q, concentrationMcgPerMl));
  if (correct && speedBonus > 0) {
    lines.push(`速答ボーナス +${speedBonus}点（制限の${Math.round(SPEED_BONUS_TIME_RATIO * 100)}%以内）`);
  }
  return lines.join("\n");
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
  if (state.status !== "running" || state.recoveryOpen || state.tutorialOpen) return;
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
if (els.startAdvancedBtn) {
  els.startAdvancedBtn.addEventListener("click", () => openSessionLengthPicker("advanced"));
}
if (els.openTutorialOnlyBtn) {
  els.openTutorialOnlyBtn.addEventListener("click", () => openTutorialPreviewOnly());
}
if (els.startAirwayScenarioBtn) {
  els.startAirwayScenarioBtn.addEventListener("click", openAirwayDurationPicker);
}
if (els.airwaySubmitStepBtn) {
  els.airwaySubmitStepBtn.addEventListener("click", submitAirwayStep);
}
if (els.airwayNextStepBtn) {
  els.airwayNextStepBtn.addEventListener("click", goNextAirwayStep);
}
if (els.airwayRestartBtn) {
  els.airwayRestartBtn.addEventListener("click", openAirwayDurationPicker);
}
if (els.airwayCloseBtn) {
  els.airwayCloseBtn.addEventListener("click", closeAirwayFullscreen);
}
if (els.airwayDur3Btn) {
  els.airwayDur3Btn.addEventListener("click", () => startAirwayScenarioTraining(3));
}
if (els.airwayDur5Btn) {
  els.airwayDur5Btn.addEventListener("click", () => startAirwayScenarioTraining(5));
}
if (els.airwayDur10Btn) {
  els.airwayDur10Btn.addEventListener("click", () => startAirwayScenarioTraining(10));
}
if (els.airwayDurCancelBtn) {
  els.airwayDurCancelBtn.addEventListener("click", closeAirwayDurationPicker);
}

els.sessionLen5Btn.addEventListener("click", () => {
  const m = pendingGameMode;
  if (!m) return;
  closeSessionLengthPicker();
  if (m === "study") {
    pendingStudyTotalQuestions = 5;
    showStudyTutorialChoiceOverlay();
  } else if (m === "advanced") {
    openAdvancedModePicker(5);
  } else {
    startMode(m, 5);
  }
});

els.sessionLen10Btn.addEventListener("click", () => {
  const m = pendingGameMode;
  if (!m) return;
  closeSessionLengthPicker();
  if (m === "study") {
    pendingStudyTotalQuestions = 10;
    showStudyTutorialChoiceOverlay();
  } else if (m === "advanced") {
    openAdvancedModePicker(10);
  } else {
    startMode(m, 10);
  }
});

if (els.studyWithTutorialBtn) {
  els.studyWithTutorialBtn.addEventListener("click", () => {
    const n = pendingStudyTotalQuestions;
    if (n == null) return;
    hideStudyTutorialChoiceOverlay();
    startMode("study", n, { showTutorial: true });
  });
}
if (els.studySkipTutorialBtn) {
  els.studySkipTutorialBtn.addEventListener("click", () => {
    const n = pendingStudyTotalQuestions;
    if (n == null) return;
    hideStudyTutorialChoiceOverlay();
    startMode("study", n, { showTutorial: false });
  });
}
if (els.studyTutorialCancelBtn) {
  els.studyTutorialCancelBtn.addEventListener("click", () => {
    hideStudyTutorialChoiceOverlay();
    openSessionLengthPicker("study");
  });
}

if (els.advancedModeStandardBtn) {
  els.advancedModeStandardBtn.addEventListener("click", () => {
    const n = pendingAdvancedTotalQuestions;
    if (n == null) return;
    closeAdvancedModePicker();
    startMode("advanced", n, { advancedVariant: "standard" });
  });
}
if (els.advancedModePracticalBtn) {
  els.advancedModePracticalBtn.addEventListener("click", () => {
    const n = pendingAdvancedTotalQuestions;
    if (n == null) return;
    closeAdvancedModePicker();
    startMode("advanced", n, { advancedVariant: "practical" });
  });
}
if (els.advancedModeCancelBtn) {
  els.advancedModeCancelBtn.addEventListener("click", () => {
    closeAdvancedModePicker();
    openSessionLengthPicker("advanced");
  });
}

els.sessionLenCancelBtn.addEventListener("click", () => {
  closeSessionLengthPicker();
});
if (els.dilutionSelect) {
  els.dilutionSelect.addEventListener("change", refreshPracticalSelectionPreview);
}
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
  if (attempt.mode === "challenge" || attempt.mode === "advanced") {
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
  if (els.gameFullscreen.classList.contains("hidden")) return;
  if (els.tutorialOverlay && !els.tutorialOverlay.classList.contains("hidden")) {
    if (e.key === "Enter" || e.key === "ArrowRight") {
      e.preventDefault();
      tutorialGoNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      tutorialGoPrev();
    }
    return;
  }
  if (e.key !== "Enter") return;
  if (!els.gameEndFooter.classList.contains("hidden")) return;
  if (!els.roundResultOverlay.classList.contains("hidden")) return;
  if (els.recoveryOverlay && !els.recoveryOverlay.classList.contains("hidden")) return;
  if (!els.gameIntro.classList.contains("hidden") && state.status === "running") {
    e.preventDefault();
    startQuestionFromIntro();
  }
});

if (els.tutorialPrevBtn) els.tutorialPrevBtn.addEventListener("click", tutorialGoPrev);
if (els.tutorialNextBtn) els.tutorialNextBtn.addEventListener("click", tutorialGoNext);
if (els.tutorialSkipBtn) els.tutorialSkipBtn.addEventListener("click", finishTutorialAndBeginGame);

els.recoveryEasierBtn.addEventListener("click", () => {
  if (state.status !== "running") return;
  resolveRecoveryChoice(true);
});
els.recoveryContinueBtn.addEventListener("click", () => {
  if (state.status !== "running") return;
  resolveRecoveryChoice(false);
});

els.abortSessionBtn.addEventListener("click", () => {
  if (state.tutorialOnlyPreview) {
    finishTutorialAndBeginGame();
    return;
  }
  if (state.status !== "running") return;
  if (!window.confirm("セッションを中止しますか？（入力済みの回答はログ保存まで保持されます）")) return;
  abortSession();
});

els.gameCloseBtn.addEventListener("click", () => {
  if (state.tutorialOnlyPreview) {
    finishTutorialAndBeginGame();
    return;
  }
  state.status = "idle";
  state.pendingAttempt = null;
  hideRoundResultOverlay();
  hideRecoveryOverlay();
  hideTutorialOverlay();
  clearInterval(state.sessionTimerId);
  state.sessionTimerId = null;
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
