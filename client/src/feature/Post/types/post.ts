export interface Post {
  _id: string;
  title: string;
  content: string;
  description?: string;
  image?: string;
  author: {
    _id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  topic: {
    _id: string;
    title: string;
  } | null;
  space: {
    _id: string;
    title: string;
  } | null;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}
