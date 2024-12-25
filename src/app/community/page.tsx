"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import type { Post, Template, Challenge, Submission } from "@/types/post";
import dynamic from "next/dynamic";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { format, isAfter } from "date-fns";

// Dynamic import for the rich text editor
const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
});

export default function CommunityPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    prompt: "",
    category: "general",
  });
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [activePost, setActivePost] = useState<string | null>(null);
  const [view, setView] = useState<"posts" | "templates" | "challenges">(
    "posts"
  );
  const [templates, setTemplates] = useState<Template[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [newSubmission, setNewSubmission] = useState({
    challengeId: "",
    content: "",
  });
  const [templateCategory, setTemplateCategory] = useState("all");
  const [templateDifficulty, setTemplateDifficulty] = useState("all");
  const [challengeDeadline, setChallengeDeadline] = useState("");
  const [editorContent, setEditorContent] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  useEffect(() => {
    if (view === "templates") fetchTemplates();
    if (view === "challenges") fetchChallenges();
  }, [view]);

  const fetchPosts = async () => {
    try {
      const url =
        selectedCategory === "all"
          ? "/api/posts"
          : `/api/posts?category=${selectedCategory}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch posts");

      const data = await response.json();
      setPosts(data);
    } catch (error) {
      setError("Failed to load posts");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) throw new Error("Failed to create post");

      const post = await response.json();
      setPosts((prev) => [post, ...prev]);
      setShowNewPostForm(false);
      setNewPost({ title: "", content: "", prompt: "", category: "general" });
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!session) return;

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to like post");

      const updatedPost = await response.json();
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!session || !newComment.trim()) return;

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) throw new Error("Failed to add comment");

      const updatedPost = await response.json();
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? updatedPost : post))
      );
      setNewComment("");
      setActivePost(null);
    } catch (error) {
      console.error("Error commenting:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
      if (!response.ok) throw new Error("Failed to fetch templates");
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchChallenges = async () => {
    try {
      const response = await fetch("/api/challenges");
      if (!response.ok) throw new Error("Failed to fetch challenges");
      const data = await response.json();
      setChallenges(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitChallenge = async (challengeId: string) => {
    if (!session) return;

    try {
      const response = await fetch(
        `/api/challenges/${challengeId}/submissions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newSubmission.content }),
        }
      );

      if (!response.ok) throw new Error("Failed to submit");

      const updatedChallenge = await response.json();
      setChallenges((prev) =>
        prev.map((challenge) =>
          challenge._id === challengeId ? updatedChallenge : challenge
        )
      );
      setNewSubmission({ challengeId: "", content: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const useTemplate = (template: Template) => {
    setNewPost((prev) => ({
      ...prev,
      content: template.content,
      category: template.category,
    }));
    setShowNewPostForm(true);
  };

  const validateSubmission = (
    content: string,
    deadline: string
  ): string | null => {
    if (!content.trim()) return "Content cannot be empty";
    if (content.length < 50) return "Submission must be at least 50 characters";
    if (deadline && isAfter(new Date(), new Date(deadline))) {
      return "Challenge deadline has passed";
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setView("posts")}
            className={`px-4 py-2 rounded-md ${
              view === "posts"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setView("templates")}
            className={`px-4 py-2 rounded-md ${
              view === "templates"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setView("challenges")}
            className={`px-4 py-2 rounded-md ${
              view === "challenges"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Challenges
          </button>
        </div>

        {/* Content Sections */}
        {view === "posts" && (
          <>
            {/* Category Filter */}
            <div className="mb-8 flex justify-between items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="technical">Technical</option>
                <option value="creative">Creative</option>
                <option value="general">General</option>
              </select>

              {session && (
                <button
                  onClick={() => setShowNewPostForm(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Create Post
                </button>
              )}
            </div>

            {/* Posts List */}
            <div className="space-y-6">
              {posts.map((post) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Posted by {post.author.name} •{" "}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-sm rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                      {post.category}
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {post.content}
                  </p>

                  {post.prompt && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {post.prompt}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center space-x-1 ${
                        session?.user?.id && post.likes.includes(session.user.id)
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <span>❤</span>
                      <span>{post.likes.length}</span>
                    </button>

                    <button
                      onClick={() =>
                        setActivePost(activePost === post._id ? null : post._id)
                      }
                      className="text-gray-500 dark:text-gray-400 flex items-center space-x-1"
                    >
                      <span>💬</span>
                      <span>{post.comments.length}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {activePost === post._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 space-y-4"
                      >
                        {post.comments.map((comment) => (
                          <div
                            key={comment._id}
                            className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md"
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              {comment.author.image && (
                                <img
                                  src={comment.author.image}
                                  alt={comment.author.name}
                                  className="w-6 h-6 rounded-full"
                                />
                              )}
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {comment.author.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  comment.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              {comment.content}
                            </p>
                          </div>
                        ))}

                        {session && (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Add a comment..."
                              className="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                            <button
                              onClick={() => handleComment(post._id)}
                              disabled={!newComment.trim()}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            >
                              Post
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* New Post Modal */}
            <AnimatePresence>
              {showNewPostForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full"
                  >
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                      Create New Post
                    </h2>
                    <form onSubmit={handleCreatePost} className="space-y-4">
                      <input
                        type="text"
                        value={newPost.title}
                        onChange={(e) =>
                          setNewPost({ ...newPost, title: e.target.value })
                        }
                        placeholder="Title"
                        className="w-full rounded-md"
                        required
                      />
                      <textarea
                        value={newPost.content}
                        onChange={(e) =>
                          setNewPost({ ...newPost, content: e.target.value })
                        }
                        placeholder="Content"
                        className="w-full rounded-md"
                        rows={4}
                        required
                      />
                      <textarea
                        value={newPost.prompt}
                        onChange={(e) =>
                          setNewPost({ ...newPost, prompt: e.target.value })
                        }
                        placeholder="Prompt (optional)"
                        className="w-full rounded-md"
                        rows={2}
                      />
                      <select
                        value={newPost.category}
                        onChange={(e) =>
                          setNewPost({ ...newPost, category: e.target.value })
                        }
                        className="w-full rounded-md"
                      >
                        <option value="general">General</option>
                        <option value="technical">Technical</option>
                        <option value="creative">Creative</option>
                      </select>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowNewPostForm(false)}
                          className="px-4 py-2 text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Create
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {view === "templates" && (
          <div className="space-y-6">
            <div className="flex space-x-4 mb-6">
              <select
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
                className="rounded-md border-gray-300"
              >
                <option value="all">All Categories</option>
                <option value="technical">Technical</option>
                <option value="creative">Creative</option>
                <option value="academic">Academic</option>
                <option value="business">Business</option>
                <option value="casual">Casual</option>
              </select>

              <select
                value={templateDifficulty}
                onChange={(e) => setTemplateDifficulty(e.target.value)}
                className="rounded-md border-gray-300"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              {session && (
                <button
                  onClick={() => setShowNewTemplateForm(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                >
                  Create Template
                </button>
              )}
            </div>

            {/* Template list with filtering */}
            <div className="grid gap-6">
              {templates
                .filter(
                  (t) =>
                    (templateCategory === "all" ||
                      t.category === templateCategory) &&
                    (templateDifficulty === "all" ||
                      t.difficulty === templateDifficulty)
                )
                .map((template) => (
                  <motion.div
                    key={template._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                  >
                    {/* Existing template content */}
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
                      <span
                        className={`px-2 py-1 rounded ${
                          template.difficulty === "beginner"
                            ? "bg-green-100 text-green-800"
                            : template.difficulty === "intermediate"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {template.difficulty}
                      </span>
                      {template.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {view === "challenges" && (
          <div className="space-y-6">
            {session && (
              <button
                onClick={() => setShowNewChallengeForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Create Challenge
              </button>
            )}

            {challenges.map((challenge) => (
              <motion.div
                key={challenge._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                {/* Existing challenge content */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    Deadline: {format(new Date(challenge.deadline), "PPP")}
                  </div>
                  {isAfter(new Date(challenge.deadline), new Date()) ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-600">Closed</span>
                  )}
                </div>

                {/* Submission form with rich text editor */}
                {session &&
                  isAfter(new Date(challenge.deadline), new Date()) && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const error = validateSubmission(
                          newSubmission.content,
                          challenge.deadline
                        );
                        if (error) {
                          setError(error);
                          return;
                        }
                        handleSubmitChallenge(challenge._id);
                      }}
                      className="mt-4"
                    >
                      <RichTextEditor
                        content={newSubmission.content}
                        onChange={(content) =>
                          setNewSubmission({
                            challengeId: challenge._id,
                            content,
                          })
                        }
                        placeholder="Your submission..."
                      />
                      {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                      )}
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md mt-2"
                      >
                        Submit
                      </button>
                    </form>
                  )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
