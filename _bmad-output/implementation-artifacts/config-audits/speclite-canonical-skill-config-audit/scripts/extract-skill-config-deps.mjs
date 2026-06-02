#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  collectSkillDirs,
  collectSkillTextFiles,
  countOccurrences,
  extractConfigRefsFromFile,
  toPosix,
  uniqueByValue,
} from "./config-extract-lib.mjs";

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const auditDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(auditDir, "../../../..");
const resultsDir = path.join(auditDir, "results");

fs.mkdirSync(resultsDir, { recursive: true });

const skills = collectSkillDirs(repoRoot).map((skill) => {
  const files = collectSkillTextFiles(skill.dir);
  const perFile = [];
  const allConfigFiles = [];
  const allConfigItems = [];

  for (const filePath of files) {
    const relativePath = toPosix(path.relative(repoRoot, filePath));
    const extracted = extractConfigRefsFromFile({ filePath, relativePath, rootDir: repoRoot });
    if (!extracted) {
      continue;
    }
    perFile.push(extracted);
    allConfigFiles.push(...extracted.configFiles);
    allConfigItems.push(...extracted.configItems);
  }

  return {
    name: skill.name,
    scope: skill.scope,
    dir: skill.relativeDir,
    scannedFileCount: perFile.length,
    configFileRefs: uniqueByValue(allConfigFiles),
    configItemRefs: uniqueByValue(allConfigItems),
    files: perFile,
  };
});

const flatConfigFiles = [];
const flatConfigItems = [];
for (const skill of skills) {
  for (const ref of skill.configFileRefs) {
    flatConfigFiles.push({ skill: skill.name, scope: skill.scope, skillDir: skill.dir, ...ref });
  }
  for (const ref of skill.configItemRefs) {
    flatConfigItems.push({ skill: skill.name, scope: skill.scope, skillDir: skill.dir, ...ref });
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  repoRoot,
  skillRoots: [
    "assets/source/speclite/core-skills",
    "assets/source/speclite/sdlc-skills",
  ],
  skillCount: skills.length,
  scannedFileCount: skills.reduce((sum, skill) => sum + skill.scannedFileCount, 0),
  skillWithConfigFileRefsCount: skills.filter((skill) => skill.configFileRefs.length > 0).length,
  skillWithConfigItemRefsCount: skills.filter((skill) => skill.configItemRefs.length > 0).length,
  configFileRefCount: flatConfigFiles.length,
  configFileOccurrenceCount: countOccurrences(flatConfigFiles),
  configItemRefCount: flatConfigItems.length,
  configItemOccurrenceCount: countOccurrences(flatConfigItems),
  skills,
  flatConfigFiles,
  flatConfigItems,
};

fs.writeFileSync(
  path.join(resultsDir, "skill-config-deps.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);

function listValues(refs, limit = 20) {
  if (refs.length === 0) {
    return "无";
  }
  const values = refs.map((ref) => `\`${ref.value}\``);
  if (values.length <= limit) {
    return values.join(", ");
  }
  return `${values.slice(0, limit).join(", ")}，另有 ${values.length - limit} 项`;
}

const lines = [];
lines.push("# Skill Config Dependencies（Skill 配置依赖提取）");
lines.push("");
lines.push(`- 生成时间：${output.generatedAt}`);
lines.push(`- Skill 数量：${output.skillCount}`);
lines.push(`- 扫描文本文件数量：${output.scannedFileCount}`);
lines.push(`- 含配置文件引用的 Skill：${output.skillWithConfigFileRefsCount}`);
lines.push(`- 含配置项引用的 Skill：${output.skillWithConfigItemRefsCount}`);
lines.push(`- 配置文件引用去重数：${output.configFileRefCount}`);
lines.push(`- 配置文件引用出现次数：${output.configFileOccurrenceCount}`);
lines.push(`- 配置项引用去重数：${output.configItemRefCount}`);
lines.push(`- 配置项引用出现次数：${output.configItemOccurrenceCount}`);
lines.push("");
lines.push("## Per Skill Summary（逐 Skill 汇总）");
lines.push("");
lines.push("| Skill | Scope | Files | Config Files | Config Items |");
lines.push("| --- | --- | ---: | ---: | ---: |");
for (const skill of skills) {
  lines.push(
    `| \`${skill.name}\` | \`${skill.scope}\` | ${skill.scannedFileCount} | ${skill.configFileRefs.length} | ${skill.configItemRefs.length} |`,
  );
}
lines.push("");
lines.push("## Per Skill Details（逐 Skill 明细）");
for (const skill of skills) {
  lines.push("");
  lines.push(`### ${skill.name}`);
  lines.push("");
  lines.push(`- Scope：\`${skill.scope}\``);
  lines.push(`- Skill Dir：\`${skill.dir}\``);
  lines.push(`- Scanned Files：${skill.scannedFileCount}`);
  lines.push(`- Config Files：${listValues(skill.configFileRefs)}`);
  lines.push(`- Config Items：${listValues(skill.configItemRefs, 30)}`);
}
lines.push("");
lines.push("## Evidence（证据）");
lines.push("");
lines.push("完整来源文件、行号和上下文见 `skill-config-deps.json`。");

fs.writeFileSync(path.join(resultsDir, "skill-config-deps.md"), `${lines.join("\n")}\n`);

console.log(
  JSON.stringify(
    {
      skillCount: output.skillCount,
      scannedFileCount: output.scannedFileCount,
      configFileRefCount: output.configFileRefCount,
      configItemRefCount: output.configItemRefCount,
      json: toPosix(path.relative(repoRoot, path.join(resultsDir, "skill-config-deps.json"))),
      markdown: toPosix(path.relative(repoRoot, path.join(resultsDir, "skill-config-deps.md"))),
    },
    null,
    2,
  ),
);

