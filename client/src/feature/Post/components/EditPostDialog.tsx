import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { updatePost } from "../../../store/Slice/postsSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../core/components/ui/dialog";
import { Input } from "../../core/components/ui/input";
import { Textarea } from "../../core/components/ui/textarea";
import { Button } from "../../core/components/ui/button";
import { Label } from "../../core/components/ui/label";
import type { Post } from "../types/post";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
}

export default function EditPostDialog({ open, onOpenChange, post }: Props) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(post.title);
      setContent(post.content);
    }
  }, [open, post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      await dispatch(
        updatePost({
          id: post._id,
          data: { title, content },
        })
      ).unwrap();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter post content"
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
