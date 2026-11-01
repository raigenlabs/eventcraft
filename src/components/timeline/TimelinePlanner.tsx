import React, { memo, useCallback, useId, useMemo, useState } from "react";
import { isOverdue } from "../../../shared/timeline.js";
import type { TimelineTask } from "../../../shared/types.js";
import { usePlanDispatch, usePlanState } from "../../state/PlanContext.js";
import { AlertCircleIcon, CheckCircleIcon, ClockIcon } from "../layout/Icons.js";

function TaskStatusBadge({ completed, overdue }: { completed: boolean; overdue: boolean }): React.JSX.Element {
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-800 bg-green-50 px-2.5 py-1 rounded">
        <CheckCircleIcon size={14} />
        <span>Completed</span>
      </span>
    );
  }
  if (overdue) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded">
        <AlertCircleIcon size={14} />
        <span>Overdue Task</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
      <ClockIcon size={14} />
      <span>Pending</span>
    </span>
  );
}

const TaskRow = memo(function TaskRow({
  task,
  today,
  onToggle,
}: {
  task: TimelineTask;
  today: string;
  onToggle: (id: string) => void;
}): React.JSX.Element {
  const overdue = isOverdue(task, today);
  const inputId = useId();

  return (
    <div
      className={`flex items-start sm:items-center justify-between gap-4 p-4 border-b border-slate-200 transition-colors ${
        task.completed ? "bg-slate-50 opacity-75" : "hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start sm:items-center gap-3">
        <input
          id={inputId}
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="w-5 h-5 text-teal-700 rounded min-h-[44px] min-w-[44px] sm:min-h-5 sm:min-w-5 cursor-pointer mt-0.5 sm:mt-0"
        />
        <div>
          <label htmlFor={inputId} className={`font-semibold cursor-pointer ${task.completed ? "line-through text-slate-500" : "text-slate-900"}`}>
            {task.title}
          </label>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
            <span>Due: {task.dueDate}</span>
            <span>•</span>
            <span>{task.daysBefore} days before event</span>
            {task.essential && (
              <span className="font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">Essential</span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <TaskStatusBadge completed={task.completed} overdue={overdue} />
      </div>
    </div>
  );
});

function TimelineFilters({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: "all" | "pending" | "completed";
  onFilterChange: (f: "all" | "pending" | "completed") => void;
}): React.JSX.Element {
  const filters = ["all", "pending", "completed"] as const;
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Timeline Filters">
      {filters.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onFilterChange(f)}
          className={`min-h-[44px] px-3 py-1.5 text-xs font-semibold rounded capitalize transition-colors ${
            activeFilter === f ? "bg-teal-700 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

export function TimelinePlanner(): React.JSX.Element {
  const { plan } = usePlanState();
  const dispatch = usePlanDispatch();
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const handleToggle = useCallback((taskId: string) => {
    dispatch({ type: "TOGGLE_TIMELINE_TASK", payload: { taskId, today: todayStr } });
  }, [dispatch, todayStr]);

  const filteredTasks = useMemo(() => {
    if (!plan) return [];
    if (filter === "pending") return plan.timeline.filter((t) => !t.completed);
    if (filter === "completed") return plan.timeline.filter((t) => t.completed);
    return plan.timeline;
  }, [plan, filter]);

  if (!plan) return <div className="p-8 text-center text-slate-700">Please complete the intake wizard to view your timeline.</div>;
  const completedCount = plan.timeline.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 tabIndex={-1} className="text-2xl font-bold text-slate-900 outline-none">Timeline & Milestones</h2>
          <p className="text-sm text-slate-700 mt-1">Backward-scheduled from {plan.intake.date} ({plan.warnings.leadDays} days lead time).</p>
        </div>
        <TimelineFilters activeFilter={filter} onFilterChange={setFilter} />
      </div>

      {plan.warnings.compressedTimeline && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-3">
          <AlertCircleIcon size={20} className="text-amber-800 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-amber-900">Compressed Lead Timeline Active</h3>
            <p className="text-xs text-amber-800 mt-1">
              Your event date is in {plan.warnings.leadDays} days, which is shorter than typical planning windows. Milestones have been scaled proportionally.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white p-4 border border-slate-300 rounded-lg flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-slate-900">Progress</span>
          <span className="text-xs text-slate-600 block mt-0.5">{completedCount} of {plan.timeline.length} milestones complete</span>
        </div>
        <span className="text-lg font-bold text-teal-800">{Math.round((completedCount / Math.max(1, plan.timeline.length)) * 100)}%</span>
      </div>

      <div className="bg-white border border-slate-300 rounded-lg divide-y divide-slate-200 shadow-sm">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-600">No milestones match the current filter.</div>
        ) : (
          filteredTasks.map((task) => (
            <TaskRow key={task.id} task={task} today={todayStr} onToggle={handleToggle} />
          ))
        )}
      </div>
    </div>
  );
}
