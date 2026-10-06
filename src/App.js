import React, { useEffect, useState, useCallback } from "react";
import { api } from "./services/api";
import AuthService from "./services/AuthService";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import AdminPanel from "./components/AdminPanel";
import Stats from "./components/Stats";
import TaskBoard from "./components/TaskBoard";
import CourseCatalog from "./components/CourseCatalog";
import AddTaskForm from "./components/AddTaskForm";
import Spinner from "./components/Spinner";
import CourseService from "./services/CourseService";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  const [activeUserId, setActiveUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  // Task filtering & sorting state
  const [taskShowCompleted, setTaskShowCompleted] = useState(false);
  const [taskSortBy, setTaskSortBy] = useState("dueDate");

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = AuthService.getToken();
    if (token && AuthService.isAuthenticated()) {
      const role = AuthService.getUserRole();
      const user = AuthService.getUser();
      setIsAuthenticated(true);
      setUserRole(role);
      setUser(user);
      // Set activeUserId to current user's ID for security - prevent user switching
      setActiveUserId(user?.id);
    }
    setLoading(false);
  }, []);

  // Fetch tasks for the active user
  const fetchTasks = useCallback(
    async (userId) => {
      if (!userId || !isAuthenticated) return setTasks([]);
      setTasksLoading(true);
      setTasksError(null);
      try {
        const res = await api.get(`/tasks/user/${userId}`);
        setTasks(res.data || []);
      } catch (err) {
        setTasksError(err.message || "Failed to load tasks");
      } finally {
        setTasksLoading(false);
      }
    },
    [isAuthenticated],
  );

  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const data = await CourseService.getCourses();
      setCourses(data || []);
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && userRole !== "ROLE_ADMIN") {
      fetchCourses();
    }
  }, [isAuthenticated, userRole, fetchCourses]);

  useEffect(() => {
    fetchTasks(activeUserId);
  }, [activeUserId, fetchTasks]);

  const toggleTask = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}/toggle`);
      fetchTasks(activeUserId);
    } catch (err) {
      console.error(err);
      setTasksError(err.message || "Toggle failed");
      toast.error("Failed to toggle task");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks(activeUserId);
      toast.success("Task deleted");
    } catch (err) {
      console.error(err);
      setTasksError(err.message || "Delete failed");
      toast.error("Failed to delete task");
    }
  };

  const createTask = async (payload) => {
    if (!activeUserId) return;
    try {
      await api.post(`/tasks`, { ...payload, userId: activeUserId });
      fetchTasks(activeUserId);
      toast.success("Task created");
    } catch (err) {
      console.error(err);
      setTasksError(err.message || "Create failed");
      toast.error("Failed to create task");
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    const role = AuthService.getUserRole();
    setUserRole(role);
    setActiveUserId(userData?.id);
    setShowRegister(false);
    toast.success("Welcome to EduTrack!");
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    const role = AuthService.getUserRole();
    setUserRole(role);
    setActiveUserId(userData?.id);
    setShowRegister(false);
    toast.success("Welcome to EduTrack! Registration complete.");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      AuthService.logout();
      setIsAuthenticated(false);
      setUserRole(null);
      setUser(null);
      setActiveUserId(null);
      setTasks([]);
      setCourses([]);
      toast.success("Logged out successfully");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Not authenticated - show login or register page
  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <RegisterPage
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  // Admin role - show admin panel
  if (userRole === "ROLE_ADMIN") {
    return (
      <div>
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-indigo-700">
                Admin Console
              </h1>
              <p className="text-sm text-slate-600">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-medium transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>
        <AdminPanel />
      </div>
    );
  }

  // User role - show learning dashboard
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-indigo-700">
              EduTrack Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Personalized view for learning progress
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              <p className="font-medium">{user?.name || user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-medium transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 space-y-4">
            <div className="p-4 bg-white rounded-lg shadow">
              <h2 className="text-sm font-medium text-slate-600 mb-3">Stats</h2>
              {tasksLoading ? <Spinner /> : <Stats tasks={tasks} />}
            </div>
          </aside>

          <main className="lg:col-span-3 space-y-6">
            <div className="p-4 bg-white rounded-lg shadow">
              <h2 className="text-lg font-medium text-slate-700 mb-4">
                Add Task
              </h2>
              <AddTaskForm onCreate={createTask} disabled={!activeUserId} />
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-slate-700">
                  Task Board
                </h2>
                <div className="text-sm text-slate-500">
                  {tasks.length} items
                </div>
              </div>
              {tasksLoading ? (
                <Spinner />
              ) : (
                (() => {
                  // Filter tasks based on completion status
                  const filteredTasks = tasks.filter((task) => {
                    return taskShowCompleted === task.completed;
                  });

                  // Sort filtered tasks
                  const sortedTasks = [...filteredTasks].sort((a, b) => {
                    if (taskSortBy === "dueDate") {
                      const dateA = a.dueDate
                        ? new Date(a.dueDate).getTime()
                        : Infinity;
                      const dateB = b.dueDate
                        ? new Date(b.dueDate).getTime()
                        : Infinity;
                      return dateA - dateB;
                    }
                    if (taskSortBy === "created") {
                      return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                      );
                    }
                    if (taskSortBy === "newest") {
                      return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                      );
                    }
                    return 0;
                  });

                  return (
                    <TaskBoard
                      tasks={sortedTasks}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                      taskShowCompleted={taskShowCompleted}
                      taskSortBy={taskSortBy}
                      onShowCompletedChange={setTaskShowCompleted}
                      onSortByChange={setTaskSortBy}
                    />
                  );
                })()
              )}
              {tasksError && (
                <div className="mt-3 text-red-600">{tasksError}</div>
              )}
            </div>
          </main>
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium text-slate-700 mb-6">
            Available Courses
          </h2>
          {coursesLoading ? (
            <Spinner />
          ) : (
            <CourseCatalog
              courses={courses}
              activeUserId={activeUserId}
              onEnrollSuccess={() => fetchTasks(activeUserId)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
