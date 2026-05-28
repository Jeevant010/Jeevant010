import { addAchievement, getCharacterSheet } from "@/lib/actions/rpg.actions";
import { Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExpertiseCMS() {
  const { loot } = await getCharacterSheet();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-shell-muted p-8 font-mono -m-8">
      <div className="flex items-center gap-4 mb-8 border-b border-shell-border pb-6">
        <div className="w-16 h-16 bg-amber-900/20 border-2 border-amber-500 rounded-full flex items-center justify-center">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-shell-text uppercase tracking-tight">Expertise Editor</h1>
          <p className="text-amber-500 text-xs tracking-widest mt-1">// ACHIEVEMENTS // CERTIFICATIONS // PROOF</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <form action={addAchievement} className="space-y-4 bg-[#1a1a1a] p-6 border border-white/5 rounded-xl">
          <h3 className="text-shell-text font-bold uppercase border-b border-shell-border pb-2 mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Add Achievement
          </h3>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-shell-muted">Title</label>
            <input name="title" placeholder="LeetCode milestone / certificate" className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-amber-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-shell-muted">Platform</label>
            <input name="platform" placeholder="LeetCode / AWS / Hackathon" className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-amber-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-shell-muted">Date</label>
            <input name="date" type="date" placeholder="YYYY-MM-DD" className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-amber-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-shell-muted">Proof Link</label>
            <input name="proofLink" placeholder="https://..." className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-amber-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-shell-muted">Description</label>
            <textarea name="description" rows={5} placeholder="What this proves about your skill" className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-amber-500" />
          </div>

          <button className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase tracking-widest transition">Save Achievement</button>
        </form>

        <div className="space-y-4">
          <div className="bg-[#1a1a1a] p-6 border border-white/5 rounded-xl">
            <h3 className="text-shell-text font-bold uppercase border-b border-shell-border pb-2 mb-4">Current Expertise Entries</h3>
            <div className="space-y-4">
              {loot.length === 0 ? (
                <div className="text-shell-muted text-sm">No achievements yet.</div>
              ) : (
                loot.map((item: any) => (
                  <div key={item._id} className="rounded-lg border border-shell-border bg-shell-bg/20 p-4">
                    <div className="text-sm font-semibold text-shell-text">{item.title}</div>
                    <div className="text-xs uppercase tracking-widest text-shell-muted mt-1">{item.platform}</div>
                    <div className="text-xs text-shell-muted mt-2">{item.description}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
