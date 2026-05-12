import { useState } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { createTopic } from "../../../store/Slice/topicsSlice";
import { Button } from "../../core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../core/components/ui/dialog";
import { Input } from "../../core/components/ui/input";
import { Label } from "../../core/components/ui/label";
import { Textarea } from "../../core/components/ui/textarea";
import { Plus } from "lucide-react";

interface Props {
  spaceId: string;
}

export default function CreateTopicDialog({ spaceId }: Props) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(
        createTopic({
          title,
          description,
          spaceId,
        })
      ).unwrap();

      setTitle("");
      setDescription("");
      setOpen(false);
    } catch (error) {
      console.error("Failed to create topic:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Topic
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Create New Topic</DialogTitle>
          <DialogDescription>
            Start a new discussion topic in this space
          </DialogDescription>
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
              placeholder="Describe what this topic is about"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Topic"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
