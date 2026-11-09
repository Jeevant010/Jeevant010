"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trash2, Check } from "lucide-react";
import { deleteTemplateAction, logTemplateUseAction } from "@/lib/actions/template.actions";

export default function TemplateList({ templates }: { templates: any[] }) {
  const router = useRouter();
  const [copied, setCopied] = useState("");

  async function copy(template: any) {
    try {
      await navigator.clipboard.writeText(template.body);
      setCopied(template._id);
      const formData = new FormData();
      formData.set("id", template._id);
      await logTemplateUseAction(formData);
      router.refresh();
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  }

  if (!templates.length) {
    return (
      <div className="panel-cyber p-8 text-center text-[11px] uppercase tracking-widest text-shell-muted/60">
        No templates yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {templates.map((template) => (
        <article key={template._id} className="panel-cyber p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-shell-muted">
                  {template.kind}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-shell-muted/60">used {template.usageCount}×</span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-shell-text">{template.name}</h3>
              <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap border border-white/5 bg-black/40 p-3 text-[11px] leading-5 text-shell-muted custom-scrollbar">
                {template.body}
              </pre>
              {template.tags?.length > 0 && (
                <p className="mt-2 text-[10px] uppercase tracking-widest text-[#c8b48a]">
                  {template.tags.map((tag: string) => `#${tag}`).join(" ")}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => copy(template)}
                className="flex items-center gap-2 border border-[#c8b48a]/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d8cfbe] hover:bg-[#c8b48a]/10"
              >
                {copied === template._id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === template._id ? "Copied" : "Copy"}
              </button>
              <form action={deleteTemplateAction}>
                <input type="hidden" name="id" value={template._id} />
                <button className="flex items-center gap-2 border border-rose-900/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-300 hover:bg-rose-950/30">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
