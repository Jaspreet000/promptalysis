"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
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
        }),
      });

      if (response.ok) {
        setShowNewPostForm(false);
        setTitle("");
        setContent("");
        setPrompt("");
        setCategory("");
        setEditorContent("");
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
                <button
                  onClick={() => setShowNewPostForm(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                >
                  Create Post
                </button>
              )}
            </div>

            {showNewPostForm && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8"
                onSubmit={handleCreatePost}
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
                  <RichTextEditor
                    content={editorContent}
                    onChange={setEditorContent}
                    placeholder="Write your post content..."
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowNewPostForm(false)}
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

            <div className="space-y-6">
              {posts.map((post) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={post.author.image || "/default-avatar.png"}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {post.author.name} •{" "}
                        {format(new Date(post.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div
                    className="prose dark:prose-invert mb-4"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center space-x-1 ${
                          session?.user?.id &&
                          post.likes.includes(session.user.id)
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        <span>{post.likes.length} Likes</span>
                      </button>
                      <span className="text-gray-500 dark:text-gray-400">
                        {post.comments.length} Comments
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      {post.category}
                    </span>
                  </div>
                </motion.div>
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
                <motion.div
                  key={template._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={template.author.image || "/default-avatar.png"}
                      alt={template.author.name}
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {template.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {template.author.name} •{" "}
                        {format(new Date(template.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div
                    className="prose dark:prose-invert mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: template.content }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500 dark:text-gray-400">
                        {template.usageCount} Uses
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {template.likes.length} Likes
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded mb-2">
                        {template.category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {template.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
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
                <motion.div
                  key={challenge._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={challenge.author.image || "/default-avatar.png"}
                      alt={challenge.author.name}
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {challenge.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {challenge.author.name} •{" "}
                        {format(new Date(challenge.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div
                    className="prose dark:prose-invert mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: challenge.description }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      {challenge.submissions.length} Submissions
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded mb-2">
                        {challenge.category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Deadline:{" "}
                        {format(new Date(challenge.deadline), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
