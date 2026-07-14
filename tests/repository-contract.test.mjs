import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("repository keeps the tutorial, product shell, and secret boundary", async () => {
  const [readme, page, app, provider, envExample] = await Promise.all([
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SchoolBriefLab.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/providers.ts", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
  ]);

  assert.match(readme, /10분 안에 첫 브리핑/);
  assert.match(readme, /교사 승인/);
  assert.match(readme, /fixture/);
  assert.match(page, /<SchoolBriefLab \/>/);
  assert.match(app, /runSchoolBrief/);
  assert.match(provider, /SC_BRIEFER_DATA_MODE/);
  assert.match(envExample, /NEIS_API_KEY=/);
  assert.doesNotMatch(envExample, /^NEXT_PUBLIC_[A-Z0-9_]*=/m);
});
