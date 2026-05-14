import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { updateSpace } from "../../../store/Slice/spacesSlice";
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
import type { Space } from "../types/space";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: Space;
}

export default function EditSpaceDialog({ open, onOpenChange, space }: Props) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(space.title);
  const [description, setDescription] = useState(space.description);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(space.title);
      setDescription(space.description);
    }
  }, [open, space]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    try {
      await dispatch(
        updateSpace({
          id: space._id,
          data: { title, description },
        })
      ).unwrap();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update space:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Space</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter space title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter space description"
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
              {loading ? "Updating..." : "Update Space"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
