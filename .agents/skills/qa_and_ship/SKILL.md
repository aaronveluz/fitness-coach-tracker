---
name: qa_and_ship
description: >-
  Run full-stack validation, browser automated QA sweeps, TypeScript compilation audits, and production shipping procedures. Use when asked to /qa, /review, /ship, or test changes before deployment.
---

# QA, Verification & Shipping Skill

Use this workflow to ensure 100% correctness, visual fidelity, and build stability before shipping changes.

## Step 1: TypeScript & Build Audit
Run the production build compiler:
```powershell
npm --prefix frontend run build
```
Verify that the output finishes with exit code `0` and 0 errors.

## Step 2: Browser Automated QA Sweep
Launch a browser subagent (`browser_subagent`) to test:
1. User Authentication & Role Switching (Athlete, Staff, Coach Pat).
2. Food Tracker daily logs, custom food creation, and Database Manager.
3. Workout Logging, 1RM calculator, and Coach Pat remarks.
4. User Management (`/users`) additions and updates.
5. Dark / Light / Auto theme switches across responsive viewports.

## Step 3: Git Commit & PR Assembly
Stage modified files and create atomic conventional commits:
```powershell
git add .
git commit -m "feat(scope): concise description of changes"
```

## Step 4: Documentation Walkthrough
Update `walkthrough.md` in the artifact directory documenting:
- Architectural changes made
- Automated test and build verification
- Embedded browser recording artifacts
