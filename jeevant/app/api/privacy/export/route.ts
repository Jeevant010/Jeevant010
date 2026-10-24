import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import {
  Achievement,
  ActionToken,
  Activity,
  Application,
  Approval,
  AuditLog,
  Certificate,
  ChannelAccount,
  ChatMessage,
  Contact,
  ContentPost,
  Experience,
  FocusSession,
  Job,
  Learning,
  Memory,
  Message,
  Note,
  OutboundMessage,
  Profile,
  Project,
  Resume,
  Schedule,
  Setting,
  Snippet,
  StyleProfile,
  Task,
  Template,
  VoiceCapture,
  Workflow,
  WorkflowRun,
} from "@/lib/database/models";
import { openSecrets, secretsAreEncrypted } from "@/lib/crypto/secrets";
import { rateLimit, rateLimitKey } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(rateLimitKey("privacy-export", request), 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  await connectDB();

  const [
    projects,
    tasks,
    notes,
    learning,
    experience,
    achievements,
    certificates,
    schedules,
    applications,
    messages,
    snippets,
    profile,
    resume,
    voice,
    posts,
    settings,
    memories,
    jobs,
    approvals,
    workflows,
    workflowRuns,
    chat,
    outbound,
    accounts,
    audit,
    contacts,
    style,
    templates,
    activities,
    focus,
    tokens,
  ] = await Promise.all([
    Project.find({}).lean(),
    Task.find({}).lean(),
    Note.find({}).lean(),
    Learning.find({}).lean(),
    Experience.find({}).lean(),
    Achievement.find({}).lean(),
    Certificate.find({}).lean(),
    Schedule.find({}).lean(),
    Application.find({}).lean(),
    Message.find({}).lean(),
    Snippet.find({}).lean(),
    Profile.find({}).lean(),
    Resume.find({}).lean(),
    VoiceCapture.find({}).lean(),
    ContentPost.find({}).lean(),
    Setting.find({}).lean(),
    Memory.find({}).lean(),
    Job.find({}).lean(),
    Approval.find({}).lean(),
    Workflow.find({}).lean(),
    WorkflowRun.find({}).lean(),
    ChatMessage.find({}).lean(),
    OutboundMessage.find({}).lean(),
    ChannelAccount.find({}).lean(),
    AuditLog.find({}).lean(),
    Contact.find({}).lean(),
    StyleProfile.find({}).lean(),
    Template.find({}).lean(),
    Activity.find({}).lean(),
    FocusSession.find({}).lean(),
    ActionToken.find({}).lean(),
  ]);

  const safeAccounts = (accounts as any[]).map((account) => ({
    ...account,
    secrets: Object.keys(openSecrets(account.secrets)),
    encrypted: secretsAreEncrypted(account.secrets),
  }));

  const safeTokens = (tokens as any[]).map((token) => {
    const { tokenHash, ...rest } = token;
    return rest;
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    format: "jeevant-export-v1",
    counts: {
      projects: projects.length,
      tasks: tasks.length,
      notes: notes.length,
      chat: chat.length,
      audit: audit.length,
      approvals: approvals.length,
    },
    projects,
    tasks,
    notes,
    learning,
    experience,
    achievements,
    certificates,
    schedules,
    applications,
    messages,
    snippets,
    profile,
    resume,
    voice,
    posts,
    settings,
    memories,
    jobs,
    approvals,
    workflows,
    workflowRuns,
    chat,
    outbound,
    accounts: safeAccounts,
    audit,
    contacts,
    style,
    templates,
    activities,
    focus,
    actionTokens: safeTokens,
  };

  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="jeevant-export-${date}.json"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
