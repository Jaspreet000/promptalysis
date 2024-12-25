"use client";

import { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import { getPromptTemplate, getModeExamples } from "@/lib/gemini";

interface ScoreMetrics {
  style: number;
  grammar: number;
  creativity: number;
  clarity: number;
  relevance: number;
}

interface AnalysisError {
  message: string;
  type: "api" | "validation" | "network" | "unknown";
}

interface AnalysisResult {
  promptResult: string;
  response: string;
  scores: ScoreMetrics;
  suggestions: string[];
}

export default function AnalyzePage() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("casual");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [scores, setScores] = useState<ScoreMetrics>({
    style: 0,
    grammar: 0,
    creativity: 0,
    clarity: 0,
    relevance: 0,
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<AnalysisError | null>(null);
  const [promptResult, setPromptResult] = useState("");
  const { data: session, status: sessionStatus } = useSession();
  const [template, setTemplate] = useState("");
  const [examples, setExamples] = useState<string[]>([]);

  const overallScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / 5
  );

  const resetAnalysis = () => {
    setAiResponse("");
    setScores({
      style: 0,
      grammar: 0,
      creativity: 0,
      clarity: 0,
      relevance: 0,
    });
    setSuggestions([]);
    setError(null);
  };

  const handleAnalyze = async () => {
    // Input validation
    if (!prompt.trim()) {
      setError({
        message: "Please enter a prompt to analyze",
        type: "validation",
      });
      return;
    }

    if (prompt.length > 1000) {
      setError({
        message: "Prompt is too long. Maximum 1000 characters allowed.",
        type: "validation",
      });
      return;
    }

    setIsAnalyzing(true);
    resetAnalysis();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          mode,
          userId: session?.user?.id,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          response.status === 429
            ? "Too many requests. Please try again later."
            : "Failed to analyze prompt"
        );
      }

      const data = await response.json();
      setPromptResult(data.promptResult);
      setAiResponse(data.response);
      setScores(data.scores);
      setSuggestions(data.suggestions);
    } catch (error: any) {
      console.error("Analysis error:", error);
      if (error.name === "AbortError") {
        setError({
          message: "Analysis took too long. Please try again.",
          type: "network",
        });
      } else if (error.name === "TypeError" && !navigator.onLine) {
        setError({
          message: "No internet connection. Please check your network.",
          type: "network",
        });
      } else {
        setError({
          message:
            error.message || "Failed to analyze prompt. Please try again.",
          type: "api",
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    setTemplate(getPromptTemplate(newMode));
    setExamples(getModeExamples(newMode));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Section */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-between items-center mb-4"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Write Your Prompt
                </h2>
                <motion.select
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  value={mode}
                  onChange={(e) => handleModeChange(e.target.value)}
                  className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                  disabled={isAnalyzing}
                >
                  <option value="casual">Casual Mode</option>
                  <option value="technical">Technical Mode</option>
                  <option value="creative">Creative Mode</option>
                </motion.select>
              </motion.div>
              <motion.textarea
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "10rem", opacity: 1 }}
                transition={{ delay: 0.4 }}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (error?.type === "validation") setError(null);
                }}
                placeholder="Enter your prompt here..."
                className="w-full p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={isAnalyzing}
              />
              <div className="flex justify-between items-center mt-2">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm ${
                    prompt.length > 900
                      ? "text-red-500"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {prompt.length}/1000 characters
                </motion.span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || prompt.length === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isAnalyzing ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    "Analyze Prompt"
                  )}
                </motion.button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg ${
                    error.type === "validation"
                      ? "bg-yellow-50 dark:bg-yellow-900/30"
                      : "bg-red-50 dark:bg-red-900/30"
                  }`}
                >
                  <div className="flex items-center">
                    <svg
                      className={`h-5 w-5 mr-3 ${
                        error.type === "validation"
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p
                      className={`text-sm ${
                        error.type === "validation"
                          ? "text-yellow-700 dark:text-yellow-200"
                          : "text-red-700 dark:text-red-200"
                      }`}
                    >
                      {error.message}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Prompt Result Section */}
            <AnimatePresence>
              {promptResult && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Answer
                    </h2>
                    <span className="px-3 py-1 text-sm rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      {mode} Mode
                    </span>
                  </div>
                  <div className="prose prose-indigo dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {children}
                          </p>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            {children}
                          </a>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-4 space-y-2">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-4 space-y-2">
                            {children}
                          </ol>
                        ),
                        code: ({ children }) => (
                          <code className="bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-gray-100 dark:bg-gray-700 rounded p-4 overflow-x-auto">
                            {children}
                          </pre>
                        ),
                      }}
                    >
                      {promptResult}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Template for {mode} mode
                </h3>
                <button
                  onClick={() => setPrompt(template)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Use Template
                </button>
              </div>
              <pre className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md overflow-x-auto">
                {template}
              </pre>
            </div>

            {/* Example Prompts */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Example Prompts
              </h3>
              <div className="space-y-2">
                {examples.map((example, index) => (
                  <div
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {example}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Analysis Section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Score Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Prompt Analysis
              </h2>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 gap-6"
              >
                <div className="col-span-2 flex justify-center">
                  <div style={{ width: 200, height: 200 }}>
                    <CircularProgressbar
                      value={overallScore}
                      text={`${overallScore}%`}
                      styles={buildStyles({
                        pathColor: `rgba(79, 70, 229, ${overallScore / 100})`,
                        textColor: "#4F46E5",
                        trailColor: "#d6d6d6",
                        pathTransition: "ease-out",
                      })}
                    />
                  </div>
                </div>
                {Object.entries(scores).map(([metric, score], index) => (
                  <motion.div
                    key={metric}
                    initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {metric}
                      </span>
                      <span className="text-sm text-gray-500">{score}%</span>
                    </div>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                        className="bg-indigo-600 rounded"
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* AI Analysis Section */}
            <AnimatePresence>
              {aiResponse && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 overflow-hidden"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Analysis
                  </h2>
                  <div className="space-y-4">
                    <div className="prose prose-indigo dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="text-gray-700 dark:text-gray-300">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-gray-900 dark:text-white">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="text-gray-800 dark:text-gray-200">
                              {children}
                            </em>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">
                              {children}
                            </h3>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-4 space-y-2 mt-2">
                              {children}
                            </ul>
                          ),
                          li: ({ children }) => (
                            <li className="text-gray-700 dark:text-gray-300">
                              {children}
                            </li>
                          ),
                        }}
                      >
                        {aiResponse}
                      </ReactMarkdown>
                    </div>
                    {suggestions.length > 0 && (
                      <div className="mt-6 border-t dark:border-gray-700 pt-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Suggestions for Improvement
                        </h3>
                        <ul className="space-y-2">
                          {suggestions.map((suggestion, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                            >
                              <span className="text-indigo-600 dark:text-indigo-400 mt-1">
                                •
                              </span>
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <span>{children}</span>,
                                }}
                              >
                                {suggestion}
                              </ReactMarkdown>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
