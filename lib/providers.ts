/** 서버 전용 live 전환 계약. 키 값은 반환하거나 기록하지 않습니다. */

export const PROVIDER_IDS = ["neis", "careernet", "schoolinfo"] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];
export type ProviderStatus = "fixture" | "ready" | "blocked";

export interface ProviderHealth {
  id: ProviderId;
  role: string;
  officialUrl: string;
  status: ProviderStatus;
  missingEnv: string[];
  caution: string;
}

const DEFINITIONS = {
  neis: {
    role: "학교기본정보·급식·학사일정·중학교 시간표",
    requiredEnv: "NEIS_API_KEY",
    officialUrl: "https://open.neis.go.kr/",
    caution: "LOAD_DTM과 학교 최종 공지를 대조하고 급식 알레르기 번호를 의료판정으로 바꾸지 않습니다.",
  },
  careernet: {
    role: "주니어 직업정보·진로교육자료",
    requiredEnv: "CAREERNET_API_KEY",
    officialUrl:
      "https://www.career.go.kr/cnet/front/openapi/openApiJunior3Center.do",
    caution: "직업정보는 적성 판정이 아니라 탐색 후보와 질문으로만 표현합니다.",
  },
  schoolinfo: {
    role: "연간 학교 공시 맥락",
    requiredEnv: "SCHOOLINFO_API_KEY",
    officialUrl: "https://www.data.go.kr/data/15098092/openapi.do",
    caution: "주간 운영자료 공급자가 아니므로 NEIS 급식·시간표와 섞어 표시하지 않습니다.",
  },
} as const;

export function getProviderHealth(
  env: Readonly<Record<string, string | undefined>> = process.env,
): ProviderHealth[] {
  const live = env.SC_BRIEFER_DATA_MODE?.trim().toLowerCase() === "live";

  return PROVIDER_IDS.map((id) => {
    const definition = DEFINITIONS[id];
    const missingEnv = env[definition.requiredEnv]?.trim()
      ? []
      : [definition.requiredEnv];

    return {
      id,
      role: definition.role,
      officialUrl: definition.officialUrl,
      status: !live ? "fixture" : missingEnv.length ? "blocked" : "ready",
      missingEnv,
      caution: definition.caution,
    };
  });
}
