export interface User {
  id: string;
  name: string;
  image?: string;
}

export interface Comment {
  _id: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  prompt: string;
  category: string;
  author: User;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export interface Template {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: User;
  likes: string[];
  usageCount: number;
  createdAt: string;
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  author: User;
  deadline: string;
  submissions: Submission[];
  createdAt: string;
}

export interface Submission {
  _id: string;
  author: User;
  content: string;
  score: number;
  feedback: string;
  createdAt: string;
} 