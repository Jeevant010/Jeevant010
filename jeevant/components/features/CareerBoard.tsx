"use client";

import { useState } from "react";
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { updateStatus } from "@/lib/actions/career.actions";
import { KanbanColumn } from "./KanbanColumn";
import { SortableApplicationCard } from "./SortableApplicationCard";

export function CareerBoard({ initialApplications }: { initialApplications: any[] }) {
  const [items, setItems] = useState(initialApplications);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = {
    applied: items.filter(a => a.status === "applied"),
    interview: items.filter(a => a.status === "interview"),
    offer: items.filter(a => a.status === "offer"),
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setItems((tasks) => {
        const activeIndex = tasks.findIndex((t) => t._id === activeId);
        const overIndex = tasks.findIndex((t) => t._id === overId);
        
        const activeTask = tasks[activeIndex];
        const overTask = tasks[overIndex];

        if (activeTask.status !== overTask.status) {
          activeTask.status = overTask.status;
          return arrayMove(tasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Dropping a Task over a Column
    if (isActiveTask && isOverColumn) {
      setItems((tasks) => {
        const activeIndex = tasks.findIndex((t) => t._id === activeId);
        const activeTask = tasks[activeIndex];
        
        if (activeTask.status !== overId) {
          activeTask.status = overId;
          return arrayMove(tasks, activeIndex, activeIndex);
        }
        return tasks;
      });
    }
  };

  const handleDragEnd = async (event: any) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    
    // Determine final status
    const activeTask = items.find(t => t._id === active.id);
    if (!activeTask) return;

    const previousState = initialApplications.find(a => a._id === active.id);
    if (previousState && previousState.status !== activeTask.status) {
       // Persist to DB
       await updateStatus(active.id, activeTask.status);
    }
  };

  const activeApp = activeId ? items.find(a => a._id === activeId) : null;

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <KanbanColumn 
          id="applied" 
          title="Initiated" 
          items={columns.applied} 
          colorClass="border-pink-900/30 text-shell-muted" 
          accentClass="bg-slate-500" 
        />
        <KanbanColumn 
          id="interview" 
          title="Engagement" 
          items={columns.interview} 
          colorClass="border-yellow-900/30 text-yellow-500" 
          accentClass="bg-yellow-500" 
        />
        <KanbanColumn 
          id="offer" 
          title="Captured" 
          items={columns.offer} 
          colorClass="border-green-900/30 text-green-500" 
          accentClass="bg-green-500" 
        />
      </div>

      <DragOverlay>
        {activeApp ? (
          <div className="opacity-80 rotate-2 scale-105 shadow-2xl">
             <SortableApplicationCard app={activeApp} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
