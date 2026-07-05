"use client";

import { useState } from "react";
import { updateExperience, deleteExperience, updateAchievement, deleteAchievement } from "@/lib/actions/rpg.actions";
import { Edit2, Trash2, X, Save, Sword, Shield, Calendar, Tag, Eye, EyeOff } from "lucide-react";
import SortableList from "./SortableList";

function QuestItem({ quest }: { quest: any }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="bg-[#151210] border border-[#3a3028] p-4 rounded group relative w-full">
      {editingId === quest._id ? (
        <form action={async (formData) => { await updateExperience(formData); setEditingId(null); }} className="space-y-3">
          <input type="hidden" name="id" value={quest._id} />
          <div className="flex justify-between">
              <h4 className="text-yellow-500 text-xs font-bold uppercase tracking-widest">Editing Quest</h4>
              <button type="button" onClick={() => setEditingId(null)}><X className="w-4 h-4 text-[#8a7045]" /></button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-yellow-600/70 uppercase tracking-widest block mb-1">Role *</label>
              <input name="role" defaultValue={quest.role} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" required />
            </div>
            <div>
              <label className="text-xs text-yellow-600/70 uppercase tracking-widest block mb-1">Company *</label>
              <input name="company" defaultValue={quest.company} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" required />
            </div>
            <div>
              <label className="text-xs text-yellow-600/70 uppercase tracking-widest block mb-1">Type</label>
              <select name="type" defaultValue={quest.type || "internship"} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded">
                <option value="internship">Internship</option>
                <option value="full-time">Full-time</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-yellow-600/70 uppercase tracking-widest block mb-1">Skills Used (comma separated)</label>
              <input name="skillsUsed" defaultValue={quest.skillsUsed?.join(", ")} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-yellow-600/70 uppercase tracking-widest block mb-1">Start Date</label>
              <input type="date" name="startDate" defaultValue={quest.startDate ? new Date(quest.startDate).toISOString().slice(0,10) : ""} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-yellow-600/70 uppercase tracking-widest block mb-1">End Date</label>
              <input type="date" name="endDate" defaultValue={quest.endDate ? new Date(quest.endDate).toISOString().slice(0,10) : ""} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            
            {/* New Fields */}
            <div>
              <label className="text-xs text-yellow-600/70 uppercase tracking-widest block mb-1">Website URL</label>
              <input name="website" defaultValue={quest.website} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-yellow-600/70 uppercase tracking-widest block mb-1">Location</label>
              <input name="location" defaultValue={quest.location} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-yellow-600/70 uppercase tracking-widest block mb-1">Salary</label>
              <input name="salary" defaultValue={quest.salary} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-yellow-600/70 uppercase tracking-widest block mb-1">Manager</label>
              <input name="manager" defaultValue={quest.manager} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-yellow-600/70 uppercase tracking-widest block mb-1">Rating (1-10)</label>
              <input type="number" name="rating" min="1" max="10" defaultValue={quest.rating} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-yellow-600/70 uppercase tracking-widest block mb-1">Reason for Leaving</label>
              <input name="reasonForLeaving" defaultValue={quest.reasonForLeaving} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-yellow-600/70 uppercase tracking-widest block mb-1">Tags (comma separated)</label>
              <input name="tags" defaultValue={quest.tags?.join(", ")} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" name="isCurrent" defaultChecked={quest.isCurrent} className="w-4 h-4 bg-[#2a2420] border-[#4a3c30]" />
              <label className="text-xs text-yellow-600/70 uppercase tracking-widest">Currently Working Here</label>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-yellow-600/70 uppercase tracking-widest block mb-1">Description</label>
            <textarea name="description" defaultValue={quest.description} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm h-24 border border-[#4a3c30] resize-y rounded" />
          </div>
          <div>
            <label className="text-xs text-yellow-600/70 uppercase tracking-widest block mb-1">Achievements (Markdown list)</label>
            <textarea name="achievements" defaultValue={quest.achievements?.join("\n")} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm h-24 border border-[#4a3c30] resize-y rounded" />
          </div>
          
          <button type="submit" className="bg-yellow-600 text-black px-4 py-2 text-xs font-bold uppercase flex items-center gap-2 rounded"><Save className="w-3 h-3"/> Save</button>
        </form>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-[#e8dcc5]">{quest.role}</div>
              <div className="text-xs text-yellow-600 uppercase tracking-widest">{quest.company}</div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-[#8a7045] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {quest.startDate ? new Date(quest.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
                  {" → "}
                  {quest.isCurrent ? "Present" : quest.endDate ? new Date(quest.endDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Present"}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#2a2420] text-yellow-600/80 rounded uppercase border border-[#3a3028]">
                  {quest.type || "internship"}
                </span>
              </div>
              {quest.skillsUsed?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {quest.skillsUsed.map((skill: string, i: number) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-[#2a2420] text-[#8a7045] rounded border border-[#3a3028]">{skill}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditingId(quest._id)} className="text-[#8a7045] hover:text-yellow-500"><Edit2 className="w-4 h-4" /></button>
              <form action={deleteExperience}>
                <input type="hidden" name="id" value={quest._id} />
                <button type="submit" className="text-[#8a7045] hover:text-red-500" onClick={(e) => { if(!confirm("Delete this quest?")) e.preventDefault(); }}><Trash2 className="w-4 h-4" /></button>
              </form>
            </div>
          </div>
          <p className="text-sm text-[#8a7045] mt-2 line-clamp-2">{quest.description}</p>
        </>
      )}
    </div>
  );
}

export function QuestList({ quests }: { quests: any[] }) {
  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xl font-bold text-yellow-500 uppercase flex items-center gap-2 border-b border-[#4a3c30] pb-2">
        <Sword className="w-5 h-5" /> Existing Quests ({quests.length})
      </h3>
      {quests.length === 0 ? (
        <p className="text-[#8a7045] font-serif italic">No quests logged.</p>
      ) : (
        <SortableList 
          items={quests} 
          modelName="Experience" 
          revalidatePaths={["/cms/journey", "/cms/rpg", "/about", "/journey"]}
          renderItem={(quest) => <QuestItem quest={quest} />} 
        />
      )}
    </div>
  );
}

function LootItem({ item }: { item: any }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="bg-[#151210] border border-[#3a3028] p-4 rounded group relative w-full">
      {editingId === item._id ? (
        <form action={async (formData) => { await updateAchievement(formData); setEditingId(null); }} className="space-y-3">
          <input type="hidden" name="id" value={item._id} />
          <div className="flex justify-between">
              <h4 className="text-blue-400 text-xs font-bold uppercase tracking-widest">Editing Loot</h4>
              <button type="button" onClick={() => setEditingId(null)}><X className="w-4 h-4 text-[#8a7045]" /></button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Title *</label>
              <input name="title" defaultValue={item.title} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" required />
            </div>
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Platform / Category</label>
              <input name="platform" defaultValue={item.platform} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Date</label>
              <input type="date" name="date" defaultValue={item.date ? new Date(item.date).toISOString().slice(0,10) : ""} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Proof Link</label>
              <input name="proofLink" defaultValue={item.proofLink} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Visibility</label>
              <select name="visibility" defaultValue={item.visibility || "public"} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            
            {/* New fields */}
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Issuer / Org</label>
              <input name="issuer" defaultValue={item.issuer} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Category</label>
              <input name="category" defaultValue={item.category} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Score</label>
              <input type="number" name="score" defaultValue={item.score} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Credential ID</label>
              <input name="credentialId" defaultValue={item.credentialId} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Expiry Date</label>
              <input type="date" name="expiryDate" defaultValue={item.expiryDate ? new Date(item.expiryDate).toISOString().slice(0,10) : ""} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Importance</label>
              <select name="importance" defaultValue={item.importance || "medium"} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Tags (comma separated)</label>
              <input name="tags" defaultValue={item.tags?.join(", ")} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" name="isFeatured" defaultChecked={item.isFeatured} className="w-4 h-4 bg-[#2a2420] border-[#4a3c30]" />
              <label className="text-xs text-blue-400/70 uppercase tracking-widest">Featured</label>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Description</label>
            <textarea name="description" defaultValue={item.description} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm h-20 border border-[#4a3c30] resize-y rounded" />
          </div>
          <div>
            <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Skills (comma separated)</label>
            <textarea name="skills" defaultValue={item.skills?.join(", ")} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm h-12 border border-[#4a3c30] resize-y rounded" />
          </div>
          
          <button type="submit" className="bg-blue-500 text-black px-4 py-2 text-xs font-bold uppercase flex items-center gap-2 rounded"><Save className="w-3 h-3"/> Save</button>
        </form>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-[#e8dcc5]">{item.title}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-blue-500 uppercase tracking-widest">{item.platform}</span>
                {item.date && (
                  <span className="text-[10px] text-[#8a7045] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </span>
                )}
                {item.visibility === "private" && (
                  <span className="text-[10px] text-red-400 flex items-center gap-1"><EyeOff className="w-3 h-3" /> PRIVATE</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditingId(item._id)} className="text-[#8a7045] hover:text-blue-400"><Edit2 className="w-4 h-4" /></button>
              <form action={deleteAchievement}>
                <input type="hidden" name="id" value={item._id} />
                <button type="submit" className="text-[#8a7045] hover:text-red-500" onClick={(e) => { if(!confirm("Delete this loot?")) e.preventDefault(); }}><Trash2 className="w-4 h-4" /></button>
              </form>
            </div>
          </div>
          <p className="text-sm text-[#8a7045] mt-2 line-clamp-2">{item.description}</p>
          {item.proofLink && (
            <a href={item.proofLink} target="_blank" rel="noopener" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">View Proof →</a>
          )}
        </>
      )}
    </div>
  );
}

export function LootList({ loot }: { loot: any[] }) {
  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xl font-bold text-blue-400 uppercase flex items-center gap-2 border-b border-[#4a3c30] pb-2">
        <Shield className="w-5 h-5" /> Acquired Loot ({loot.length})
      </h3>
      {loot.length === 0 ? (
        <p className="text-[#8a7045] font-serif italic">No loot acquired.</p>
      ) : (
        <SortableList 
          items={loot} 
          modelName="Achievement" 
          revalidatePaths={["/cms/expertise", "/cms/rpg", "/about", "/"]}
          renderItem={(item) => <LootItem item={item} />} 
        />
      )}
    </div>
  );
}
