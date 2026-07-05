"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableApplicationCard } from "./SortableApplicationCard";

export function KanbanColumn({ id, title, items, colorClass, accentClass }: any) {
  const { setNodeRef } = useDroppable({
    id,
    data: { type: "Column" }
  });

  return (
    <div 
      ref={setNodeRef}
      className={`bg-[#0a0a0a] border-2 border-dashed ${colorClass} min-h-[500px] p-4 flex flex-col gap-4`}
    >
      <h3 className="text-2xl font-black uppercase mb-2 flex items-center gap-2">
        <span className={`w-3 h-3 rotate-45 ${accentClass}`} /> {title} ({items.length})
      </h3>
      
      <SortableContext items={items.map((i: any) => i._id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-4">
          {items.map((app: any) => (
            <SortableApplicationCard key={app._id} app={app} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
