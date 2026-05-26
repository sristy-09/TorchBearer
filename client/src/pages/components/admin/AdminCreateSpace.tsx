import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { createSpace } from "../../../store/Slice/spacesSlice";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { Loader2, CheckCircle, AlertCircle, FolderPlus } from "lucide-react";
import { Button } from "../../../feature/core/components/ui/button";
import { Input } from "../../../feature/core/components/ui/input";
import { Label } from "../../../feature/core/components/ui/label";
import { Textarea } from "../../../feature/core/components/ui/textarea";

function AdminCreateSpace() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({ title: "", description: "" });
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") navigate("/admin/login");
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (submitStatus !== "idle") setSubmitStatus("idle");
  };

  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    else if (formData.title.trim().length < 3) newErrors.title = "Title must be at least 3 characters";
    else if (formData.title.trim().length > 100) newErrors.title = "Title must not exceed 100 characters";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    else if (formData.description.trim().length < 10) newErrors.description = "Description must be at least 10 characters";
    else if (formData.description.trim().length > 500) newErrors.description = "Description must not exceed 500 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");
    try {
      await dispatch(createSpace({ title: formData.title.trim(), description: formData.description.trim() })).unwrap();
      setSubmitStatus("success");
      setFormData({ title: "", description: "" });
      setTimeout(() => navigate("/admin/spaces"), 2000);
    } catch (error: any) {
      setSubmitStatus("error");
      setErrorMessage(error || "Failed to create space. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--secondary)" }}>
                <FolderPlus size={20} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Create Space</h1>
                <p className="text-muted-foreground text-sm">Create a new space for users to collaborate</p>
              </div>
            </div>
          </div>

          {/* Status messages */}
          {submitStatus === "success" && (
            <div className="mb-5 p-4 rounded-xl flex items-start gap-3"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Space created successfully!</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Redirecting to spaces list...</p>
              </div>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="mb-5 p-4 rounded-xl flex items-start gap-3"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-600">Failed to create space</p>
                <p className="text-xs text-red-500 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="rounded-2xl p-7 border"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm font-medium text-foreground">
                  Space Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Engineering Hub, Alumni Network"
                  value={formData.title}
                  onChange={handleChange}
                  className={`rounded-xl h-11 ${errors.title ? "border-red-500" : ""}`}
                  style={{ background: "var(--background)", borderColor: errors.title ? "#EF4444" : "var(--border)" }}
                  disabled={isSubmitting}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                <p className="text-xs text-muted-foreground">{formData.title.length}/100 characters</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the purpose and focus of this space..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className={`rounded-xl ${errors.description ? "border-red-500" : ""}`}
                  style={{ background: "var(--background)", borderColor: errors.description ? "#EF4444" : "var(--border)" }}
                  disabled={isSubmitting}
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                <p className="text-xs text-muted-foreground">{formData.description.length}/500 characters</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/spaces")}
                  disabled={isSubmitting}
                  className="rounded-xl"
                  style={{ borderColor: "var(--border)" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl text-white font-semibold"
                  style={{ background: "var(--primary)" }}
                >
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin mr-2" size={15} />Creating...</>
                  ) : (
                    "Create Space"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Tips */}
          <div className="mt-5 p-4 rounded-xl"
            style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--primary)" }}>
              💡 Tips for creating a great space
            </h3>
            <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
              <li>Choose a clear, descriptive title that reflects the space's purpose</li>
              <li>Write a detailed description to help users understand what the space is about</li>
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
