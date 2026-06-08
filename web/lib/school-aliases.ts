type AliasRule = {
  slug: string;
  aliases: string[];
};

const SCHOOL_ALIAS_RULES: AliasRule[] = [
  {
    slug: "university-arts-london",
    aliases: ["ual", "伦艺", "伦敦艺术大学", "university of the arts london"],
  },
  {
    slug: "school-visual-arts",
    aliases: ["sva", "纽约视觉艺术学院", "school of visual arts"],
  },
  {
    slug: "royal-college-art",
    aliases: ["rca", "皇艺", "皇家艺术学院", "royal college of art"],
  },
  {
    slug: "risd",
    aliases: ["risd", "罗德岛", "罗德岛设计学院", "rhode island school of design"],
  },
  {
    slug: "central-saint-martins",
    aliases: ["csm", "中央圣马丁", "central saint martins"],
  },
  {
    slug: "london-college-fashion",
    aliases: ["lcf", "伦敦时装学院", "london college of fashion"],
  },
  {
    slug: "london-college-communication",
    aliases: ["lcc", "伦敦传媒学院", "london college of communication"],
  },
  {
    slug: "parsons-school-design",
    aliases: ["parsons", "帕森斯", "parsons school of design"],
  },
];

function normalizeQuery(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function hasLatinAlias(query: string, alias: string) {
  return new RegExp(`(^|[^a-z0-9])${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i").test(query);
}

export function resolveSchoolAliasSlugs(rawQuery: string) {
  const query = normalizeQuery(rawQuery);
  if (!query) return [];

  const slugs = new Set<string>();
  for (const rule of SCHOOL_ALIAS_RULES) {
    for (const alias of rule.aliases) {
      const normalizedAlias = normalizeQuery(alias);
      const isLatinAlias = /^[a-z0-9\s]+$/.test(normalizedAlias);
      const matched = isLatinAlias
        ? hasLatinAlias(query, normalizedAlias)
        : query.includes(normalizedAlias);
      if (matched) {
        slugs.add(rule.slug);
        break;
      }
    }
  }
  return [...slugs];
}

