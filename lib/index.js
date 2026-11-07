import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Long-form novel writing skills for DeepSeek Harness.
 *
 * Every Markdown file under `assets/` is one skill: YAML frontmatter carries
 * `name`, `description` and optional `whenToUse`, the body is the skill text.
 * Discovery happens on each catalog lookup, so adding or editing a skill file
 * needs no reinstall or restart.
 */

const ASSETS_DIR = fileURLToPath(new URL("../assets/", import.meta.url));
const PROVIDER_NAME = "novel-writing";
const SKILL_RANK = 600;
const RESOURCE_BASE = { kind: "directory", path: ASSETS_DIR };

function unquote(value) {
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
}

function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (match === null) return { data: {}, body: text };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    if (key === "") continue;
    data[key] = unquote(line.slice(colon + 1));
  }
  return { data, body: text.slice(match[0].length) };
}

async function discover() {
  let files;
  try {
    files = await readdir(ASSETS_DIR);
  } catch {
    return [];
  }
  const skills = [];
  for (const file of files.sort()) {
    if (!file.toLowerCase().endsWith(".md")) continue;
    let text;
    try {
      text = await readFile(join(ASSETS_DIR, file), "utf8");
    } catch {
      continue;
    }
    const { data, body } = parseFrontmatter(text);
    if (typeof data.name !== "string" || data.name === "") continue;
    if (typeof data.description !== "string" || data.description === "") continue;
    skills.push({
      file,
      name: data.name,
      description: data.description,
      whenToUse: typeof data.whenToUse === "string" && data.whenToUse !== "" ? data.whenToUse : undefined,
      content: body.trimStart(),
    });
  }
  return skills;
}

const provider = {
  name: PROVIDER_NAME,
  async list() {
    const skills = await discover();
    return skills.map((skill) => ({
      name: skill.name,
      description: skill.description,
      ...(skill.whenToUse === undefined ? {} : { whenToUse: skill.whenToUse }),
      invocation: { modelInvocable: true, userInvocable: true },
      provider: PROVIDER_NAME,
      source: "bundled",
      resourceBase: RESOURCE_BASE,
      rank: SKILL_RANK,
      locator: { file: skill.file },
    }));
  },
  async get(candidate) {
    const skills = await discover();
    const skill = skills.find(
      (entry) =>
        entry.name === candidate.name ||
        (candidate.locator !== undefined && entry.file === candidate.locator.file),
    );
    if (skill === undefined) return undefined;
    return {
      name: skill.name,
      description: skill.description,
      ...(skill.whenToUse === undefined ? {} : { whenToUse: skill.whenToUse }),
      invocation: { modelInvocable: true, userInvocable: true },
      provider: PROVIDER_NAME,
      source: "bundled",
      resourceBase: RESOURCE_BASE,
      content: skill.content,
    };
  },
};

/** Cordis plugin name. */
export const name = "novel-writing";

/** Service required by the provider. */
export const inject = ["skills"];

/** Register the long-form novel writing skill provider on `ctx.skills`. */
export function apply(ctx) {
  ctx.skills.registerProvider(() => provider);
}
