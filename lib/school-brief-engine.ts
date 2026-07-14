/**
 * 학교생활·진로 데이터 브리퍼의 결정론적 fixture 엔진입니다.
 *
 * 실제 API 연결 전에도 입력 정규화, 부분 실패, 근거 원장, 교사 승인 경계를
 * 검증할 수 있도록 공식 응답 스키마를 모사한 합성 레코드만 사용합니다.
 */

export type CareerTheme =
  | "ai_robot"
  | "environment"
  | "public_social"
  | "engineering"
  | "culture_art";

export type BriefStatus = "ready" | "verify" | "blocked";

export interface SchoolBriefInput {
  schoolQuery: string;
  weekStart: string;
  grade: 1 | 2 | 3;
  classNumber: string;
  careerTheme: CareerTheme;
}

export interface SchoolIdentity {
  name: string;
  office: string;
  level: string;
  address: string;
  schoolCode: string;
  matchStatus: "모의 매칭";
  loadedAt: string;
}

export interface MealBrief {
  menu: string[];
  calories: string;
  allergenNumbers: number[];
  status: "fixture";
}

export interface TimetableItem {
  period: number;
  subject: string;
}

export interface SchoolDayBrief {
  date: string;
  dayLabel: string;
  events: string[];
  meal: MealBrief | null;
  timetable: TimetableItem[];
}

export interface CareerCard {
  id: string;
  name: string;
  summary: string;
  explorationQuestion: string;
  activity: string;
  sourceUrl: string;
}

export interface ApprovalCheck {
  id: string;
  label: string;
  status: BriefStatus;
  evidence: string;
}

export interface SchoolToolTrace {
  id: string;
  tool: string;
  status: "fixture" | "verify";
  source: string;
  retrievedAt: string;
  detail: string;
}

export interface SchoolEvidence {
  id: string;
  claim: string;
  source: string;
  sourceUrl: string;
  retrievedAt: string;
  confidence: "높음" | "중간";
}

export interface SchoolBriefResult {
  mode: "school-brief";
  input: SchoolBriefInput;
  summary: string;
  school: SchoolIdentity;
  days: SchoolDayBrief[];
  careerCards: CareerCard[];
  teachingConnections: string[];
  approvalChecks: ApprovalCheck[];
  toolTrace: SchoolToolTrace[];
  evidence: SchoolEvidence[];
  dataGaps: string[];
  warnings: string[];
}

const SOURCE_URLS = {
  neis: "https://open.neis.go.kr/",
  schoolInfo: "https://www.data.go.kr/data/15098092/openapi.do",
  juniorCareer:
    "https://www.career.go.kr/cnet/front/openapi/openApiJunior3Center.do",
  careerMaterials:
    "https://www.career.go.kr/cnet/front/openapi/openApiCoseCenter.do",
} as const;

const THEME_LABELS: Record<CareerTheme, string> = {
  ai_robot: "AI·로봇",
  environment: "환경·생태",
  public_social: "공공·사회",
  engineering: "공학·제조",
  culture_art: "문화·예술",
};

const CAREER_FIXTURES: Record<
  CareerTheme,
  Omit<CareerCard, "sourceUrl">[]
