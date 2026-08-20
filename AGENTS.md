# Antigravity Agent Execution Standards (v2.5.5 Minimal)

This file defines the primary operational standards, workflow rules, and context retrieval policies for Antigravity in this repository.

---

## 1. Operational Modes

- **Quick Edits (<20 lines / simple fixes / visual tweaks):**
  - Execute immediately with minimal overhead using `replace_file_content` or `multi_replace_file_content`.
  - No bloated planning cycles for trivial changes.

- **Features / Complex Refactors / Architectural Changes:**
  - Follow the 5-stage engineering lifecycle:
    1. **Research**: Targeted codebase exploration (`grep_search`, `list_dir`, `view_file` slices).
    2. **Plan**: Generate `implementation_plan.md` outlining exact file diffs and open questions.
    3. **Approval**: Wait for user approval on architectural decisions before modifying code.
    4. **Execute**: Implement modular, typed changes with clean separation of concerns.
    5. **Verify & Ship**: Run `npm run build` to ensure 0 compiler errors, test via `browser_subagent`, and document results in `walkthrough.md`.

---

## 2. High-Leverage Engineering Workflows

- **Scope & Planning (`/office-hours`, `/grill-me`, `/goal`):**
  - Scope features, challenge assumptions, identify edge cases, and define minimal viable paths before writing code.
- **Code Review (`/review`):**
  - Audit all modified lines for race conditions, state persistence issues, TypeScript strictness, and security flaws before committing.
- **QA & Browser Validation (`/qa <url>`):**
  - Use the native `browser_subagent` to visually verify UI responsiveness, click interaction paths, modal lifecycle, and DOM state.
- **Ship & Auto-Deployment (`/ship`):**
  - Run `npm run ship` (or `powershell -File ./scripts/ship.ps1`) to compile, commit, and push automatically to GitHub (`origin/main`), which triggers instant Vercel production deployment. Document results in `walkthrough.md`.

---

## 3. Targeted Codebase Context Rule (Anti-Bloat Policy)

- **Avoid Monolithic Context Packing (e.g. Repomix dumps):**
  - Do NOT dump the entire repository into a monolithic XML file. Monolithic context packing pollutes the context window with thousands of irrelevant tokens, degrades needle-in-a-haystack reasoning precision, and increases latency.
- **Use Precision Slicing:**
  - Use `grep_search` to pinpoint exact symbol locations.
  - Use `view_file` with explicit `StartLine` and `EndLine` ranges (100–200 lines per read).
  - Use Knowledge Items (KIs) for persistent repository architecture patterns.

---

## 4. UI & Design System Standards

- **Theme Engine**: Support DARK, LIGHT, and AUTO themes using pure CSS variables (`[data-theme="dark"]`, `[data-theme="light"]`, `[data-theme="auto"]`).
- **Responsive Layouts**: Design for seamless responsiveness across mobile viewports (375px), tablets (768px), and high-res desktop monitors (1440px+).
- **No Third-Party Bloat**: Prefer native Vanilla CSS tokens and lightweight zero-dependency utilities (e.g. pure HTML5 canvas animations) over heavy NPM packages.
