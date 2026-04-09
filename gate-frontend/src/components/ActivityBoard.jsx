// src/components/ActivityBoard.jsx
import React, { useEffect, useState } from "react";
import API from "../api";

export default function ActivityBoard() {
  const [entries, setEntries] = useState([]);

  const fetchRecent = async () => {
    try {
      const res = await API.get("/daily-entry/recent");
      setEntries(res.data || []);
    } catch (err) {
      console.error("Error fetching entries:", err);
    }
  };

  useEffect(() => {
    fetchRecent();
    const interval = setInterval(fetchRecent, 5000); // auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const date = new Date(timeString);
      return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "Invalid Time";
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-indigo-600 mb-4">
        🕒 Recent Entries / Exits
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-indigo-100 text-indigo-700">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Roll No</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {entries.length > 0 ? (
              entries.map((e, idx) => (
                <tr
                  key={idx}
                  className="border-b last:border-none hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{e.name}</td>
                  <td className="px-4 py-2">{e.rollNo}</td>
                  <td className="px-4 py-2">
                    {e.action === "Exited" ? "Exited 🚪" : "Entered 🏫"}
                  </td>
                  <td className="px-4 py-2">{formatTime(e.time)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-3 text-center text-gray-500 italic"
                >
                  No recent activity yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
