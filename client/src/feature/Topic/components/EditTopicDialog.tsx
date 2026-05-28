import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { updateTopic } from "../../../store/Slice/topicsSlice";
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
import type { Topic } from "../types/topic";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: Topic;
}

export default function EditTopicDialog({ open, onOpenChange, topic }: Props) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(topic.title);
  const [description, setDescription] = useState(topic.description);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(topic.title);
      setDescription(topic.description);
    }
  }, [open, topic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    try {
      await dispatch(
        updateTopic({
          id: topic._id,
          data: { title, description },
        })
      ).unwrap();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update topic:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-500px">
        <DialogHeader>
          <DialogTitle>Edit Topic</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter topic title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter topic description"
              rows={4}
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
              {loading ? "Updating..." : "Update Topic"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
