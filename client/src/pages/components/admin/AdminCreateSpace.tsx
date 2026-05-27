import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { createSpace } from "../../../store/Slice/spacesSlice";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { Loader2, CheckCircle, AlertCircle, X, Tag, Menu } from "lucide-react";
import { Button } from "../../../feature/core/components/ui/button";
import { Input } from "../../../feature/core/components/ui/input";
import { Label } from "../../../feature/core/components/ui/label";
import { Textarea } from "../../../feature/core/components/ui/textarea";

function AdminCreateSpace() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<{ title?: string; description?: string; tags?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/admin/login");
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear submit status when user makes changes
    if (submitStatus !== "idle") {
      setSubmitStatus("idle");
    }
  };

  const validateForm = () => {
    const newErrors: { title?: string; description?: string; tags?: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (formData.title.trim().length > 100) {
      newErrors.title = "Title must not exceed 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (formData.description.trim().length > 500) {
      newErrors.description = "Description must not exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      await dispatch(
        createSpace({
          title: formData.title.trim(),
          description: formData.description.trim(),
          tags: formData.tags,
        })
      ).unwrap();

      setSubmitStatus("success");

      // Reset form
      setFormData({
        title: "",
        description: "",
        tags: [],
      });
      setTagInput("");

      // Redirect to spaces list after 2 seconds
      setTimeout(() => {
        navigate("/admin/spaces");
      }, 2000);
    } catch (error: any) {
      setSubmitStatus("error");
      setErrorMessage(error || "Failed to create space. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/spaces");
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();

    if (!trimmedTag) {
      return;
    }

    if (formData.tags.includes(trimmedTag)) {
      setErrors((prev) => ({ ...prev, tags: "Tag already added" }));
      return;
    }

    if (formData.tags.length >= 10) {
      setErrors((prev) => ({ ...prev, tags: "Maximum 10 tags allowed" }));
      return;
    }

    if (trimmedTag.length > 30) {
      setErrors((prev) => ({ ...prev, tags: "Tag must not exceed 30 characters" }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, trimmedTag],
    }));
    setTagInput("");
    setErrors((prev) => ({ ...prev, tags: undefined }));
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <AdminSidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Hamburger Menu for Mobile */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden mb-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-foreground" />
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Create Space</h1>
            <p className="text-muted-foreground mt-2">
              Create a new space for users to collaborate and share ideas
            </p>
          </div>

          {/* Success Message */}
          {submitStatus === "success" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  Space created successfully!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Redirecting to spaces list...
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === "error" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Failed to create space
                </h3>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Space Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Engineering Hub, Alumni Network"
                  value={formData.title}
                  onChange={handleChange}
                  className={errors.title ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
                <p className="text-xs text-gray-500">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the purpose and focus of this space..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className={errors.description ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
                <p className="text-xs text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Tags Field */}
              <div className="space-y-2">
                <Label htmlFor="tags">
                  Tags <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="tags"
                      type="text"
                      placeholder="e.g., engineering, technology, networking"
                      value={tagInput}
                      onChange={(e) => {
                        setTagInput(e.target.value);
                        if (errors.tags) {
                          setErrors((prev) => ({ ...prev, tags: undefined }));
                        }
                      }}
                      onKeyDown={handleTagInputKeyDown}
                      className="pl-10"
                      disabled={isSubmitting || formData.tags.length >= 10}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={isSubmitting || !tagInput.trim() || formData.tags.length >= 10}
                  >
                    Add
                  </Button>
                </div>
                {errors.tags && (
                  <p className="text-sm text-red-600">{errors.tags}</p>
                )}
                <p className="text-xs text-gray-500">
                  Press Enter or click Add to add a tag. Maximum 10 tags.
                </p>

                {/* Tags Display */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          disabled={isSubmitting}
                          className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                          aria-label={`Remove ${tag} tag`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Creating...
                    </>
                  ) : (
                    "Create Space"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              💡 Tips for creating a great space:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Choose a clear, descriptive title that reflects the space's purpose</li>
              <li>Write a detailed description to help users understand what the space is about</li>
              <li>Add relevant tags to help users discover your space (e.g., engineering, alumni, networking)</li>
              <li>Consider the target audience when naming and describing the space</li>
              <li>Keep the title concise but informative</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCreateSpace;
