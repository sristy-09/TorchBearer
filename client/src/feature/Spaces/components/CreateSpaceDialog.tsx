import { useState } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { createSpace } from "../../../store/Slice/spacesSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../core/components/ui/dialog";

import { Button } from "../../core/components/ui/button";
import { Input } from "../../core/components/ui/input";
import { Textarea } from "../../core/components/ui/textarea";

export default function CreateSpaceDialog() {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTags("");
    setError("");
  };

  const submitHandler = async () => {
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!trimmedTitle || !trimmedDesc) {
      setError("Title and description are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await dispatch(
        createSpace({
          title: trimmedTitle,
          description: trimmedDesc,
          tags: tags
            ? tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
        })
      ).unwrap();

      resetForm();
      setOpen(false);
    } catch (err) {
      console.error(err);
      setError("Failed to create space. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger */}
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 rounded-md">
          Create Space
        </Button>
      </DialogTrigger>

      {/* Modal */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create New Space
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Title */}
          <div>
            <Input
              placeholder="Space title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <Textarea
            placeholder="Describe your space..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Tags */}
          <Input
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={submitHandler}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}