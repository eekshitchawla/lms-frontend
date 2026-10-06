import React, { useState } from "react";
import toast from "react-hot-toast";
import { catalogApi } from "../services/api";
import SyllabusModal from "./SyllabusModal";

export default function CourseCatalog({
  courses = [],
  activeUserId = null,
  onEnrollSuccess = () => {},
}) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolling, setEnrolling] = useState(null);

  const handleEnroll = async (course) => {
    if (!activeUserId) {
      toast.error("Please select a user first");
      return;
    }

    setEnrolling(course.id);
    try {
      await catalogApi.post(`/courses/${course.id}/enroll`, {
        userId: activeUserId,
      });

      toast.success(`Successfully enrolled in ${course.title}!`);

      // Trigger task board refresh
      onEnrollSuccess();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Enrollment failed. Please try again.";
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setEnrolling(null);
    }
  };

  if (!courses.length) {
    return (
      <div className="text-sm text-slate-500 text-center py-8">
        No courses available.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-slate-100 overflow-hidden flex flex-col"
          >
            {course.imageUrl && (
              <div className="h-40 bg-gradient-to-br from-indigo-400 to-indigo-600 w-full">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {course.title}
              </h3>

              <p className="text-sm text-slate-600 mb-4 flex-grow">
                {course.description ||
                  course.shortDescription ||
                  "No description available"}
              </p>

              {course.instructor && (
                <p className="text-xs text-slate-500 mb-3">
                  <span className="font-medium">Instructor:</span>{" "}
                  {course.instructor}
                </p>
              )}

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="flex-1 px-3 py-2 text-sm rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium transition"
                >
                  View Syllabus
                </button>
                <button
                  onClick={() => handleEnroll(course)}
                  disabled={enrolling === course.id || !activeUserId}
                  className="flex-1 px-3 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling === course.id ? "Enrolling..." : "Enroll"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCourse && (
        <SyllabusModal
          course={selectedCourse}
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </>
  );
}
