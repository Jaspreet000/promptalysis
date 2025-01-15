"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import RichTextEditor from "@/components/RichTextEditor";
import type { Post, Template, Challenge } from "@/types/post";

export default function CommunityPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [showNewChallengeForm, setShowNewChallengeForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const [tags, setTags] = useState<string[]>([]);
  const [challengeDeadline, setChallengeDeadline] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  useEffect(() => {
    fetchPosts();
    fetchTemplates();
    fetchChallenges();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const fetchChallenges = async () => {
    try {
      const response = await fetch("/api/challenges");
      const data = await response.json();
      setChallenges(data);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: editorContent,
          prompt,
          category,
          fromTemplate: selectedTemplate?._id,
        }),
      });

      if (response.ok) {
        setShowNewPostForm(false);
        setTitle("");
        setContent("");
        setPrompt("");
        setCategory("");
        setEditorContent("");
        setSelectedTemplate(null);
        fetchPosts();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: editorContent,
          category,
          difficulty,
          tags,
        }),
      });

      if (response.ok) {
        setShowNewTemplateForm(false);
        setTitle("");
        setContent("");
        setCategory("");
        setDifficulty("intermediate");
        setTags([]);
        setEditorContent("");
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: editorContent,
          prompt,
          category,
          deadline: challengeDeadline,
        }),
      });

      if (response.ok) {
        setShowNewChallengeForm(false);
        setTitle("");
        setContent("");
        setPrompt("");
        setCategory("");
        setChallengeDeadline("");
        setEditorContent("");
        fetchChallenges();
      }
    } catch (error) {
      console.error("Error creating challenge:", error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLikeTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error liking template:", error);
    }
  };

  const handleUseTemplate = async (template: Template) => {
    if (!session?.user) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/${template._id}/use`, {
        method: "POST",
      });

      if (response.ok) {
        setTitle(`[From Template] ${template.title}`);
        setEditorContent(template.content);
        setCategory(template.category);
        setSelectedTemplate(template);
        setShowNewPostForm(true);
        setActiveTab("posts");

        fetchTemplates();
      }
    } catch (error) {
      console.error("Error using template:", error);
    }
  };

  const handleSubmitChallenge = async (
    challengeId: string,
    content: string
  ) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        fetchChallenges();
      }
    } catch (error) {
      console.error("Error submitting to challenge:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete challenge");
      }

      // Refresh the challenges list
      fetchChallenges();
    } catch (error) {
      console.error("Error deleting challenge:", error);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const PostCard = ({ post }: { post: Post }) => {
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const [isLiked, setIsLiked] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
      if (session?.user?.id) {
        setIsLiked(post.likes.includes(session.user.id));
      }
    }, [post.likes, session?.user?.id]);

    const handleSubmitComment = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleComment(post._id, commentContent);
      setCommentContent("");
      setShowCommentForm(false);
    };

    return (
      <motion.div
        key={post._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01] border border-gray-100/50 dark:border-gray-700/50"
      >
        {/* Header Section */}
        <div className="relative">
          <div className="absolute top-4 right-4 flex space-x-2">
            {session?.user?.id === post.author.id && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDeletePost(post._id)}
                className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </motion.button>
            )}
          </div>

          <div className="p-8">
            {/* Author Info */}
            <div className="flex items-center space-x-4 mb-6">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={post.author.image || "/default-avatar.png"}
                alt={post.author.name}
                className="w-12 h-12 rounded-full ring-2 ring-gray-100 dark:ring-gray-700"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {post.author.name} •{" "}
                  {format(new Date(post.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            {/* Category Badge */}
            <div className="flex flex-wrap gap-2 mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400"
              >
                {post.category}
              </motion.div>
            </div>

            {/* Post Content */}
            <div className="prose dark:prose-invert max-w-none mb-6">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* Interaction Section */}
            <div className="flex items-center justify-between py-4 px-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center space-x-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLike(post._id)}
                  className={`flex items-center space-x-2 group ${
                    isLiked
                      ? "text-red-500"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-all duration-300 ${
                      isLiked
                        ? "fill-current scale-110"
                        : "stroke-current fill-none group-hover:text-red-500"
                    }`}
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="font-medium">{post.likes.length}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCommentForm(!showCommentForm)}
                  className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 group hover:text-indigo-500 dark:hover:text-indigo-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 transition-colors duration-200 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="font-medium">{post.comments.length}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {(showCommentForm || post.comments.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-100 dark:border-gray-700"
            >
              {/* Comment Form */}
              {showCommentForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-gray-50 dark:bg-gray-800/50"
                >
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setShowCommentForm(false)}
                        className="px-6 py-2 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-sm hover:shadow"
                      >
                        Post Comment
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Existing Comments */}
              {post.comments.length > 0 && (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {post.comments.map((comment, index) => (
                    <motion.div
                      key={comment._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <img
                            src={comment.author.image || "/default-avatar.png"}
                            alt={comment.author.name}
                            className="w-10 h-10 rounded-full ring-2 ring-gray-100 dark:ring-gray-700"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {comment.author.name}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                •{" "}
                                {format(
                                  new Date(comment.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </div>
                            <p className="mt-1 text-gray-700 dark:text-gray-300">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                        {session?.user?.id === comment.author.id && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleDeleteComment(post._id, comment._id)
                            }
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const TemplateCard = ({ template }: { template: Template }) => {
    const { data: session } = useSession();
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
      if (session?.user?.id) {
        setIsLiked(template.likes.includes(session.user.id));
      }
    }, [template.likes, session?.user?.id]);

    return (
      <motion.div
        key={template._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01] border border-gray-100/50 dark:border-gray-700/50"
      >
        {/* Header Section */}
        <div className="relative">
          <div className="absolute top-4 right-4 flex space-x-2">
            {session?.user?.id === template.author.id && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDeleteTemplate(template._id)}
                className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </motion.button>
            )}
          </div>

          <div className="p-8">
            {/* Author Info */}
            <div className="flex items-center space-x-4 mb-6">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={template.author.image || "/default-avatar.png"}
                alt={template.author.name}
                className="w-12 h-12 rounded-full ring-2 ring-gray-100 dark:ring-gray-700"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {template.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {template.author.name} •{" "}
                  {format(new Date(template.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400"
              >
                {template.category}
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  template.difficulty === "beginner"
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-400"
                    : template.difficulty === "intermediate"
                    ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 text-yellow-600 dark:text-yellow-400"
                    : "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-600 dark:text-red-400"
                }`}
              >
                {template.difficulty.charAt(0).toUpperCase() +
                  template.difficulty.slice(1)}
              </motion.div>
            </div>

            {/* Template Content */}
            <div className="prose dark:prose-invert max-w-none mb-6 line-clamp-3">
              <div dangerouslySetInnerHTML={{ __html: template.content }} />
            </div>

            {/* Interaction Section */}
            <div className="flex items-center justify-between py-4 px-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-6">
              <div className="flex items-center space-x-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleUseTemplate(template)}
                  className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 group hover:text-indigo-500 dark:hover:text-indigo-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 transition-colors duration-200 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                    />
                  </svg>
                  <span className="font-medium">
                    {template.usageCount} Uses
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLikeTemplate(template._id)}
                  className={`flex items-center space-x-2 group ${
                    isLiked
                      ? "text-red-500"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-all duration-300 ${
                      isLiked
                        ? "fill-current scale-110"
                        : "stroke-current fill-none group-hover:text-red-500"
                    }`}
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="font-medium">
                    {template.likes.length} Likes
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Tags Section */}
            {template.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2"
              >
                {template.tags.map((tag) => (
                  <motion.span
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    #{tag}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [submissionContent, setSubmissionContent] = useState("");
    const [showSubmissions, setShowSubmissions] = useState(false);
    const { data: session } = useSession();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleSubmitChallenge(challenge._id, submissionContent);
      setShowSubmitForm(false);
      setSubmissionContent("");
    };

    const hasSubmitted =
      session?.user?.id &&
      challenge.submissions.some((sub) => sub.author.id === session.user.id);

    const isExpired = new Date(challenge.deadline) < new Date();
    const isAuthor = session?.user?.id === challenge.author.id;

    return (
      <motion.div
        key={challenge._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01] border border-gray-100/50 dark:border-gray-700/50"
      >
        {/* Header Section */}
        <div className="relative">
          <div className="absolute top-4 right-4 flex space-x-2">
            {isAuthor && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDeleteChallenge(challenge._id)}
                className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </motion.button>
            )}
          </div>

          <div className="p-8">
            {/* Author Info */}
            <div className="flex items-center space-x-4 mb-6">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={challenge.author.image || "/default-avatar.png"}
                alt={challenge.author.name}
                className="w-12 h-12 rounded-full ring-2 ring-gray-100 dark:ring-gray-700"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {challenge.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {challenge.author.name} •{" "}
                  {format(new Date(challenge.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400"
              >
                {challenge.category}
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  isExpired
                    ? "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-600 dark:text-red-400"
                    : "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-400"
                }`}
              >
                {isExpired ? "Expired" : "Active"}
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => isAuthor && setShowSubmissions(!showSubmissions)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-600 dark:text-blue-400 ${
                  isAuthor ? "cursor-pointer hover:shadow-md" : "cursor-default"
                }`}
              >
                {challenge.submissions.length} Submissions
              </motion.button>
            </div>

            {/* Challenge Description */}
            <div className="prose dark:prose-invert max-w-none mb-6">
              <div
                dangerouslySetInnerHTML={{ __html: challenge.description }}
              />
            </div>

            {/* Deadline Section */}
            <div className="flex items-center justify-between py-4 px-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-6">
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${
                    isExpired ? "text-red-500" : "text-green-500"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Deadline:
                </span>
              </div>
              <span
                className={`font-medium ${
                  isExpired
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {format(new Date(challenge.deadline), "MMM d, yyyy")}
              </span>
            </div>

            {/* Submissions Section for Challenge Creator */}
            <AnimatePresence>
              {isAuthor &&
                showSubmissions &&
                challenge.submissions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden">
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30">
                        <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">
                          Challenge Submissions
                        </h4>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {challenge.submissions.map((submission, index) => (
                          <motion.div
                            key={submission._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200"
                          >
                            <div className="flex items-start space-x-4">
                              <img
                                src={
                                  submission.author.image ||
                                  "/default-avatar.png"
                                }
                                alt={submission.author.name}
                                className="w-10 h-10 rounded-full ring-2 ring-gray-100 dark:ring-gray-700"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                      {submission.author.name}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                      •{" "}
                                      {format(
                                        new Date(submission.createdAt),
                                        "MMM d, yyyy"
                                      )}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-2 prose dark:prose-invert max-w-none">
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: submission.content,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>

            {/* Submission Form */}
            <AnimatePresence>
              {session && !hasSubmitted && !isExpired && !isAuthor && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {showSubmitForm ? (
                    <motion.form
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <RichTextEditor
                        content={submissionContent}
                        onChange={setSubmissionContent}
                        placeholder="Write your submission..."
                      />
                      <div className="flex justify-end space-x-3">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowSubmitForm(false)}
                          className="px-6 py-2 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          Submit Solution
                        </motion.button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowSubmitForm(true)}
                      className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center space-x-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>Submit Solution</span>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Messages */}
            {hasSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center space-x-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">
                  You have submitted to this challenge
                </span>
              </motion.div>
            )}

            {isExpired && !hasSubmitted && !isAuthor && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center space-x-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">This challenge has expired</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderNewPostForm = () => (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg mb-8"
      onSubmit={handleCreatePost}
    >
      <div className="space-y-6">
        {selectedTemplate && (
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  Creating post from template:
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                  {selectedTemplate.title}
                </p>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedTemplate(null);
                  setTitle("");
                  setEditorContent("");
                  setCategory("");
                }}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
          />
          <input
            type="text"
            placeholder="Prompt (optional)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
          >
            <option value="">Select Category</option>
            <option value="technical">Technical</option>
            <option value="creative">Creative</option>
            <option value="academic">Academic</option>
            <option value="business">Business</option>
            <option value="casual">Casual</option>
          </select>
          <RichTextEditor
            content={editorContent}
            onChange={setEditorContent}
            placeholder="Write your post content..."
          />
          <div className="flex justify-end space-x-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowNewPostForm(false);
                setSelectedTemplate(null);
                setTitle("");
                setEditorContent("");
                setCategory("");
              }}
              className="px-6 py-2 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-sm hover:shadow"
            >
              Create Post
            </motion.button>
          </div>
        </div>
      </div>
    </motion.form>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          {["posts", "templates", "challenges"].map((tab) => (
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
        {activeTab === "posts" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Community Posts
              </h2>
              {session && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowNewPostForm(true)}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-sm hover:shadow"
                >
                  Create Post
                </motion.button>
              )}
            </div>

            {showNewPostForm && renderNewPostForm()}

            <div className="space-y-8">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Templates
              </h2>
              {session && (
                <button
                  onClick={() => setShowNewTemplateForm(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                >
                  Create Template
                </button>
              )}
            </div>

            {showNewTemplateForm && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8"
                onSubmit={handleCreateTemplate}
              >
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="technical">Technical</option>
                    <option value="creative">Creative</option>
                    <option value="academic">Academic</option>
                    <option value="business">Business</option>
                    <option value="casual">Casual</option>
                  </select>
                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(
                        e.target.value as
                          | "beginner"
                          | "intermediate"
                          | "advanced"
                      )
                    }
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Tags (comma-separated)"
                    onChange={(e) =>
                      setTags(
                        e.target.value.split(",").map((tag) => tag.trim())
                      )
                    }
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                  <RichTextEditor
                    content={editorContent}
                    onChange={setEditorContent}
                    placeholder="Write your template content..."
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowNewTemplateForm(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </motion.form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard key={template._id} template={template} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "challenges" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Challenges
              </h2>
              {session && (
                <button
                  onClick={() => setShowNewChallengeForm(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                >
                  Create Challenge
                </button>
              )}
            </div>

            {showNewChallengeForm && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8"
                onSubmit={handleCreateChallenge}
              >
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="technical">Technical</option>
                    <option value="creative">Creative</option>
                    <option value="academic">Academic</option>
                    <option value="business">Business</option>
                    <option value="casual">Casual</option>
                  </select>
                  <input
                    type="datetime-local"
                    value={challengeDeadline}
                    onChange={(e) => setChallengeDeadline(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                  <RichTextEditor
                    content={editorContent}
                    onChange={setEditorContent}
                    placeholder="Write your challenge description..."
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowNewChallengeForm(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </motion.form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <ChallengeCard key={challenge._id} challenge={challenge} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
