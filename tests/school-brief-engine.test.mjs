import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

const engineUrl = new URL("../lib/school-brief-engine.ts", import.meta.url).href;
let cachedProbe;

function loadProbe() {
  if (cachedProbe) return cachedProbe;

  const source = `
    const { defaultSchoolBriefInput, runSchoolBrief } = await import(${JSON.stringify(engineUrl)});
    const input = { ...defaultSchoolBriefInput };
    const first = runSchoolBrief(input);
    const second = runSchoolBrief({ ...defaultSchoolBriefInput });
    const invalid = {
      ...defaultSchoolBriefInput,
      schoolQuery: "   ",
      weekStart: "2026-99-99",
      grade: 9,
      classNumber: "student-a",
      careerTheme: "unknown",
    };
    const invalidBefore = JSON.stringify(invalid);
    const normalized = runSchoolBrief(invalid);
    const themes = ["ai_robot", "environment", "public_social", "engineering", "culture_art"]
      .map((careerTheme) => runSchoolBrief({ ...defaultSchoolBriefInput, careerTheme }));

    process.stdout.write(JSON.stringify({
      defaultSchoolBriefInput,
      first,
      deterministic: JSON.stringify(first) === JSON.stringify(second),
      inputUnchanged: JSON.stringify(input) === JSON.stringify(defaultSchoolBriefInput),
      invalidBefore,
      invalidAfter: JSON.stringify(invalid),
      normalized,
      themes,
    }));
  `;

  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", "--input-type=module", "--eval", source],
    { encoding: "utf8", maxBuffer: 2 * 1024 * 1024, windowsHide: true },
  );

  assert.ifError(result.error);
  assert.equal(
    result.status,
    0,
    `school-brief probe failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  assert.ok(result.stdout.trim());
  cachedProbe = JSON.parse(result.stdout);
  return cachedProbe;
}

test("school brief is deterministic, structured, and input-immutable", () => {
  const { first, deterministic, inputUnchanged } = loadProbe();

  assert.equal(deterministic, true);
  assert.equal(inputUnchanged, true);
  assert.equal(first.mode, "school-brief");
  assert.equal(first.days.length, 7);
  assert.equal(first.careerCards.length, 3);
  assert.equal(first.toolTrace.length, 8);
  assert.equal(first.approvalChecks.length, 5);
  assert.ok(first.evidence.length >= 4);
  assert.ok(first.warnings.some((item) => item.includes("합성 fixture")));
});

test("invalid query scalars normalize without mutating the caller", () => {
  const {
    defaultSchoolBriefInput,
    invalidBefore,
    invalidAfter,
    normalized,
  } = loadProbe();

  assert.equal(invalidAfter, invalidBefore);
  assert.equal(normalized.input.schoolQuery, defaultSchoolBriefInput.schoolQuery);
  assert.equal(normalized.input.weekStart, defaultSchoolBriefInput.weekStart);
  assert.equal(normalized.input.grade, 2);
  assert.equal(normalized.input.classNumber, defaultSchoolBriefInput.classNumber);
  assert.equal(normalized.input.careerTheme, "ai_robot");
});

test("weekly records are ordered, bounded to seven days, and do not invent weekend data", () => {
  const { first } = loadProbe();

  assert.deepEqual(
    first.days.map((day) => day.date),
    [
      "2026-07-13",
      "2026-07-14",
      "2026-07-15",
      "2026-07-16",
      "2026-07-17",
      "2026-07-18",
      "2026-07-19",
    ],
  );
  for (const day of first.days.slice(5)) {
    assert.equal(day.meal, null);
    assert.deepEqual(day.timetable, []);
    assert.deepEqual(day.events, []);
  }
  assert.ok(first.dataGaps.some((item) => item.includes("주말")));
});

test("meal fixtures strip markup and normalize allergen numbers", () => {
  const { first } = loadProbe();
  const mondayMeal = first.days[0].meal;

  assert.ok(mondayMeal);
  assert.deepEqual(mondayMeal.menu, ["현미밥", "근대된장국", "두부구이", "배추김치"]);
  assert.deepEqual(mondayMeal.allergenNumbers, [5, 6, 9]);
  assert.ok(mondayMeal.menu.every((item) => !item.includes("<br")));
});

test("timetables and career candidates are bounded exploration records", () => {
  const { first, themes } = loadProbe();

  first.days.slice(0, 5).forEach((day) => {
    assert.deepEqual(
      day.timetable.map((item) => item.period),
      day.timetable.map((_, index) => index + 1),
    );
  });

  for (const result of themes) {
    assert.equal(result.careerCards.length, 3);
    assert.equal(new Set(result.careerCards.map((item) => item.id)).size, 3);
    const cardText = JSON.stringify(result.careerCards);
    assert.doesNotMatch(cardText, /적성\s*판정|매수|매도/);
  }
});

test("tool trace and evidence ledger remain auditable", () => {
  const { first } = loadProbe();
  const ids = first.toolTrace.map((item) => item.id);

  assert.equal(new Set(ids).size, 8);
  assert.deepEqual(
    first.toolTrace.map((item) => item.tool),
    [
      "resolve_school",
      "get_week_schedule",
      "get_meals",
      "get_middle_timetable",
      "search_junior_jobs",
      "get_junior_job",
      "search_career_materials",
      "generate_school_brief",
    ],
  );
  assert.ok(first.toolTrace.every((item) => item.source && item.retrievedAt));
  assert.ok(first.evidence.every((item) => item.sourceUrl.startsWith("https://")));
});

test("school brief source avoids network, persistence, randomness, and personal fields", async () => {
  const source = await readFile(
    new URL("../lib/school-brief-engine.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /\b(?:localStorage|sessionStorage|indexedDB)\b/);
  assert.doesNotMatch(source, /\b(?:Date\.now|Math\.random)\s*\(/);
  assert.doesNotMatch(source, /(?:studentName|studentId|phoneNumber|healthProfile)\s*:/);
});
