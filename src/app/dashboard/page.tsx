"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useRouter } from "next/navigation";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface SavedPrompt {
  id: number;
  text: string;
  score: number;
  date: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const scoreData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Score Trend",
        data: [65, 78, 72, 85, 82, 90],
        borderColor: "rgb(99, 102, 241)",
        tension: 0.1,
      },
    ],
  };

  const categoryData = {
    labels: ["Clarity", "Creativity", "Grammar", "Style", "Relevance"],
    datasets: [
      {
        data: [85, 92, 78, 88, 95],
        backgroundColor: [
          "#4F46E5",
          "#7C3AED",
          "#EC4899",
          "#F59E0B",
          "#10B981",
        ],
      },
    ],
  };

  const savedPrompts: SavedPrompt[] = [
    {
      id: 1,
      text: "Explain quantum computing to a 5-year-old",
      score: 92,
      date: "2024-03-20",
    },
    {
      id: 2,
      text: "Write a creative story about a time-traveling cat",
      score: 88,
      date: "2024-03-19",
    },
  ];

  const achievements: Achievement[] = [
    {
      id: 1,
      title: "Prompt Wizard",
      description: "Score above 90 on 5 consecutive prompts",
      icon: "🧙‍♂️",
      earned: true,
    },
    {
      id: 2,
      title: "Creative Genius",
      description: "Achieve perfect creativity score",
      icon: "🎨",
      earned: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <button
            onClick={() => router.push("/analyze")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            New Analysis
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          {["overview", "leaderboard", "saved", "achievements"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md capitalize ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Performance Overview */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Score Trend
            </h2>
            <div className="h-64">
              <Line data={scoreData} options={{ maintainAspectRatio: false }} />
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Category Breakdown
            </h2>
            <div className="h-64">
              <Doughnut
                data={categoryData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </motion.div>

          {/* Saved Prompts */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Recent Prompts
            </h2>
            <div className="space-y-4">
              {savedPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-md"
                >
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    {prompt.text}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Score: {prompt.score}</span>
                    <span className="text-gray-500">{prompt.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Achievements
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-md ${
                    achievement.earned
                      ? "bg-indigo-50 dark:bg-indigo-900/30"
                      : "bg-gray-50 dark:bg-gray-700/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{achievement.icon}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {achievement.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
