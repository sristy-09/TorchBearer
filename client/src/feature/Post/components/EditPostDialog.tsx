import { useState, useEffect, useRef } from "react";
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
import { X, FileIcon, ImageIcon, VideoIcon, FileTextIcon, Upload, Paperclip, AlertCircle } from "lucide-react";
import type { Post } from "../types/post";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
}

export default function EditPostDialog({ open, onOpenChange, post }: Props) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [description, setDescription] = useState(post.description || "");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setTitle(post.title);
      setContent(post.content);
      setDescription(post.description || "");
      setFiles([]);
      setDragActive(false);
      setValidationErrors([]);
    }
  }, [open, post]);

  const validateAndAddFiles = (selectedFiles: File[]) => {
    const errors: string[] = [];
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const MAX_FILES = 5;

    // Validate file types
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
      "application/pdf",
    ];

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    const oversizedFiles: string[] = [];

    selectedFiles.forEach((file) => {
      // Check file type
      if (!validTypes.includes(file.type)) {
        invalidFiles.push(file.name);
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file.name);
        return;
      }

      validFiles.push(file);
    });

    // Check total file count
    const remainingSlots = MAX_FILES - files.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    // Generate error messages
    if (invalidFiles.length > 0) {
      errors.push(
        `Invalid file type: ${invalidFiles.join(", ")}. Only images, videos, and PDFs are allowed.`
      );
    }

    if (oversizedFiles.length > 0) {
      errors.push(
        `File too large: ${oversizedFiles.join(", ")}. Maximum size is 50MB per file.`
      );
    }

    if (validFiles.length > remainingSlots) {
      errors.push(
        `Only ${remainingSlots} more file(s) can be added. Maximum ${MAX_FILES} files allowed.`
      );
    }

    // Show errors
    if (errors.length > 0) {
      setValidationErrors(errors);
    } else {
      setValidationErrors([]);
    }

    // Add valid files
    if (filesToAdd.length > 0) {
      setFiles((prev) => [...prev, ...filesToAdd]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      validateAndAddFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFiles = Array.from(e.dataTransfer.files);
      validateAndAddFiles(selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (file.type.startsWith("video/")) return <VideoIcon className="h-5 w-5 text-purple-500" />;
    if (file.type === "application/pdf") return <FileTextIcon className="h-5 w-5 text-red-500" />;
    return <FileIcon className="h-5 w-5 text-gray-500" />;
  };

  const getFileTypeLabel = (file: File) => {
    if (file.type.startsWith("image/")) return "Image";
    if (file.type.startsWith("video/")) return "Video";
    if (file.type === "application/pdf") return "PDF";
    return "File";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    setValidationErrors([]);

    try {
      await dispatch(
        updatePost({
          id: post._id,
          data: {
            title,
            content,
            description: description || undefined,
            files
          },
        })
      ).unwrap();

      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to update post:", error);
      setValidationErrors([error || "Failed to update post. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
            <Label htmlFor="description">Short Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary (optional)"
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

          <div>
            <Label htmlFor="attachments" className="text-sm font-medium">
              Add More Attachments
            </Label>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900 mb-1">
                      Upload Errors
                    </p>
                    <ul className="text-xs text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValidationErrors([])}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`mt-2 border-2 border-dashed rounded-lg transition-all ${dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400"
                }`}
            >
              <div className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className={`p-2 rounded-full ${dragActive ? "bg-blue-100" : "bg-gray-100"}`}>
                    <Upload className={`h-5 w-5 ${dragActive ? "text-blue-600" : "text-gray-400"}`} />
                  </div>
                </div>

                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-700">
                    {dragActive ? "Drop files here" : "Drag and drop files"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">or</p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1"
                  disabled={files.length >= 5}
                >
                  <Paperclip className="h-3 w-3 mr-1.5" />
                  Browse Files
                </Button>

                <input
                  ref={fileInputRef}
                  id="attachments"
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Images, Videos, PDFs • Max 5 files • 50MB each
                </p>
              </div>
            </div>

            {/* New Files List */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-700">
                    New Files ({files.length}/5)
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiles([])}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                  >
                    Clear All
                  </Button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
                    >
                      <div className="flex-shrink-0">
                        {getFileIcon(file)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded flex-shrink-0">
                            {getFileTypeLabel(file)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatFileSize(file.size)}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 h-7 w-7 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Attachments */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs font-medium text-blue-900 mb-2">
                  Existing Attachments ({post.attachments.length})
                </p>
                <div className="space-y-1">
                  {post.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-blue-700">
                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                      <span className="truncate">{attachment.originalName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
