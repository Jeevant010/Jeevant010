"use client";

import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Code, Trash2, Plus, GripVertical, Edit2, X, Check } from "lucide-react";
import { deleteLearning, incrementLearning, updateLearning, updateLearningOrder } from "@/lib/actions/learning.actions";

function SortableItem({ item }: { item: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const progress = Math.round((item.completedModules / item.totalModules) * 100) || 0;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="bg-shell-bg border-l-4 border-l-green-500 border border-green-900 p-4 relative group">
        <form action={async (formData) => { await updateLearning(formData); setIsEditing(false); }} className="space-y-3">
          <input type="hidden" name="id" value={item._id} />
          
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-green-700 uppercase tracking-widest font-bold">Title</label>
              <input name="title" defaultValue={item.title} required className="w-full bg-shell-surface border border-green-900 text-green-400 px-2 py-1 outline-none font-bold text-sm" />
            </div>
            <div className="w-1/3">
              <label className="text-[10px] text-green-700 uppercase tracking-widest font-bold">Platform</label>
              <input name="platform" defaultValue={item.platform} className="w-full bg-shell-surface border border-green-900 text-green-400 px-2 py-1 outline-none text-sm" />
            </div>
          </div>
          
          <div className="flex gap-2">
             <div className="flex-1">
              <label className="text-[10px] text-green-700 uppercase tracking-widest font-bold">URL</label>
              <input name="url" defaultValue={item.url} className="w-full bg-shell-surface border border-green-900 text-green-400 px-2 py-1 outline-none text-sm" />
            </div>
            <div className="w-24">
              <label className="text-[10px] text-green-700 uppercase tracking-widest font-bold">Modules</label>
              <input type="number" name="totalModules" defaultValue={item.totalModules} required className="w-full bg-shell-surface border border-green-900 text-green-400 px-2 py-1 outline-none text-sm" />
            </div>
            <div className="w-24">
              <label className="text-[10px] text-green-700 uppercase tracking-widest font-bold">Done</label>
              <input type="number" name="completedModules" defaultValue={item.completedModules} required className="w-full bg-shell-surface border border-green-900 text-green-400 px-2 py-1 outline-none text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-green-900/50">
            <button type="button" onClick={() => setIsEditing(false)} className="text-red-400 hover:text-red-300 px-3 py-1 bg-red-900/20 text-xs font-bold uppercase transition"><X className="w-3 h-3 inline mr-1" /> Cancel</button>
            <button type="submit" className="text-green-400 hover:text-green-300 px-3 py-1 bg-green-900/20 text-xs font-bold uppercase transition"><Check className="w-3 h-3 inline mr-1" /> Save</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-shell-bg border border-green-900 p-4 flex items-center gap-4 hover:border-green-500 transition group relative">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-green-900 hover:text-green-500 p-1">
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="p-3 bg-green-900/20 border border-green-800 text-green-400 group-hover:text-shell-text transition-colors">
        <Code className="w-6 h-6" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2 max-w-[70%]">
            <h3 className="font-bold text-lg text-shell-text group-hover:text-green-300 truncate">{item.title}</h3>
            {item.platform && <span className="px-2 py-0.5 bg-green-900/30 text-green-500 text-[10px] uppercase font-bold border border-green-900/50 whitespace-nowrap">{item.platform}</span>}
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-blue-500 transition"><Edit2 className="w-4 h-4" /></button>
            <form action={async () => { await deleteLearning(item._id); }}>
              <button type="submit" className="text-slate-500 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="w-full max-w-[80%] pr-4">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-green-700 uppercase tracking-widest font-bold">Progress ({item.completedModules}/{item.totalModules})</span>
              <span className="font-mono text-xs text-green-500 font-bold">{progress}%</span>
            </div>
            <div className="h-2 bg-green-900/30 w-full overflow-hidden">
              <div className="h-full bg-green-500 shadow-[0_0_10px_lime] transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          
          <div className="text-right">
            {progress < 100 ? (
              <form action={async () => { await incrementLearning(item._id); }}>
                <button type="submit" className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-900 border border-green-900 px-2 py-1 hover:bg-green-900 hover:text-black transition" title="Increment Progress">
                  <Plus className="w-3 h-3" /> Advance
                </button>
              </form>
            ) : (
              <div className="text-[10px] font-black text-green-400 uppercase tracking-widest px-2 py-1 bg-green-900/20 border border-green-500/30">
                Complete
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LearningSortableList({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((i) => i._id === active.id);
      const newIndex = items.findIndex((i) => i._id === over?.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      
      // Persist order
      await updateLearningOrder(newItems.map(i => i._id));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {items.map((item) => (
            <SortableItem key={item._id} item={item} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}