export interface Space {
  _id: string;
  title: string;
  description: string;
  tags?: string[];
  topicsCount?: number;
  members?: string[];
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
    role: string;
  };
}