# Execution Standards & Quality Rules

## Context Retrieval & Exploration
1. Never ingest entire multi-megabyte codebase dumps into prompt context.
2. Use `grep_search` and `list_dir` for fast discovery.
3. Slice files into precise 100–250 line chunks with `view_file` to keep the context window sharp, high-speed, and token-efficient.

## Code Quality & Architecture
1. **TypeScript Strictness**: Zero `any` types for domain models; all models must be strongly typed in `src/types/fitness.ts`.
2. **State Management**: Manage global state via Zustand with LocalStorage persistence and clean action setters.
3. **Modularity**: Keep components reusable, self-contained, and driven by centralized CSS variables in `src/index.css`.
4. **Validation**: Always verify builds with `npm --prefix frontend run build` before finalizing any turn.
5. **Git Hygiene**: Create clear, atomic git commits on branch `main` with standard conventional commit prefixes (`feat:`, `fix:`, `refactor:`, `style:`, `docs:`).
