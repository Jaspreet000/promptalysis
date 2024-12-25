"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UserActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected";
}

interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  status: "active" | "draft";
  createdAt: string;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for user activity chart
  const activityData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Active Users",
        data: [65, 72, 78, 74, 82, 85, 80],
        borderColor: "rgb(99, 102, 241)",
        tension: 0.4,
      },
      {
        label: "Average Score",
        data: [75, 78, 76, 79, 82, 81, 83],
        borderColor: "rgb(34, 197, 94)",
        tension: 0.4,
      },
    ],
  };

  // Mock data for recent activity
  const recentActivity: UserActivity[] = [
    {
      id: "1",
      user: "john.doe@example.com",
      action: "Created new prompt",
      timestamp: "2 minutes ago",
      status: "pending",
    },
    {
      id: "2",
      user: "jane.smith@example.com",
      action: "Posted in discussion",
      timestamp: "5 minutes ago",
      status: "approved",
    },
  ];

  // Mock data for prompt templates
  const promptTemplates: PromptTemplate[] = [
    {
      id: "1",
      title: "Technical Documentation Template",
      category: "Technical",
      status: "active",
      createdAt: "2024-03-20",
    },
    {
      id: "2",
      title: "Creative Story Prompt",
      category: "Creative",
      status: "draft",
      createdAt: "2024-03-19",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your platform and monitor user activity
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          {["overview", "moderation", "templates", "analytics"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              User Activity
            </h2>
            <div className="h-64">
              <Line
                data={activityData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {activity.timestamp}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      activity.status === "approved"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : activity.status === "rejected"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Prompt Templates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg lg:col-span-2"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Prompt Templates
              </h2>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                Add New Template
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {promptTemplates.map((template) => (
                    <tr key={template.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {template.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {template.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            template.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {template.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {template.createdAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
