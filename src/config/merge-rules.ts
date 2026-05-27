export type TomlValue =
  | string
  | number
  | boolean
  | Date
  | TomlValue[]
  | { [key: string]: TomlValue };

export type TomlDocument = Record<string, TomlValue>;

const KEYED_MERGE_FIELDS = ["code", "id"] as const;

export function deepMergeTomlDocuments(base: TomlDocument, override: TomlDocument): TomlDocument {
  return deepMergeTomlValue(base, override) as TomlDocument;
}

function deepMergeTomlValue(base: TomlValue, override: TomlValue): TomlValue {
  if (isRecord(base) && isRecord(override)) {
    const result: TomlDocument = { ...base };
    for (const [key, overrideValue] of Object.entries(override)) {
      result[key] = key in result ? deepMergeTomlValue(result[key] as TomlValue, overrideValue) : overrideValue;
    }
    return result;
  }

  if (Array.isArray(base) && Array.isArray(override)) {
    return mergeArrays(base, override);
  }

  return override;
}

function mergeArrays(base: TomlValue[], override: TomlValue[]): TomlValue[] {
  const keyedField = detectKeyedMergeField([...base, ...override]);
  if (keyedField === undefined) {
    return [...base, ...override];
  }

  const result: TomlValue[] = [];
  const indexByKey = new Map<string, number>();

  for (const item of base) {
    if (!isRecord(item)) continue;
    const key = String(item[keyedField]);
    indexByKey.set(key, result.length);
    result.push({ ...item });
  }

  for (const item of override) {
    if (!isRecord(item)) {
      result.push(item);
      continue;
    }

    const key = String(item[keyedField]);
    const existingIndex = indexByKey.get(key);
    if (existingIndex === undefined) {
      indexByKey.set(key, result.length);
      result.push({ ...item });
    } else {
      result[existingIndex] = { ...item };
    }
  }

  return result;
}

function detectKeyedMergeField(items: TomlValue[]): "code" | "id" | undefined {
  if (items.length === 0 || !items.every(isRecord)) {
    return undefined;
  }

  for (const field of KEYED_MERGE_FIELDS) {
    if (items.every((item) => item[field] !== undefined)) {
      return field;
    }
  }

  return undefined;
}

function isRecord(value: TomlValue): value is TomlDocument {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date);
}
