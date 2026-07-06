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
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-bold text-[#e8dcc5]">{quest.role}</div>
              <div className="text-xs text-yellow-600 uppercase tracking-widest flex items-center gap-2">
                {quest.company}
                {quest.website && <a href={quest.website} target="_blank" rel="noopener" className="text-[#8a7045] hover:text-yellow-500 underline lowercase">[{quest.website}]</a>}
              </div>
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
            </div>
            <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditingId(quest._id)} className="text-[#8a7045] hover:text-yellow-500"><Edit2 className="w-4 h-4" /></button>
              <form action={deleteExperience}>
                <input type="hidden" name="id" value={quest._id} />
                <button type="submit" className="text-[#8a7045] hover:text-red-500" onClick={(e) => { if(!confirm("Delete this quest?")) e.preventDefault(); }}><Trash2 className="w-4 h-4" /></button>
              </form>
            </div>
          </div>
          <p className="text-sm text-[#8a7045] mt-2 mb-3 whitespace-pre-wrap">{quest.description}</p>
          
          {(quest.location || quest.salary || quest.manager || quest.rating) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-[#8a7045] mb-3 bg-[#2a2420]/50 p-2 rounded border border-[#3a3028]">
              {quest.location && <div><span className="font-bold text-yellow-600/70">LOC:</span> {quest.location}</div>}
              {quest.salary && <div><span className="font-bold text-yellow-600/70">SALARY:</span> {quest.salary}</div>}
              {quest.manager && <div><span className="font-bold text-yellow-600/70">LEAD:</span> {quest.manager}</div>}
              {quest.rating && <div><span className="font-bold text-yellow-600/70">RATING:</span> {quest.rating}/10</div>}
            </div>
          )}

          {quest.reasonForLeaving && (
            <div className="text-xs italic text-[#8a7045] mb-3 border-l-2 border-[#3a3028] pl-2">
              <span className="font-bold uppercase tracking-widest text-yellow-600/50 text-[9px] block">Debrief (Reason for leaving)</span>
              {quest.reasonForLeaving}
            </div>
          )}

          {quest.achievements?.length > 0 && (
            <div className="mb-3 bg-[#2a2420] border border-[#3a3028] p-3 rounded">
               <span className="font-bold uppercase tracking-widest text-yellow-600/70 text-[9px] block mb-2 border-b border-[#3a3028] pb-1">Key Achievements</span>
               <ul className="list-disc list-inside text-xs text-[#8a7045] space-y-1">
                 {quest.achievements.map((ach: string, i: number) => <li key={i}>{ach}</li>)}
               </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-1 mt-2">
            {quest.skillsUsed?.map((skill: string, i: number) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-[#2a2420] text-[#8a7045] rounded border border-[#3a3028]">{skill}</span>
            ))}
            {quest.tags?.map((tag: string, i: number) => (
              <span key={`tag-${i}`} className="text-[10px] px-1.5 py-0.5 bg-transparent text-[#8a7045]/60 rounded border border-[#3a3028] border-dashed">#{tag}</span>
            ))}
          </div>
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
            <div className="col-span-1">
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Title *</label>
              <input name="title" defaultValue={item.title} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" required />
            </div>
            <div className="col-span-1">
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">URL Slug</label>
              <input name="slug" defaultValue={item.slug} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" placeholder="my-achievement" />
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
            
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Github Link</label>
              <input name="githubLink" defaultValue={item.githubLink} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Live Link</label>
              <input name="liveLink" defaultValue={item.liveLink} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Cover Image URL</label>
              <input name="coverImage" defaultValue={item.coverImage} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Arch Diagram URL</label>
              <input name="architectureDiagram" defaultValue={item.architectureDiagram} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Gallery URLs (comma separated)</label>
              <input name="gallery" defaultValue={item.gallery?.join(", ")} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm border border-[#4a3c30] rounded" />
            </div>
            
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" name="isFeatured" defaultChecked={item.isFeatured} className="w-4 h-4 bg-[#2a2420] border-[#4a3c30]" />
              <label className="text-xs text-blue-400/70 uppercase tracking-widest">Featured</label>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Description (Markdown)</label>
            <textarea name="description" defaultValue={item.description} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm h-16 border border-[#4a3c30] resize-y rounded" />
          </div>
          <div>
            <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Impact (Markdown)</label>
            <textarea name="impact" defaultValue={item.impact} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm h-16 border border-[#4a3c30] resize-y rounded" />
          </div>
          <div>
            <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Lessons Learned (Markdown)</label>
            <textarea name="lessonsLearned" defaultValue={item.lessonsLearned} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm h-16 border border-[#4a3c30] resize-y rounded" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Skills (comma separated)</label>
              <textarea name="skills" defaultValue={item.skills?.join(", ")} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm h-12 border border-[#4a3c30] resize-y rounded" />
            </div>
            <div>
              <label className="text-xs text-blue-400/70 uppercase tracking-widest block mb-1">Tech Stack (comma separated)</label>
              <textarea name="techStack" defaultValue={item.techStack?.join(", ")} className="w-full bg-[#2a2420] text-[#e8dcc5] p-2 text-sm h-12 border border-[#4a3c30] resize-y rounded" />
            </div>
          </div>
          
          <button type="submit" className="bg-blue-500 text-black px-4 py-2 text-xs font-bold uppercase flex items-center gap-2 rounded"><Save className="w-3 h-3"/> Save</button>
        </form>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-bold text-[#e8dcc5]">{item.title}</div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-blue-500 uppercase tracking-widest">{item.platform}</span>
                {item.category && <span className="text-[10px] px-1 bg-[#2a2420] border border-[#3a3028] text-blue-400/80">{item.category}</span>}
                {item.date && (
                  <span className="text-[10px] text-[#8a7045] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </span>
                )}
                {item.visibility === "private" && (
                  <span className="text-[10px] text-red-400 flex items-center gap-1"><EyeOff className="w-3 h-3" /> PRIVATE</span>
                )}
                {item.isFeatured && (
                  <span className="text-[10px] text-yellow-500 flex items-center gap-1 border border-yellow-500/30 px-1 bg-yellow-500/10">★ FEATURED</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditingId(item._id)} className="text-[#8a7045] hover:text-blue-400"><Edit2 className="w-4 h-4" /></button>
              <form action={deleteAchievement}>
                <input type="hidden" name="id" value={item._id} />
                <button type="submit" className="text-[#8a7045] hover:text-red-500" onClick={(e) => { if(!confirm("Delete this loot?")) e.preventDefault(); }}><Trash2 className="w-4 h-4" /></button>
              </form>
            </div>
          </div>
          
          <p className="text-sm text-[#8a7045] mt-2 mb-3 whitespace-pre-wrap">{item.description}</p>
          
          {(item.issuer || item.score || item.credentialId || item.expiryDate || item.importance) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono text-[#8a7045] mb-3 bg-[#2a2420]/50 p-2 rounded border border-[#3a3028]">
              {item.issuer && <div><span className="font-bold text-blue-400/70">ISSUER:</span> {item.issuer}</div>}
              {item.score && <div><span className="font-bold text-blue-400/70">SCORE:</span> {item.score}</div>}
              {item.credentialId && <div><span className="font-bold text-blue-400/70">CRED ID:</span> {item.credentialId}</div>}
              {item.importance && <div><span className="font-bold text-blue-400/70">IMPORTANCE:</span> <span className="uppercase">{item.importance}</span></div>}
              {item.expiryDate && <div><span className="font-bold text-blue-400/70">EXPIRY:</span> {new Date(item.expiryDate).toLocaleDateString()}</div>}
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest mb-3">
            {item.proofLink && (
              <a href={item.proofLink} target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300 border border-blue-400/30 px-2 py-1 rounded bg-blue-400/5 transition">Proof Link ↗</a>
            )}
            {item.githubLink && (
              <a href={item.githubLink} target="_blank" rel="noopener" className="text-slate-300 hover:text-white border border-slate-600 px-2 py-1 rounded bg-slate-800 transition">Source ↗</a>
            )}
            {item.liveLink && (
              <a href={item.liveLink} target="_blank" rel="noopener" className="text-emerald-400 hover:text-emerald-300 border border-emerald-400/30 px-2 py-1 rounded bg-emerald-400/5 transition">Live Link ↗</a>
            )}
            {item.architectureDiagram && (
              <a href={item.architectureDiagram} target="_blank" rel="noopener" className="text-purple-400 hover:text-purple-300 border border-purple-400/30 px-2 py-1 rounded bg-purple-400/5 transition">Arch Diagram ↗</a>
            )}
          </div>

          {(item.impact || item.lessonsLearned) && (
            <div className="flex flex-col gap-2 mb-3">
              {item.impact && (
                <div className="bg-[#2a2420] border border-[#3a3028] p-3 rounded">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-blue-400/70 block mb-1">Impact</span>
                  <div className="text-xs text-[#8a7045] whitespace-pre-wrap">{item.impact}</div>
                </div>
              )}
              {item.lessonsLearned && (
                <div className="bg-[#2a2420] border border-[#3a3028] p-3 rounded">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-blue-400/70 block mb-1">Lessons Learned</span>
                  <div className="text-xs text-[#8a7045] whitespace-pre-wrap">{item.lessonsLearned}</div>
                </div>
              )}
            </div>
          )}

          {(item.gallery?.length > 0 || item.coverImage) && (
             <div className="flex gap-2 overflow-x-auto mb-3 pb-1">
               {item.coverImage && <img src={item.coverImage} className="h-12 w-12 object-cover rounded border border-[#3a3028]" alt="Cover" />}
               {item.gallery?.map((url: string, i: number) => (
                 <img key={i} src={url} className="h-12 w-12 object-cover rounded border border-[#3a3028]" alt={`Gallery ${i}`} />
               ))}
             </div>
          )}

          <div className="flex flex-wrap gap-1 mt-2">
            {[...(item.skills || []), ...(item.techStack || [])].map((skill: string, i: number) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-[#2a2420] text-[#8a7045] rounded border border-[#3a3028]">{skill}</span>
            ))}
            {item.tags?.map((tag: string, i: number) => (
              <span key={`tag-${i}`} className="text-[10px] px-1.5 py-0.5 bg-transparent text-[#8a7045]/60 rounded border border-[#3a3028] border-dashed">#{tag}</span>
            ))}
          </div>
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
