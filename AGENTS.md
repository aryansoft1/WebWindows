# WebWindows execution policy

These rules apply to every branch and worktree in this repository. They keep ordinary changes small and predictable without weakening an explicitly requested full release.

## 1. Execution modes

Use exactly one mode for a task:

- **Scoped change (default):** ordinary code, UI, copy, style, or bug fixes.
- **FTP upload:** the user explicitly asks to upload the current task's files.
- **Full release:** only when the user explicitly asks for a formal release, Release Integrity verification, full production audit, or equivalent.
- **OpenCode handoff:** only when work is actually transferred to OpenCode.

Do not silently promote a scoped change or FTP upload into a full release.

## 2. Scoped change workflow

For an ordinary change:

1. Locate only the relevant files and direct dependencies.
2. Edit only the requested scope.
3. Run one smallest sufficient targeted test pass.
4. Review one path-limited diff for the changed files.
5. Commit once when the task calls for a commit.
6. If FTP was explicitly requested, follow the FTP workflow below.
7. Stop when the requested result is stable.

Default budget: one implementation pass, one targeted test pass, one necessary repair pass, and one final verification pass. Retry a failure once only when its cause is understood and the retry directly addresses it.

Do not run broad audits, unrelated tests, full builds, repeated `git status`/`git diff`, or repeated production checks for a scoped change.

## 3. Git and worktree safety

- At task start, perform at most one local, read-only status/baseline check.
- A scoped change does not require `git fetch`, `git pull`, `git push`, or a remote merge-base check unless the user explicitly requests remote synchronization or the task is a full release.
- Preserve all unrelated dirty and untracked files.
- Never use `reset`, `clean`, history rewriting, or branch cleanup without explicit user authorization.
- Work only in the provided writable repository or a managed writable worktree.
- If Git cannot create an index lock or worktree metadata is outside the writable boundary, stop and report the permission/path needed. Do not clone repeatedly, copy `.git`, create substitute repositories, or move patches through multiple worktrees as a workaround.
- Deployment source must be tracked and committed. Do not deploy files copied from a dirty or untracked alternate worktree.

## 4. FTP upload workflow

FTP upload is a mechanical operation, not an automatic full release audit.

When the user asks to upload:

1. Confirm the exact current-task file list once.
2. Confirm that `WEBWINDOWS_FTP_HOST`, `WEBWINDOWS_FTP_USER`, and `WEBWINDOWS_FTP_PASSWORD` exist in the host's persistent user environment without printing their values.
3. Use the most recently successful, already approved incremental FTP method.
4. Upload only the current task's changed runtime files.
5. If all uploads succeed, report success and stop.

For a plain FTP upload, do not automatically:

- run `git fetch`, `git pull`, `git push`, or remote merge-base checks;
- rebuild the complete deployment manifest;
- run `tools/deployment-preflight.ps1`;
- synchronize the whole site;
- enumerate or hash every managed production file;
- rebuild a remote production baseline;
- perform browser checks, online functional checks, repeated refreshes, or long observation.

Never upload ignored credential configuration. Never request, repeat, print, log, copy into the repository, or commit FTP credential values.

If FTP cannot connect or upload, do not repeat the same attempt, switch deployment methods, search for another workaround, or modify deployment scripts. Stop and report the error.

Do not update `deploy/ftp-manifest.json` for a plain FTP upload unless the user explicitly includes it, the manifest itself is the requested change, or the task is a full release.

## 5. Full release workflow

Only in full-release mode:

1. Run `git fetch origin --prune` once and verify `origin/main` is an ancestor of `HEAD`.
2. If necessary, merge `origin/main`; never copy an older worktree over newer files.
3. Verify the release branch and upstream state once.
4. Run required targeted tests and `tools/deployment-preflight.ps1` once at the final candidate stage.
5. Back up production files and compare them with the previous deployment manifest. Stop on mismatch for manual reconciliation.
6. Update `deploy/ftp-manifest.json` with `tools/update-deployment-manifest.mjs`; never hand-edit integrity hashes.
7. Run `node tests/deployment-entry-dependency-smoke.mjs` when the entry page or its same-origin dependency closure is part of the release.
8. Upload the deployment manifest and entry page last.
9. Perform one minimal production smoke test, then stop.

Do not repeat preflight, upload, or production verification when no relevant state changed.

## 6. Long operations and timers

- For FTP, builds, package installation, Gradle, large tests, and network operations: start once, confirm no immediate failure, and perform at most one additional status check.
- Do not use repeated sleep-and-poll loops.
- Test timeout, retry, reconnect, debounce, refresh, and backoff behavior with fake timers, mock clocks, or fixtures instead of real long waits.
- If an operation remains healthy but incomplete after the allowed check, report its current state and how the user can confirm completion.

## 7. Tool and context efficiency

- Prefer path-limited `rg`, diffs, tests, and output.
- Do not print entire manifests, repository-wide status listings, full branch histories, or large historical task logs when a focused query is sufficient.
- Do not reread unchanged information.
- Do not use a skill, browser, GUI automation, or external documentation unless the task requires it.
- When no new information can be obtained, stop calling tools.

## 8. OpenCode handoff

Read or update `docs/HANDOFF_TASK_QUEUE.md` only when a task is actually handed to or resumed from OpenCode. Do not update it after every ordinary Codex milestone.

A handoff checkpoint must contain:

- the user's goal and constraints;
- completed work and current state;
- the complete changed-file list;
- tests run and their results;
- branch, commit hash, and relevant worktree state;
- FTP status and uploaded file list, if applicable;
- exact unfinished work, failures, and blockers;
- operations that must not be repeated or bypassed;
- one clear next action for OpenCode.

Write the checkpoint once, then stop. Do not retest or re-upload merely to prepare a handoff.

## 9. Final report

Keep the final report short and include only:

- completed work;
- changed files;
- test result;
- FTP/production result when applicable;
- commit hash when applicable;
- unfinished work or material risk.

Core rule: when the requested result is stable and another tool call would only reproduce the same state, stop.
