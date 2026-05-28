"use client";

import { useState } from "react";
import { updateExperience, deleteExperience, updateAchievement, deleteAchievement } from "@/lib/actions/rpg.actions";
import { Edit2, Trash2, X, Save, Sword, Shield } from "lucide-react";

export function QuestList({ quests }: { quests: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xl font-bold text-yellow-500 uppercase flex items-center gap-2 border-b border-[#4a3c30] pb-2">
        <Sword className="w-5 h-5" /> Existing Quests
      </h3>
      {quests.length === 0 ? (
        <p className="text-[#8a7045] font-serif italic">No quests logged.</p>
      ) : (
        quests.map((quest) => (
          <div key={quest._id} className="bg-[#151210] border border-[#3a3028] p-4 rounded group relative">
            {editingId === quest._id ? (
              <form action={async (formData) => { await updateExperience(formData); setEditingId(null); }} className="space-y-3">
                <input type="hidden" name="id" value={quest._id} />
                <div className="flex justify-between">
                   <h4 className="text-yellow-500 text-xs font-bold uppercase tracking-widest">Editing Quest</h4>
                   <button type="button" onClick={() => setEditingId(null)}><X className="w-4 h-4 text-[#8a7045]" /></button>
                </div>
                <input name="role" defaultValue={quest.role} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30]" required />
                <input name="company" defaultValue={quest.company} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30]" required />
                <textarea name="description" defaultValue={quest.description} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm h-24 border border-[#4a3c30] resize-none" required />
                <button type="submit" className="bg-yellow-600 text-black px-4 py-2 text-xs font-bold uppercase flex items-center gap-2"><Save className="w-3 h-3"/> Save</button>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-[#e8dcc5]">{quest.role}</div>
                    <div className="text-xs text-yellow-600 uppercase tracking-widest">{quest.company}</div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingId(quest._id)} className="text-[#8a7045] hover:text-yellow-500"><Edit2 className="w-4 h-4" /></button>
                    <form action={deleteExperience}>
                      <input type="hidden" name="id" value={quest._id} />
                      <button type="submit" className="text-[#8a7045] hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </form>
                  </div>
                </div>
                <p className="text-sm text-[#8a7045] mt-2 line-clamp-2">{quest.description}</p>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export function LootList({ loot }: { loot: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xl font-bold text-blue-400 uppercase flex items-center gap-2 border-b border-[#4a3c30] pb-2">
        <Shield className="w-5 h-5" /> Acquired Loot
      </h3>
      {loot.length === 0 ? (
        <p className="text-[#8a7045] font-serif italic">No loot acquired.</p>
      ) : (
        loot.map((item) => (
          <div key={item._id} className="bg-[#151210] border border-[#3a3028] p-4 rounded group relative">
            {editingId === item._id ? (
              <form action={async (formData) => { await updateAchievement(formData); setEditingId(null); }} className="space-y-3">
                <input type="hidden" name="id" value={item._id} />
                <div className="flex justify-between">
                   <h4 className="text-blue-400 text-xs font-bold uppercase tracking-widest">Editing Loot</h4>
                   <button type="button" onClick={() => setEditingId(null)}><X className="w-4 h-4 text-[#8a7045]" /></button>
                </div>
                <input name="title" defaultValue={item.title} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30]" required />
                <input name="platform" defaultValue={item.platform} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30]" required />
                <textarea name="description" defaultValue={item.description} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm h-24 border border-[#4a3c30] resize-none" required />
                <button type="submit" className="bg-blue-500 text-black px-4 py-2 text-xs font-bold uppercase flex items-center gap-2"><Save className="w-3 h-3"/> Save</button>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-[#e8dcc5]">{item.title}</div>
                    <div className="text-xs text-blue-500 uppercase tracking-widest">{item.platform}</div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingId(item._id)} className="text-[#8a7045] hover:text-blue-400"><Edit2 className="w-4 h-4" /></button>
                    <form action={deleteAchievement}>
                      <input type="hidden" name="id" value={item._id} />
                      <button type="submit" className="text-[#8a7045] hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </form>
                  </div>
                </div>
                <p className="text-sm text-[#8a7045] mt-2 line-clamp-2">{item.description}</p>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
