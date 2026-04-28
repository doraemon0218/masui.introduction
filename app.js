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
    title: "まずは γ の意味を1行で",
    paragraphs: [
      { text: "γ（ガンマ）は μg/kg/min（マイクログラム/キログラム/分）です。" },
      { text: "つまり「1kgあたり・1分あたり、どれだけ流すか」。" },
      { em: "ここだけ覚える: γ = 体重と時間で決まる“速さ”" }
    ]
  },
  {
    title: "50kgなら、まず 3000 を作ろう",
    paragraphs: [
      { text: "50kgの患者さんを考えると、50 × 60分 = 3000 です。" },
      { text: "この 3000 を先に作ると、暗算が一気にラクになります。" },
      { em: "50kgの型: γ × 3000（μg/h）" }
    ]
  },
  {
    title: "実際に1γを暗算してみよう",
    paragraphs: [
      { text: "例: 50kg、レミフェンタニル 5mg/50ml。" },
      { em: "1γ = 1×3000μg/50kg/60min = 3mg/50kg/h" },
      { text: "この薬液は 5mg/50ml なので 0.1mg/ml。" },
      { text: "3mg/h を入れたいなら、3 ÷ 0.1 = 30ml/h。" },
      { em: "答え: 1γ なら 30ml/h（50kg・5mg/50ml）" }
    ]
  },
  {
    title: "体重が変わっても、倍率で考える",
    paragraphs: [
      { text: "100kgなら50kgの2倍なので、30ml/hの2倍で 60ml/h。" },
      { text: "75kgなら50kgの1.5倍なので、30ml/hの1.5倍で 45ml/h。" },
      { text: "56kgなら「だいたい55kg=1.1倍」と置くと、約33ml/h とすぐ出せます。" },
      { em: "暗算のコツ: 50kgの答え × 体重倍率" }
    ]
  },
  {
    title: "最後に、いつもの形に戻す",
    paragraphs: [
      { text: "まず指示 γ と体重で「必要量（mg/h）」を作る。" },
      { text: "次に薬液濃度（mg/ml）で割って、ml/h に直す。" },
      { em: "流れは毎回同じ: 必要量を作る → 濃度で割る → ml/h" }
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
const MISHAP_SCENARIOS = [
  {
    title: "症例0: 3方活栓ロックで閉塞",
    caseText: "点滴メインルートに3方活栓。プロポフォールとレミの延長チューブが接続され、プロポフォール側のみ閉鎖。",
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 220">
  <rect width="420" height="220" fill="#f5f7fb"/>

  <!-- メインルート（点滴バッグ→患者） -->
  <rect x="20" y="14" width="56" height="82" rx="8" fill="#ffffff" stroke="#a3afbf"/>
  <rect x="28" y="24" width="40" height="56" rx="6" fill="#eef3fa" stroke="#c8d0dc"/>
  <line x1="48" y1="96" x2="48" y2="124" stroke="#6b7280" stroke-width="3"/>
  <line x1="48" y1="124" x2="170" y2="124" stroke="#8b96a6" stroke-width="5"/>
  <circle cx="178" cy="124" r="7" fill="#dce3ec" stroke="#7a8697"/>
  <line x1="185" y1="124" x2="348" y2="124" stroke="#6f7c8f" stroke-width="6"/>

  <!-- 3方活栓ユニット（実物風） -->
  <g transform="translate(188 94)">
    <rect x="0" y="24" width="138" height="10" rx="5" fill="#b8c0cc"/>
    <rect x="0" y="38" width="138" height="8" rx="4" fill="#9aa6b6"/>

    <!-- 活栓1: プロポ側（閉鎖） -->
    <g transform="translate(0 0)">
      <ellipse cx="16" cy="34" rx="14" ry="6" fill="#dfe5ee" stroke="#7d8796"/>
      <rect x="8" y="8" width="16" height="24" rx="3" fill="#eceff4" stroke="#9099a8"/>
      <path d="M3 6 L16 0 L29 6 L26 18 L6 18 Z" fill="#7ec9c4" stroke="#5ca39e"/>
      <line x1="16" y1="9" x2="4" y2="1" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>
      <circle cx="1" cy="0" r="8" fill="#ef4444"/><text x="-2.5" y="3" font-size="11" fill="#fff">!</text>
    </g>

    <!-- 活栓2: レミ側（開放） -->
    <g transform="translate(52 0)">
      <ellipse cx="16" cy="34" rx="14" ry="6" fill="#dfe5ee" stroke="#7d8796"/>
      <rect x="8" y="8" width="16" height="24" rx="3" fill="#eceff4" stroke="#9099a8"/>
      <path d="M3 6 L16 0 L29 6 L26 18 L6 18 Z" fill="#7ec9c4" stroke="#5ca39e"/>
      <line x1="16" y1="9" x2="16" y2="-2" stroke="#3b4b61" stroke-width="4" stroke-linecap="round"/>
    </g>

    <!-- 活栓3: 患者側 -->
    <g transform="translate(104 0)">
      <ellipse cx="16" cy="34" rx="14" ry="6" fill="#dfe5ee" stroke="#7d8796"/>
      <rect x="8" y="8" width="16" height="24" rx="3" fill="#eceff4" stroke="#9099a8"/>
      <path d="M3 6 L16 0 L29 6 L26 18 L6 18 Z" fill="#7ec9c4" stroke="#5ca39e"/>
      <line x1="16" y1="9" x2="16" y2="-2" stroke="#3b4b61" stroke-width="4" stroke-linecap="round"/>
    </g>
  </g>

  <!-- 延長チューブ2本 -->
  <line x1="76" y1="52" x2="191" y2="96" stroke="#ef4444" stroke-width="4"/>
  <line x1="76" y1="166" x2="243" y2="104" stroke="#2563eb" stroke-width="4"/>

  <!-- 薬剤ラベル -->
  <rect x="80" y="30" width="128" height="28" rx="6" fill="#fff" stroke="#a9b3c3"/>
  <text x="88" y="48" font-size="12" fill="#ef4444">プロポフォール延長チューブ</text>
  <rect x="80" y="154" width="138" height="28" rx="6" fill="#fff" stroke="#a9b3c3"/>
  <text x="88" y="172" font-size="12" fill="#2563eb">レミフェンタニル延長チューブ</text>

  <!-- 患者 -->
  <rect x="350" y="100" width="56" height="46" rx="8" fill="#fff" stroke="#9aa4b2"/>
  <text x="366" y="128" font-size="13" fill="#111827">患者</text>

  <!-- 図と重ならない説明 -->
  <rect x="20" y="194" width="380" height="20" rx="5" fill="#fff1f2" stroke="#f87171"/>
  <text x="28" y="208" font-size="12" fill="#b91c1c">プロポフォール側のみ閉鎖向き（レミフェンタニル側は開放）</text>
</svg>`,
    steps: [
      {
        prompt: "画像で最も問題な箇所はどこ？",
        options: [
          { text: "プロポフォール側の3方活栓が閉鎖向き", correct: true, rationale: "持続投与ラインが遮断され、閉塞アラームの直接原因になります。" },
          { text: "レミフェンタニルのシリンジ残量", correct: false, rationale: "今回のアラーム原因は閉塞で、残量不足の情報はありません。" },
          { text: "患者側のルート長", correct: false, rationale: "主因は活栓向きの誤りです。" }
        ]
      },
      {
        prompt: "気づいた直後の初動として最も適切なのは？",
        options: [
          {
            text: "プロポフォール接続を一度外し、大気開放で圧を逃して溶液を廃棄し、再接続して投与再開する",
            correct: true,
            rationale: "閉塞時はライン内圧を解除してから再接続・再開する手順が安全です。"
          },
          {
            text: "閉塞した3方活栓を開けて薬剤をそのまま投与する",
            correct: false,
            rationale: "薬液漏出や感染リスクがあり禁忌です。"
          },
          {
            text: "アラーム音だけ止めて様子を見る",
            correct: false,
            rationale: "原因が未解決のままになり、必要薬剤が入らず危険です。"
          }
        ]
      }
    ]
  },
  {
    title: "症例1: ルートトラブル",
    caseText: "導入10分後、血圧低下。ノルアド投与中。",
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180"><rect width="360" height="180" fill="#f5f7ff"/><rect x="16" y="24" width="130" height="64" rx="8" fill="#ffffff" stroke="#9aa4b2"/><text x="26" y="48" font-size="14" fill="#1f2a37">シリンジポンプ</text><text x="26" y="70" font-size="12" fill="#6b7280">NAd 0.08γ</text><rect x="182" y="24" width="160" height="132" rx="10" fill="#ffffff" stroke="#9aa4b2"/><text x="194" y="46" font-size="13" fill="#111827">患者腕</text><line x1="146" y1="60" x2="210" y2="60" stroke="#1f6feb" stroke-width="4"/><line x1="210" y1="60" x2="250" y2="88" stroke="#1f6feb" stroke-width="4"/><line x1="250" y1="88" x2="278" y2="88" stroke="#1f6feb" stroke-width="4"/><circle cx="232" cy="75" r="11" fill="#ef4444"/><text x="228" y="79" font-size="14" fill="#fff">×</text><text x="188" y="138" font-size="12" fill="#ef4444">ここで屈曲・閉塞</text></svg>`,
    steps: [
      {
        prompt: "画像で最も問題な箇所はどこ？",
        options: [
          { text: "ルートの屈曲・閉塞部", correct: true, rationale: "投与が実際に入らず、血行動態悪化の原因になります。" },
          { text: "シリンジポンプの画面色", correct: false, rationale: "表示色は問題の本質ではありません。" },
          { text: "患者腕の位置", correct: false, rationale: "今回の主因はルート閉塞です。" }
        ]
      },
      {
        prompt: "それに気づいた直後、最初に取る対応は？",
        options: [
          { text: "ルートを解除し、流量再開を確認しながらバイタル再評価", correct: true, rationale: "原因除去と再評価を同時に行うのが初動です。" },
          { text: "まず鎮静薬を追加投与する", correct: false, rationale: "循環悪化要因になる可能性があります。" },
          { text: "様子を見るだけで5分待つ", correct: false, rationale: "初動が遅れます。" }
        ]
      }
    ]
  },
  {
    title: "症例2: 酸素ライン外れ",
    caseText: "抜管後、SpO2が 99%→90%に低下。",
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180"><rect width="360" height="180" fill="#f5f7ff"/><rect x="20" y="24" width="152" height="132" rx="10" fill="#ffffff" stroke="#9aa4b2"/><text x="30" y="46" font-size="13" fill="#111827">酸素流量計</text><line x1="52" y1="72" x2="52" y2="140" stroke="#1f2937" stroke-width="3"/><circle cx="52" cy="94" r="7" fill="#10b981"/><text x="30" y="162" font-size="12" fill="#10b981">流量あり</text><rect x="196" y="24" width="144" height="132" rx="10" fill="#ffffff" stroke="#9aa4b2"/><text x="206" y="46" font-size="13" fill="#111827">患者顔</text><ellipse cx="266" cy="92" rx="42" ry="32" fill="#fde2c5"/><path d="M220 102 L240 102" stroke="#2563eb" stroke-width="4"/><path d="M298 102 L320 102" stroke="#2563eb" stroke-width="4"/><circle cx="246" cy="102" r="8" fill="#ef4444"/><text x="243" y="106" font-size="11" fill="#fff">!</text><text x="206" y="138" font-size="12" fill="#ef4444">カニューレ外れ</text></svg>`,
    steps: [
      {
        prompt: "画像で最も問題な箇所はどこ？",
        options: [
          { text: "鼻カニューレが外れている", correct: true, rationale: "酸素供給が届かずSpO2低下を招きます。" },
          { text: "流量計の色が緑", correct: false, rationale: "色は異常所見ではありません。" },
          { text: "患者顔の向き", correct: false, rationale: "今回は酸素デバイス逸脱が主因です。" }
        ]
      },
      {
        prompt: "それに気づいた直後、最初に取る対応は？",
        options: [
          { text: "カニューレ再装着、酸素再投与、SpO2トレンドを再確認", correct: true, rationale: "原因修正と再評価がセットです。" },
          { text: "採血結果が出るまで何もしない", correct: false, rationale: "低酸素への対応が遅れます。" },
          { text: "鎮痛薬を先に増量する", correct: false, rationale: "優先順位が違います。" }
        ]
      }
    ]
  },
  {
    title: "症例3: 食道挿管",
    caseText: "気管挿管後、ETCO2が出ない。手動換気でも胸郭の動きが乏しい。",
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180"><rect width="360" height="180" fill="#f5f7ff"/><rect x="18" y="20" width="152" height="128" rx="10" fill="#fff" stroke="#9aa4b2"/><text x="30" y="44" font-size="13" fill="#111827">モニタ</text><rect x="34" y="56" width="120" height="58" rx="6" fill="#0f172a"/><text x="42" y="80" font-size="12" fill="#ef4444">ETCO2 --</text><text x="42" y="98" font-size="12" fill="#ef4444">胸郭挙上 乏しい</text><rect x="194" y="20" width="148" height="128" rx="10" fill="#fff" stroke="#9aa4b2"/><text x="206" y="44" font-size="13" fill="#111827">気道イメージ</text><line x1="232" y1="66" x2="232" y2="122" stroke="#6b7280" stroke-width="5"/><line x1="266" y1="66" x2="266" y2="122" stroke="#6b7280" stroke-width="5"/><text x="220" y="60" font-size="11" fill="#111827">気管</text><text x="255" y="60" font-size="11" fill="#111827">食道</text><line x1="286" y1="34" x2="266" y2="78" stroke="#ef4444" stroke-width="5"/><circle cx="266" cy="82" r="8" fill="#ef4444"/><text x="263" y="86" font-size="10" fill="#fff">!</text><text x="206" y="138" font-size="12" fill="#ef4444">チューブ先端が食道側</text></svg>`,
    steps: [
      {
        prompt: "この所見で最も疑うべきなのは？",
        options: [
          { text: "食道挿管", correct: true, rationale: "ETCO2が出ず胸郭挙上も乏しい所見は食道挿管を最優先で疑います。" },
          { text: "鎮静が浅いだけ", correct: false, rationale: "この所見の主因としては不適切です。" },
          { text: "モニタ表示の不具合のみ", correct: false, rationale: "患者所見と一致せず危険です。" }
        ]
      },
      {
        prompt: "気づいた直後の初動として最も適切なのは？",
        options: [
          { text: "直ちに抜管し、バッグマスクで酸素化を回復して再挿管プランへ移行する", correct: true, rationale: "酸素化回復を最優先に食道挿管対応へ切り替えます。" },
          { text: "そのまま換気を続けながら様子を見る", correct: false, rationale: "低酸素進行リスクが高い対応です。" },
          { text: "筋弛緩薬を追加してから再確認する", correct: false, rationale: "原因未解決のまま時間を失います。" }
        ]
      }
    ]
  },
  {
    title: "症例4: 無ラベル薬剤シリンジ",
    caseText: "透明薬液入りの10mlシリンジに薬剤シールがなく、中身が不明。",
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180"><rect width="360" height="180" fill="#f5f7ff"/><rect x="20" y="24" width="320" height="132" rx="10" fill="#fff" stroke="#9aa4b2"/><rect x="52" y="62" width="212" height="20" rx="4" fill="#eef2f7" stroke="#9aa4b2"/><rect x="52" y="98" width="212" height="20" rx="4" fill="#eef2f7" stroke="#9aa4b2"/><text x="60" y="76" font-size="12" fill="#6b7280">10ml 透明薬液（ラベルなし）</text><text x="60" y="112" font-size="12" fill="#6b7280">10ml 透明薬液（ラベルなし）</text><circle cx="280" cy="72" r="9" fill="#ef4444"/><text x="277" y="76" font-size="10" fill="#fff">!</text><text x="294" y="76" font-size="12" fill="#ef4444">薬剤不明</text></svg>`,
    steps: [
      {
        prompt: "画像で最も問題な箇所はどこ？",
        options: [
          { text: "薬剤シールがなく内容不明のシリンジ", correct: true, rationale: "中身不明薬剤の投与は重大エラーにつながります。" },
          { text: "シリンジの並び順", correct: false, rationale: "主因は識別不能である点です。" },
          { text: "作業台の位置", correct: false, rationale: "作業台位置は本質ではありません。" }
        ]
      },
      {
        prompt: "気づいた直後の初動として最も適切なのは？",
        options: [
          { text: "不明シリンジは投与せず隔離し、薬剤名・濃度を再確認して新規調製する", correct: true, rationale: "不明薬剤は絶対に投与せず、再確認/再調製が原則です。" },
          { text: "少量なら安全と判断して投与する", correct: false, rationale: "量に関わらず中身不明薬剤投与は危険です。" },
          { text: "担当者の記憶を信じて投与する", correct: false, rationale: "記憶依存は取り違えを招きます。" }
        ]
      }
    ]
  },
  {
    title: "症例5: フルストマック挿管前チェック漏れ",
    caseText: "フルストマック患者。挿管直前に嘔吐し、吸引を試みるが作動しない。",
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180"><rect width="360" height="180" fill="#f5f7ff"/><rect x="16" y="22" width="168" height="136" rx="10" fill="#fff" stroke="#9aa4b2"/><text x="28" y="44" font-size="13" fill="#111827">挿管前チェック</text><text x="28" y="66" font-size="11" fill="#111827">□ 喉頭鏡</text><text x="28" y="84" font-size="11" fill="#111827">□ チューブ</text><text x="28" y="102" font-size="11" fill="#111827">□ カフ用シリンジ</text><text x="28" y="120" font-size="11" fill="#111827">□ 聴診器</text><text x="28" y="138" font-size="11" fill="#ef4444">□ 吸引器（未確認）</text><rect x="196" y="22" width="148" height="136" rx="10" fill="#fff" stroke="#9aa4b2"/><text x="208" y="44" font-size="13" fill="#111827">吸引系</text><line x1="214" y1="88" x2="292" y2="88" stroke="#6b7280" stroke-width="5"/><circle cx="294" cy="88" r="8" fill="#ef4444"/><text x="291" y="92" font-size="10" fill="#fff">!</text><text x="208" y="112" font-size="11" fill="#ef4444">接続不良</text><circle cx="246" cy="128" r="10" fill="#fff" stroke="#ef4444" stroke-width="2"/><line x1="238" y1="128" x2="254" y2="128" stroke="#ef4444" stroke-width="3"/><text x="262" y="132" font-size="11" fill="#ef4444">陰圧解放弁 開放のまま</text></svg>`,
    steps: [
      {
        prompt: "フルストマック挿管前チェックで、特に見落としてはいけない項目は？",
        options: [
          { text: "吸引器（接続と作動確認）", correct: true, rationale: "嘔吐時対応に直結するため、導入前確認の必須項目です。" },
          { text: "手術台の高さ", correct: false, rationale: "重要ですが本ケースの主因ではありません。" },
          { text: "腕帯の色", correct: false, rationale: "本ケースの危険因子とは直接関係しません。" }
        ]
      },
      {
        prompt: "嘔吐直後、吸引できないと気づいた際の最適対応は？",
        options: [
          { text: "接続を是正し、陰圧解放弁を適正化して吸引作動を確認しつつ酸素化を優先する", correct: true, rationale: "原因修正と酸素化確保を同時進行するのが初動です。" },
          { text: "吸引を諦めて挿管操作だけ続ける", correct: false, rationale: "誤嚥リスクと低酸素リスクを高めます。" },
          { text: "とりあえず薬剤追加だけ行う", correct: false, rationale: "機器不備が未解決のままでは危険です。" }
        ]
      }
    ]
  },
  {
    title: "症例6: APL弁の設定ミス",
    caseText: "マスク換気時に胸郭が上がりにくい。APL弁が不適切設定。",
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180"><rect width="360" height="180" fill="#f5f7ff"/><rect x="18" y="24" width="324" height="132" rx="10" fill="#fff" stroke="#9aa4b2"/><text x="30" y="48" font-size="13" fill="#111827">麻酔器（APL弁）</text><circle cx="98" cy="92" r="28" fill="#eef2f7" stroke="#7b8794" stroke-width="2"/><line x1="98" y1="92" x2="80" y2="74" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/><text x="136" y="98" font-size="12" fill="#ef4444">APL設定が高すぎる</text><path d="M208 96 Q248 72 288 96" fill="none" stroke="#6b7280" stroke-width="5"/><text x="208" y="130" font-size="12" fill="#111827">胸郭挙上不十分</text></svg>`,
    steps: [
      {
        prompt: "画像で最も問題な箇所はどこ？",
        options: [
          { text: "APL弁設定が高すぎる/不適切", correct: true, rationale: "換気抵抗増大や圧管理不良につながります。" },
          { text: "回路の色", correct: false, rationale: "主因は設定ミスです。" },
          { text: "患者表示テキスト", correct: false, rationale: "表示内容は問題の本質ではありません。" }
        ]
      },
      {
        prompt: "気づいた直後の初動として最も適切なのは？",
        options: [
          { text: "APL設定を適正化し、換気・胸郭挙上・圧を再確認する", correct: true, rationale: "設定是正と効果確認を連続して行います。" },
          { text: "圧を上げ続けて力で換気する", correct: false, rationale: "圧外傷リスクを上げます。" },
          { text: "原因確認せず挿管を急ぐ", correct: false, rationale: "設定不備を残したままでは危険です。" }
        ]
      }
    ]
  },
  {
    title: "症例7: フェンタニル過量記録と不正使用疑い",
    caseText: "上司と麻酔後、電子麻酔記録でフェンタニル使用量が通常の約5倍。下級医は薬液を準備していない。",
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180"><rect width="360" height="180" fill="#f5f7ff"/><rect x="18" y="20" width="324" height="138" rx="10" fill="#fff" stroke="#9aa4b2"/><text x="30" y="44" font-size="13" fill="#111827">電子麻酔記録</text><rect x="32" y="56" width="296" height="88" rx="8" fill="#eef2f7" stroke="#c3ccd8"/><text x="42" y="80" font-size="12" fill="#111827">フェンタニル投与量</text><text x="42" y="102" font-size="16" fill="#ef4444">普段の約5倍</text><text x="42" y="124" font-size="11" fill="#6b7280">準備者: 下級医なし / 投与記録あり</text><circle cx="292" cy="92" r="12" fill="#ef4444"/><text x="287" y="97" font-size="14" fill="#fff">!</text></svg>`,
    steps: [
      {
        prompt: "この状況で最も重大なリスクとして優先して捉えるべきなのは？",
        options: [
          { text: "患者安全に影響する薬剤管理異常（不正使用の疑いを含む）", correct: true, rationale: "患者安全・麻薬管理の両面で重大事案として扱う必要があります。" },
          { text: "単なる記録ミスとして放置してよい", correct: false, rationale: "重大な見逃しにつながるため不適切です。" },
          { text: "個人の問題なので患者管理とは切り離す", correct: false, rationale: "薬剤管理異常は患者安全に直結します。" }
        ]
      },
      {
        prompt: "下級医として最初に取るべき対応は？",
        options: [
          { text: "記録と残薬・使用本数の事実確認を行い、責任者（科長/麻薬管理責任者）へ速やかに報告する", correct: true, rationale: "推測で断定せず、事実確認と上申を優先して安全にエスカレーションします。" },
          { text: "本人にだけ口頭確認して、記録は修正せず終了する", correct: false, rationale: "組織的対応が行われず再発リスクが残ります。" },
          { text: "問題化を避けるため誰にも共有しない", correct: false, rationale: "患者安全・法令順守の観点で不適切です。" }
        ]
      }
    ]
  },
  {
    title: "些細な問題1: 3方活栓閉鎖中のシリンジポンプ",
    caseText: "レミフェンタニル5mg/50mL（0.1mg/mL）のシリンジポンプが30mL/hで稼働中。ふと見ると、3方活栓が閉じたまま1分間動き続けていることに気づいた。あなた（担当医）は気づいたが、指導医はまだ気づいていない。",
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 200">
  <rect width="420" height="200" fill="#f5f7fb"/>
  <rect x="10" y="55" width="108" height="90" rx="10" fill="#fff" stroke="#9aa4b2" stroke-width="1.5"/>
  <text x="64" y="82" text-anchor="middle" font-size="11" font-weight="bold" fill="#111827">シリンジポンプ</text>
  <rect x="20" y="90" width="88" height="18" rx="4" fill="#dbeafe" stroke="#93c5fd"/>
  <text x="64" y="103" text-anchor="middle" font-size="10" font-weight="bold" fill="#1d4ed8">30 mL/h 稼働中</text>
  <text x="64" y="124" text-anchor="middle" font-size="9" fill="#374151">レミフェンタニル</text>
  <text x="64" y="137" text-anchor="middle" font-size="9" fill="#374151">5mg / 50mL</text>
  <line x1="118" y1="100" x2="188" y2="100" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
  <circle cx="210" cy="100" r="22" fill="#fee2e2" stroke="#ef4444" stroke-width="2.5"/>
  <line x1="197" y1="87" x2="223" y2="113" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
  <line x1="223" y1="87" x2="197" y2="113" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
  <circle cx="234" cy="78" r="13" fill="#dc2626" stroke="#fff" stroke-width="2"/>
  <text x="234" y="83" text-anchor="middle" font-size="14" font-weight="bold" fill="#fff">!</text>
  <text x="210" y="136" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="bold">3方活栓 閉鎖中</text>
  <text x="210" y="150" text-anchor="middle" font-size="9" fill="#dc2626">1分経過</text>
  <line x1="232" y1="100" x2="328" y2="100" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" stroke-dasharray="8,5" opacity="0.4"/>
  <text x="278" y="92" text-anchor="middle" font-size="18" fill="#dc2626">✗</text>
  <rect x="330" y="68" width="80" height="64" rx="10" fill="#fff" stroke="#9aa4b2" stroke-width="1.5"/>
  <text x="370" y="104" text-anchor="middle" font-size="13" fill="#111827">患者</text>
  <rect x="8" y="170" width="404" height="24" rx="6" fill="#fff1f2" stroke="#f87171" stroke-width="1.5"/>
  <text x="18" y="186" font-size="10.5" fill="#b91c1c">ポンプ内圧が上昇中 → 活栓を急に開けると薬液が急速投与されるリスクあり</text>
</svg>`,
    steps: [
      {
        prompt: "この状況での適切な対応は？（複数選択可 — 正しいものをすべて選んでください）",
        multiSelect: true,
        options: [
          { text: "3方活栓を閉じたまま、シリンジの接続部を大気に開放する", correct: true, rationale: "閉塞中にポンプが加圧し続けているため、活栓を開く前に大気開放で内圧を逃がします。これにより急速投与を防げます。" },
          { text: "上級医・指導医にすぐに報告する", correct: true, rationale: "初学者は自己判断せず、速やかに指導医・上級医に状況を共有するのが安全原則です。" },
          { text: "3方活栓をすぐに開いて投与を再開する", correct: false, rationale: "閉塞中にポンプが加圧していた薬液が急速投与されるリスクがあります。まず大気開放が先です。" },
          { text: "アラームを消音して麻酔を続けながら様子を見る", correct: false, rationale: "原因未解決のまま放置するとレミフェンタニルが投与されない時間が続き、術中覚醒・体動のリスクがあります。" }
        ]
      }
    ]
  }
];

/** 一覧表示用の短い題名（症例データとは別にまとめておく） */
const MISHAP_CHARMING_TITLES = [
  "活栓が黙ったライン",
  "屈曲ルート、血圧の独白",
  "酸素の小さな脱走",
  "ETCO2が沈黙したあと",
  "名乗らない透明の誘惑",
  "吸引器はチェックリストの外で",
  "APL、きつすぎる抱擁",
  "記録が5倍に跳ねた午後",
  "1分間、レミは届かなかった"
];

(function ensureMishapScenarioMeta() {
  MISHAP_SCENARIOS.forEach((s, i) => {
    if (!s.id) s.id = `mishap-${i}`;
    if (!s.charmingTitle) s.charmingTitle = MISHAP_CHARMING_TITLES[i] || s.title;
  });
})();

const CHECKLIST_MODULES = [
  {
    id: "soap-md",
    title: "挿管準備物品チェック（SOAP-MD）",
    context: "これから気管挿管を行います。SOAP-MDに沿って確認すべき物品・準備項目を全て選んでください。",
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 150">
  <rect width="460" height="150" fill="#f5f7fb"/>
  <rect x="8" y="10" width="66" height="130" rx="10" fill="#fee2e2" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="41" y="66" text-anchor="middle" font-size="36" font-weight="bold" fill="#dc2626">S</text>
  <text x="41" y="86" text-anchor="middle" font-size="10" font-weight="700" fill="#991b1b">Suction</text>
  <text x="41" y="102" text-anchor="middle" font-size="9" fill="#7f1d1d">吸引器</text>
  <rect x="84" y="10" width="66" height="130" rx="10" fill="#ffedd5" stroke="#fdba74" stroke-width="1.5"/>
  <text x="117" y="66" text-anchor="middle" font-size="36" font-weight="bold" fill="#ea580c">O</text>
  <text x="117" y="86" text-anchor="middle" font-size="10" font-weight="700" fill="#9a3412">Oxygen</text>
  <text x="117" y="102" text-anchor="middle" font-size="9" fill="#7c2d12">酸素</text>
  <rect x="160" y="10" width="66" height="130" rx="10" fill="#fef9c3" stroke="#fde047" stroke-width="1.5"/>
  <text x="193" y="66" text-anchor="middle" font-size="36" font-weight="bold" fill="#ca8a04">A</text>
  <text x="193" y="86" text-anchor="middle" font-size="10" font-weight="700" fill="#854d0e">Airway</text>
  <text x="193" y="102" text-anchor="middle" font-size="9" fill="#713f12">気道器具</text>
  <rect x="236" y="10" width="66" height="130" rx="10" fill="#dcfce7" stroke="#86efac" stroke-width="1.5"/>
  <text x="269" y="66" text-anchor="middle" font-size="36" font-weight="bold" fill="#16a34a">P</text>
  <text x="269" y="86" text-anchor="middle" font-size="10" font-weight="700" fill="#166534">Pharmacy</text>
  <text x="269" y="102" text-anchor="middle" font-size="9" fill="#14532d">薬剤</text>
  <rect x="312" y="10" width="66" height="130" rx="10" fill="#dbeafe" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="345" y="66" text-anchor="middle" font-size="36" font-weight="bold" fill="#1d4ed8">M</text>
  <text x="345" y="86" text-anchor="middle" font-size="10" font-weight="700" fill="#1e40af">Monitor</text>
  <text x="345" y="102" text-anchor="middle" font-size="9" fill="#1e3a5f">モニター</text>
  <rect x="386" y="10" width="66" height="130" rx="10" fill="#f3e8ff" stroke="#c4b5fd" stroke-width="1.5"/>
  <text x="419" y="66" text-anchor="middle" font-size="36" font-weight="bold" fill="#7c3aed">D</text>
  <text x="419" y="86" text-anchor="middle" font-size="9" font-weight="700" fill="#5b21b6">Difficult</text>
  <text x="419" y="102" text-anchor="middle" font-size="9" fill="#4c1d95">困難気道対応</text>
</svg>`,
    items: [
      { label: "S: 吸引器（接続・作動確認）", correct: true, rationale: "嘔吐・分泌物への対応に必須。フルストマック症例では最重要項目。作動チェックを必ず行う。" },
      { label: "O: 酸素供給（バッグバルブマスク・酸素ライン確認）", correct: true, rationale: "プレオキシジェネーションと緊急マスク換気のために不可欠。流量と接続を確認する。" },
      { label: "A: 気道器具（ETチューブ複数サイズ・スタイレット・テープ・喉頭鏡）", correct: true, rationale: "サイズ違いを複数準備し、困難挿管にも対応できるようにする。カフの確認も忘れずに。" },
      { label: "P: 薬剤（導入薬・筋弛緩薬・拮抗薬・緊急昇圧薬）", correct: true, rationale: "スガマデクスの準備と昇圧薬（エフェドリン等）も手元に。ラベル確認を徹底する。" },
      { label: "M: モニター（SpO2・ETCO2・BP・ECG 接続・作動確認）", correct: true, rationale: "挿管確認にETCO2は必須。SpO2・BP・ECGもすべて動作確認してから導入する。" },
      { label: "D: 困難気道対応器具（ビデオ喉頭鏡・LMA・輪状甲状膜穿刺セット）", correct: true, rationale: "困難気道の有無に関わらず、いつでも取り出せる場所に用意する。" },
      { label: "滅菌手袋と消毒薬（無菌野の準備）", correct: false, rationale: "経口挿管は無菌操作を要しない。これはSOAP-MDの項目ではない。" },
      { label: "術前採血結果の最終確認", correct: false, rationale: "術前評価で済んでいる項目。挿管直前の物品準備リストには含まれない。" },
    ]
  },
  {
    id: "lemon",
    title: "挿管困難評価（LEMON法）",
    context: "気管挿管前に実施するLEMON評価。困難挿管の予測因子として正しいものを全て選んでください。",
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 210">
  <rect width="460" height="210" fill="#f5f7fb"/>
  <ellipse cx="120" cy="95" rx="52" ry="62" fill="#fde8c8" stroke="#c97a4a" stroke-width="2"/>
  <rect x="100" y="150" width="40" height="44" rx="6" fill="#fde8c8" stroke="#c97a4a" stroke-width="2"/>
  <ellipse cx="136" cy="76" rx="7" ry="5" fill="#fff" stroke="#374151" stroke-width="1.5"/>
  <circle cx="138" cy="76" r="3" fill="#374151"/>
  <path d="M112 108 Q122 115 134 108" fill="none" stroke="#374151" stroke-width="2" stroke-linecap="round"/>
  <line x1="136" y1="107" x2="136" y2="120" stroke="#374151" stroke-width="1.5"/>
  <line x1="126" y1="120" x2="146" y2="120" stroke="#374151" stroke-width="1.5"/>
  <path d="M112 155 Q120 145 128 155" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-dasharray="4,2"/>
  <path d="M112 160 Q100 140 108 148" fill="none" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="3,2"/>
  <circle cx="152" cy="96" r="4" fill="#dc2626"/>
  <line x1="156" y1="94" x2="175" y2="88" stroke="#dc2626" stroke-width="1.5"/>
  <text x="18" y="62" font-size="13" font-weight="bold" fill="#dc2626">L</text>
  <text x="18" y="76" font-size="8.5" fill="#7f1d1d">Look 外見</text>
  <line x1="34" y1="64" x2="70" y2="72" stroke="#dc2626" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="155" y="82" font-size="13" font-weight="bold" fill="#2563eb">E</text>
  <text x="155" y="96" font-size="8" fill="#1d4ed8">3-3-2</text>
  <text x="18" y="115" font-size="13" font-weight="bold" fill="#16a34a">M</text>
  <text x="18" y="129" font-size="8.5" fill="#14532d">Mallampati</text>
  <line x1="34" y1="117" x2="88" y2="113" stroke="#16a34a" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="18" y="170" font-size="13" font-weight="bold" fill="#f59e0b">O</text>
  <text x="18" y="184" font-size="8.5" fill="#92400e">閉塞</text>
  <line x1="34" y1="171" x2="68" y2="155" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="100" y="202" font-size="13" font-weight="bold" fill="#7c3aed">N</text>
  <text x="116" y="202" font-size="8.5" fill="#4c1d95">頸部可動域</text>
  <rect x="188" y="10" width="264" height="190" rx="8" fill="#fffbeb" stroke="#fcd34d" stroke-width="1.5"/>
  <text x="198" y="32" font-size="12" font-weight="bold" fill="#92400e">LEMON 評価ポイント</text>
  <text x="198" y="56" font-size="11" fill="#111827">L: 外見（肥満・顔面外傷・突出歯・小顎症）</text>
  <text x="198" y="78" font-size="11" fill="#111827">E: 3-3-2 ルール</text>
  <text x="204" y="94" font-size="9.5" fill="#57606a">　開口3横指・舌骨3横指・甲状軟骨-床2横指</text>
  <text x="198" y="114" font-size="11" fill="#111827">M: マランパティ分類 III/IV</text>
  <text x="198" y="134" font-size="11" fill="#111827">O: 気道閉塞（腫瘍・膿瘍・浮腫・異物）</text>
  <text x="198" y="154" font-size="11" fill="#111827">N: 頸部可動域制限</text>
  <rect x="194" y="165" width="252" height="26" rx="6" fill="#fef3c7"/>
  <text x="204" y="178" font-size="9.5" fill="#92400e">スコア≥3 → 困難挿管の可能性が高い</text>
  <text x="204" y="190" font-size="9.5" fill="#92400e">→ 困難気道宣言・バックアッププラン必要</text>
</svg>`,
    items: [
      { label: "L - Look: 外見からの評価（肥満・顔面外傷・突出歯・小顎症）", correct: true, rationale: "第一印象での視覚的評価。異常があれば挿管が困難になりやすい。" },
      { label: "E - Evaluate: 3-3-2ルール（開口3横指・舌骨3横指・甲状軟骨-床2横指）", correct: true, rationale: "口腔内・咽頭スペースを数値で評価。基準未満で困難の可能性が高まる。" },
      { label: "M - Mallampati: マランパティ分類（クラスIII/IVが困難因子）", correct: true, rationale: "開口時の口腔内視野評価。クラスIIIで注意、IVで高度困難を示唆。" },
      { label: "O - Obstruction: 気道閉塞（腫瘍・膿瘍・浮腫・異物）", correct: true, rationale: "喉頭・咽頭の閉塞は直接的に視野と挿管を困難にする。" },
      { label: "N - Neck: 頸部可動域（頸椎固定・強直性脊椎炎・頸部照射後）", correct: true, rationale: "嗅ぎ位（sniffing position）が取れないと喉頭展開が困難になる。" },
      { label: "術前の空腹時血糖値", correct: false, rationale: "誤嚥リスクや代謝評価に関わるが、LEMONの挿管困難評価因子ではない。" },
      { label: "術中予測出血量", correct: false, rationale: "麻酔管理計画には重要だが、LEMONの挿管困難因子ではない。" },
    ]
  },
  {
    id: "moan",
    title: "マスク換気困難評価（MOAN法）",
    context: "MOAN法でマスク換気が困難になる因子を全て選んでください。",
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 210">
  <rect width="460" height="210" fill="#f5f7fb"/>
  <ellipse cx="120" cy="90" rx="58" ry="68" fill="#fde8c8" stroke="#c97a4a" stroke-width="2"/>
  <ellipse cx="100" cy="70" rx="7" ry="5" fill="#fff" stroke="#374151" stroke-width="1.5"/>
  <circle cx="100" cy="70" r="3" fill="#374151"/>
  <ellipse cx="140" cy="70" rx="7" ry="5" fill="#fff" stroke="#374151" stroke-width="1.5"/>
  <circle cx="140" cy="70" r="3" fill="#374151"/>
  <ellipse cx="120" cy="91" rx="5" ry="4" fill="none" stroke="#c97a4a" stroke-width="1.5"/>
  <rect x="72" y="104" width="96" height="56" rx="14" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="2" opacity="0.88"/>
  <text x="120" y="136" text-anchor="middle" font-size="9" fill="#1e40af">マスク</text>
  <line x1="72" y1="118" x2="50" y2="108" stroke="#ef4444" stroke-width="2.5"/>
  <circle cx="46" cy="106" r="5" fill="#ef4444"/>
  <line x1="168" y1="118" x2="190" y2="108" stroke="#ef4444" stroke-width="2.5"/>
  <circle cx="194" cy="106" r="5" fill="#ef4444"/>
  <text x="16" y="90" font-size="13" font-weight="bold" fill="#dc2626">M</text>
  <text x="16" y="104" font-size="8" fill="#7f1d1d">Mask seal</text>
  <text x="16" y="128" font-size="13" font-weight="bold" fill="#ea580c">O</text>
  <text x="16" y="142" font-size="8" fill="#9a3412">肥満/閉塞</text>
  <text x="16" y="166" font-size="13" font-weight="bold" fill="#ca8a04">A</text>
  <text x="16" y="180" font-size="8" fill="#854d0e">高齢(55歳+)</text>
  <text x="50" y="200" font-size="13" font-weight="bold" fill="#16a34a">N</text>
  <text x="66" y="200" font-size="8" fill="#166534">無歯顎</text>
  <rect x="210" y="10" width="242" height="190" rx="8" fill="#f0f9ff" stroke="#7dd3fc" stroke-width="1.5"/>
  <text x="220" y="32" font-size="12" font-weight="bold" fill="#0c4a6e">MOAN 評価ポイント</text>
  <text x="220" y="56" font-size="11" fill="#111827">M: マスクシール不良</text>
  <text x="226" y="70" font-size="9.5" fill="#57606a">　ひげ・顔面外傷・陥凹・骨突出</text>
  <text x="220" y="92" font-size="11" fill="#111827">O: 肥満(BMI≥26) / 閉塞 / OSA歴</text>
  <text x="220" y="114" font-size="11" fill="#111827">A: 高齢（55歳以上）</text>
  <text x="220" y="136" font-size="11" fill="#111827">N: 無歯顎（義歯を外した状態）</text>
  <rect x="216" y="150" width="230" height="38" rx="6" fill="#e0f2fe"/>
  <text x="226" y="164" font-size="9.5" fill="#0c4a6e">2項目以上 → マスク換気困難の可能性</text>
  <text x="226" y="178" font-size="9.5" fill="#0c4a6e">→ 声門上器具・二人法マスク換気を想定</text>
</svg>`,
    items: [
      { label: "M - Mask seal: マスクシール不良（顎ひげ・顔面外傷・骨突出/陥凹）", correct: true, rationale: "マスクが顔面に密着しないと換気圧が維持できない。ひげは特に多い原因。剃毛や義歯装着で改善することも。" },
      { label: "O - Obesity/Obstruction: 肥満（BMI≥26）または気道閉塞（OSA歴）", correct: true, rationale: "肥満は機能的残気量低下と気道虚脱を招き、無呼吸許容時間を短縮する。" },
      { label: "A - Age: 高齢（55歳以上）", correct: true, rationale: "軟部組織の弾力低下により気道が虚脱しやすくなる。" },
      { label: "N - No teeth: 無歯顎（義歯を外した状態）", correct: true, rationale: "義歯のない無歯顎ではマスクが沈み込みシールが得られにくい。（義歯を外す前に換気しておくのが有用）" },
      { label: "患者の血液型がAB型", correct: false, rationale: "血液型はマスク換気困難とは無関係。" },
      { label: "術前の心電図所見（QTc延長など）", correct: false, rationale: "循環管理に影響するが、MOANの評価因子ではない。" },
    ]
  },
  {
    id: "weaning",
    title: "人工呼吸離脱（SBT・抜管プロセス）",
    context: "ICU患者の人工呼吸器離脱に向けて確認すべきステップを全て選んでください。",
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 185">
  <rect width="460" height="185" fill="#f5f7fb"/>
  <rect x="8" y="18" width="84" height="62" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="50" y="40" text-anchor="middle" font-size="10" font-weight="bold" fill="#1d4ed8">Step 1</text>
  <text x="50" y="56" text-anchor="middle" font-size="9" fill="#1e40af">SBT前</text>
  <text x="50" y="70" text-anchor="middle" font-size="9" fill="#1e40af">スクリーニング</text>
  <line x1="92" y1="49" x2="110" y2="49" stroke="#6b7280" stroke-width="2"/>
  <polygon points="110,44 120,49 110,54" fill="#6b7280"/>
  <rect x="120" y="18" width="84" height="62" rx="8" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
  <text x="162" y="40" text-anchor="middle" font-size="10" font-weight="bold" fill="#15803d">Step 2</text>
  <text x="162" y="56" text-anchor="middle" font-size="9" fill="#166534">SBT実施</text>
  <text x="162" y="70" text-anchor="middle" font-size="9" fill="#166534">30〜120分</text>
  <line x1="204" y1="49" x2="222" y2="49" stroke="#6b7280" stroke-width="2"/>
  <polygon points="222,44 232,49 222,54" fill="#6b7280"/>
  <polygon points="272,18 312,49 272,80 232,49" fill="#fef9c3" stroke="#eab308" stroke-width="1.5"/>
  <text x="272" y="45" text-anchor="middle" font-size="9" font-weight="bold" fill="#92400e">成功?</text>
  <text x="272" y="59" text-anchor="middle" font-size="8" fill="#78350f">基準確認</text>
  <line x1="312" y1="49" x2="330" y2="49" stroke="#6b7280" stroke-width="2"/>
  <polygon points="330,44 340,49 330,54" fill="#6b7280"/>
  <text x="317" y="42" font-size="8" fill="#16a34a">Yes</text>
  <rect x="340" y="18" width="112" height="62" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="1.5"/>
  <text x="396" y="40" text-anchor="middle" font-size="10" font-weight="bold" fill="#be185d">Step 3</text>
  <text x="396" y="56" text-anchor="middle" font-size="9" fill="#9d174d">抜管前</text>
  <text x="396" y="70" text-anchor="middle" font-size="9" fill="#9d174d">アセスメント</text>
  <line x1="272" y1="80" x2="272" y2="104" stroke="#6b7280" stroke-width="2"/>
  <polygon points="267,104 272,114 277,104" fill="#6b7280"/>
  <text x="280" y="97" font-size="8" fill="#dc2626">No</text>
  <rect x="218" y="114" width="108" height="38" rx="6" fill="#fee2e2" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="272" y="130" text-anchor="middle" font-size="9" fill="#dc2626">原疾患を再評価</text>
  <text x="272" y="146" text-anchor="middle" font-size="9" fill="#dc2626">SBT翌日に再試行</text>
  <rect x="8" y="100" width="200" height="76" rx="6" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
  <text x="18" y="118" font-size="9" font-weight="bold" fill="#15803d">抜管後ケア</text>
  <text x="18" y="134" font-size="8.5" fill="#166534">・HFNC / NIV の準備</text>
  <text x="18" y="150" font-size="8.5" fill="#166534">・再挿管基準を事前に設定</text>
  <text x="18" y="166" font-size="8.5" fill="#166534">・咳嗽力・嚥下機能を事前評価</text>
</svg>`,
    items: [
      { label: "SBT前: 原疾患改善・酸素化（FiO2≤0.4、PEEP≤5cmH2O、SpO2≥90%）の確認", correct: true, rationale: "SBTの前提条件。これを満たさない状態でのSBTは早計。" },
      { label: "SBT前: 循環安定（少量の昇圧薬以下、ノルアドレナリン<0.1μg/kg/min）", correct: true, rationale: "重篤な循環不全下でのSBTは離脱失敗・悪化につながる。" },
      { label: "SBT前: 覚醒・鎮痛評価（RASS -2〜+1、不穏なし、NRS/CPOTで痛みを評価）", correct: true, rationale: "過鎮静・不穏はSBT失敗の主因。鎮痛先行の覚醒プロトコルを実施する。" },
      { label: "SBT実施: T-ピース法またはPS 5〜8cmH2Oで30〜120分の自発呼吸試験", correct: true, rationale: "30分以上の安定した自発呼吸でSBT成功とみなす。" },
      { label: "SBT成功基準: SpO2≥90%・呼吸数≤35回/分・循環安定・患者苦痛なし", correct: true, rationale: "成功基準を全て満たしたら抜管アセスメントへ進む。" },
      { label: "抜管前: 咳嗽力・嚥下機能評価（カフリークテスト検討）", correct: true, rationale: "分泌物を自力で排出できなければ抜管後呼吸不全のリスクが高い。" },
      { label: "抜管後: HFNC/NIVの準備と再挿管基準を事前に設定する", correct: true, rationale: "再挿管の適応を先に決めておくと判断遅延を防げる。" },
      { label: "SBT中は筋弛緩薬を追加して自発呼吸を抑制する", correct: false, rationale: "SBTは自発呼吸を評価するプロセス。筋弛緩薬の追加は完全に逆効果。" },
      { label: "尿量が保たれていれば他の離脱基準は省略してよい", correct: false, rationale: "尿量は腎機能の指標であり、SBT離脱基準の代替にはならない。" },
    ]
  },
  {
    id: "fluid",
    title: "血圧低下：輸液反応性評価とアクション",
    context: "術中・ICUで血圧低下を認めた。輸液反応性評価と対応として正しいものを全て選んでください。",
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 215">
  <rect width="460" height="215" fill="#f5f7fb"/>
  <rect x="8" y="78" width="92" height="54" rx="8" fill="#fee2e2" stroke="#f87171" stroke-width="1.5"/>
  <text x="54" y="101" text-anchor="middle" font-size="11" font-weight="bold" fill="#dc2626">血圧低下</text>
  <text x="54" y="118" text-anchor="middle" font-size="9" fill="#991b1b">原因を鑑別</text>
  <line x1="100" y1="105" x2="118" y2="105" stroke="#6b7280" stroke-width="2"/>
  <polygon points="118,100 128,105 118,110" fill="#6b7280"/>
  <polygon points="212,55 272,105 212,155 152,105" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <text x="212" y="97" text-anchor="middle" font-size="9" font-weight="bold" fill="#92400e">PLR / PPV</text>
  <text x="212" y="111" text-anchor="middle" font-size="9" fill="#78350f">輸液反応性</text>
  <text x="212" y="125" text-anchor="middle" font-size="8.5" fill="#78350f">あり?</text>
  <line x1="272" y1="105" x2="294" y2="105" stroke="#6b7280" stroke-width="2"/>
  <polygon points="294,100 304,105 294,110" fill="#6b7280"/>
  <text x="276" y="97" font-size="9" fill="#16a34a">Yes</text>
  <rect x="304" y="68" width="148" height="74" rx="8" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
  <text x="378" y="95" text-anchor="middle" font-size="10" font-weight="bold" fill="#15803d">輸液ボーラス</text>
  <text x="378" y="111" text-anchor="middle" font-size="9" fill="#166534">晶質液 250〜500mL</text>
  <text x="378" y="127" text-anchor="middle" font-size="9" fill="#166534">効果・副作用を再評価</text>
  <line x1="212" y1="155" x2="212" y2="175" stroke="#6b7280" stroke-width="2"/>
  <polygon points="207,175 212,185 217,175" fill="#6b7280"/>
  <text x="220" y="170" font-size="9" fill="#dc2626">No</text>
  <rect x="112" y="185" width="200" height="22" rx="6" fill="#fce7f3" stroke="#ec4899" stroke-width="1.5"/>
  <text x="212" y="200" text-anchor="middle" font-size="9" fill="#be185d">昇圧薬（ノルアドレナリン等）を開始</text>
  <rect x="8" y="8" width="136" height="62" rx="6" fill="#f0f9ff" stroke="#7dd3fc" stroke-width="1.5"/>
  <text x="18" y="26" font-size="9" font-weight="bold" fill="#0c4a6e">原因の鑑別</text>
  <text x="14" y="40" font-size="8.5" fill="#374151">循環血液量減少（出血・脱水）</text>
  <text x="14" y="54" font-size="8.5" fill="#374151">心原性 / 血管拡張 / 閉塞性</text>
  <text x="14" y="66" font-size="8.5" fill="#dc2626">※心原性に大量輸液は禁忌</text>
</svg>`,
    items: [
      { label: "まず原因を鑑別する（循環血液量減少・心原性・血管拡張・閉塞性ショック）", correct: true, rationale: "輸液が有効なのは前負荷依存性がある時のみ。心原性や閉塞性への盲目的輸液は悪化させる。" },
      { label: "PLR（下肢挙上テスト）で輸液なしに前負荷反応性を動的評価する", correct: true, rationale: "可逆的・非侵襲的な動的評価法。CO/SV/PPが増えれば輸液反応あり。人工呼吸なしでも使える。" },
      { label: "人工呼吸管理下ならPPV/SVV >13% は輸液反応性あり（条件付き）", correct: true, rationale: "調節呼吸下での動的指標として有用だが、自発呼吸・不整脈・低換気量では信頼性が落ちる。" },
      { label: "輸液反応あり → 晶質液250〜500mLをボーラス投与し効果・副作用を再評価", correct: true, rationale: "反応があっても漫然と輸液を続けない。ボーラス後に肺水腫などの副作用も評価する。" },
      { label: "輸液反応なし → 輸液継続より昇圧薬（ノルアドレナリン等）の開始を検討", correct: true, rationale: "反応なしに輸液を続けると組織浮腫を招く。血管収縮薬で対応する。" },
      { label: "心原性ショックでもまず輸液を負荷してから昇圧薬を考える", correct: false, rationale: "心原性ショックへの過剰輸液は肺水腫を悪化させる。強心薬・補助循環が基本。" },
      { label: "Hbが正常範囲なら輸血は不要で輸液量を増やせばよい", correct: false, rationale: "Hbが許容下限付近でも組織酸素需給バランスが崩れていれば輸血が必要。輸液は酸素運搬能を上げない。" },
    ]
  }
];

(function ensureCheckModuleMeta() {
  CHECKLIST_MODULES.forEach((m, i) => {
    if (!m.id) m.id = `check-${i}`;
  });
})();

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
  },
  mishap: {
    view: "list",
    mode: "pick",
    scenarioIdx: -1,
    stepIdx: 0,
    answered: false,
    score: 0,
    shuffle: { stepTotal: 0, stepCorrect: 0 }
  },
  check: {
    view: "list",
    moduleIdx: -1,
    answered: false
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
  instructorMessage: document.getElementById("instructorMessage"),
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
  startCheckModuleBtn: document.getElementById("startCheckModuleBtn"),
  checkFullscreen: document.getElementById("checkFullscreen"),
  checkCloseBtn: document.getElementById("checkCloseBtn"),
  checkTitle: document.getElementById("checkTitle"),
  checkMeta: document.getElementById("checkMeta"),
  checkListArea: document.getElementById("checkListArea"),
  checkListRoot: document.getElementById("checkListRoot"),
  checkQuizArea: document.getElementById("checkQuizArea"),
  checkContext: document.getElementById("checkContext"),
  checkImage: document.getElementById("checkImage"),
  checkPrompt: document.getElementById("checkPrompt"),
  checkItems: document.getElementById("checkItems"),
  checkFeedback: document.getElementById("checkFeedback"),
  checkSubmitBtn: document.getElementById("checkSubmitBtn"),
  checkRestartBtn: document.getElementById("checkRestartBtn"),
  startMishapTrainerBtn: document.getElementById("startMishapTrainerBtn"),
  mishapFullscreen: document.getElementById("mishapFullscreen"),
  mishapCloseBtn: document.getElementById("mishapCloseBtn"),
  mishapTitle: document.getElementById("mishapTitle"),
  mishapMeta: document.getElementById("mishapMeta"),
  mishapCaseText: document.getElementById("mishapCaseText"),
  mishapImage: document.getElementById("mishapImage"),
  mishapPrompt: document.getElementById("mishapPrompt"),
  mishapOptions: document.getElementById("mishapOptions"),
  mishapFeedback: document.getElementById("mishapFeedback"),
  mishapSubmitBtn: document.getElementById("mishapSubmitBtn"),
  mishapNextBtn: document.getElementById("mishapNextBtn"),
  mishapRestartBtn: document.getElementById("mishapRestartBtn"),
  mishapListArea: document.getElementById("mishapListArea"),
  mishapListHint: document.getElementById("mishapListHint"),
  mishapListRoot: document.getElementById("mishapListRoot"),
  mishapQuizArea: document.getElementById("mishapQuizArea"),
  mishapShuffleNextBtn: document.getElementById("mishapShuffleNextBtn"),
  mishapShuffleEndBtn: document.getElementById("mishapShuffleEndBtn"),
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

function mishapProgressStorageKey(playerId) {
  return `masui_mishap_cleared_${playerId}`;
}

function loadMishapClearedIds(playerId) {
  if (!playerId) return [];
  try {
    const raw = localStorage.getItem(mishapProgressStorageKey(playerId));
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveMishapClearedIds(playerId, ids) {
  if (!playerId) return;
  const uniq = [...new Set(ids)];
  localStorage.setItem(mishapProgressStorageKey(playerId), JSON.stringify(uniq));
}

function recordMishapClearedIfPerfect(playerId, scenarioId, score, stepCount) {
  if (!playerId || !scenarioId || score !== stepCount) return;
  const ids = loadMishapClearedIds(playerId);
  if (ids.includes(scenarioId)) return;
  saveMishapClearedIds(playerId, [...ids, scenarioId]);
}

function getMishapPlayerId() {
  return (state.playerName || els.playerName?.value || "").trim();
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

function openMishapFullscreen() {
  if (!els.mishapFullscreen) return;
  els.mishapFullscreen.classList.remove("hidden");
  els.mishapFullscreen.setAttribute("aria-hidden", "false");
  document.body.classList.add("airway-active");
}

function closeMishapFullscreen() {
  if (!els.mishapFullscreen) return;
  els.mishapFullscreen.classList.add("hidden");
  els.mishapFullscreen.setAttribute("aria-hidden", "true");
  document.body.classList.remove("airway-active");
  state.mishap.view = "list";
  state.mishap.mode = "pick";
  state.mishap.shuffle = { stepTotal: 0, stepCorrect: 0 };
}

function showMishapListView() {
  state.mishap.view = "list";
  if (els.mishapListArea) els.mishapListArea.classList.remove("hidden");
  if (els.mishapQuizArea) els.mishapQuizArea.classList.add("hidden");
  renderMishapList();
}

function showMishapQuizView() {
  state.mishap.view = "quiz";
  if (els.mishapListArea) els.mishapListArea.classList.add("hidden");
  if (els.mishapQuizArea) els.mishapQuizArea.classList.remove("hidden");
}

function openMishapHub() {
  openMishapFullscreen();
  state.mishap.mode = "pick";
  state.mishap.shuffle = { stepTotal: 0, stepCorrect: 0 };
  state.mishap.scenarioIdx = -1;
  showMishapListView();
}

function startMishapTrainer() {
  openMishapHub();
}

function startMishapScenarioAt(sIdx) {
  if (sIdx < 0 || sIdx >= MISHAP_SCENARIOS.length) return;
  state.mishap.mode = "pick";
  state.mishap.scenarioIdx = sIdx;
  state.mishap.stepIdx = 0;
  state.mishap.answered = false;
  state.mishap.score = 0;
  showMishapQuizView();
  renderMishapStep();
}

function startMishapShuffleMode() {
  state.mishap.mode = "shuffle";
  state.mishap.shuffle = { stepTotal: 0, stepCorrect: 0 };
  state.mishap.scenarioIdx = Math.floor(Math.random() * MISHAP_SCENARIOS.length);
  state.mishap.stepIdx = 0;
  state.mishap.answered = false;
  state.mishap.score = 0;
  showMishapQuizView();
  renderMishapStep();
}

function goNextShuffleProblem() {
  state.mishap.scenarioIdx = Math.floor(Math.random() * MISHAP_SCENARIOS.length);
  state.mishap.stepIdx = 0;
  state.mishap.answered = false;
  state.mishap.score = 0;
  if (els.mishapShuffleNextBtn) els.mishapShuffleNextBtn.classList.add("hidden");
  if (els.mishapShuffleEndBtn) els.mishapShuffleEndBtn.classList.add("hidden");
  if (els.mishapSubmitBtn) {
    els.mishapSubmitBtn.classList.remove("hidden");
    els.mishapSubmitBtn.disabled = false;
  }
  renderMishapStep();
}

function endMishapShuffleMode() {
  const sh = state.mishap.shuffle;
  const t = sh.stepTotal;
  const c = sh.stepCorrect;
  const pct = t > 0 ? Math.round((c / t) * 100) : 0;
  const msg =
    t > 0
      ? `このシャッフルセッションの正答率: ${pct}％（${c} / ${t} 問）`
      : "まだ解答がないため正答率は算出できませんでした。";
  window.alert(`おつかれさまでした。\n\n${msg}`);
  state.mishap.mode = "pick";
  state.mishap.shuffle = { stepTotal: 0, stepCorrect: 0 };
  showMishapListView();
}

function handleMishapCloseClick() {
  if (state.mishap.view === "quiz") {
    if (state.mishap.mode === "shuffle") {
      state.mishap.mode = "pick";
      state.mishap.shuffle = { stepTotal: 0, stepCorrect: 0 };
    }
    showMishapListView();
    return;
  }
  closeMishapFullscreen();
}

function renderMishapList() {
  if (!els.mishapListRoot || !els.mishapListHint) return;
  const pid = getMishapPlayerId();
  const clearedSet = new Set(loadMishapClearedIds(pid));
  els.mishapListHint.textContent = pid
    ? `受講者「${pid}」の正答済み症例が表示されます。未完了を上に並べています。`
    : "トップで受講者を選ぶと、正答済みが保存・表示されます。";

  els.mishapListRoot.replaceChildren();

  const shuffleRow = document.createElement("div");
  shuffleRow.className = "mishap-list-row mishap-list-row--shuffle";
  shuffleRow.setAttribute("role", "listitem");
  const shuffleBtn = document.createElement("button");
  shuffleBtn.type = "button";
  shuffleBtn.className = "mishap-list-shuffle-btn";
  shuffleBtn.textContent = "シャッフルで解き続ける（終了までランダム出題）";
  shuffleBtn.addEventListener("click", () => {
    openMishapFullscreen();
    startMishapShuffleMode();
  });
  const shuffleSub = document.createElement("p");
  shuffleSub.className = "mishap-list-sub mishap-list-sub--shuffle";
  shuffleSub.textContent = "プール全症例からランダム。「終了する」で正答率を表示します。";
  shuffleRow.appendChild(shuffleBtn);
  shuffleRow.appendChild(shuffleSub);
  els.mishapListRoot.appendChild(shuffleRow);

  const ordered = MISHAP_SCENARIOS.map((s, i) => ({
    scenario: s,
    index: i,
    cleared: clearedSet.has(s.id)
  })).sort((a, b) => {
    if (a.cleared !== b.cleared) return a.cleared ? 1 : -1;
    return a.index - b.index;
  });

  ordered.forEach(({ scenario, index, cleared }) => {
    const row = document.createElement("div");
    row.className = "mishap-list-row" + (cleared ? " mishap-list-row--cleared" : " mishap-list-row--open");
    row.setAttribute("role", "listitem");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mishap-list-item-btn";
    const titleLine = document.createElement("span");
    titleLine.className = "mishap-list-charming";
    titleLine.textContent = scenario.charmingTitle || scenario.title;
    btn.appendChild(titleLine);
    const sub = document.createElement("span");
    sub.className = "mishap-list-official";
    sub.textContent = scenario.title;
    btn.appendChild(sub);
    if (cleared) {
      const badge = document.createElement("span");
      badge.className = "mishap-cleared-badge";
      badge.textContent = "正答済み";
      btn.appendChild(badge);
    }
    btn.addEventListener("click", () => {
      openMishapFullscreen();
      startMishapScenarioAt(index);
    });
    row.appendChild(btn);
    els.mishapListRoot.appendChild(row);
  });

  if (els.mishapTitle) els.mishapTitle.textContent = "先人から学ぶ";
  if (els.mishapMeta) els.mishapMeta.textContent = "症例を選ぶか、シャッフルモードへ";
}

function renderMishapStep() {
  const sIdx = state.mishap.scenarioIdx;
  if (sIdx < 0 || sIdx >= MISHAP_SCENARIOS.length) return;
  const scenario = MISHAP_SCENARIOS[sIdx];
  const step = scenario.steps[state.mishap.stepIdx];
  if (!step || !els.mishapOptions || !els.mishapPrompt || !els.mishapMeta) return;
  if (els.mishapTitle) els.mishapTitle.textContent = scenario.title;
  if (els.mishapCaseText) els.mishapCaseText.textContent = `症例: ${scenario.caseText}`;
  if (els.mishapImage) els.mishapImage.innerHTML = scenario.imageSvg || "";
  const sh = state.mishap.shuffle;
  if (state.mishap.mode === "shuffle") {
    const acc = sh.stepTotal > 0 ? `${sh.stepCorrect} / ${sh.stepTotal}` : "—";
    els.mishapMeta.textContent = `シャッフル · Step ${state.mishap.stepIdx + 1} / ${scenario.steps.length} · 累計 ${acc}`;
  } else {
    els.mishapMeta.textContent = `Step ${state.mishap.stepIdx + 1} / ${scenario.steps.length}`;
  }
  els.mishapPrompt.textContent = step.prompt;
  els.mishapOptions.replaceChildren();
  const multiSelect = !!step.multiSelect;
  step.options.forEach((opt, idx) => {
    const label = document.createElement("label");
    label.className = "airway-option-label";
    const input = document.createElement("input");
    input.type = multiSelect ? "checkbox" : "radio";
    if (!multiSelect) input.name = "mishapOption";
    input.value = String(idx);
    const text = document.createElement("span");
    text.textContent = opt.text;
    label.appendChild(input);
    label.appendChild(text);
    els.mishapOptions.appendChild(label);
  });
  state.mishap.answered = false;
  if (els.mishapFeedback) {
    els.mishapFeedback.classList.add("hidden");
    els.mishapFeedback.classList.remove("correct", "wrong");
    els.mishapFeedback.textContent = "";
  }
  if (els.mishapNextBtn) els.mishapNextBtn.classList.add("hidden");
  if (els.mishapSubmitBtn) {
    els.mishapSubmitBtn.classList.remove("hidden");
    els.mishapSubmitBtn.disabled = false;
  }
  if (els.mishapRestartBtn) els.mishapRestartBtn.classList.add("hidden");
  if (els.mishapShuffleNextBtn) els.mishapShuffleNextBtn.classList.add("hidden");
  if (els.mishapShuffleEndBtn) els.mishapShuffleEndBtn.classList.add("hidden");
}

function submitMishapStep() {
  if (state.mishap.answered || !els.mishapOptions) return;
  const scenario = MISHAP_SCENARIOS[state.mishap.scenarioIdx];
  const step = scenario?.steps?.[state.mishap.stepIdx];
  if (!step) return;

  const multiSelect = !!step.multiSelect;

  if (multiSelect) {
    const allInputs = Array.from(els.mishapOptions.querySelectorAll("input[type='checkbox']"));
    const selectedIdxs = allInputs.filter(el => el.checked).map(el => Number(el.value));
    if (selectedIdxs.length === 0) {
      if (els.mishapFeedback) {
        els.mishapFeedback.classList.remove("hidden", "correct");
        els.mishapFeedback.classList.add("wrong");
        els.mishapFeedback.textContent = "1つ以上選んでから判定してください。";
      }
      return;
    }
    state.mishap.answered = true;
    const correctIdxs = step.options.map((o, i) => o.correct ? i : -1).filter(i => i >= 0);
    const allCorrect = correctIdxs.every(i => selectedIdxs.includes(i));
    const noIncorrect = selectedIdxs.every(i => correctIdxs.includes(i));
    const ok = allCorrect && noIncorrect;
    if (ok) state.mishap.score += 1;
    if (state.mishap.mode === "shuffle") {
      state.mishap.shuffle.stepTotal += 1;
      if (ok) state.mishap.shuffle.stepCorrect += 1;
    }
    allInputs.forEach((el, i) => {
      el.disabled = true;
      const isCorrect = !!step.options[i]?.correct;
      const isSelected = selectedIdxs.includes(i);
      if (isCorrect && isSelected) el.parentElement?.classList.add("is-recommended");
      else if (!isCorrect && isSelected) el.parentElement?.classList.add("is-risky");
      else if (isCorrect && !isSelected) el.parentElement?.classList.add("is-missed");
    });
    if (els.mishapFeedback) {
      els.mishapFeedback.classList.remove("hidden");
      els.mishapFeedback.classList.add(ok ? "correct" : "wrong");
      const missed = correctIdxs.filter(i => !selectedIdxs.includes(i));
      const wrong = selectedIdxs.filter(i => !correctIdxs.includes(i));
      let fb = ok ? "正解です！正しい対応をすべて選べました。" : "確認が必要な項目があります。";
      if (missed.length) fb += ` 見落とし: ${missed.map(i => step.options[i].text).join("、")}`;
      if (wrong.length) fb += ` 不要な選択: ${wrong.map(i => step.options[i].text).join("、")}`;
      els.mishapFeedback.textContent = fb;
    }
    if (els.mishapSubmitBtn) els.mishapSubmitBtn.disabled = true;
    if (els.mishapNextBtn) {
      const isLast = state.mishap.stepIdx >= scenario.steps.length - 1;
      els.mishapNextBtn.textContent = isLast ? "ふり返る" : "次へ";
      els.mishapNextBtn.classList.remove("hidden");
    }
    return;
  }

  const selected = els.mishapOptions.querySelector("input[type='radio']:checked");
  if (!selected) {
    if (els.mishapFeedback) {
      els.mishapFeedback.classList.remove("hidden", "correct");
      els.mishapFeedback.classList.add("wrong");
      els.mishapFeedback.textContent = "1つ選んでから判定してください。";
    }
    return;
  }
  state.mishap.answered = true;
  const idx = Number(selected.value);
  const chosen = step.options[idx];
  const ok = !!chosen?.correct;
  if (ok) state.mishap.score += 1;
  if (state.mishap.mode === "shuffle") {
    state.mishap.shuffle.stepTotal += 1;
    if (ok) state.mishap.shuffle.stepCorrect += 1;
  }
  Array.from(els.mishapOptions.querySelectorAll("input[type='radio']")).forEach((el, i) => {
    el.disabled = true;
    if (step.options[i]?.correct) el.parentElement?.classList.add("is-recommended");
    if (i === idx && !ok) el.parentElement?.classList.add("is-risky");
  });
  if (els.mishapFeedback) {
    els.mishapFeedback.classList.remove("hidden");
    els.mishapFeedback.classList.add(ok ? "correct" : "wrong");
    els.mishapFeedback.textContent = `${ok ? "正解です。" : "ここは再確認。"} ${chosen?.rationale || ""}`;
  }
  if (els.mishapSubmitBtn) els.mishapSubmitBtn.disabled = true;
  if (els.mishapNextBtn) {
    const isLast = state.mishap.stepIdx >= scenario.steps.length - 1;
    els.mishapNextBtn.textContent = isLast ? "ふり返る" : "次へ";
    els.mishapNextBtn.classList.remove("hidden");
  }
}

function goNextMishapStep() {
  const scenario = MISHAP_SCENARIOS[state.mishap.scenarioIdx];
  if (!scenario) return;
  if (state.mishap.stepIdx < scenario.steps.length - 1) {
    state.mishap.stepIdx += 1;
    renderMishapStep();
    return;
  }
  renderMishapResult();
}

function renderMishapResult() {
  const scenario = MISHAP_SCENARIOS[state.mishap.scenarioIdx];
  if (!scenario || !els.mishapPrompt || !els.mishapOptions || !els.mishapMeta || !els.mishapFeedback) return;

  const pid = getMishapPlayerId();
  if (state.mishap.mode === "pick") {
    recordMishapClearedIfPerfect(pid, scenario.id, state.mishap.score, scenario.steps.length);
  }

  els.mishapMeta.textContent = `完了 ${state.mishap.score} / ${scenario.steps.length}`;
  els.mishapPrompt.textContent = "ふり返り: 見つける→初動対応 の順で考える";
  els.mishapOptions.replaceChildren();
  const ul = document.createElement("ul");
  ["① まず画像/現場で異常箇所を特定", "② つぎに原因修正と再評価を同時進行"].forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    ul.appendChild(li);
  });
  els.mishapOptions.appendChild(ul);
  els.mishapFeedback.classList.remove("hidden", "correct", "wrong");
  let fb = `2問セット完了: ${state.mishap.score}/${scenario.steps.length}`;
  if (state.mishap.mode === "shuffle") {
    const sh = state.mishap.shuffle;
    fb += ` · シャッフル累計 ${sh.stepCorrect} / ${sh.stepTotal}`;
  } else if (pid && state.mishap.score === scenario.steps.length) {
    fb += " · 症例は正答済みとして保存しました";
  }
  els.mishapFeedback.textContent = fb;
  if (els.mishapSubmitBtn) els.mishapSubmitBtn.classList.add("hidden");
  if (els.mishapNextBtn) els.mishapNextBtn.classList.add("hidden");
  if (state.mishap.mode === "shuffle") {
    if (els.mishapRestartBtn) els.mishapRestartBtn.classList.add("hidden");
    if (els.mishapShuffleNextBtn) els.mishapShuffleNextBtn.classList.remove("hidden");
    if (els.mishapShuffleEndBtn) els.mishapShuffleEndBtn.classList.remove("hidden");
  } else {
    if (els.mishapShuffleNextBtn) els.mishapShuffleNextBtn.classList.add("hidden");
    if (els.mishapShuffleEndBtn) els.mishapShuffleEndBtn.classList.add("hidden");
    if (els.mishapRestartBtn) els.mishapRestartBtn.classList.remove("hidden");
  }
}

function loadCheckClearedIds(playerId) {
  if (!playerId) return [];
  const raw = localStorage.getItem(`masui_check_cleared_${playerId}`);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function recordCheckCleared(playerId, moduleId) {
  if (!playerId || !moduleId) return;
  const ids = loadCheckClearedIds(playerId);
  if (!ids.includes(moduleId)) {
    ids.push(moduleId);
    localStorage.setItem(`masui_check_cleared_${playerId}`, JSON.stringify(ids));
  }
}

function openCheckFullscreen() {
  if (!els.checkFullscreen) return;
  els.checkFullscreen.classList.remove("hidden");
  els.checkFullscreen.setAttribute("aria-hidden", "false");
}

function closeCheckFullscreen() {
  if (!els.checkFullscreen) return;
  els.checkFullscreen.classList.add("hidden");
  els.checkFullscreen.setAttribute("aria-hidden", "true");
  state.check.view = "list";
  state.check.moduleIdx = -1;
  state.check.answered = false;
}

function showCheckListView() {
  state.check.view = "list";
  if (els.checkListArea) els.checkListArea.classList.remove("hidden");
  if (els.checkQuizArea) els.checkQuizArea.classList.add("hidden");
}

function showCheckQuizView() {
  state.check.view = "quiz";
  if (els.checkListArea) els.checkListArea.classList.add("hidden");
  if (els.checkQuizArea) els.checkQuizArea.classList.remove("hidden");
}

function renderCheckList() {
  if (!els.checkListRoot) return;
  const pid = state.playerName;
  const clearedSet = new Set(loadCheckClearedIds(pid));
  if (els.checkTitle) els.checkTitle.textContent = "初学者必修チェックリスト";
  if (els.checkMeta) els.checkMeta.textContent = "モジュールを選んでください";
  els.checkListRoot.replaceChildren();
  CHECKLIST_MODULES.forEach((mod, idx) => {
    const cleared = clearedSet.has(mod.id);
    const row = document.createElement("div");
    row.className = "mishap-list-row" + (cleared ? " mishap-list-row--cleared" : " mishap-list-row--open");
    row.setAttribute("role", "listitem");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mishap-list-item-btn";
    const titleLine = document.createElement("span");
    titleLine.className = "mishap-list-charming";
    titleLine.textContent = mod.title;
    btn.appendChild(titleLine);
    const sub = document.createElement("span");
    sub.className = "mishap-list-official";
    sub.textContent = `正解 ${mod.items.filter(it => it.correct).length} 項目 ／ ダミー ${mod.items.filter(it => !it.correct).length} 項目`;
    btn.appendChild(sub);
    if (cleared) {
      const badge = document.createElement("span");
      badge.className = "mishap-cleared-badge";
      badge.textContent = "修了";
      btn.appendChild(badge);
    }
    btn.addEventListener("click", () => {
      startCheckModule(idx);
    });
    row.appendChild(btn);
    els.checkListRoot.appendChild(row);
  });
  showCheckListView();
}

function startCheckModule(idx) {
  if (idx < 0 || idx >= CHECKLIST_MODULES.length) return;
  state.check.moduleIdx = idx;
  state.check.answered = false;
  renderCheckModule();
  showCheckQuizView();
}

function renderCheckModule() {
  const idx = state.check.moduleIdx;
  if (idx < 0 || idx >= CHECKLIST_MODULES.length) return;
  const mod = CHECKLIST_MODULES[idx];
  if (els.checkTitle) els.checkTitle.textContent = mod.title;
  const correctCount = mod.items.filter(it => it.correct).length;
  const dummyCount = mod.items.filter(it => !it.correct).length;
  if (els.checkMeta) els.checkMeta.textContent = `正解 ${correctCount} 項目 ／ ダミー ${dummyCount} 項目`;
  if (els.checkContext) els.checkContext.textContent = mod.context;
  if (els.checkImage) els.checkImage.innerHTML = mod.imageSvg || "";
  if (els.checkPrompt) els.checkPrompt.textContent = "以下の項目のうち、このシナリオで正しいものを全て選んでください。";
  if (!els.checkItems) return;
  els.checkItems.replaceChildren();
  mod.items.forEach((item, i) => {
    const label = document.createElement("label");
    label.className = "airway-option-label";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = String(i);
    const text = document.createElement("span");
    text.textContent = item.label;
    label.appendChild(input);
    label.appendChild(text);
    els.checkItems.appendChild(label);
  });
  state.check.answered = false;
  if (els.checkFeedback) {
    els.checkFeedback.classList.add("hidden");
    els.checkFeedback.classList.remove("correct", "wrong");
    els.checkFeedback.textContent = "";
  }
  if (els.checkSubmitBtn) {
    els.checkSubmitBtn.classList.remove("hidden");
    els.checkSubmitBtn.disabled = false;
  }
  if (els.checkRestartBtn) els.checkRestartBtn.classList.add("hidden");
}

function submitCheckModule() {
  if (state.check.answered || !els.checkItems) return;
  const idx = state.check.moduleIdx;
  if (idx < 0 || idx >= CHECKLIST_MODULES.length) return;
  const mod = CHECKLIST_MODULES[idx];
  const allInputs = Array.from(els.checkItems.querySelectorAll("input[type='checkbox']"));
  const selectedIdxs = allInputs.filter(el => el.checked).map(el => Number(el.value));
  if (selectedIdxs.length === 0) {
    if (els.checkFeedback) {
      els.checkFeedback.classList.remove("hidden", "correct");
      els.checkFeedback.classList.add("wrong");
      els.checkFeedback.textContent = "1つ以上選んでから判定してください。";
    }
    return;
  }
  state.check.answered = true;
  const correctIdxs = mod.items.map((it, i) => it.correct ? i : -1).filter(i => i >= 0);
  const allCorrect = correctIdxs.every(i => selectedIdxs.includes(i));
  const noIncorrect = selectedIdxs.every(i => correctIdxs.includes(i));
  const perfect = allCorrect && noIncorrect;
  const correctSelected = selectedIdxs.filter(i => correctIdxs.includes(i)).length;
  const incorrectSelected = selectedIdxs.filter(i => !correctIdxs.includes(i)).length;
  const missed = correctIdxs.filter(i => !selectedIdxs.includes(i)).length;
  allInputs.forEach((el, i) => {
    el.disabled = true;
    const item = mod.items[i];
    const isSelected = selectedIdxs.includes(i);
    if (item.correct && isSelected) {
      el.parentElement?.classList.add("is-recommended");
    } else if (!item.correct && isSelected) {
      el.parentElement?.classList.add("is-risky");
    } else if (item.correct && !isSelected) {
      el.parentElement?.classList.add("is-missed");
    }
    const rationaleEl = document.createElement("span");
    rationaleEl.className = "check-rationale";
    rationaleEl.textContent = item.rationale;
    el.parentElement?.appendChild(rationaleEl);
  });
  const pid = state.playerName;
  if (perfect && pid) recordCheckCleared(pid, mod.id);
  if (els.checkFeedback) {
    els.checkFeedback.classList.remove("hidden");
    els.checkFeedback.classList.add(perfect ? "correct" : "wrong");
    let fb = perfect
      ? `完璧です！ 全 ${correctIdxs.length} 項目を正しく選択しました。`
      : `正解選択: ${correctSelected} / ${correctIdxs.length} 項目`;
    if (incorrectSelected > 0) fb += ` · 不要な選択: ${incorrectSelected} 個（赤表示）`;
    if (missed > 0) fb += ` · 見落とし: ${missed} 個（オレンジ表示）`;
    els.checkFeedback.textContent = fb;
  }
  if (els.checkSubmitBtn) els.checkSubmitBtn.classList.add("hidden");
  if (els.checkRestartBtn) els.checkRestartBtn.classList.remove("hidden");
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
  if (mode === "challenge") return "応用編（ER編）";
  if (mode === "advanced") return state.advancedVariant === "practical" ? "発展編（P-ICU対応&組成選択・本番）" : "発展編（P-ICU対応&組成選択）";
  return "基礎編（レミフェンタニル編）";
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
  els.questionContextWeight.textContent = `${state.blockWeightKg}kg`;
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
      ph.textContent = "選ぶ";
      els.dilutionSelect.appendChild(ph);
      q.practicalOptions.forEach((opt, idx) => {
        const o = document.createElement("option");
        o.value = String(idx);
        o.textContent = opt.label;
        els.dilutionSelect.appendChild(o);
      });
      els.dilutionSelect.value = "";
      els.dilutionSourceHint.textContent = "希釈を選んでね";
    } else {
      els.dilutionChooser.classList.add("hidden");
      els.dilutionSelect.replaceChildren();
      els.dilutionSourceHint.textContent = "";
    }
  }
  if (els.questionConcentration) els.questionConcentration.textContent = "";
  if (els.questionGammaHint) els.questionGammaHint.textContent = "";
  if (els.questionText) els.questionText.textContent = q.text;
  if (els.instructorMessage) els.instructorMessage.textContent = q.instructorLine || `${q.orderGamma}γで投与して！`;
  els.answerInput.value = "";
  calcReset();
  els.answerInput.blur();

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
    els.questionConcentration.textContent = "";
    els.questionGammaHint.textContent = "";
    if (els.dilutionSourceHint) {
      els.dilutionSourceHint.textContent = "希釈を選んでね";
    }
    return;
  }
  const c = qMath.concentrationMcgPerMl;
  const cDisp = Math.abs(c - Math.round(c)) < 1e-6 ? String(Math.round(c)) : c.toFixed(1);
  els.questionConcentration.textContent = `溶解濃度（主薬）: ${cDisp} μg/ml`;
  els.questionGammaHint.textContent = `式メモ: ml/h ＝ γ(μg/kg/min) × 体重(kg) × 60 ÷ ${c.toFixed(1)}`;
  if (els.dilutionSourceHint) {
    const src = qMath.selected.source ? ` · ${qMath.selected.source}` : "";
    els.dilutionSourceHint.textContent = `${cDisp}μg/ml${src}`;
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
      alert("電卓で数値を入れて「答えに反映」してください。");
      return;
    }
    const inputRate = parseAnswerMlInput(raw);
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
    instructorLine: q.instructorLine || `${q.orderGamma}γで投与して！`,
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
  const instructorLine = `${orderGamma}γで投与して！`;
  const text = practicalMode ? `${instructorLine}（希釈を選んでからml/h）` : instructorLine;
  return {
    id: `q${seq}`,
    category,
    drug,
    mgPer50ml,
    weightKg,
    orderGamma,
    concentrationMcgPerMl,
    answerMlPerHour,
    instructorLine,
    text,
    preparationLine: practicalMode ? drug : preparationLineForQuestion(drug, mgPer50ml),
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

function parseAnswerMlInput(raw) {
  const s = String(raw ?? "")
    .trim()
    .replace(/,/g, ".");
  return Number(s);
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
if (els.startCheckModuleBtn) {
  els.startCheckModuleBtn.addEventListener("click", () => {
    openCheckFullscreen();
    renderCheckList();
  });
}
if (els.checkCloseBtn) {
  els.checkCloseBtn.addEventListener("click", closeCheckFullscreen);
}
if (els.checkSubmitBtn) {
  els.checkSubmitBtn.addEventListener("click", submitCheckModule);
}
if (els.checkRestartBtn) {
  els.checkRestartBtn.addEventListener("click", renderCheckList);
}
if (els.startMishapTrainerBtn) {
  els.startMishapTrainerBtn.addEventListener("click", startMishapTrainer);
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
if (els.mishapCloseBtn) {
  els.mishapCloseBtn.addEventListener("click", handleMishapCloseClick);
}
if (els.mishapSubmitBtn) {
  els.mishapSubmitBtn.addEventListener("click", submitMishapStep);
}
if (els.mishapNextBtn) {
  els.mishapNextBtn.addEventListener("click", goNextMishapStep);
}
if (els.mishapRestartBtn) {
  els.mishapRestartBtn.addEventListener("click", () => {
    if (state.mishap.mode === "shuffle") return;
    showMishapListView();
  });
}
if (els.mishapShuffleNextBtn) {
  els.mishapShuffleNextBtn.addEventListener("click", goNextShuffleProblem);
}
if (els.mishapShuffleEndBtn) {
  els.mishapShuffleEndBtn.addEventListener("click", endMishapShuffleMode);
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