> = {
  ai_robot: [
    {
      id: "ai-researcher",
      name: "인공지능 연구원",
      summary: "데이터와 알고리즘을 이용해 문제 해결 방법을 탐구하는 직업 후보입니다.",
      explorationQuestion: "좋은 AI 결과를 판단하려면 어떤 근거와 검증이 필요할까요?",
      activity: "학교생활 데이터를 사람이 검토해야 하는 이유를 사례로 정리합니다.",
    },
    {
      id: "robot-engineer",
      name: "로봇공학 기술자",
      summary: "센서·제어·소프트웨어를 결합해 로봇 시스템을 설계하는 직업 후보입니다.",
      explorationQuestion: "학교에서 반복되는 일 중 로봇이 돕기 적합한 일은 무엇일까요?",
      activity: "센서 입력, 판단, 동작으로 이어지는 흐름도를 만듭니다.",
    },
    {
      id: "data-analyst",
      name: "데이터 분석가",
      summary: "자료를 정리하고 패턴과 한계를 설명해 의사결정을 돕는 직업 후보입니다.",
      explorationQuestion: "자료가 없는 날을 추정하지 않고 표시해야 하는 이유는 무엇일까요?",
      activity: "이번 주 일정표에서 사실, 해석, 확인 필요 항목을 구분합니다.",
    },
  ],
  environment: [
    {
      id: "environment-researcher",
      name: "환경 연구원",
      summary: "환경 변화를 측정하고 원인과 대응 방법을 연구하는 직업 후보입니다.",
      explorationQuestion: "학교에서 지속적으로 관찰할 수 있는 환경 지표는 무엇일까요?",
      activity: "급식·행사 자료와 연결할 수 있는 자원 절약 질문을 설계합니다.",
    },
    {
      id: "ecologist",
      name: "생태학 연구원",
      summary: "생물과 환경의 상호작용을 조사하는 직업 후보입니다.",
      explorationQuestion: "학교 주변 생태를 기록할 때 계절 변화를 어떻게 구분할까요?",
      activity: "관찰값과 공개데이터를 비교하는 표를 설계합니다.",
    },
    {
      id: "energy-manager",
      name: "에너지 관리 전문가",
      summary: "시설의 에너지 사용을 분석하고 효율 개선을 지원하는 직업 후보입니다.",
      explorationQuestion: "에너지 절약 효과를 공정하게 비교하려면 어떤 기준이 필요할까요?",
      activity: "학교 주간 운영에서 에너지 사용이 달라질 요인을 찾습니다.",
    },
  ],
  public_social: [
    {
      id: "policy-researcher",
      name: "정책 연구원",
      summary: "공공문제를 자료로 분석하고 대안을 비교하는 직업 후보입니다.",
      explorationQuestion: "학교 공지는 누구에게 어떤 형식으로 제공되어야 할까요?",
      activity: "같은 정보를 학생용·교사용 문장으로 각각 바꿔 봅니다.",
    },
    {
      id: "social-worker",
      name: "사회복지사",
      summary: "사람들이 필요한 지원을 찾고 이용하도록 연결하는 직업 후보입니다.",
      explorationQuestion: "정보 접근이 어려운 사용자를 위해 무엇을 바꿔야 할까요?",
      activity: "브리핑 화면의 접근성 개선 항목을 점검합니다.",
    },
    {
      id: "public-data-planner",
      name: "공공데이터 기획자",
      summary: "공공정보를 안전하게 개방하고 활용 서비스를 설계하는 직업 후보입니다.",
      explorationQuestion: "공개정보와 개인정보의 경계는 어디에 있을까요?",
      activity: "수집해도 되는 필드와 금지할 필드를 분류합니다.",
    },
  ],
  engineering: [
    {
      id: "software-engineer",
      name: "소프트웨어 개발자",
      summary: "요구사항을 코드와 테스트로 구현하는 직업 후보입니다.",
      explorationQuestion: "같은 입력에 같은 결과가 나와야 하는 기능은 무엇일까요?",
      activity: "학교 브리퍼의 입력·출력 계약을 간단한 표로 만듭니다.",
    },
    {
      id: "industrial-engineer",
      name: "산업공학 기술자",
      summary: "사람·정보·절차가 함께 움직이는 과정을 개선하는 직업 후보입니다.",
      explorationQuestion: "학교의 반복 업무에서 가장 큰 대기 지점은 어디일까요?",
      activity: "조회부터 교사 승인까지의 처리 흐름을 분석합니다.",
    },
    {
      id: "quality-engineer",
      name: "품질관리 기술자",
      summary: "제품과 과정이 기준을 충족하는지 시험하고 개선하는 직업 후보입니다.",
      explorationQuestion: "공공 API가 일부 실패했을 때 어떤 결과를 막아야 할까요?",
      activity: "정상·누락·오류 상황의 검사표를 작성합니다.",
    },
  ],
  culture_art: [
    {
      id: "content-planner",
      name: "문화콘텐츠 기획자",
      summary: "문화 자원을 이야기와 체험으로 재구성하는 직업 후보입니다.",
      explorationQuestion: "학교의 한 주를 한 장의 이야기로 전달한다면 무엇이 핵심일까요?",
      activity: "주간 브리핑의 제목과 정보 우선순위를 설계합니다.",
    },
    {
      id: "visual-designer",
      name: "시각디자이너",
      summary: "정보가 빠르고 정확하게 이해되도록 시각 언어를 설계하는 직업 후보입니다.",
      explorationQuestion: "주의와 확정 상태를 색만 사용하지 않고 어떻게 구분할까요?",
      activity: "상태 배지의 글자·모양·색 조합을 비교합니다.",
    },
    {
      id: "archivist",
      name: "기록연구사",
      summary: "기록을 분류하고 맥락과 출처를 보존하는 직업 후보입니다.",
      explorationQuestion: "조회시각과 출처가 빠지면 기록의 신뢰성은 어떻게 달라질까요?",
      activity: "근거 원장의 필수 항목을 정의합니다.",
    },
  ],
};

