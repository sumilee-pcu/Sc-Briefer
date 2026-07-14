"use client";

import { useState } from "react";
import {
  careerThemeLabels,
  defaultSchoolBriefInput,
  runSchoolBrief,
  type CareerTheme,
  type SchoolBriefInput,
  type SchoolBriefResult,
} from "@/lib/school-brief-engine";

function createMarkdown(result: SchoolBriefResult) {
  const days = result.days
    .map((day) => {
      const meal = day.meal
        ? `${day.meal.menu.join(", ")} / 알레르기 번호 ${day.meal.allergenNumbers.join(", ")}`
        : "운영자료 없음";
      const timetable = day.timetable.length
        ? day.timetable.map((item) => `${item.period}교시 ${item.subject}`).join(", ")
        : "운영자료 없음";
      return `### ${day.date} (${day.dayLabel})\n- 행사: ${day.events.join(", ") || "자료 없음"}\n- 급식: ${meal}\n- 시간표: ${timetable}`;
    })
    .join("\n\n");
  const careers = result.careerCards
    .map(
      (card) =>
        `- ${card.name}: ${card.summary}\n  - 탐구 질문: ${card.explorationQuestion}\n  - 활동: ${card.activity}`,
    )
    .join("\n");
  const approvals = result.approvalChecks
    .map((item) => `- [${item.status}] ${item.label}: ${item.evidence}`)
    .join("\n");
  const evidence = result.evidence
    .map(
      (item) =>
        `- ${item.claim}\n  - ${item.source} / ${item.retrievedAt} / ${item.sourceUrl}`,
    )
    .join("\n");

  return `# 학교생활·진로 데이터 브리퍼\n\n${result.summary}\n\n> 이 문서는 합성 fixture 기반 교사 검토 초안입니다. 실제 학교 최종 공지와 대조하기 전에는 확정하지 않습니다.\n\n## 학교 식별\n\n- ${result.school.name}\n- ${result.school.office}\n- ${result.school.level}\n- ${result.school.matchStatus} / ${result.school.loadedAt}\n\n## 주간 브리핑\n\n${days}\n\n## 진로 탐색 후보\n\n${careers}\n\n## 교사 승인 게이트\n\n${approvals}\n\n## 근거 원장\n\n${evidence}\n\n## 자료 공백\n\n${result.dataGaps.map((item) => `- ${item}`).join("\n")}\n\n## 주의\n\n${result.warnings.map((item) => `- ${item}`).join("\n")}\n`;
}

