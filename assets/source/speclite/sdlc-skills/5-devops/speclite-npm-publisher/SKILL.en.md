---
name: speclite-npm-publisher
description: "Publish open-source Node.js packages to npm with evidence-based release gates. Use when user mentions 'npm publish', 'release to npm', 'Node package release', 'npm 发布', 'Node 项目发布', '发 npm 包', package.json, npm pack, npx verification, registry auth, OTP, scoped package, or public package release. Capable of package metadata auditing, version occupancy checks, official registry authentication, tarball install smoke tests, safe publish confirmation, and post-publish propagation troubleshooting."
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview]
    An npm publishing Skill for open-source Node.js projects. It turns fact audit, tarball smoke tests, official registry authentication, confirmation, publish execution, postpublish verification, and incident recovery into a reusable workflow that prevents version reuse, mirror registry credential confusion, broken `.bin` entries, and propagation false alarms.

[Core Capabilities]
    - **Release Intent Confirmation**: Distinguish advice, readiness checks, preparation, and actual publishing; run `npm publish` only after explicit authorization and `package@version` confirmation.
    - **Package Contract Audit**: Extract `name`, `version`, `license`, `bin`, `exports`, `files`, `publishConfig`, `repository`, `homepage`, `bugs`, and scripts from `package.json` and real files.
    - **Official Registry Credential Check**: Verify `npm whoami` against `https://registry.npmjs.org/`, and detect credential separation when the default registry is a mirror.
    - **Version Occupancy Decision**: Check whether the target version already exists; never reuse published versions, and rerun gates after SemVer changes.
    - **Release Gate Orchestration**: Prefer existing `release:check`; otherwise compose build, test, lint, typecheck, and project checks from existing scripts.
    - **Tarball Smoke Verification**: Create a real tarball with `npm pack`, install it in a clean temporary directory, and run CLI or library smoke tests according to package type.
    - **Postpublish Verification**: Validate `npm view`, `dist-tags`, clean `npx`, or clean install, and handle registry, search, or CDN delays.
    - **Incident Pattern Capture**: Cover `E401`, `ENEEDAUTH`, `EOTP`, `E404 PUT scoped package`, `E403`, missing tarball files, `.bin` symlink issues, and local `npx` mis-resolution.

[Workflow]
    Use a sequential workflow with domain-specific gates. Load `references/speclite-npm-publisher-workflow.md` for detailed commands, decision rules, incident handling, and report templates; this entry keeps only phase routing.

    Step 1: Confirm Boundary And Authorization
        Classify whether the user wants advice, audit, preparation, or actual publishing. Before actual publishing, present the target `package@version`, registry, publish command, and validation plan, then wait for confirmation.

    Step 2: Establish Release Contract
        Read the Contract Audit section in the reference. Extract facts from `package.json`, build outputs, and git status. Stop if the project is not an open-source Node.js npm package, or if `private: true` is present without explicit override.

    Step 3: Run Prepublish Gates
        Follow the Prepublish Gates section to verify official registry login, unused version, metadata, scripts, build, tests, and real tarball smoke. If any gate fails, fix the root cause or ask for a decision; do not weaken requirements.

    Step 4: Publish And Handle Incidents
        Run publish only after user confirmation. Use `--access public` for scoped public packages; do not force scoped-only semantics on unscoped packages. Enter OTP, passwords, and tokens only through the terminal prompt.

    Step 5: Verify And Report
        Follow Postpublish Verification to check npm metadata, dist-tags, clean `npx`, or clean install. If read-side metadata temporarily returns 404 while publish evidence exists, wait and retry instead of republishing the same version.

[Notes]
    - Only edit project files explicitly requested by the user; list metadata, README, LICENSE, bin, or release script gaps before changing them.
    - Package name, version, bin names, entry files, and scripts must come from `package.json` and real files, never guesses.
    - Do not record passwords, tokens, OTPs, or recovery codes in scripts, docs, logs, chat, or shell history.
    - Do not validate remote packages with `npx <package>@<version>` from the source repository root; use clean temporary directories.
    - Do not reuse published versions, roll versions backward to bypass errors, or change core requirements just to pass gates.
    - This Skill handles publish execution; pair it with `npm-release-docs-checker` for README and publishing documentation audits.
    - Write generated release reports to `.specskills/output/devops/speclite-npm-publisher/`, never the project root.

[Generation Metadata]
    This Skill was generated by speclite-skill-creator. Update SKILL.md and SKILL.en.md together, and sync assets/source/speclite/sdlc-skills/5-devops/speclite-npm-publisher/ with installed copies or manage versions through skills-upgrade.