export const defaultSchoolBriefInput: SchoolBriefInput = {
  schoolQuery: "수원 미래중학교",
  weekStart: "2026-07-13",
  grade: 2,
  classNumber: "1",
  careerTheme: "ai_robot",
};

function isCareerTheme(value: string): value is CareerTheme {
  return Object.prototype.hasOwnProperty.call(THEME_LABELS, value);
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function normalizeInput(input: SchoolBriefInput): SchoolBriefInput {
  const numericGrade = Number(input.grade);
  return {
    schoolQuery: input.schoolQuery.trim() || defaultSchoolBriefInput.schoolQuery,
    weekStart: isValidIsoDate(input.weekStart)
      ? input.weekStart
      : defaultSchoolBriefInput.weekStart,
    grade: ([1, 2, 3].includes(numericGrade) ? numericGrade : 2) as 1 | 2 | 3,
    classNumber: /^\d{1,2}$/.test(input.classNumber.trim())
      ? input.classNumber.trim()
      : defaultSchoolBriefInput.classNumber,
    careerTheme: isCareerTheme(input.careerTheme)
      ? input.careerTheme
      : defaultSchoolBriefInput.careerTheme,
  };
}

function isoAt(date: string, minuteOffset: number): string {
  return `${date}T08:${String(minuteOffset).padStart(2, "0")}:00+09:00`;
}

function dateParts(date: string): [number, number, number] {
  const [year, month, day] = date.split("-").map(Number);
  return [year, month, day];
}

function addDays(date: string, offset: number): string {
  const [year, month, day] = dateParts(date);
  const value = new Date(Date.UTC(year, month - 1, day + offset));
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, "0"),
    String(value.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function parseMeal(raw: string): MealBrief {
  const menu = raw
    .split(/<br\s*\/?\s*>/i)
    .map((item) => item.replace(/\([^)]*\)/g, "").trim())
    .filter(Boolean);
  const allergenNumbers = Array.from(
    new Set(
      Array.from(raw.matchAll(/\(([^)]*)\)/g))
        .flatMap((match) => match[1].split(/[.,]/))
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isInteger(item) && item > 0),
    ),
  ).sort((a, b) => a - b);

  return {
    menu,
    calories: "684.2 Kcal (합성 fixture)",
    allergenNumbers,
    status: "fixture",
  };
}

