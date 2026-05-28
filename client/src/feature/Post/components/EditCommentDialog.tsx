import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../core/components/ui/dialog";
import { Button } from "../../core/components/ui/button";

interface EditCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commentText: string;
  onSave: (newText: string) => void;
}

export default function EditCommentDialog({
  open,
  onOpenChange,
  commentText,
  onSave,
}: EditCommentDialogProps) {
  const [text, setText] = useState(commentText);

  // Update text when commentText prop changes
  useEffect(() => {
    setText(commentText);
  }, [commentText]);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setText(commentText); // Reset to original text
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Edit Comment</DialogTitle>
          <DialogDescription>
            Make changes to your comment below.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your comment..."
            className="w-full min-h-30 border border-gray-300 px-3 py-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="border border-gray-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!text.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
