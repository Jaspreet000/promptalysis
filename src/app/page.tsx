"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const features = [
    {
      title: "AI-Powered Analysis",
      description:
        "Get instant feedback on your prompts with advanced AI analysis",
      icon: "🤖",
    },
    {
      title: "Community Driven",
      description: "Learn from others and share your expertise",
      icon: "👥",
    },
    {
      title: "Real-time Scoring",
      description: "Understand your prompt's effectiveness instantly",
      icon: "📊",
    },
    {
      title: "Continuous Learning",
      description: "Improve your prompt engineering skills systematically",
      icon: "📈",
    },
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-10 animate-gradient" />
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
              Master the Art of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 block sm:inline">
                Prompt Engineering
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 sm:px-0">
              Elevate your AI interactions with our advanced prompt analysis
              platform. Get instant feedback, learn from the community, and
              perfect your prompts.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
              <Link
                href="/analyze"
                className="px-8 py-3 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
              >
                Try Now
              </Link>
              <Link
                href="/community"
                className="px-8 py-3 rounded-full text-indigo-600 bg-white hover:bg-gray-50 transition-colors font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
              >
                Explore Community
              </Link>
            </div>
          </motion.div>

          {/* Feature Graphics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 sm:mt-20 relative px-4 sm:px-0"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 sm:w-96 sm:h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-10 animate-pulse" />
            </div>
            <div className="relative">
              <Image
                src="/dashboard-preview.png"
                alt="Platform Preview"
                width={1200}
                height={600}
                className="rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="py-16 sm:py-24 bg-white dark:bg-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Why Choose Prompt Judge?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 px-4 sm:px-0">
              Unlock the full potential of AI with our comprehensive platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeIn}
                className="bg-gray-50 dark:bg-gray-700 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="bg-indigo-600 dark:bg-indigo-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-7xl mx-auto py-10 sm:py-12 px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "50K+", label: "Prompts Analyzed" },
              { value: "95%", label: "Satisfaction Rate" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-indigo-100">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center px-4 sm:px-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Ready to Perfect Your Prompts?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
              Join thousands of users who are mastering prompt engineering with
              our platform.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center px-6 sm:px-8 py-3 border border-transparent text-base sm:text-lg font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors w-full sm:w-auto justify-center"
            >
              Get Started Free
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
