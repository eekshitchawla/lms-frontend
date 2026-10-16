import React from "react";

export default function SyllabusModal({ course, isOpen, onClose }) {
  if (!isOpen) return null;

  const modules = course.modules || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="syllabus-modal-title"
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-lg"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-white p-4">
          <h2
            id="syllabus-modal-title"
            className="min-w-0 break-words text-lg font-semibold text-slate-800"
          >
            {course.title} - Syllabus
          </h2>
          <button
            onClick={onClose}
            aria-label="Close syllabus"
            className="shrink-0 text-2xl font-light text-slate-500 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {modules.length === 0 ? (
              <div className="text-slate-500 text-sm">
                No modules available.
              </div>
            ) : (
              modules.map((module, idx) => (
                <div
                  key={module.id || idx}
                  className="p-3 border border-slate-200 rounded-md bg-slate-50"
                >
                  <h3 className="font-medium text-slate-800">{module.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {module.description || ""}
                  </p>
                  {module.duration && (
                    <p className="text-xs text-slate-500 mt-2">
                      Duration: {module.duration}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex shrink-0 justify-end border-t border-slate-200 p-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
