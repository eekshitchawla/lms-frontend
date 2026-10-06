import React, { useState, useCallback, useEffect } from "react";
import { adminApi } from "../services/api";
import {
  Users,
  Book,
  Save,
  Loader,
  AlertCircle,
  CheckCircle,
  BarChart3,
  X,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "./Spinner";
import AdminStats from "./AdminStats";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("users"); // users, courses, assign, dashboard

  // Stats state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  // Form states
  const [assignForm, setAssignForm] = useState({ userId: "", courseId: "" });
  const [courseForm, setCourseForm] = useState({
    id: "",
    title: "",
    description: "",
    content: "",
  });
  const [originalCourseData, setOriginalCourseData] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setError(null);
    try {
      const res = await adminApi.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load users");
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Fetch all courses
  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true);
    setError(null);
    try {
      const res = await adminApi.get("/courses");
      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load courses");
      toast.error("Failed to load courses");
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError("");
      const token = localStorage.getItem("token");
      const response = await adminApi.get("/admin/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStatsError(
        error.response?.data?.message ||
          "Failed to load statistics. Check console for details.",
      );
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "courses") fetchCourses();
    if (activeTab === "dashboard") fetchStats();
  }, [activeTab, fetchUsers, fetchCourses, fetchStats]);

  // Assign course to user
  const handleAssignCourse = async (e) => {
    e.preventDefault();
    if (!assignForm.userId || !assignForm.courseId) {
      setError("Please select both user and course");
      return;
    }

    setUsersLoading(true);
    setError(null);
    try {
      await adminApi.post("/admin/courses/assign", {
        userId: assignForm.userId,
        courseId: assignForm.courseId,
      });
      toast.success("Course assigned successfully!");
      setAssignForm({ userId: "", courseId: "" });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to assign course");
      toast.error("Failed to assign course");
    } finally {
      setUsersLoading(false);
    }
  };

  // Update course content
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.id || !courseForm.title || !courseForm.content) {
      setError("Please fill in all course fields");
      return;
    }

    setCoursesLoading(true);
    setError(null);
    try {
      await adminApi.put(`/admin/courses/${courseForm.id}/content`, {
        title: courseForm.title,
        description: courseForm.description,
        content: courseForm.content,
      });
      toast.success("Course updated successfully!");
      setCourseForm({ id: "", title: "", description: "", content: "" });
      setOriginalCourseData(null);
      fetchCourses();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update course");
      toast.error("Failed to update course");
    } finally {
      setCoursesLoading(false);
    }
  };

  // Reset course form to original values
  const handleResetCourseForm = () => {
    if (originalCourseData) {
      setCourseForm({ ...originalCourseData });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">
            Admin Management Panel
          </h1>
          <p className="text-slate-600">
            Manage users, courses, and assignments
          </p>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle
              className="text-red-600 mt-0.5 flex-shrink-0"
              size={20}
            />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "users", label: "Users", icon: Users },
            { id: "courses", label: "Courses", icon: Book },
            { id: "assign", label: "Assign Courses", icon: CheckCircle },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition ${
                activeTab === id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="bg-white rounded-lg shadow p-6">
            <AdminStats
              stats={stats}
              loading={statsLoading}
              error={statsError}
            />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">All Users</h2>
            {usersLoading ? (
              <Spinner />
            ) : users.length === 0 ? (
              <p className="text-slate-500">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition"
                      >
                        <td className="px-4 py-3 text-sm">{user.id}</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {user.name || user.username || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === "ROLE_ADMIN"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {user.role === "ROLE_ADMIN" ? "Admin" : "User"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => setViewingUser(user)}
                            className="text-indigo-600 hover:text-indigo-700 font-medium transition"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Courses List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">All Courses</h2>
              {coursesLoading ? (
                <Spinner />
              ) : courses.length === 0 ? (
                <p className="text-slate-500">No courses found.</p>
              ) : (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => {
                        const courseData = {
                          id: course.id,
                          title: course.title || "",
                          description: course.description || "",
                          content: course.content || "",
                        };
                        setCourseForm(courseData);
                        setOriginalCourseData(courseData);
                      }}
                      className={`w-full p-4 rounded-lg text-left transition ${
                        courseForm.id === course.id
                          ? "bg-indigo-50 border-2 border-indigo-600"
                          : "bg-slate-50 border border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className="font-semibold text-slate-800">
                        {course.title}
                      </p>
                      <p className="text-sm text-slate-600">
                        {course.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Course Editor */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Edit Course</h2>
              {courseForm.id ? (
                <form onSubmit={handleUpdateCourse} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Editing:</strong> {originalCourseData?.title}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Title
                    </label>
                    <div className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={courseForm.title}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            title: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                      />
                    </div>
                    {originalCourseData?.title !== courseForm.title && (
                      <p className="text-xs text-amber-600 mt-1">
                        Original: {originalCourseData?.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={courseForm.description}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                    {originalCourseData?.description !==
                      courseForm.description && (
                      <p className="text-xs text-amber-600 mt-1">
                        Original: {originalCourseData?.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={courseForm.content}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          content: e.target.value,
                        })
                      }
                      rows="6"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                    {originalCourseData?.content !== courseForm.content && (
                      <p className="text-xs text-amber-600 mt-1">
                        Content has been modified
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={coursesLoading}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {coursesLoading ? (
                        <Loader size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      Save Course
                    </button>
                    <button
                      type="button"
                      onClick={handleResetCourseForm}
                      disabled={coursesLoading}
                      className="px-4 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-400 text-slate-700 font-medium py-2 rounded-lg transition flex items-center gap-2"
                    >
                      <RotateCcw size={16} />
                      Reset
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-slate-500 text-center py-8">
                  Select a course to edit
                </p>
              )}
            </div>
          </div>
        )}

        {/* Assign Courses Tab */}
        {activeTab === "assign" && (
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">
              Assign Course to User
            </h2>
            <form onSubmit={handleAssignCourse} className="space-y-6">
              {/* Select User */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select User
                </label>
                <select
                  value={assignForm.userId}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, userId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="">-- Choose a user --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Course */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Course
                </label>
                <select
                  value={assignForm.courseId}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, courseId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="">-- Choose a course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  usersLoading || !assignForm.userId || !assignForm.courseId
                }
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                {usersLoading ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                Assign Course
              </button>
            </form>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                User Details
              </h3>
              <button
                onClick={() => setViewingUser(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  ID
                </label>
                <p className="text-slate-800">{viewingUser.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Name
                </label>
                <p className="text-slate-800">
                  {viewingUser.name || viewingUser.username || "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Email
                </label>
                <p className="text-slate-800">{viewingUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Role
                </label>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                    viewingUser.role === "ROLE_ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {viewingUser.role === "ROLE_ADMIN" ? "Admin" : "User"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setViewingUser(null)}
              className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
