import React from "react";

export default function UserSwitcher({
  users = [],
  loading,
  error,
  activeUserId,
  onChange,
}) {
  return (
    <div>
      <label className="text-xs text-slate-500 mb-1 block">Active User</label>
      {loading ? (
        <div className="h-10 w-full bg-slate-100 rounded animate-pulse" />
      ) : error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : (
        <select
          className="w-full h-10 px-3 rounded border border-slate-200 bg-white text-sm"
          value={activeUserId || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select user</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name || u.email || `User ${u.id}`}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
