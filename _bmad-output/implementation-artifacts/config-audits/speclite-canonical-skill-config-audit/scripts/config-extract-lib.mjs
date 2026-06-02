import fs from "node:fs";
import path from "node:path";

export const TEXT_EXTENSIONS = new Set([
  ".md",
  ".markdown",
  ".toml",
  ".yaml",
  ".yml",
  ".json",
  ".csv",
  ".txt",
  ".example",
]);

const CONFIG_FILE_RE =
  /(?:^|[\s("'`<])((?:(?:\{[A-Za-z0-9_.-]+\}|[A-Za-z0-9_.-]+|\.\.?)[/\\])*[A-Za-z0-9_{}.-]*(?:config|customize|settings|module|manifest|index|status|context|coverage|workflow|registry|schema|methods|help|files|phase)[A-Za-z0-9_{}.-]*\.(?:toml|ya?ml|json|csv|env)(?:\.example)?)/gi;

const ANY_CONFIG_EXT_RE =
  /(?:^|[\s("'`<])((?:(?:\{[A-Za-z0-9_.-]+\}|[A-Za-z0-9_.-]+|\.\.?)[/\\])*[A-Za-z0-9_{}.-]+\.(?:toml|ya?ml|json|csv|env)(?:\.example)?)/gi;

const PLACEHOLDER_RE = /\{([A-Za-z][A-Za-z0-9_.-]*)\}/g;
const INLINE_CODE_RE = /`([^`\n]+)`/g;
const ASSIGNMENT_RE = /^\s{0,8}["']?([A-Za-z][A-Za-z0-9_.-]*)["']?\s*[:=]\s*.+$/;
const TOML_SECTION_RE = /^\s*\[([A-Za-z0-9_.-]+)]\s*$/;
const TOML_ARRAY_SECTION_RE = /^\s*\[\[([A-Za-z0-9_.-]+)]]\s*$/;
const JSON_KEY_RE = /"([A-Za-z][A-Za-z0-9_.-]*)"\s*:/g;

export function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

export function walkFiles(rootDir) {
  const output = [];
  if (!fs.existsSync(rootDir)) {
    return output;
  }
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") {
        continue;
      }
      output.push(...walkFiles(fullPath));
      continue;
    }
    if (entry.isFile()) {
      output.push(fullPath);
    }
  }
  return output;
}

export function isTextLikeFile(filePath) {
  if (path.basename(filePath) === "CHANGELOG.md") {
    return false;
  }
  const ext = path.extname(filePath);
  if (TEXT_EXTENSIONS.has(ext)) {
    return true;
  }
  const base = path.basename(filePath);
  return base === "config.toml.example" || base === "sprint-status-template.yaml";
}

export function readTextFile(filePath) {
  const stat = fs.statSync(filePath);
  if (stat.size > 2_000_000) {
    return null;
  }
  const text = fs.readFileSync(filePath, "utf8");
  if (text.includes("\u0000")) {
    return null;
  }
  return text;
}

export function normalizeToken(raw) {
  return raw
    .trim()
    .replace(/^[`"'(<\[]+/, "")
    .replace(/[`"',;)>\]]+$/, "")
    .replace(/\[/g, "")
    .replace(/\]/g, "")
    .replace(/\\/g, "/");
}

export function isLikelyConfigFile(value) {
  const clean = normalizeToken(value);
  if (!clean || clean.length > 180 || clean.includes("://")) {
    return false;
  }
  if (/[A-Z]{3,}$/.test(path.extname(clean))) {
    return false;
  }
  if (clean.endsWith(".toml.example")) {
    return true;
  }
  const ext = path.extname(clean).toLowerCase();
  const base = path.basename(clean).toLowerCase();
  if ([".toml", ".yaml", ".yml", ".env"].includes(ext)) {
    return true;
  }
  if (ext === ".csv") {
    return /(config|customize|settings|module|manifest|index|status|coverage|registry|schema|methods|help|files|phase)/.test(
      base,
    );
  }
  if (ext === ".json") {
    return /(config|customize|settings|module|manifest|index|status|coverage|registry|schema|metadata|fixture|contract|package)/.test(
      base,
    );
  }
  return false;
}

export function isLikelyConfigItem(token) {
  if (!token || token.length < 2 || token.length > 100) {
    return false;
  }
  if (token.includes("/") || token.includes("\\") || token.includes(" ")) {
    return false;
  }
  if (/^https?:/.test(token)) {
    return false;
  }
  if (/\.(md|toml|ya?ml|json|csv|txt|ts|js|mjs|sh|py)$/i.test(token)) {
    return false;
  }
  if (/^[0-9.-]+$/.test(token)) {
    return false;
  }
  if (/^[A-Z][A-Z0-9_]+$/.test(token)) {
    return /(SPECLITE|BMAD|CLAUDE|OPENAI|NODE|PYTHON|_PATH|_ROOT|_DIR|_FILE|_CONFIG|_OUTPUT|_ARTIFACT|_STATUS|_KEY|_TOKEN)/.test(
      token,
    );
  }
  return (
    token.includes("_") ||
    token.includes(".") ||
    /^(project|artifact|artifacts|implementation|planning|skill|story|sprint|workflow|custom|config|metadata|runtime|output|path|root|location|phase|files|help|manifest|status|review|evidence|gate)/.test(
      token,
    )
  );
}

function addOccurrence(map, keyParts, occurrence) {
  const key = keyParts.join("\u0000");
  if (!map.has(key)) {
    map.set(key, {
      ...Object.fromEntries(keyParts.map((part, index) => [`key${index}`, part])),
      occurrences: [],
    });
  }
  map.get(key).occurrences.push(occurrence);
}

export function extractConfigRefsFromFile({ filePath, relativePath, rootDir }) {
  const text = readTextFile(filePath);
  if (text === null) {
    return null;
  }

  const configFileMap = new Map();
  const configItemMap = new Map();
  const lines = text.split(/\r?\n/);
  const ext = path.extname(filePath).toLowerCase();
  let tomlSection = "";
  const yamlStack = [];

  function occurrence(lineNumber, lineText, source) {
    return {
      file: toPosix(path.relative(rootDir, filePath)),
      absoluteFile: filePath,
      line: lineNumber,
      source,
      context: lineText.trim().slice(0, 260),
    };
  }

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];

    for (const regex of [CONFIG_FILE_RE, ANY_CONFIG_EXT_RE]) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(line)) !== null) {
        const value = normalizeToken(match[1]);
        if (!isLikelyConfigFile(value)) {
          continue;
        }
        addOccurrence(configFileMap, [value], occurrence(lineNumber, line, "config-file-reference"));
      }
    }

    PLACEHOLDER_RE.lastIndex = 0;
    let placeholderMatch;
    while ((placeholderMatch = PLACEHOLDER_RE.exec(line)) !== null) {
      const value = normalizeToken(placeholderMatch[1]);
      if (isLikelyConfigItem(value)) {
        addOccurrence(configItemMap, [value, "placeholder"], occurrence(lineNumber, line, "placeholder"));
      }
    }

    INLINE_CODE_RE.lastIndex = 0;
    let inlineMatch;
    while ((inlineMatch = INLINE_CODE_RE.exec(line)) !== null) {
      const value = normalizeToken(inlineMatch[1]);
      if (isLikelyConfigItem(value)) {
        addOccurrence(configItemMap, [value, "inline-code"], occurrence(lineNumber, line, "inline-code"));
      }
    }

    const assignmentMatch = ext === ".md" || ext === ".markdown" ? null : line.match(ASSIGNMENT_RE);
    if (assignmentMatch) {
      const key = normalizeToken(assignmentMatch[1]);
      if (isLikelyConfigItem(key)) {
        addOccurrence(configItemMap, [key, "assignment"], occurrence(lineNumber, line, "assignment"));
      }
    }

    if (ext === ".toml" || filePath.endsWith(".toml.example")) {
      const arraySectionMatch = line.match(TOML_ARRAY_SECTION_RE);
      if (arraySectionMatch) {
        tomlSection = arraySectionMatch[1];
        addOccurrence(configItemMap, [tomlSection, "toml-array-section"], occurrence(lineNumber, line, "toml-array-section"));
        continue;
      }
      const sectionMatch = line.match(TOML_SECTION_RE);
      if (sectionMatch) {
        tomlSection = sectionMatch[1];
        addOccurrence(configItemMap, [tomlSection, "toml-section"], occurrence(lineNumber, line, "toml-section"));
        continue;
      }
      const tomlKeyMatch = line.match(/^\s*([A-Za-z][A-Za-z0-9_.-]*)\s*=/);
      if (tomlKeyMatch) {
        const key = tomlSection ? `${tomlSection}.${tomlKeyMatch[1]}` : tomlKeyMatch[1];
        addOccurrence(configItemMap, [key, "toml-key"], occurrence(lineNumber, line, "toml-key"));
      }
    }

    if (ext === ".yaml" || ext === ".yml") {
      const yamlMatch = line.match(/^(\s*)([A-Za-z][A-Za-z0-9_.-]*)\s*:/);
      if (yamlMatch) {
        const indent = yamlMatch[1].length;
        const key = yamlMatch[2];
        while (yamlStack.length && yamlStack[yamlStack.length - 1].indent >= indent) {
          yamlStack.pop();
        }
        yamlStack.push({ indent, key });
        const pathKey = yamlStack.map((entry) => entry.key).join(".");
        addOccurrence(configItemMap, [pathKey, "yaml-key"], occurrence(lineNumber, line, "yaml-key"));
      }
    }

    if (ext === ".json") {
      JSON_KEY_RE.lastIndex = 0;
      let jsonMatch;
      while ((jsonMatch = JSON_KEY_RE.exec(line)) !== null) {
        const key = jsonMatch[1];
        if (isLikelyConfigItem(key)) {
          addOccurrence(configItemMap, [key, "json-key"], occurrence(lineNumber, line, "json-key"));
        }
      }
    }
  }

  if (ext === ".csv") {
    const firstLine = lines.find((line) => line.trim() && !line.trim().startsWith("#"));
    if (firstLine) {
      for (const header of firstLine.split(",")) {
        const key = normalizeToken(header);
        if (isLikelyConfigItem(key)) {
          addOccurrence(configItemMap, [key, "csv-header"], occurrence(1, firstLine, "csv-header"));
        }
      }
    }
  }

  return {
    file: relativePath,
    configFiles: [...configFileMap.values()].map((entry) => ({
      value: entry.key0,
      occurrences: entry.occurrences,
    })),
    configItems: [...configItemMap.values()].map((entry) => ({
      value: entry.key0,
      kind: entry.key1,
      occurrences: entry.occurrences,
    })),
  };
}

export function collectSkillDirs(repoRoot) {
  const roots = [
    path.join(repoRoot, "assets/source/speclite/core-skills"),
    path.join(repoRoot, "assets/source/speclite/sdlc-skills"),
  ];
  return roots
    .flatMap((root) => walkFiles(root).filter((file) => path.basename(file) === "SKILL.md"))
    .map((skillEntry) => {
      const skillDir = path.dirname(skillEntry);
      const rel = toPosix(path.relative(repoRoot, skillDir));
      const parts = rel.split("/");
      const scope = parts.includes("core-skills") ? "core-skills" : "sdlc-skills";
      return {
        name: path.basename(skillDir),
        scope,
        dir: skillDir,
        relativeDir: rel,
      };
    })
    .sort((a, b) => a.relativeDir.localeCompare(b.relativeDir));
}

export function collectSkillTextFiles(skillDir) {
  return walkFiles(skillDir)
    .filter(isTextLikeFile)
    .filter((file) => !file.includes(`${path.sep}node_modules${path.sep}`))
    .sort();
}

export function countOccurrences(refs) {
  return refs.reduce((sum, ref) => sum + ref.occurrences.length, 0);
}

export function uniqueByValue(refs) {
  return [...new Map(refs.map((ref) => [ref.value, ref])).values()].sort((a, b) =>
    a.value.localeCompare(b.value),
  );
}
