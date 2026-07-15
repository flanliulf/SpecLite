#!/usr/bin/env node

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.cwd());
const docsRoot = path.join(root, "docs");
const entrypoint = path.join(docsRoot, "index.md");
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const draftMarker = "> Status: Draft（草稿）";
const relatedHeading = "## Related Documents（相关文档）";
const errors = [];

const markdownFiles = (await walk(docsRoot)).filter((filePath) => filePath.endsWith(".md")).sort();
const markdownSet = new Set(markdownFiles);
const contentByFile = new Map(
  await Promise.all(markdownFiles.map(async (filePath) => [filePath, await readFile(filePath, "utf8")])),
);
const draftFiles = new Set(
  markdownFiles.filter((filePath) =>
    (contentByFile.get(filePath) ?? "")
      .split("\n")
      .slice(0, 8)
      .some((line) => line.startsWith(draftMarker)),
  ),
);
const linksByFile = new Map();

for (const filePath of markdownFiles) {
  const links = extractMarkdownLinks(contentByFile.get(filePath) ?? "");
  const resolvedLinks = [];

  for (const link of links) {
    const resolved = await validateLink(filePath, link);
    if (resolved !== undefined) {
      resolvedLinks.push(resolved);
    }
  }

  linksByFile.set(filePath, resolvedLinks);
}

validateDraftIndexes();
validateCompatibilityEntries();
validatePackageBoundary();
validateRelatedDocuments();
validateReachability();

if (errors.length > 0) {
  console.error(`docs:check failed with ${errors.length} issue(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `docs:check passed: ${markdownFiles.length} Markdown files, ${draftFiles.size} drafts, links and governance rules valid.`,
  );
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === ".DS_Store") {
      continue;
    }
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function extractMarkdownLinks(markdown) {
  const withoutFences = markdown
    .replace(/^```[\s\S]*?^```\s*$/gm, "")
    .replace(/^~~~[\s\S]*?^~~~\s*$/gm, "")
    .replace(/`[^`\n]*`/g, "");
  const links = [];
  const pattern = /!?\[[^\]]*\]\((<[^>]+>|[^)\s]+)(?:\s+["'][^"']*["'])?\)/g;

  for (const match of withoutFences.matchAll(pattern)) {
    links.push(match[1].replace(/^<|>$/g, ""));
  }

  return links;
}

async function validateLink(sourceFile, rawTarget) {
  if (/^(?:https?:|mailto:|tel:|data:)/i.test(rawTarget)) {
    return undefined;
  }

  const [rawPath, fragment = ""] = rawTarget.split("#", 2);
  let decodedPath;
  let decodedFragment;
  try {
    decodedPath = decodeURIComponent(rawPath);
    decodedFragment = decodeURIComponent(fragment);
  } catch {
    errors.push(`${relative(sourceFile)} contains an invalid encoded link: ${rawTarget}`);
    return undefined;
  }

  const targetPath = decodedPath === "" ? sourceFile : path.resolve(path.dirname(sourceFile), decodedPath);
  if (!targetPath.startsWith(`${root}${path.sep}`) && targetPath !== root) {
    errors.push(`${relative(sourceFile)} links outside the repository: ${rawTarget}`);
    return undefined;
  }

  try {
    const targetStat = await stat(targetPath);
    if (targetStat.isDirectory()) {
      errors.push(`${relative(sourceFile)} links to a directory instead of an explicit entry: ${rawTarget}`);
      return undefined;
    }
  } catch {
    errors.push(`${relative(sourceFile)} has a missing target: ${rawTarget}`);
    return undefined;
  }

  if (decodedFragment !== "" && targetPath.endsWith(".md")) {
    const targetContent = contentByFile.get(targetPath) ?? (await readFile(targetPath, "utf8"));
    const anchors = markdownAnchors(targetContent);
    if (!anchors.has(decodedFragment.toLowerCase())) {
      errors.push(`${relative(sourceFile)} has a missing fragment: ${rawTarget}`);
    }
  }

  return targetPath;
}

