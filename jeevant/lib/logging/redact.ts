const RULES: { pattern: RegExp; replace: string }[] = [
  { pattern: /\bjv_[A-Za-z0-9_-]{12,}\b/g, replace: "jv_[redacted]" },
  { pattern: /\bbot\d+:[A-Za-z0-9_-]{10,}\b/g, replace: "bot[redacted]" },
  { pattern: /(Bearer\s+)[A-Za-z0-9._~+/-]+=*/gi, replace: "$1[redacted]" },
  { pattern: /((?:access_token|refresh_token|token|key|secret|password|auth)=)[^&\s"']+/gi, replace: "$1[redacted]" },
  { pattern: /(Authorization:\s*)(?!Bearer)[^\s,;]+/gi, replace: "$1[redacted]" },
  { pattern: /\b\+?\d{12,15}\b/g, replace: "[redacted-number]" },
];

export function redact(value: unknown): string {
  let text = typeof value === "string" ? value : String(value ?? "");

  for (const rule of RULES) {
    text = text.replace(rule.pattern, rule.replace);
  }

  return text;
}