function buildDays(input: SchoolBriefInput): SchoolDayBrief[] {
  const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];
  const events = [
    [`${input.grade}학년 프로젝트 수업 안내`],
    ["학급 자치활동"],
    ["동아리 활동"],
    ["진로 탐색 질문 만들기"],
    ["주간 학습 성찰"],
    [],
    [],
  ];
  const mealFixtures = [
    "현미밥<br/>근대된장국(5.6)<br/>두부구이(5.6)<br/>배추김치(9)",
    "보리밥<br/>미역국(5.6)<br/>닭갈비(5.6.15)<br/>깍두기(9)",
    "콩나물밥(5.6)<br/>달걀국(1.5.6)<br/>채소전(1.5.6)<br/>배추김치(9)",
    "흑미밥<br/>감자국(5.6)<br/>고등어구이(5.6.7)<br/>열무김치(9)",
    "카레라이스(2.5.6.10)<br/>샐러드(1.5)<br/>요구르트(2)<br/>깍두기(9)",
  ];
  const subjects = ["국어", "수학", "과학", "영어", "사회", "정보"];

  return dayLabels.map((dayLabel, index) => ({
    date: addDays(input.weekStart, index),
    dayLabel,
    events: events[index],
    meal: index < 5 ? parseMeal(mealFixtures[index]) : null,
    timetable:
      index < 5
        ? subjects.slice(0, index === 2 ? 5 : 6).map((subject, period) => ({
            period: period + 1,
            subject:
              period === 5 && input.careerTheme === "ai_robot"
                ? "정보·진로 연계"
                : subject,
          }))
        : [],
  }));
}

function buildCareerCards(theme: CareerTheme): CareerCard[] {
  return CAREER_FIXTURES[theme].slice(0, 3).map((card) => ({
    ...card,
    sourceUrl: SOURCE_URLS.juniorCareer,
  }));
}

function buildToolTrace(input: SchoolBriefInput): SchoolToolTrace[] {
  const base = [
    ["resolve-school", "resolve_school", "NEIS schoolInfo fixture", "학교명을 교육청·학교코드 모의 레코드와 연결했습니다."],
    ["week-schedule", "get_week_schedule", "NEIS SchoolSchedule fixture", "7일 학사일정 합성 레코드를 학년 조건으로 필터링했습니다."],
    ["meals", "get_meals", "NEIS mealServiceDietInfo fixture", "평일 식단과 전체 알레르기 번호를 분리했습니다."],
    ["timetable", "get_middle_timetable", "NEIS misTimetable fixture", `${input.grade}학년 ${input.classNumber}반 조건으로 교시를 정렬했습니다.`],
    ["career-search", "search_junior_jobs", "CareerNet junior jobs fixture", `${THEME_LABELS[input.careerTheme]} 주제의 탐색 후보를 찾았습니다.`],
    ["career-detail", "get_junior_job", "CareerNet junior job detail fixture", "후보별 설명과 탐색 질문을 구성했습니다."],
    ["career-materials", "search_career_materials", "CareerNet COSE fixture", "수업 연결 활동을 합성 자료에서 선택했습니다."],
    ["brief", "generate_school_brief", "Local deterministic generator", "교사용 승인 항목과 학생용 탐구 질문을 생성했습니다."],
  ] as const;

  return base.map(([id, tool, source, detail], index) => ({
    id,
    tool,
    status: index === base.length - 1 ? "fixture" : "verify",
    source,
    retrievedAt: isoAt(input.weekStart, index),
    detail,
  }));
}

