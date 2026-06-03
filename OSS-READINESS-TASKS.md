# Sharely WebControl — Open-Source Readiness Tasks

> **For:** Carlos
> **Context:** This repo is architecturally strong (layered monorepo, honest docs, real tests on the risky parsing/streaming logic), but it's missing several "table stakes" items that stop an outside developer before they can use, run, or contribute to it. The tasks below close those gaps.
> **How to use this doc:** Each task is self-contained — pick it up in any order *within its priority band* (do all P0 before P1). Every task has a **Why**, **Acceptance criteria**, and a ready-to-paste **Agent prompt** you can run in Claude Code from the repo root.
> **Repo root:** `/Users/juanperez/src/s/sharely/webcontrol`

---

## Summary table

| # | Priority | Task | Effort |
|---|----------|------|--------|
| 1 | 🔴 P0 | Add a LICENSE + root `license` field | Trivial |
| 2 | 🔴 P0 | Fix the broken `lint` setup (no ESLint config or dependency) | Small |
| 3 | 🔴 P0 | Reconcile env-var docs — remove phantom Supabase vars | Trivial |
| 4 | 🟠 P1 | Add minimal CI (build + test + lint on PR) | Small |
| 5 | 🟠 P1 | Fix the phantom "Deploy with Vercel" button reference | Trivial |
| 6 | 🟡 P2 | Add issue/PR templates + CODE_OF_CONDUCT | Small |
| 7 | 🟡 P2 | Refactor oversized files (`WebControl.tsx`, agent-chat `styles.ts`) | Medium |
| 8 | 🟡 P2 | De-duplicate `listSearchItem.tsx` across ui-search / ui-browse | Medium |

