"use client";

import { addAchievement } from "@/lib/actions/rpg.actions";
import { Shield, Save } from "lucide-react";

export function AddLootForm() {

  return (
    <div className="bg-[#231f1b] border-2 border-[#4a3c30] p-8 rounded-xl shadow-2xl relative mb-8">
      <div className="absolute -top-4 left-8 bg-[#1a1510] px-4 text-xl font-bold text-blue-400 flex items-center gap-2 border border-[#4a3c30]">
         <Shield className="w-5 h-5" /> Add Loot / Achievement
      </div>

      <form action={addAchievement} className="space-y-4 mt-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Achievement Name *</label>
            <input name="title" placeholder="e.g. Hackathon Winner" required className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Platform / Source</label>
            <input name="platform" placeholder="e.g. Devfolio" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Details</label>
          <textarea name="description" placeholder="Details of the loot..." required className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 h-20 focus:border-blue-500 outline-none resize-none custom-scrollbar" />
        </div>

        <div className="space-y-4 pt-4 border-t border-[#3a3028] mt-4">
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Slug</label>
              <input name="slug" placeholder="my-achievement" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Date</label>
              <input type="date" name="date" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Visibility</label>
              <select name="visibility" defaultValue="public" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Issuer / Org</label>
              <input name="issuer" placeholder="e.g. AWS" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Category</label>
              <input name="category" placeholder="e.g. Cloud" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Score</label>
              <input name="score" type="number" placeholder="e.g. 100" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Importance</label>
              <select name="importance" defaultValue="medium" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Proof Link</label>
              <input name="proofLink" placeholder="https://..." className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Credential ID</label>
              <input name="credentialId" placeholder="ID-12345" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Expiry Date</label>
              <input type="date" name="expiryDate" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Tags (CSV)</label>
              <input name="tags" placeholder="react, tailwind" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Skills (CSV)</label>
              <input name="skills" placeholder="leadership, coding" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Tech Stack (CSV)</label>
              <input name="techStack" placeholder="Node.js, AWS" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Github Link</label>
              <input name="githubLink" placeholder="https://github.com/..." className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Live Link</label>
              <input name="liveLink" placeholder="https://..." className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Cover Image URL</label>
              <input name="coverImage" placeholder="https://..." className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Gallery URLs (CSV)</label>
              <input name="gallery" placeholder="https://..., https://..." className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Architecture Diagram</label>
              <input name="architectureDiagram" placeholder="https://..." className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Collaborators (CSV)</label>
              <input name="collaborators" placeholder="Alice, Bob" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 focus:border-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Impact (Markdown)</label>
              <textarea name="impact" placeholder="What was the impact?" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 h-20 focus:border-blue-500 outline-none resize-none custom-scrollbar" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#5a4a3a] mb-1">Lessons Learned (Markdown)</label>
              <textarea name="lessonsLearned" placeholder="What did you learn?" className="w-full bg-[#151210] border border-[#3a3028] text-[#e8dcc5] p-3 h-20 focus:border-blue-500 outline-none resize-none custom-scrollbar" />
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <label className="flex items-center gap-2 text-[#8a7045] text-sm">
              <input type="checkbox" name="isFeatured" className="w-4 h-4 bg-[#151210] border-[#3a3028]" />
              Mark as Featured
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#8a7045] uppercase tracking-widest">Icon</label>
                <input name="icon" placeholder="trophy" defaultValue="trophy" className="w-20 bg-[#151210] border border-[#3a3028] p-2 text-[#e8dcc5] focus:border-blue-500 outline-none text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#8a7045] uppercase tracking-widest">Order</label>
                <input name="order" type="number" defaultValue="0" className="w-20 bg-[#151210] border border-[#3a3028] p-2 text-[#e8dcc5] focus:border-blue-500 outline-none text-sm" />
              </div>
            </div>
          </div>

        </div>

        <button className="w-full bg-blue-900/20 border border-blue-500 text-blue-400 font-bold py-3 hover:bg-blue-500 hover:text-black transition uppercase tracking-widest flex items-center justify-center gap-2 mt-4">
          <Save className="w-4 h-4" /> Stash Loot
        </button>
      </form>
    </div>
  );
}