function markdownAnchors(markdown) {
  const anchors = new Set();
  const counts = new Map();

  for (const match of markdown.matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    const base = githubSlug(match[1]);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    anchors.add(count === 0 ? base : `${base}-${count}`);
  }

  return anchors;
}

function githubSlug(heading) {
  return heading
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function validateDraftIndexes() {
  const indexFiles = markdownFiles.filter((filePath) => path.basename(filePath) === "index.md");
  for (const indexFile of indexFiles) {
    for (const target of linksByFile.get(indexFile) ?? []) {
      if (draftFiles.has(target)) {
        errors.push(`${relative(indexFile)} publishes draft page ${relative(target)}`);
      }
    }
  }
}

function validateCompatibilityEntries() {
  const compatibilityRoot = path.join(docsRoot, "glossary");
  for (const filePath of markdownFiles.filter((candidate) => candidate.startsWith(`${compatibilityRoot}${path.sep}`))) {
    const content = contentByFile.get(filePath) ?? "";
    if (!content.includes("Status: Frozen Compatibility（冻结兼容）")) {
      errors.push(`${relative(filePath)} is missing the Frozen Compatibility marker`);
    }
    const replacement = (linksByFile.get(filePath) ?? []).find(
      (target) => markdownSet.has(target) && !target.startsWith(`${compatibilityRoot}${path.sep}`) && !draftFiles.has(target),
    );
    if (replacement === undefined) {
      errors.push(`${relative(filePath)} does not link to a primary public replacement`);
    }
  }
}

function validatePackageBoundary() {
  const quickStart = path.join(docsRoot, "quick-start.md");
  const packageFiles = packageJson.files ?? [];

  for (const target of linksByFile.get(quickStart) ?? []) {
    const targetRelative = relative(target);
    if (target === quickStart || packageFiles.some((entry) => packageEntryContains(entry, targetRelative))) {
      continue;
    }
    errors.push(`docs/quick-start.md links to file outside package.json.files: ${targetRelative}`);
  }
}

function packageEntryContains(entry, targetRelative) {
  const normalized = entry.replace(/\\/g, "/");
  return normalized.endsWith("/") ? targetRelative.startsWith(normalized) : targetRelative === normalized;
}

function validateRelatedDocuments() {
  for (const filePath of markdownFiles) {
    const relativePath = relative(filePath);
    const exempt =
      path.basename(filePath) === "index.md" ||
      relativePath === "docs/README.md" ||
      relativePath === "docs/_STYLE_GUIDE.md" ||
      relativePath === "docs/quick-start.md" ||
      relativePath.startsWith("docs/glossary/") ||
      draftFiles.has(filePath);
    if (!exempt && !(contentByFile.get(filePath) ?? "").includes(relatedHeading)) {
      errors.push(`${relativePath} is missing ${relatedHeading}`);
      continue;
    }
    if (!exempt) {
      const content = contentByFile.get(filePath) ?? "";
      const relatedSection = content.slice(content.indexOf(relatedHeading) + relatedHeading.length);
      const relatedLinks = extractMarkdownLinks(relatedSection).filter((target) => !/^(?:https?:|mailto:|tel:|data:)/i.test(target));
      if (relatedLinks.length === 0) {
        errors.push(`${relativePath} has no local relationship link under ${relatedHeading}`);
      }
    }
  }
}

function validateReachability() {
  const visited = new Set();
  const queue = [entrypoint];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined || visited.has(current)) {
      continue;
    }
    visited.add(current);
    for (const target of linksByFile.get(current) ?? []) {
      if (markdownSet.has(target) && !visited.has(target)) {
        queue.push(target);
      }
    }
  }

  for (const filePath of markdownFiles) {
    if (!draftFiles.has(filePath) && !visited.has(filePath)) {
      errors.push(`${relative(filePath)} is not reachable from docs/index.md`);
    }
  }
}

function relative(filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}
