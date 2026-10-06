import React from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const TaskBoard = ({
  tasks = [],
  onToggle = () => {},
  onDelete = () => {},
  taskShowCompleted = false,
  taskSortBy = "dueDate",
  onShowCompletedChange = () => {},
  onSortByChange = () => {},
}) => {
  const handleToggleCompletion = async (taskId) => {
    try {
      await onToggle(taskId);
      toast.success(
        taskShowCompleted ? "Task marked as active" : "Task marked as complete",
      );
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await onDelete(taskId);
        toast.success("Task deleted");
      } catch (err) {
        toast.error("Failed to delete task");
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter & Sort Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Toggle Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onShowCompletedChange(false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !taskShowCompleted
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Active Tasks
          </button>
          <button
            onClick={() => onShowCompletedChange(true)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              taskShowCompleted
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Completed Tasks
          </button>
        </div>

        {/* Sort Dropdown */}
        <select
          value={taskSortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="dueDate">Due Date</option>
          <option value="created">Created Date</option>
          <option value="newest">Newest First</option>
        </select>

        {/* Results Counter */}
        <div className="text-sm text-gray-600">
          {tasks.length === 0 ? (
            <span>No tasks</span>
          ) : (
            <span>
              {tasks.length} {taskShowCompleted ? "completed" : "active"} task
              {tasks.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {taskShowCompleted
              ? "No completed tasks yet. Keep working!"
              : "No active tasks. Great job!"}
          </p>
          <button
            onClick={() => onShowCompletedChange(!taskShowCompleted)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            View {taskShowCompleted ? "Active" : "Completed"} Tasks
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all ${
                task.completed ? "opacity-60 bg-gray-50" : ""
              }`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleCompletion(task.id)}
                className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-medium text-gray-900 break-words ${
                    task.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p
                    className={`text-sm mt-1 break-words ${
                      task.completed ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {task.description}
                  </p>
                )}
                {task.dueDate && (
                  <p
                    className={`text-xs mt-2 ${
                      task.completed ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Actions */}
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors flex-shrink-0"
                title="Delete task"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