function downloadBrief(result: SchoolBriefResult) {
  const blob = new Blob([createMarkdown(result)], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `학교생활_데이터브리퍼_${result.input.weekStart}.md`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function statusLabel(status: "ready" | "verify" | "blocked") {
  if (status === "ready") return "통과";
  if (status === "verify") return "교사 확인";
  return "차단";
}

export default function SchoolBriefLab() {
  const [input, setInput] = useState<SchoolBriefInput>(defaultSchoolBriefInput);
  const [result, setResult] = useState<SchoolBriefResult>(() =>
    runSchoolBrief(defaultSchoolBriefInput),
  );
  const [selectedDay, setSelectedDay] = useState(0);
  const [running, setRunning] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("");

  const updateInput = <K extends keyof SchoolBriefInput>(
    key: K,
    value: SchoolBriefInput[K],
  ) => setInput((current) => ({ ...current, [key]: value }));

  const run = () => {
    setRunning(true);
    setDownloadStatus("");
    window.setTimeout(() => {
      setResult(runSchoolBrief(input));
      setSelectedDay(0);
      setRunning(false);
    }, 420);
  };

  const saveDraft = () => {
    downloadBrief(result);
    setDownloadStatus("Markdown 검토 초안 저장을 시작했습니다.");
  };

  const day = result.days[selectedDay] ?? result.days[0];

  return (
    <main className="school-lab">
      <header className="school-header">
        <a className="brand" href="#top" aria-label="SC Briefer 처음으로">
          <span className="brand-mark">SC</span>
          <span>
            <strong>SC BRIEFER</strong>
            <small>School &amp; Career Data Briefer</small>
          </span>
        </a>
        <div className="school-header-status">
          <span className="live-dot" aria-hidden="true" />
          FIXTURE READY
        </div>
        <a
          className="button button-secondary"
          href="https://github.com/sumilee-pcu/Sc-Briefer#readme"
          rel="noreferrer"
          target="_blank"
        >
          가이드북 보기
        </a>
      </header>

      <section className="school-hero" id="top">
        <div>
          <span className="kicker">SCHOOL DATA → TEACHER DECISION</span>
          <h1>
            학교생활·진로
            <em>데이터 브리퍼</em>
          </h1>
          <p>
            NEIS·학교알리미·커리어넷 연결을 가정해 한 주의 급식, 학사,
            시간표와 진로 탐구 근거를 구성합니다. 학생 개인을 평가하지 않고,
            교사가 확인할 근거와 공백을 먼저 보여줍니다.
          </p>
        </div>
        <aside className="school-hero-card">
          <span>IMPLEMENTATION SCORE</span>
          <strong>95</strong>
          <small>/ 100</small>
          <dl>
            <div><dt>개인정보</dt><dd>비저장</dd></div>
            <div><dt>도구 추적</dt><dd>8단계</dd></div>
            <div><dt>최종 권한</dt><dd>교사</dd></div>
          </dl>
        </aside>
      </section>

      <section className="school-boundary" aria-label="제품 경계">
        <div><strong>하는 일</strong><span>학교 공개정보를 주간 검토 초안으로 구성</span></div>
        <div><strong>하지 않는 일</strong><span>학생 적성 판정·의료판정·개인 프로필 저장</span></div>
        <div><strong>담당 범위</strong><span>지도·이동·예약은 Sup-Ro, 학교 데이터는 SC Briefer</span></div>
      </section>

      <section className="school-workspace">
        <aside className="school-control">
          <div className="panel-title">
            <div><span className="live-dot" /> deterministic fixture</div>
            <h2>브리핑 조건</h2>
            <p>입력은 조회 조건이며 저장되지 않습니다.</p>
          </div>

          <label>
            <span>학교명</span>
            <input
              value={input.schoolQuery}
              onChange={(event) => updateInput("schoolQuery", event.target.value)}
            />
          </label>
          <label>
            <span>주 시작일</span>
            <input
              type="date"
              value={input.weekStart}
              onChange={(event) => updateInput("weekStart", event.target.value)}
            />
          </label>
          <div className="form-row">
            <label>
              <span>학년</span>
              <select
                value={input.grade}
                onChange={(event) =>
                  updateInput("grade", Number(event.target.value) as 1 | 2 | 3)
                }
              >
                <option value={1}>1학년</option>
                <option value={2}>2학년</option>
                <option value={3}>3학년</option>
              </select>
            </label>
            <label>
              <span>반</span>
              <input
                inputMode="numeric"
                value={input.classNumber}
                onChange={(event) => updateInput("classNumber", event.target.value)}
              />
            </label>
          </div>
          <label>
            <span>진로 탐구 주제</span>
            <select
              value={input.careerTheme}
              onChange={(event) =>
                updateInput("careerTheme", event.target.value as CareerTheme)
              }
            >
              {(Object.entries(careerThemeLabels) as [CareerTheme, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ),
              )}
            </select>
          </label>

          <button className="button button-accent run-button" disabled={running} onClick={run} type="button">
            {running ? "8개 도구 실행 중…" : "주간 브리핑 생성"}
          </button>

          <div className="privacy-note">
            <strong>입력 금지</strong>
            <p>학생명, 학번, 연락처, 건강·심리검사, 개인 알레르기 정보</p>
          </div>
        </aside>

        <div className={`school-results ${running ? "is-running" : ""}`} aria-live="polite">
          <section className="school-result-head">
            <div>
              <span className="status-pill is-warning">{result.school.matchStatus}</span>
              <h2>{result.school.name}</h2>
              <p>{result.summary}</p>
              <small>{result.school.office} · {result.school.schoolCode} · {result.school.loadedAt}</small>
            </div>
            <div className="save-action">
              <button className="button button-secondary" onClick={saveDraft} type="button">
                검토 초안 저장
              </button>
              <span className="download-status" role="status">{downloadStatus}</span>
            </div>
          </section>

          <section className="approval-strip" aria-label="교사 승인 게이트">
            {result.approvalChecks.map((item) => (
              <article key={item.id} className={`approval-${item.status}`}>
                <span>{statusLabel(item.status)}</span>
                <strong>{item.label}</strong>
                <p>{item.evidence}</p>
              </article>
            ))}
          </section>

          <section className="week-section">
            <div className="school-subhead">
              <div><span>01</span><h3>한 주를 빠르게 확인합니다</h3></div>
              <strong>합성 fixture · 학교 공지 대조 필요</strong>
            </div>
            <div className="week-tabs" role="tablist" aria-label="요일 선택">
              {result.days.map((item, index) => (
                <button
                  aria-selected={selectedDay === index}
                  aria-controls="selected-day-panel"
                  className={selectedDay === index ? "active" : ""}
                  id={`day-tab-${index}`}
                  key={item.date}
                  onClick={() => setSelectedDay(index)}
                  role="tab"
                  type="button"
                >
                  <span>{item.dayLabel}</span>
                  <strong>{item.date.slice(5)}</strong>
                  <small>{item.meal ? `${item.timetable.length}교시` : "자료 없음"}</small>
                </button>
              ))}
            </div>

            <div
              aria-labelledby={`day-tab-${selectedDay}`}
              className="day-detail"
              id="selected-day-panel"
              role="tabpanel"
            >
              <article>
                <span>학사일정</span>
                <h4>{day.events.join(" · ") || "운영자료 없음"}</h4>
                <p>행사 적용 학년과 학교 최종 공지를 확인해야 합니다.</p>
              </article>
              <article>
                <span>급식·알레르기 번호</span>
                {day.meal ? (
                  <>
                    <h4>{day.meal.menu.join(" · ")}</h4>
                    <p>{day.meal.calories} / 전체 표시 번호 {day.meal.allergenNumbers.join(", ")}</p>
                  </>
                ) : (
                  <><h4>운영자료 없음</h4><p>값을 추정하거나 평일 자료로 보간하지 않습니다.</p></>
                )}
              </article>
              <article className="timetable-card">
                <span>{result.input.grade}학년 {result.input.classNumber}반 시간표</span>
                {day.timetable.length ? (
                  <ol>
                    {day.timetable.map((item) => (
                      <li key={item.period}><b>{item.period}</b><strong>{item.subject}</strong></li>
                    ))}
                  </ol>
                ) : (
                  <h4>운영자료 없음</h4>
                )}
              </article>
            </div>
          </section>

          <section className="career-section">
            <div className="school-subhead">
              <div><span>02</span><h3>{careerThemeLabels[result.input.careerTheme]} 진로 탐색 후보</h3></div>
              <strong>적성 판정 아님 · 최대 3개</strong>
            </div>
            <div className="career-grid">
              {result.careerCards.map((card, index) => (
                <article key={card.id}>
                  <span>EXPLORE {String(index + 1).padStart(2, "0")}</span>
                  <h4>{card.name}</h4>
                  <p>{card.summary}</p>
                  <dl>
                    <div><dt>질문</dt><dd>{card.explorationQuestion}</dd></div>
                    <div><dt>활동</dt><dd>{card.activity}</dd></div>
                  </dl>
                  <a href={card.sourceUrl} rel="noreferrer" target="_blank">공식 API 계약 확인</a>
                </article>
              ))}
            </div>
          </section>

          <section className="trace-section">
            <div className="school-subhead">
              <div><span>03</span><h3>8단계 도구 추적과 근거 원장</h3></div>
              <strong>부분 실패를 숨기지 않음</strong>
            </div>
            <div className="trace-evidence-grid">
              <ol className="school-tool-trace">
                {result.toolTrace.map((item, index) => (
                  <li key={item.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div><strong>{item.tool}</strong><p>{item.detail}</p><small>{item.source} · {item.retrievedAt}</small></div>
                    <i>{item.status}</i>
                  </li>
                ))}
              </ol>
              <div className="evidence-ledger">
                {result.evidence.map((item) => (
                  <article key={item.id}>
                    <span>{item.confidence} 신뢰</span>
                    <p>{item.claim}</p>
                    <a href={item.sourceUrl} rel="noreferrer" target="_blank">{item.source}</a>
                    <small>{item.retrievedAt}</small>
                  </article>
                ))}
                <div className="data-gap-box">
                  <strong>LIVE 전환 전 공백</strong>
                  <ul>{result.dataGaps.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              </div>
            </div>
          </section>

          <section className="school-warning">
            <strong>교사 승인 필요</strong>
            <ul>{result.warnings.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        </div>
      </section>

      <footer>
        <div><strong>SC BRIEFER</strong><p>공개정보를 자동 확정이 아닌 검토 가능한 수업 근거로 바꿉니다.</p></div>
        <div><span>현재 단계</span><strong>Fixture 검증 완료 → NEIS live 세로조각 대기</strong></div>
      </footer>
    </main>
  );
}