export function runSchoolBrief(input: SchoolBriefInput): SchoolBriefResult {
  const normalized = normalizeInput({ ...input });
  const days = buildDays(normalized);
  const careerCards = buildCareerCards(normalized.careerTheme);
  const loadedAt = isoAt(normalized.weekStart, 0);

  return {
    mode: "school-brief",
    input: normalized,
    summary: `${normalized.schoolQuery}의 ${normalized.weekStart} 시작 주간을 대상으로 급식·학사·시간표·${THEME_LABELS[normalized.careerTheme]} 진로 탐색 근거를 하나의 교사 검토 초안으로 구성했습니다.`,
    school: {
      name: `${normalized.schoolQuery} (시연용 합성 학교)`,
      office: "경기도교육청 (fixture)",
      level: "중학교",
      address: "경기도 수원시 (상세주소 비사용)",
      schoolCode: "MOCK-MIDDLE-001",
      matchStatus: "모의 매칭",
      loadedAt,
    },
    days,
    careerCards,
    teachingConnections: [
      "공개데이터의 사실·해석·확인 필요 항목을 색과 문장으로 구분합니다.",
      `${THEME_LABELS[normalized.careerTheme]} 직업 후보를 추천 결과가 아닌 탐구 질문으로 전환합니다.`,
      "자료가 없는 주말에는 값을 추정하지 않고 ‘운영자료 없음’으로 표시합니다.",
    ],
    approvalChecks: [
      {
        id: "school-match",
        label: "학교 식별",
        status: "verify",
        evidence: "현재 합성 학교코드를 사용합니다. live 전환 시 NEIS 학교코드와 교육청코드를 교사가 대조해야 합니다.",
      },
      {
        id: "freshness",
        label: "일정 최신성",
        status: "verify",
        evidence: "급식·학사·시간표는 학교 공지에 따라 바뀔 수 있으므로 LOAD_DTM과 최종 공지를 대조해야 합니다.",
      },
      {
        id: "privacy",
        label: "개인정보 비저장",
        status: "ready",
        evidence: "학생명·학번·연락처·개인 건강정보·심리검사 결과를 입력하거나 저장하지 않습니다.",
      },
      {
        id: "allergen",
        label: "알레르기 해석",
        status: "verify",
        evidence: "번호는 전체 원재료 표시이며 개인별 섭취 가능 여부나 의료판정이 아닙니다.",
      },
      {
        id: "career-boundary",
        label: "진로 표현",
        status: "ready",
        evidence: "직업 카드는 적성 판정이나 확정 추천이 아니라 탐색 후보와 질문만 제공합니다.",
      },
    ],
    toolTrace: buildToolTrace(normalized),
    evidence: [
      {
        id: "neis-evidence",
        claim: "학교·급식·학사일정·중학교 시간표는 NEIS 공개 API 연결 후보입니다.",
        source: "나이스 교육정보 개방 포털",
        sourceUrl: SOURCE_URLS.neis,
        retrievedAt: loadedAt,
        confidence: "높음",
      },
      {
        id: "schoolinfo-evidence",
        claim: "학교알리미는 주간 운영자료가 아닌 연간 공시 맥락의 2차 근거로 사용합니다.",
        source: "한국교육학술정보원 학교알리미 공개용 데이터",
        sourceUrl: SOURCE_URLS.schoolInfo,
        retrievedAt: isoAt(normalized.weekStart, 1),
        confidence: "높음",
      },
      {
        id: "career-evidence",
        claim: "초·중학생용 진로 후보는 커리어넷 주니어 직업정보 계약으로 전환합니다.",
        source: "커리어넷 주니어 직업정보 Open API",
        sourceUrl: SOURCE_URLS.juniorCareer,
        retrievedAt: isoAt(normalized.weekStart, 2),
        confidence: "높음",
      },
      {
        id: "career-material-evidence",
        claim: "진로교육자료는 학생 판정이 아니라 수업 탐구활동 보조에만 사용합니다.",
        source: "커리어넷 진로교육자료 Open API",
        sourceUrl: SOURCE_URLS.careerMaterials,
        retrievedAt: isoAt(normalized.weekStart, 3),
        confidence: "중간",
      },
    ],
    dataGaps: [
      "실제 NEIS 인증키·학교코드·LOAD_DTM 미연결",
      "커리어넷 인증키 승인 및 현행 응답 필드 검증 전",
      "학교알리미 2026년 시군구코드 변경사항 live 계약 미검증",
      "주말 운영자료는 추정 생성하지 않음",
    ],
    warnings: [
      "화면의 학교·식단·일정·시간표는 실제 학교 데이터가 아닌 합성 fixture입니다.",
      "급식 알레르기 번호는 개인별 의료판정이나 섭취 가능 판정이 아닙니다.",
      "교사가 학교 최종 공지와 출처 시각을 확인하기 전에는 결과를 확정하지 않습니다.",
      "2023년 종료된 커리어넷 구 직업정보 API는 사용하지 않습니다.",
    ],
  };
}

export const careerThemeLabels = THEME_LABELS;
