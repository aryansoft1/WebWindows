# WebWindows branch and deployment safety

These rules apply to every branch and worktree in this repository.

1. Before editing, run `git fetch origin --prune` and verify `origin/main` is an ancestor of `HEAD`.
2. If it is not an ancestor, merge `origin/main` into the feature branch before editing. Resolve and test conflicts; never copy an older worktree over newer files.
3. Source used for deployment must be tracked and committed. Do not deploy files copied from another dirty or untracked worktree.
4. Immediately before deployment, fetch again, verify the branch equals its upstream, and run `tools/deployment-preflight.ps1`.
5. Production files must be backed up and checked against the previous deployment manifest before overwrite. A mismatch stops deployment for manual reconciliation.
6. Update `deploy/ftp-manifest.json` with `tools/update-deployment-manifest.mjs`; do not hand-edit integrity hashes.
7. Upload the deployment manifest and entry page last. Never upload ignored credential configuration.
8. Run `node tests/deployment-entry-dependency-smoke.mjs`; every same-origin entry-page dependency must exist and be recorded in the deployment manifest.
9. Task continuity and handoff: every task (OpenCode or Codex) that is interrupted by a network failure must reconnect and resume from the checkpoint; never abandon or exit the task. All tasks executed by OpenCode must be recorded in `docs/HANDOFF_TASK_QUEUE.md`; Codex must read that ledger before continuing and write the status back after each milestone, block, handoff, or completion.
