import { addExperience, getCharacterSheet } from "@/lib/actions/rpg.actions";
import { Route, BriefcaseBusiness } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JourneyCMS() {
  const { quests } = await getCharacterSheet();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-shell-muted p-8 font-mono -m-8">
      <div className="flex items-center gap-4 mb-8 border-b border-shell-border pb-6">
        <div className="w-16 h-16 bg-blue-900/20 border-2 border-blue-500 rounded-full flex items-center justify-center">
          <Route className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-shell-text uppercase tracking-tight">Journey Editor</h1>
          <p className="text-blue-500 text-xs tracking-widest mt-1">// EXPERIENCE // TIMELINE // RESPONSIBILITIES</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <form action={addExperience} className="space-y-4 bg-[#1a1a1a] p-6 border border-white/5 rounded-xl">
          <h3 className="text-shell-text font-bold uppercase border-b border-shell-border pb-2 mb-4 flex items-center gap-2">
            <BriefcaseBusiness className="w-4 h-4" /> Add Experience
          </h3>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-shell-muted">Company</label>
            <input name="company" placeholder="Company name" className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-blue-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-shell-muted">Role</label>
            <input name="role" placeholder="Intern / Engineer / Freelancer" className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-shell-muted">Start Date</label>
              <input name="startDate" type="date" placeholder="YYYY-MM-DD" className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-shell-muted">End Date</label>
              <input name="endDate" type="date" placeholder="YYYY-MM-DD" className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-shell-muted">Type</label>
            <select name="type" title="Experience type" className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-blue-500">
              <option value="internship">Internship</option>
              <option value="full-time">Full-time</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-shell-muted">Description</label>
            <textarea name="description" rows={5} placeholder="Responsibilities, impact, tools..." className="w-full bg-shell-bg border border-shell-border p-3 text-shell-text outline-none focus:border-blue-500" />
          </div>

          <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-shell-text font-bold uppercase tracking-widest transition">Save Experience</button>
        </form>

        <div className="space-y-4">
          <div className="bg-[#1a1a1a] p-6 border border-white/5 rounded-xl">
            <h3 className="text-shell-text font-bold uppercase border-b border-shell-border pb-2 mb-4">Current Timeline Items</h3>
            <div className="space-y-4">
              {quests.length === 0 ? (
                <div className="text-shell-muted text-sm">No journey entries yet.</div>
              ) : (
                quests.map((quest: any) => (
                  <div key={quest._id} className="rounded-lg border border-shell-border bg-shell-bg/20 p-4">
                    <div className="text-sm font-semibold text-shell-text">{quest.role}</div>
                    <div className="text-xs uppercase tracking-widest text-shell-muted mt-1">{quest.company}</div>
                    <div className="text-xs text-shell-muted mt-2">
                      {new Date(quest.startDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                      {quest.endDate ? ` - ${new Date(quest.endDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}` : " - present"}
                    </div>
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
