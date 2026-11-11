// Validation for Android UI sequences. The model can propose steps, but only a
// bounded, typed sequence reaches the approval payload.

export type UiAction = "tap" | "type" | "scroll" | "back" | "wait";

export type UiStep = {
  action: UiAction;
  text?: string;
  direction?: "up" | "down";
  ms?: number;
};

const KNOWN_APPS: Record<string, string> = {
  whatsapp: "com.whatsapp",
  instagram: "com.instagram.android",
  telegram: "org.telegram.messenger",
  youtube: "com.google.android.youtube",
  chrome: "com.android.chrome",
  gmail: "com.google.android.gm",
  maps: "com.google.android.apps.maps",
  "google maps": "com.google.android.apps.maps",
  settings: "com.android.settings",
  phone: "com.android.dialer",
  dialer: "com.android.dialer",
  messages: "com.google.android.apps.messaging",
  spotify: "com.spotify.music",
  linkedin: "com.linkedin.android",
  twitter: "com.twitter.android",
  x: "com.twitter.android",
  facebook: "com.facebook.katana",
  camera: "com.android.camera2",
  photos: "com.google.android.apps.photos",
};

export function normalizeApp(value: unknown): { packageName: string; label: string; error?: string } {
  const text = String(value || "").trim();
  if (!text) return { packageName: "", label: "", error: "An app is required." };

  const alias = KNOWN_APPS[text.toLowerCase()];
  if (alias) return { packageName: alias, label: text };

  if (/^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/.test(text)) {
    return { packageName: text, label: text };
  }

  return {
    packageName: "",
    label: text,
    error: `Unknown app "${text}". Use a package name like com.whatsapp, or one of: ${Object.keys(KNOWN_APPS).slice(0, 10).join(", ")}.`,
  };
}

export function normalizeUiSteps(raw: unknown): { steps: UiStep[]; error?: string } {
  let source: unknown = raw;
  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      return { steps: [], error: "Steps must be a JSON array." };
    }
  }
  if (!Array.isArray(source)) return { steps: [], error: "Steps must be an array." };
  if (!source.length) return { steps: [], error: "At least one step is required." };
  if (source.length > 20) return { steps: [], error: "At most 20 steps are allowed." };

  const steps: UiStep[] = [];
  for (let index = 0; index < source.length; index++) {
    const entry = source[index];
    if (!entry || typeof entry !== "object") {
      return { steps: [], error: `Step ${index + 1} must be an object.` };
    }
    const item = entry as Record<string, unknown>;
    const action = String(item.action || "").toLowerCase().trim() as UiAction;

    if (action === "tap" || action === "type") {
      const text = String(item.text || "").trim();
      if (!text) return { steps: [], error: `Step ${index + 1} (${action}) needs text.` };
      if (text.length > 500) return { steps: [], error: `Step ${index + 1} text is too long.` };
      steps.push({ action, text });
      continue;
    }
    if (action === "scroll") {
      const direction = String(item.direction || "down").toLowerCase() === "up" ? "up" : "down";
      steps.push({ action, direction });
      continue;
    }
    if (action === "back") {
      steps.push({ action });
      continue;
    }
    if (action === "wait") {
      const ms = Math.min(Math.max(Number(item.ms) || 700, 100), 5000);
      steps.push({ action, ms });
      continue;
    }
    return { steps: [], error: `Step ${index + 1} has unsupported action "${action}".` };
  }

  return { steps };
}

export function describeUiSteps(steps: UiStep[]): string {
  return steps
    .map((step, index) => {
      if (step.action === "tap") return `${index + 1}. tap "${step.text}"`;
      if (step.action === "type") return `${index + 1}. type "${step.text}"`;
      if (step.action === "scroll") return `${index + 1}. scroll ${step.direction || "down"}`;
      if (step.action === "wait") return `${index + 1}. wait ${step.ms || 700}ms`;
      return `${index + 1}. back`;
    })
    .join("\n");
}
