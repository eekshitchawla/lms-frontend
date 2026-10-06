import React from "react";
import {
  Users,
  UserCheck,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Clock,
} from "lucide-react";

const AdminStats = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-medium">Error loading statistics</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-600 p-4 rounded-lg">
        <p>No statistics available</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers || 0,
      icon: Users,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Users",
      value: stats.activeUsers || 0,
      icon: UserCheck,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Courses Assigned",
      value: stats.totalCoursesAssigned || 0,
      icon: BookOpen,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Completed Courses",
      value: stats.completedCourses || 0,
      icon: CheckCircle,
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Average Progress",
      value: `${(stats.averageProgress || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Last Updated",
      value: stats.lastUpdated
        ? new Date(stats.lastUpdated).toLocaleString()
        : "Never",
      icon: Clock,
      color: "bg-gray-50",
      iconColor: "text-gray-600",
      isTime: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">
          Overview of your learning management system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`${card.color} rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  {card.isTime ? (
                    <p className="text-xs text-gray-500">{card.value}</p>
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  )}
                </div>
                <Icon className={`${card.iconColor} w-8 h-8`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      {(stats.averageProgress || stats.averageProgress === 0) && (
        <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Overall Platform Progress
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.averageProgress, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {(stats.averageProgress || 0).toFixed(1)}% of courses completed
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminStats;
