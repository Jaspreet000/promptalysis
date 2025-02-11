"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Container, Engine, ISourceOptions } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setMounted(true);
    });
  }, []);

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
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {mounted && (
        <Particles
          id="tsparticles"
          options={{
            background: {
              color: {
                value: "transparent",
              },
            },
            fpsLimit: 120,
            particles: {
              color: {
                value: "#ffffff",
              },
              links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.2,
                width: 1,
              },
              move: {
                enable: true,
                speed: 1,
              },
              number: {
                value: 40,
              },
              opacity: {
                value: 0.2,
              },
              size: {
                value: { min: 1, max: 3 },
              },
            },
          }}
          className="absolute inset-0 z-0"
        />
      )}

      {/* Hero Section */}
      <div className="relative">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-x" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/30 to-gray-900" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-gray-900/60 to-gray-900" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center relative z-10"
          >
            {/* Glowing orb behind title */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl" />

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight relative">
              Master the Art of{" "}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
                  Prompt Engineering
                </span>
                <span className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur opacity-30 group-hover:opacity-100 transition duration-1000"></span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl text-gray-300 mb-8 sm:mb-10 max-w-3xl mx-auto px-4 sm:px-0 relative z-10"
            >
              Elevate your AI interactions with our advanced prompt analysis
              platform. Get instant feedback, learn from the community, and
              perfect your prompts.
            </motion.p>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/analyze"
                  className="group relative px-8 py-4 rounded-full text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto inline-block"
                >
                  <span className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000"></span>
                  <span className="relative">Try Now</span>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/community"
                  className="group relative px-8 py-4 rounded-full text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto inline-block"
                >
                  <span className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-20 group-hover:opacity-30 transition duration-1000"></span>
                  <span className="relative">Explore Community</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Feature Graphics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 sm:mt-24 relative px-4 sm:px-0"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-indigo-500 rounded-full filter blur-[100px] opacity-20 animate-pulse" />
            </div>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30"></div>
              <video
                src="/dashboard-preview.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="relative rounded-xl shadow-2xl border border-gray-700/50 w-full"
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
        className="py-24 sm:py-32 relative z-10 bg-gray-900/50 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose Prompt Judge?
            </h2>
            <p className="text-xl text-gray-300 px-4 sm:px-0">
              Unlock the full potential of AI with our comprehensive platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeIn}
                whileHover={{ scale: 1.05 }}
                className="group relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative bg-gray-800/50 backdrop-blur-xl p-8 rounded-xl border border-gray-700/50">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20"></div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative"
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
                className="text-center group"
              >
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2 relative">
                  <span className="relative z-10">{stat.value}</span>
                  <span className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur opacity-30 group-hover:opacity-75 transition duration-1000"></span>
                </div>
                <div className="text-lg text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-7xl mx-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20"></div>
            <div className="relative bg-gray-800/50 backdrop-blur-xl p-8 sm:p-12 rounded-2xl border border-gray-700/50">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Perfect Your Prompts?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of users who are mastering prompt engineering
                with our platform.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/signup"
                  className="group relative inline-flex items-center px-8 py-4 rounded-full text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-300 font-medium text-lg"
                >
                  <span className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000"></span>
                  <span className="relative">Get Started Free</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
