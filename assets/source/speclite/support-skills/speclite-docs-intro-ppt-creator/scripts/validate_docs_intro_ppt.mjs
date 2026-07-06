#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function usage() {
  console.error("Usage: node validate_docs_intro_ppt.mjs --project-root <dir> --html <docs/path/index.html>");
}

function parseArgs(argv) {
  const args = { projectRoot: ".", html: "" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--project-root") {
      args.projectRoot = argv[index + 1] || "";
      index += 1;
    } else if (arg === "--html") {
      args.html = argv[index + 1] || "";
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${arg}`);
      usage();
      process.exit(2);
    }
  }
  return args;
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
if (!args.projectRoot || !args.html) {
  usage();
  process.exit(2);
}

const projectRoot = path.resolve(args.projectRoot);
const docsRoot = path.join(projectRoot, "docs");
const htmlPath = path.resolve(projectRoot, args.html);

if (!htmlPath.startsWith(docsRoot + path.sep)) {
  fail(`HTML output must be under docs/: ${htmlPath}`);
}

if (path.basename(htmlPath) !== "index.html") {
  fail("HTML output file must be named index.html");
}

if (!fs.existsSync(htmlPath)) {
  fail(`HTML file does not exist: ${htmlPath}`);
}

const html = fs.readFileSync(htmlPath, "utf8");
const findings = [];

const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
const title = titleMatch ? titleMatch[1].trim() : "";
if (!title || title.includes("[必填]") || title.includes("替换为 PPT 标题")) {
  findings.push("missing or placeholder-like <title>");
}

if (!html.includes('<div id="deck"')) {
  findings.push('missing <div id="deck">');
}

const slideCount = (html.match(/<section\b[^>]*class="[^"]*\bslide\b[^"]*"/g) || []).length;
if (slideCount < 5) {
  findings.push(`too few slides: ${slideCount}`);
}

const forbiddenPatterns = [
  /\[必填\]/,
  /SLIDES_HERE/,
];

for (const pattern of forbiddenPatterns) {
  if (pattern.test(html)) {
    findings.push(`forbidden placeholder or template marker matched: ${pattern}`);
  }
}

if (findings.length > 0) {
  console.error(JSON.stringify({ status: "fail", html: htmlPath, slideCount, findings }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ status: "ok", html: htmlPath, slideCount }, null, 2));
