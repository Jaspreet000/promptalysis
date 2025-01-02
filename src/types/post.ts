export interface User {
  id: string;
  name: string;
  image?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
}

export interface Post {
  _id: string;
  id: string;
  title: string;
  content: string;
  category: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  _id: string;
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  author: {
    id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Challenge {
  _id: string;
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  deadline: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  _id: string;
  author: User;
  content: string;
  score: number;
  feedback: string;
  createdAt: string;
} 