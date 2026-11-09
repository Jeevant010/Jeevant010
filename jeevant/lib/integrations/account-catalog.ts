export type AccountField = {
  key: string;
  label: string;
  secret?: boolean;
  required?: boolean;
  placeholder?: string;
};

export type AccountChannel = {
  id: string;
  label: string;
  mode: "direct" | "webhook" | "share" | "manual";
  testable: boolean;
  note: string;
  config: AccountField[];
  secrets: AccountField[];
};

export const ACCOUNT_CHANNELS: AccountChannel[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    mode: "direct",
    testable: true,
    note: "Meta Cloud API. A test number is free; production needs a Meta business app.",
    config: [
      { key: "phoneNumberId", label: "Phone number ID", required: true },
      { key: "fromNumber", label: "Display number" },
    ],
    secrets: [{ key: "token", label: "Cloud API token", secret: true, required: true }],
  },
  {
    id: "sms",
    label: "SMS",
    mode: "direct",
    testable: true,
    note: "Twilio is paid. Without credentials the app copies the message instead.",
    config: [{ key: "fromNumber", label: "From number", required: true }],
    secrets: [
      { key: "accountSid", label: "Account SID", secret: true, required: true },
      { key: "authToken", label: "Auth token", secret: true, required: true },
    ],
  },
  {
    id: "call",
    label: "Calls",
    mode: "direct",
    testable: true,
    note: "Twilio voice. Without credentials the app returns a tel: link.",
    config: [{ key: "fromNumber", label: "From number", required: true }],
    secrets: [
      { key: "accountSid", label: "Account SID", secret: true, required: true },
      { key: "authToken", label: "Auth token", secret: true, required: true },
    ],
  },
  {
    id: "telegram",
    label: "Telegram",
    mode: "direct",
    testable: true,
    note: "Free Bot API. Create a bot with @BotFather, then paste the token.",
    config: [{ key: "chatId", label: "Chat ID", required: true }],
    secrets: [{ key: "botToken", label: "Bot token", secret: true, required: true }],
  },
  {
    id: "email",
    label: "Email",
    mode: "direct",
    testable: true,
    note: "Gmail drafts use a Google refresh token. Account values override the env.",
    config: [{ key: "sender", label: "Sender address" }],
    secrets: [
      { key: "clientId", label: "OAuth client ID", secret: true },
      { key: "clientSecret", label: "OAuth client secret", secret: true },
      { key: "refreshToken", label: "Refresh token", secret: true },
    ],
  },
  {
    id: "discord",
    label: "Discord",
    mode: "webhook",
    testable: true,
    note: "Free webhook. Server settings → Integrations → Webhooks.",
    config: [],
    secrets: [{ key: "webhookUrl", label: "Webhook URL", secret: true, required: true }],
  },
  {
    id: "slack",
    label: "Slack",
    mode: "webhook",
    testable: true,
    note: "Free incoming webhook. Slack only fully confirms on a real POST.",
    config: [],
    secrets: [{ key: "webhookUrl", label: "Webhook URL", secret: true, required: true }],
  },
  {
    id: "mastodon",
    label: "Mastodon",
    mode: "direct",
    testable: true,
    note: "Free API. Create an access token with write:statuses.",
    config: [{ key: "instance", label: "Instance URL", required: true, placeholder: "https://mastodon.social" }],
    secrets: [{ key: "token", label: "Access token", secret: true, required: true }],
  },
  {
    id: "twitter",
    label: "X / Twitter",
    mode: "share",
    testable: true,
    note: "The free API tier is limited and needs developer access. Share intent always works.",
    config: [],
    secrets: [{ key: "bearerToken", label: "Bearer token", secret: true }],
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    mode: "share",
    testable: false,
    note: "Posting needs an approved LinkedIn app. Share intent works without one.",
    config: [{ key: "authorUrn", label: "Author URN", placeholder: "urn:li:person:…" }],
    secrets: [{ key: "accessToken", label: "Access token", secret: true }],
  },
  {
    id: "reddit",
    label: "Reddit",
    mode: "share",
    testable: false,
    note: "Posting needs a registered OAuth app. Submit intent works without one.",
    config: [{ key: "username", label: "Username" }],
    secrets: [
      { key: "clientId", label: "Client ID", secret: true },
      { key: "clientSecret", label: "Client secret", secret: true },
      { key: "password", label: "Password", secret: true },
    ],
  },
];

export function getAccountChannel(id: string): AccountChannel | undefined {
  return ACCOUNT_CHANNELS.find((channel) => channel.id === id);
}

export const ACCOUNT_CHANNEL_IDS = ACCOUNT_CHANNELS.map((channel) => channel.id);
