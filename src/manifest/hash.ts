import { createHash, randomBytes } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

export type FileHash = `sha256:${string}`;

export async function hashFile(filePath: string): Promise<FileHash> {
  return hashBytes(await readFile(filePath));
}

export function hashBytes(value: Buffer | string): FileHash {
  const hash = createHash("sha256");
  hash.update(value);
  return `sha256:${hash.digest("hex")}`;
}

export async function hashPackageDirectory(
  packageRoot: string,
  options: { include?: (relativeFile: string) => boolean } = {},
): Promise<FileHash> {
  const hash = createHash("sha256");
  const files = (await listFiles(packageRoot)).filter((file) => options.include?.(file) ?? true);

  for (const file of files) {
    const absolutePath = path.join(packageRoot, file);
    const fileStat = await stat(absolutePath);
    hash.update(file);
    hash.update("\0");
    hash.update(isExecutableMode(fileStat.mode) ? "executable" : "regular");
    hash.update("\0");
    hash.update(await readFile(absolutePath));
    hash.update("\0");
  }

  return `sha256:${hash.digest("hex")}`;
}

export async function listFiles(root: string): Promise<string[]> {
  const files: string[] = [];

  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const absolutePath = path.join(directory, entry.name);
      const relativePath = path.relative(root, absolutePath).split(path.sep).join("/");

      if (entry.isDirectory()) {
        await visit(absolutePath);
        continue;
      }

      if (entry.isFile()) {
        files.push(relativePath);
      }
    }
  }

  await visit(root);
  return files.sort();
}

export function createPrivateOperationId(): string {
  return randomBytes(8).toString("hex");
}

export function isExecutableMode(mode: number): boolean {
  return (mode & 0o111) !== 0;
}
