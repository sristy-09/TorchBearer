export interface Topic {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
    role: string;
  };
  space: {
    _id: string;
    title: string;
  } | null;
  posts?: string[];
}
