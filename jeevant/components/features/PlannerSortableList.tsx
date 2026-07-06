"use client";

import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Check, GripVertical, Edit2, X, Save, Clock, AlertTriangle, Link as LinkIcon, Calendar } from "lucide-react";
import { deleteTask, toggleTask, updateTask, updateTaskOrder } from "@/lib/actions/task.actions";
import Link from "next/link";

function SortableTaskItem({ task }: { task: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [completed, setCompleted] = useState(task.isCompleted);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  const handleToggle = async () => {
    setCompleted(!completed);
    await toggleTask(task._id, task.isCompleted);
  };

  const handleDelete = async () => {
    if(!confirm("Delete this objective?")) return;
    await deleteTask(task._id);
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="bg-slate-900 border border-slate-700 p-4 relative">
        <form action={async (formData) => { await updateTask(formData); setIsEditing(false); }} className="space-y-4">
          <input type="hidden" name="id" value={task._id} />
          
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Objective Title</label>
            <input name="title" defaultValue={task.title} required className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500 font-bold" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Priority</label>
                <select name="priority" defaultValue={task.priority} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
             </div>
             <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Category</label>
                <select name="category" defaultValue={task.category} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500">
                  <option value="work">Work</option>
                  <option value="learning">Learning</option>
                  <option value="read-later">Read Later</option>
                  <option value="deadline">Deadline</option>
                  <option value="competition">Competition</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Estimated Time (mins)</label>
                <input name="estimatedTime" type="number" defaultValue={task.estimatedTime} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500" />
             </div>
             <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Actual Time (mins)</label>
                <input name="actualTime" type="number" defaultValue={task.actualTime} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Energy Level</label>
                <select name="energyLevel" defaultValue={task.energyLevel || "medium"} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
             </div>
             <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Assigned To</label>
                <input name="assignedTo" defaultValue={task.assignedTo} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tags (CSV)</label>
               <input name="tags" defaultValue={task.tags?.join(", ")} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500" />
            </div>
            <div>
               <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Dependencies (CSV)</label>
               <input name="dependencies" defaultValue={task.dependencies?.join(", ")} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Status Update</label>
               <textarea name="statusUpdate" defaultValue={task.statusUpdate} rows={2} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-1 outline-none focus:border-red-500 text-sm custom-scrollbar" />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Blockers</label>
               <textarea name="blockers" defaultValue={task.blockers} rows={2} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-1 outline-none focus:border-red-500 text-sm custom-scrollbar" />
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Review Notes</label>
               <textarea name="reviewNotes" defaultValue={task.reviewNotes} rows={2} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-1 outline-none focus:border-red-500 text-sm custom-scrollbar" />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Cost / Value</label>
               <input name="cost" defaultValue={task.cost} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3"/> Due Date (Deadline)</label>
                <input type="datetime-local" name="dueDate" defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().slice(0,16) : ""} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500 text-sm" />
             </div>
             <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3"/> Reminder Alert</label>
                <input type="datetime-local" name="reminderDate" defaultValue={task.reminderDate ? new Date(task.reminderDate).toISOString().slice(0,16) : ""} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500 text-sm" />
             </div>
          </div>

          <div>
             <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Source URL (Email/Link)</label>
             <input name="sourceUrl" defaultValue={task.sourceUrl} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500" placeholder="https://..." />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={() => setIsEditing(false)} className="text-red-400 hover:text-red-300 px-3 py-1 bg-red-900/20 text-xs font-bold uppercase transition border border-red-900/50"><X className="w-3 h-3 inline mr-1" /> Cancel</button>
            <button type="submit" className="text-green-400 hover:text-green-300 px-3 py-1 bg-green-900/20 text-xs font-bold uppercase transition border border-green-900/50"><Save className="w-3 h-3 inline mr-1" /> Save Update</button>
          </div>

        </form>
      </div>
    );
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !completed;
  const priorityColor = task.priority === "high" ? "text-red-500" : task.priority === "medium" ? "text-yellow-500" : "text-blue-500";

  return (
    <div ref={setNodeRef} style={style} className={`flex items-stretch group border-b border-slate-800 last:border-0 transition-colors ${completed ? 'bg-slate-900/30' : 'bg-[#0a0a0a] hover:bg-[#111]'}`}>
      <div {...attributes} {...listeners} className="w-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-700 hover:text-slate-400 transition">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="flex-1 p-4 flex flex-col justify-center gap-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <button onClick={handleToggle} className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded-full border flex items-center justify-center transition ${completed ? 'bg-green-500 border-green-500' : 'border-slate-500 hover:border-red-500'}`}>
              {completed && <Check className="w-3 h-3 text-black font-bold" />}
            </button>
            <div>
              <span className={`text-base font-bold ${completed ? 'line-through text-slate-600' : isOverdue ? 'text-red-400' : 'text-slate-200'}`}>
                {task.title}
              </span>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`text-[10px] uppercase tracking-widest font-bold ${priorityColor}`}>[{task.priority}]</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 border border-slate-800 px-1">{task.category}</span>
                {task.dueDate && (
                  <span className={`text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                    <Calendar className="w-3 h-3"/> {new Date(task.dueDate).toLocaleString()}
                  </span>
                )}
                {task.reminderDate && (
                  <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500 flex items-center gap-1">
                    <Clock className="w-3 h-3"/> Alert: {new Date(task.reminderDate).toLocaleString()}
                  </span>
                )}
                {task.sourceUrl && (
                  <Link href={task.sourceUrl} target="_blank" className="text-[10px] uppercase tracking-widest font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 border border-blue-900 px-1">
                    <LinkIcon className="w-3 h-3"/> Source
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
            <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-blue-400 transition p-1">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={handleDelete} className="text-slate-500 hover:text-red-400 transition p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlannerSortableList({ initialItems }: { initialItems: any[] }) {
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
      await updateTaskOrder(newItems.map(i => i._id));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i._id)} strategy={verticalListSortingStrategy}>
        <div className="border border-slate-800 bg-black">
          {items.map((item) => (
            <SortableTaskItem key={item._id} task={item} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}