"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor, TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { updateBulkOrder } from "@/lib/actions/reorder.actions";
import { motion } from "framer-motion";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group mb-4">
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6 cursor-grab active:cursor-grabbing text-shell-muted hover:text-blue-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2 z-20"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <div className={isDragging ? "ring-2 ring-blue-500 shadow-xl" : ""}>
        {children}
      </div>
    </div>
  );
}

interface SortableListProps {
  items: { _id: string; [key: string]: any }[];
  modelName: string; // e.g. "Project", "Experience"
  renderItem: (item: any) => React.ReactNode;
  revalidatePaths?: string[];
}

export default function SortableList({ items, modelName, renderItem, revalidatePaths = [] }: SortableListProps) {
  const [activeItems, setActiveItems] = useState(items);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = activeItems.findIndex((item) => item._id === active.id);
      const newIndex = activeItems.findIndex((item) => item._id === over.id);
      
      const newItems = arrayMove(activeItems, oldIndex, newIndex);
      setActiveItems(newItems);
      
      // Save order to DB
      setIsSaving(true);
      try {
        const updates = newItems.map((item, idx) => ({ id: item._id, order: idx }));
        await updateBulkOrder(modelName, updates, revalidatePaths);
      } catch (e) {
        console.error("Failed to reorder", e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="relative pl-6">
      {isSaving && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="absolute top-0 right-0 text-xs text-blue-400 font-mono flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          Saving Order...
        </motion.div>
      )}
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={activeItems.map(i => i._id)}
          strategy={verticalListSortingStrategy}
        >
          {activeItems.map((item) => (
            <SortableItem key={item._id} id={item._id}>
              {renderItem(item)}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}