"use client";

import { useState, useEffect } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Post, Template, Challenge } from "@/types/post";

interface DeleteButtonProps {
  postId: string;
  authorId: string;
  sessionUserId: string;
}

export default async function CommunityPage() {
  const session = await getServerSession(authOptions);
  const [posts, setPosts] = useState<Post[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    // Fetch posts, templates, and challenges
    const fetchData = async () => {
      try {
        const [postsRes, templatesRes, challengesRes] = await Promise.all([
          fetch("/api/posts"),
          fetch("/api/templates"),
          fetch("/api/challenges"),
        ]);

        if (postsRes.ok) setPosts(await postsRes.json());
        if (templatesRes.ok) setTemplates(await templatesRes.json());
        if (challengesRes.ok) setChallenges(await challengesRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== postId));
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <select className="bg-gray-800 text-white rounded-lg px-4 py-2">
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="creative">Creative</option>
            <option value="casual">Casual</option>
          </select>

          <select className="bg-gray-800 text-white rounded-lg px-4 py-2">
            <option value="latest">Latest</option>
            <option value="popular">Most Popular</option>
            <option value="commented">Most Commented</option>
          </select>

          <Button variant="outline" className="bg-gray-800 text-white">
            Show My Posts
          </Button>
        </div>

        {session && (
          <div className="flex flex-wrap gap-2">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Create Post
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Create Template
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Create Challenge
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <div className="grid gap-4">
            {posts?.map((post: Post) => (
              <div key={post.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>{post.author?.name}</span>
                      <span>•</span>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {session?.user?.id === post.author?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
                <p className="mt-4">{post.content}</p>
                <div className="mt-4 flex items-center gap-4">
                  <Button variant="ghost" className="text-blue-500">
                    {post.likes?.length || 0} Likes
                  </Button>
                  <Button variant="ghost" className="text-gray-400">
                    {post.comments?.length || 0} Comments
                  </Button>
                  <span className="ml-auto px-3 py-1 rounded-full text-sm bg-gray-700">
                    {post.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {templates?.map((template: Template) => (
              <div key={template.id} className="bg-gray-800 rounded-lg p-6">
                {/* Similar structure to posts */}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4">
            {challenges?.map((challenge: Challenge) => (
              <div key={challenge.id} className="bg-gray-800 rounded-lg p-6">
                {/* Similar structure to posts */}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DeleteButton({ postId, authorId, sessionUserId }: DeleteButtonProps) {
  if (authorId !== sessionUserId) return null;

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        // Refresh the page or update the posts list
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-red-500 hover:text-red-600"
      onClick={handleDelete}
    >
      <Trash2 className="h-5 w-5" />
    </Button>
  );
}
