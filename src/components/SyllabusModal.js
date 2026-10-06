import React from "react";

export default function SyllabusModal({ course, isOpen, onClose }) {
  if (!isOpen) return null;

  const modules = course.modules || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {course.title} - Syllabus
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl font-light"
          >
            ×
          </button>
        </div>

        <div className="p-4">
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

        <div className="border-t border-slate-200 p-4 flex justify-end">
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
