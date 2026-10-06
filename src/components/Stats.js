import React from "react";

export default function Stats({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const statClass = "block px-3 py-2 rounded-md bg-indigo-50 text-indigo-700";

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className={statClass}>
        <div className="text-xs">Total</div>
        <div className="text-lg font-semibold">{total}</div>
      </div>
      <div className={statClass}>
        <div className="text-xs">Completed</div>
        <div className="text-lg font-semibold">{completed}</div>
      </div>
      <div className={statClass}>
        <div className="text-xs">Pending</div>
        <div className="text-lg font-semibold">{pending}</div>
      </div>
    </div>
  );
}
