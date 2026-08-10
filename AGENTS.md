# WebWindows branch and deployment safety

These rules apply to every branch and worktree in this repository.

1. Before editing, run `git fetch origin --prune` and verify `origin/main` is an ancestor of `HEAD`.
2. If it is not an ancestor, merge `origin/main` into the feature branch before editing. Resolve and test conflicts; never copy an older worktree over newer files.
3. Source used for deployment must be tracked and committed. Do not deploy files copied from another dirty or untracked worktree.
4. Immediately before deployment, fetch again, verify the branch equals its upstream, and run `tools/deployment-preflight.ps1`.
5. Production files must be backed up and checked against the previous deployment manifest before overwrite. A mismatch stops deployment for manual reconciliation.
6. Update `deploy/ftp-manifest.json` with `tools/update-deployment-manifest.mjs`; do not hand-edit integrity hashes.
7. Upload the deployment manifest and entry page last. Never upload ignored credential configuration.
