export type PageThemeId = "tactical" | "biohazard" | "requiem" | "brightfalls";

export type PageTheme = {
  id: PageThemeId;
  label: string;
  source: string;
  note: string;
  accent: string;
};

export const PAGE_THEMES: Record<PageThemeId, PageTheme> = {
  tactical: {
    id: "tactical",
    label: "Nightops",
    source: "Modern Warfare",
    note: "Gunmetal, signal green, HUD restraint.",
    accent: "#10b981",
  },
  biohazard: {
    id: "biohazard",
    label: "Biohazard",
    source: "Resident Evil",
    note: "Black, blood red, inventory-grid tension.",
    accent: "#e11d48",
  },
  requiem: {
    id: "requiem",
    label: "Requiem",
    source: "Resident Evil Requiem",
    note: "Cold fog, steel, a single crimson signal.",
    accent: "#a8c4d4",
  },
  brightfalls: {
    id: "brightfalls",
    label: "Bright Falls",
    source: "Alan Wake",
    note: "Dusk amber, pine, manuscript serif.",
    accent: "#e0a558",
  },
};

export const DEFAULT_PAGE_THEME: PageThemeId = "tactical";

const ROUTE_THEMES: { prefix: string; theme: PageThemeId }[] = [
  { prefix: "/projects", theme: "biohazard" },
  { prefix: "/tracker", theme: "biohazard" },
  { prefix: "/contacts", theme: "biohazard" },
  { prefix: "/media", theme: "biohazard" },
  { prefix: "/arsenal", theme: "biohazard" },

  { prefix: "/journey", theme: "requiem" },
  { prefix: "/cv", theme: "requiem" },
  { prefix: "/approvals", theme: "requiem" },
  { prefix: "/guardrails", theme: "requiem" },
  { prefix: "/accounts", theme: "requiem" },
  { prefix: "/integrations", theme: "requiem" },
  { prefix: "/career", theme: "requiem" },
  { prefix: "/cms", theme: "requiem" },

  { prefix: "/about", theme: "brightfalls" },
  { prefix: "/research", theme: "brightfalls" },
  { prefix: "/library", theme: "brightfalls" },
  { prefix: "/voice", theme: "brightfalls" },
  { prefix: "/studio", theme: "brightfalls" },
  { prefix: "/templates", theme: "brightfalls" },
  { prefix: "/style", theme: "brightfalls" },
  { prefix: "/brain", theme: "brightfalls" },
  { prefix: "/learning", theme: "brightfalls" },

  { prefix: "/assistant", theme: "tactical" },
  { prefix: "/agent", theme: "tactical" },
  { prefix: "/dashboard", theme: "tactical" },
  { prefix: "/planner", theme: "tactical" },
  { prefix: "/messages", theme: "tactical" },
  { prefix: "/automations", theme: "tactical" },
  { prefix: "/contact", theme: "tactical" },
  { prefix: "/login", theme: "tactical" },
  { prefix: "/", theme: "tactical" },
];

const SORTED_ROUTES = [...ROUTE_THEMES].sort((a, b) => b.prefix.length - a.prefix.length);

export function themeForPath(pathname: string): PageThemeId {
  const path = pathname || "/";
  const match = SORTED_ROUTES.find(
    ({ prefix }) => path === prefix || path.startsWith(`${prefix}/`)
  );
  return match?.theme ?? DEFAULT_PAGE_THEME;
}

export function isPageTheme(value: string | null): value is PageThemeId {
  return !!value && Object.prototype.hasOwnProperty.call(PAGE_THEMES, value);
}