**Suggested order:** Do **1, 2, 3** first (they're what make the repo legally and practically usable by outsiders), then **4, 5**, then the P2 cleanups as time allows.

---

## 🔴 P0 — Blockers (an outsider literally cannot proceed without these)

### Task 1 — Add a LICENSE

**Why:** There is no `LICENSE` file and no `license` field in the root `package.json`. Without a license, default copyright applies and **nobody can legally fork, use, or contribute** — which directly contradicts the README's "deploy your own fork" narrative. This is the single highest-priority item.

**Decision (locked):** **Apache-2.0**, copyright holder **Sharely.ai, Inc.**, year **2026**. Apache-2.0 is the standard for company-stewarded OSS: it adds an explicit patent grant and a `NOTICE`-file attribution mechanism that survives forks (useful given the Sharely branding), while keeping the published `@sharelyai/*` npm scope publish-restricted.

**Acceptance criteria:**
- [ ] `LICENSE` file exists at repo root with the full, verbatim Apache License 2.0 text.
- [ ] `NOTICE` file exists at repo root: `Copyright 2026 Sharely.ai, Inc.` plus a one-line product attribution (e.g. `Sharely WebControl`).
- [ ] Root `package.json` has `"license": "Apache-2.0"`.
- [ ] README has a short **License** section near the bottom stating the project is Apache-2.0 (© Sharely.ai, Inc.) and clarifying the `@sharelyai` npm scope remains publish-restricted (cross-reference the existing "For maintainers" section).

**Agent prompt:**
```
Add the Apache License 2.0 to this repo. Copyright holder is "Sharely.ai, Inc.",
year 2026. Specifically:
1. Create a LICENSE file at the repo root with the full, verbatim Apache-2.0 text
   (the standard apache.org text, including the appendix).
2. Create a NOTICE file at the repo root containing:
     Sharely WebControl
     Copyright 2026 Sharely.ai, Inc.
3. Add `"license": "Apache-2.0"` to the root package.json.
4. Add a short "## License" section at the bottom of README.md: state the project is
   licensed under Apache-2.0 (© 2026 Sharely.ai, Inc.), and note that while the source
   is open, the published @sharelyai/* npm packages remain publish-restricted (link to
   the existing "For maintainers" section).
Do not modify the per-package package.json license fields unless they already have one
that conflicts with Apache-2.0 — if they do, report it instead of changing it.
```

---

### Task 2 — Fix the broken `lint` setup

**Why:** Every package declares `"lint": "eslint src/"`, but there is **no ESLint config anywhere in the repo** and **`eslint` is not a dependency**. So `pnpm lint` fails immediately — the first thing a careful contributor runs is broken, which undermines confidence in all the other tooling.

**Pick one approach** (the prompt covers both — choose in the task):
- **(A) Wire up ESLint properly** (preferred if the team wants lint enforcement): add a flat `eslint.config.js` at the root + the dependency, targeting TS/React.
- **(B) Remove the dead scripts** (fastest, if lint isn't wanted yet): delete the `lint` scripts and the `turbo` lint task.

**Acceptance criteria (Approach A):**
- [ ] Root `eslint.config.js` (flat config) covering `.ts`/`.tsx`, with TypeScript + React rules and sensible ignores (`dist`, `node_modules`).
- [ ] `eslint` and required plugins added as root `devDependencies`.
- [ ] `pnpm lint` runs clean (or with only intentional, documented warnings) across all packages.
- [ ] `turbo.json` `lint` task still valid.

**Acceptance criteria (Approach B):**
- [ ] `"lint"` scripts removed from all package.json files.
- [ ] `lint` task removed from `turbo.json`.
- [ ] README "Commands" table no longer lists `pnpm lint` (or notes lint isn't configured yet).

**Agent prompt:**
```
The repo has "lint": "eslint src/" scripts in every package but NO eslint config and
eslint is not installed, so `pnpm lint` fails. I want approach <A or B>.

Approach A — set up ESLint properly:
- Add a flat config eslint.config.js at the repo root for a TypeScript + React 18/19
  monorepo using styled-components. Include @typescript-eslint and eslint-plugin-react
  (+ react-hooks). Ignore dist/ and node_modules/. Keep the rule set pragmatic, not
  draconian — this is an existing codebase, so don't introduce hundreds of errors.
- Add eslint and the needed plugins as root devDependencies (pin versions).
- Run `pnpm lint` and iterate until it passes or only emits a small, intentional set
  of warnings. Report the final lint output.

Approach B — remove the dead lint scaffolding:
- Remove the "lint" script from every package.json, remove the lint task from
  turbo.json, and remove `pnpm lint` from the README Commands table.

First confirm which config files and scripts exist, then make the change for the chosen
approach only. Show me what you changed.
```

---

### Task 3 — Reconcile env-var docs (remove phantom Supabase vars)

**Why:** `CONTRIBUTING.md` documents `VITE_PUBLIC_SUPABASE_URL`, `VITE_PUBLIC_SUPABASE_ANON_KEY`, and `VITE_REDIRECT_URL` as required env vars. **None of these are read anywhere in the source** — the only `VITE_*` vars the code actually uses are `VITE_API_DEFAULT_URL` and `VITE_WORKSPACE_ID` (which match `.env.example` and the README). The Supabase vars are stale/aspirational and will send a newcomer chasing credentials they don't need, and imply Sharely depends on Supabase when it doesn't.

> **Verify before deleting:** run the grep in the prompt. If it turns out some Supabase integration *is* planned/partially wired, the fix flips to *adding* the vars to `.env.example` instead of removing them from the docs. Confirm which case is true before editing.

**Acceptance criteria:**
- [ ] Env-var documentation is consistent across `README.md`, `CONTRIBUTING.md`, and `.env.example`.
- [ ] If Supabase vars are confirmed unused: remove them from `CONTRIBUTING.md` (and remove the "a Supabase project" line from its Prerequisites).
- [ ] If any var is demo-only, it's labeled as such.

**Agent prompt:**
```
CONTRIBUTING.md documents Supabase env vars (VITE_PUBLIC_SUPABASE_URL,
VITE_PUBLIC_SUPABASE_ANON_KEY, VITE_REDIRECT_URL) but I believe they're unused.

1. Verify: grep the entire packages/ and apps/ source (*.ts, *.tsx) for SUPABASE,
   VITE_REDIRECT_URL, and every VITE_ variable. List exactly which env vars are
   actually read in code.
2. If the Supabase/redirect vars are NOT referenced anywhere:
   - Remove them from the Environment table in CONTRIBUTING.md.
   - Remove "and a Supabase project for env vars" from CONTRIBUTING.md Prerequisites.
   - Ensure README.md, CONTRIBUTING.md, and .env.example all list the SAME set of vars
     (currently VITE_API_DEFAULT_URL and VITE_WORKSPACE_ID).
3. If any of them ARE referenced, instead add them to .env.example with comments and
   keep the docs — and tell me where they're used.
Report the grep results before making edits.
```

---

## 🟠 P1 — Strongly recommended (signals the project is ready for outside contributors)

### Task 4 — Add minimal CI

**Why:** There is no `.github/workflows/` directory. A contributor's PR gets no automated validation, and there's no signal that `main` builds or that tests pass on a clean checkout. A tiny workflow is high-leverage and cheap.

**Acceptance criteria:**
- [ ] `.github/workflows/ci.yml` runs on `pull_request` and on push to `main`.
- [ ] Uses pnpm 9 (Corepack) + Node 18, runs `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm test`.
- [ ] Includes `pnpm lint` **only if Task 2 Approach A was taken** (otherwise omit it).
- [ ] Caches pnpm store for speed.

**Agent prompt:**
```
Add a GitHub Actions CI workflow at .github/workflows/ci.yml for this pnpm + Turborepo
monorepo. Requirements:
- Trigger on pull_request and on push to main.
- Ubuntu runner, Node 18, pnpm 9 via Corepack (the repo pins packageManager pnpm@9.0.0).
- Cache the pnpm store.
- Steps: checkout → setup node → install pnpm → `pnpm install --frozen-lockfile` →
  `pnpm build` → `pnpm test`.
- Add `pnpm lint` as a step ONLY if a working ESLint config exists in the repo;
  otherwise omit it (check first).
Keep it a single job. Confirm the test and build scripts exist in the root package.json
before writing the file.
```

---

### Task 5 — Fix the phantom "Deploy with Vercel" button reference

**Why:** `CONTRIBUTING.md` step 2 says to "click the **Deploy with Vercel** button in `README.md`" — but no such button exists in the README. A contributor following the deploy steps hunts for something that isn't there.

**Acceptance criteria:**
- [ ] Either a working "Deploy with Vercel" button is added to the README (pointing at the repo), **or** the CONTRIBUTING reference is reworded to the manual "Import the repo into Vercel" flow.
- [ ] No dangling references to a non-existent button remain.

**Agent prompt:**
```
CONTRIBUTING.md tells the reader to click a "Deploy with Vercel" button in README.md,
but README.md has no such button. Fix the inconsistency. Preferred: add a real
"Deploy with Vercel" button to README.md near the Quick start / Distribution section
using the standard https://vercel.com/new/clone deploy link pointing at this repo's
GitHub URL (ask me for the URL if it's not in the git remotes — check `git remote -v`).
If adding the button isn't clean, instead reword the CONTRIBUTING step to describe the
manual "Import the repo into Vercel" flow and drop the button reference. Show the diff.
```

---

## 🟡 P2 — Polish (improves contributor experience; do as time allows)

### Task 6 — Add issue/PR templates + CODE_OF_CONDUCT

**Why:** CONTRIBUTING's "Reporting issues" section asks for specific info (repro, Node/pnpm versions, browser) but there's no template to enforce it. Standard community health files make the project look maintained and lower the bar to good contributions.

**Acceptance criteria:**
- [ ] `.github/ISSUE_TEMPLATE/bug_report.md` (and optionally `feature_request.md`) capturing the fields CONTRIBUTING already asks for.
- [ ] `.github/pull_request_template.md` with a short checklist (tests pass, changeset added if a package changed, docs updated).
- [ ] `CODE_OF_CONDUCT.md` (Contributor Covenant) with a real contact email.

**Agent prompt:**
```
Add community health files to this repo:
1. .github/ISSUE_TEMPLATE/bug_report.md — fields matching CONTRIBUTING.md's "Reporting
   issues" section: minimal reproduction (mention the /headless-demo snippet), Node &
   pnpm versions, browser + version.
2. .github/ISSUE_TEMPLATE/feature_request.md — short problem/solution/alternatives form.
3. .github/pull_request_template.md — checklist: `pnpm test` passes, `pnpm build`
   passes, a changeset was added if a package under packages/ changed, docs/examples
   updated if behavior changed.
4. CODE_OF_CONDUCT.md — Contributor Covenant v2.1. Use the contact email
   <ASK ME — e.g. conduct@sharely.ai>; leave a clear TODO placeholder if unknown.
Keep them concise and consistent with the existing CONTRIBUTING.md tone.
```

---

### Task 7 — Refactor the oversized files

**Why:** Several files are large enough to intimidate a newcomer — and the worst offenders are exactly the files people read first. `apps/webcontrol/src/WebControl.tsx` (724 LOC) is the documented main entry component; `packages/ui-agent-chat/src/components/styles.ts` (1,186 LOC) and `packages/services/src/hooks/useAgentChat.ts` (669 LOC) are also heavy.

**Acceptance criteria:**
- [ ] `WebControl.tsx` is decomposed into smaller, named sub-components/hooks (or, at minimum, gains a top-of-file comment block mapping its sections) with **no behavior change**.
- [ ] `styles.ts` in ui-agent-chat is split by component grouping if a clean seam exists.
- [ ] All existing tests still pass; the demo app still runs and behaves identically.

**Agent prompt:**
```
Refactor apps/webcontrol/src/WebControl.tsx (currently ~724 lines) for readability with
ZERO behavior change. Identify natural seams — view-switching logic, the floating
launcher, the drawer, RBAC gating, effects/state — and extract them into well-named
sub-components or hooks in sibling files. Preserve all props and public exports exactly.
After refactoring, run `pnpm test` and `pnpm --filter @sharelyai/webcontrol build` and
confirm both pass. Do NOT change styling output or the embed API. Summarize the new file
layout. (If a clean extraction isn't safe, instead add a structured section-map comment
at the top of the file and stop — tell me why.)
```

---

### Task 8 — De-duplicate `listSearchItem.tsx`

**Why:** Near-identical `listSearchItem.tsx` files exist in both `ui-search` (~611 LOC) and `ui-browse` (~590 LOC). Since `ui-browse` already depends on `ui-search`, this is duplicated logic that will drift and confuses newcomers about which is canonical.

**Acceptance criteria:**
- [ ] The two files are diffed; shared logic is identified.
- [ ] If they're substantially the same: the canonical version lives in `ui-search`, is exported, and `ui-browse` consumes it (parameterizing any differences via props).
- [ ] If differences are genuinely large: leave both but document why, and extract any clearly-shared helpers.
- [ ] Tests pass and both `/search-only` and `/browse-only` demo routes behave identically.

**Agent prompt:**
```
Compare packages/ui-search/src/components/SearchResults/components/listSearchItem.tsx
and packages/ui-browse/src/components/ContentView/components/listSearchItem.tsx. Produce
a diff summary first. ui-browse already depends on ui-search.
- If they share most logic: promote a single canonical implementation in ui-search,
  export it from the package's public entry, and have ui-browse import it — parameterize
  any real differences via props rather than copying. Update imports accordingly.
- If the differences are substantial: don't force a merge; instead extract only the
  clearly-shared helpers and document at the top of each file why they remain separate.
Run `pnpm test` and build both packages. Confirm /search-only and /browse-only still
work identically in the demo. Report what you did and why.
```

---

## Other recommendations (no task needed — judgment calls / future)

- **Component-level tests are absent.** All 18 test files cover `utils/` and the AI adapters (good — that's the risky logic). But there's no rendering test for any panel, so styled-components/UI regressions won't be caught. Consider adding a few smoke tests (React Testing Library) for `ChatPanel`, `SearchPanel`, and `AgentChatPanel` once CI exists.
- **Lead the README with the filtered dev command.** `pnpm dev` starts *every* package's persistent task — heavy for a first run. CONTRIBUTING already calls `pnpm --filter @sharelyai/demo dev` "the recommended starting point"; the README's Local Development section should match so newcomers' first command is the lightweight one.
- **Clarify the Supabase story in the demo (if Task 3 confirms it's unused).** Add one line somewhere explaining the demo's auth approach so people don't assume Sharely requires Supabase.
- **Consider release automation later.** `pnpm release` is fully manual. Once CI exists, a Changesets "release" GitHub Action would remove a class of human error — but it's not urgent given the scope is private.
- **Add a SECURITY.md** with a disclosure contact if this widget will be embedded on third-party sites (XSS surface in markdown rendering / SSE handling makes a reporting path worthwhile).

---

*Generated as a shareable task spec. Each Agent prompt is designed to be pasted into Claude Code (or any coding agent) run from the repo root. Run P0 tasks before P1, and re-verify acceptance criteria after each.*
