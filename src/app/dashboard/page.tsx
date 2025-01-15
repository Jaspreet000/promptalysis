"use client";

import { useState, useEffect } from "react";
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
import { useSession } from "next-auth/react";

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

interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earnedAt: string;
}

interface Analysis {
  _id: string;
  prompt: string;
  mode: string;
  scores: {
    style: number;
    grammar: number;
    creativity: number;
    clarity: number;
    relevance: number;
  };
  createdAt: string;
}

interface DashboardStats {
  averageScores: {
    style: number;
    grammar: number;
    creativity: number;
    clarity: number;
    relevance: number;
  };
  totalAnalyses: number;
  modeStats: {
    [key: string]: {
      count: number;
      avgScore: number;
    };
  };
}

interface TrendData {
  date: string;
  avgScore: number;
  count: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/user/analysis");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      setAnalyses(data.analyses);
      setAchievements(data.achievements);
      setStats(data.stats);
      setTrend(data.trend);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again later.");
      console.error("Dashboard data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const scoreData = {
    labels: trend.map((t) => {
      const [year, month] = t.date.split("-");
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleString(
        "default",
        { month: "short" }
      );
    }),
    datasets: [
      {
        label: "Average Score",
        data: trend.map((t) => t.avgScore),
        borderColor: "rgb(99, 102, 241)",
        tension: 0.1,
      },
      {
        label: "Analyses Count",
        data: trend.map((t) => t.count),
        borderColor: "rgb(16, 185, 129)",
        tension: 0.1,
      },
    ],
  };

  const categoryData = stats
    ? {
        labels: ["Clarity", "Creativity", "Grammar", "Style", "Relevance"],
        datasets: [
          {
            data: [
              stats.averageScores.clarity,
              stats.averageScores.creativity,
              stats.averageScores.grammar,
              stats.averageScores.style,
              stats.averageScores.relevance,
            ],
            backgroundColor: [
              "#4F46E5",
              "#7C3AED",
              "#EC4899",
              "#F59E0B",
              "#10B981",
            ],
          },
        ],
      }
    : null;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            {stats && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Total Analyses: {stats.totalAnalyses}
              </p>
            )}
          </div>
          <button
            onClick={() => router.push("/analyze")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            New Analysis
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg animate-pulse"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Score Trend */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                >
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Score Trend
                  </h2>
                  <div className="h-64">
                    <Line
                      data={scoreData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                          },
                        },
                      }}
                    />
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
                    {categoryData && (
                      <Doughnut
                        data={categoryData}
                        options={{ maintainAspectRatio: false }}
                      />
                    )}
                  </div>
                </motion.div>

                {/* Mode Performance */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                >
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Mode Performance
                  </h2>
                  <div className="space-y-4">
                    {stats &&
                      Object.entries(stats.modeStats).map(([mode, data]) => (
                        <div
                          key={mode}
                          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                              {mode} Mode
                            </h3>
                            <span className="text-sm text-gray-500">
                              {data.count} analyses
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${Math.round(data.avgScore)}%` }}
                            ></div>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            Average Score: {Math.round(data.avgScore)}%
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>

                {/* Recent Analyses */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                >
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Recent Analyses
                  </h2>
                  <div className="space-y-4">
                    {analyses.map((analysis) => (
                      <div
                        key={analysis._id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <p className="text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                          {analysis.prompt}
                        </p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            Mode: {analysis.mode}
                          </span>
                          <span className="text-gray-500">
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Achievements Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                  Achievements
                </h2>
                <div className="space-y-4">
                  {achievements.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No achievements yet. Keep analyzing prompts to earn
                      badges!
                    </p>
                  ) : (
                    achievements.map((achievement) => (
                      <motion.div
                        key={achievement._id}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-100 dark:border-indigo-800"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {achievement.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {achievement.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Earned{" "}
                              {new Date(
                                achievement.earnedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
