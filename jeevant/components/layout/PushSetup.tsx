"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Loader2, Send } from "lucide-react";

type Status = "loading" | "unsupported" | "unconfigured" | "denied" | "off" | "on";

function decodeKey(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) output[index] = raw.charCodeAt(index);
  return output;
}

export default function PushSetup() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setStatus("unsupported");
      return;
    }

    try {
      const res = await fetch("/api/push/public-key", { cache: "no-store" });
      const json = await res.json();
      if (!json.configured || !json.key) {
        setStatus("unconfigured");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setStatus(subscription ? "on" : Notification.permission === "denied" ? "denied" : "off");
    } catch {
      setStatus("off");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function subscribe() {
    if (busy) return;
    setBusy(true);
    setMessage("");

    try {
      const keyRes = await fetch("/api/push/public-key", { cache: "no-store" });
      const keyJson = await keyRes.json();
      if (!keyJson.key) throw new Error("VAPID public key is not configured.");

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        setMessage("Notifications are blocked in the browser settings.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeKey(String(keyJson.key)) as BufferSource,
        }));

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.detail || json?.error || `Subscribe failed (${res.status})`);

      setStatus("on");
      setMessage("This device will receive lock-screen reminders.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    if (busy) return;
    setBusy(true);
    setMessage("");

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setStatus(Notification.permission === "denied" ? "denied" : "off");
      setMessage("This device will no longer receive push.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    if (busy) return;
    setBusy(true);
    setMessage("");

    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `Test failed (${res.status})`);
      setMessage(`Sent to ${json.sent} device(s). Removed ${json.removed}, failed ${json.failed}.`);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const label: Record<Status, string> = {
    loading: "checking this device",
    unsupported: "this browser does not support push",
    unconfigured: "VAPID keys are not configured",
    denied: "notifications are blocked",
    off: "not enabled on this device",
    on: "enabled on this device",
  };

  const active = status === "on";

  return (
    <section className="panel-cyber mt-6 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-shell-muted">
          {active ? <Bell className="h-4 w-4 text-emerald-400" /> : <BellOff className="h-4 w-4" />}
          Lock-screen reminders
          <span className={`ml-2 h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-amber-400"}`} />
          <span className="text-[9px] normal-case tracking-[0.1em] text-shell-muted/70">{label[status]}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {active ? (
            <>
              <button
                type="button"
                onClick={() => void sendTest()}
                disabled={busy}
                className="inline-flex items-center gap-2 border border-[color:var(--shell-accent)]/50 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[color:var(--shell-accent)] disabled:opacity-40"
              >
                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                Send test
              </button>
              <button
                type="button"
                onClick={() => void unsubscribe()}
                disabled={busy}
                className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-shell-muted disabled:opacity-40"
              >
                <BellOff className="h-3 w-3" /> Disable
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => void subscribe()}
              disabled={busy || status === "unsupported" || status === "unconfigured"}
              className="inline-flex items-center gap-2 border border-[color:var(--shell-accent)]/50 bg-[color:var(--shell-accent)]/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[color:var(--shell-accent)] disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bell className="h-3 w-3" />}
              Enable push
            </button>
          )}
        </div>
      </div>

      {message ? <p className="mt-3 text-[10px] leading-4 text-shell-muted">{message}</p> : null}

      <p className="mt-3 border-t border-white/5 pt-3 text-[9px] uppercase leading-5 tracking-[0.12em] text-shell-muted/60">
        HTTPS is required. On iPhone, add the app to the Home Screen first (iOS 16.4+). The cron at
        /api/cron/reminders sends due reminders; without it, push only fires from tests.
      </p>
    </section>
  );
}
