import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setUser } from "../../../store/Slice/authSlice";
import { updateUserProfile } from "../api/userApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../core/components/ui/dialog";
import { Button } from "../../core/components/ui/button";
import { Input } from "../../core/components/ui/input";
import { Label } from "../../core/components/ui/label";
import { Pencil, X, Plus } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileDialog({
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name ?? "");
  const [department, setDepartment] = useState(user?.department ?? "");
  const [batchYear, setBatchYear] = useState(
    user?.batchYear ? String(user.batchYear) : ""
  );
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(user?.skills ?? []);
  const [interestInput, setInterestInput] = useState("");
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);

  // Social media links
  const [facebook, setFacebook] = useState(user?.socialLinks?.facebook ?? "");
  const [instagram, setInstagram] = useState(user?.socialLinks?.instagram ?? "");
  const [linkedin, setLinkedin] = useState(user?.socialLinks?.linkedin ?? "");
  const [github, setGithub] = useState(user?.socialLinks?.github ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTag = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    setInput: (v: string) => void
  ) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
    }
    setInput("");
  };

  const removeTag = (
    item: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    setList(list.filter((t) => t !== item));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateUserProfile({
        name: name.trim(),
        department: department.trim() || undefined,
        batchYear: batchYear ? Number(batchYear) : undefined,
        skills,
        interests,
        socialLinks: {
          facebook: facebook.trim(),
          instagram: instagram.trim(),
          linkedin: linkedin.trim(),
          github: github.trim(),
        },
      });
      dispatch(setUser(updated));
      onOpenChange(false);
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil size={18} />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-dept">Department</Label>
            <Input
              id="edit-dept"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science"
            />
          </div>

          {/* Batch Year */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-batch">Batch Year</Label>
            <Input
              id="edit-batch"
              type="number"
              value={batchYear}
              onChange={(e) => setBatchYear(e.target.value)}
              placeholder="e.g. 2024"
            />
          </div>

          {/* Skills */}
          <div className="space-y-1.5">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(skillInput, skills, setSkills, setSkillInput);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  addTag(skillInput, skills, setSkills, setSkillInput)
                }
              >
                <Plus size={16} />
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {s}
                    <button
                      onClick={() => removeTag(s, skills, setSkills)}
                      className="hover:text-blue-900 ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interests */}
          <div className="space-y-1.5">
            <Label>Interests</Label>
            <div className="flex gap-2">
              <Input
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                placeholder="Add an interest"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(
                      interestInput,
                      interests,
                      setInterests,
                      setInterestInput
                    );
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  addTag(
                    interestInput,
                    interests,
                    setInterests,
                    setInterestInput
                  )
                }
              >
                <Plus size={16} />
              </Button>
            </div>
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {interests.map((i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                  >
                    {i}
                    <button
                      onClick={() => removeTag(i, interests, setInterests)}
                      className="hover:text-purple-900 ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Social Media Links */}
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <Label className="text-base font-semibold">Social Media Links</Label>

            {/* Facebook */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-facebook" className="flex items-center gap-2 text-sm">
                <FaFacebook size={14} className="text-blue-600" />
                Facebook
              </Label>
              <Input
                id="edit-facebook"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/yourprofile"
                type="url"
              />
            </div>

            {/* Instagram */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-instagram" className="flex items-center gap-2 text-sm">
                <FaInstagram size={14} className="text-pink-600" />
                Instagram
              </Label>
              <Input
                id="edit-instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/yourprofile"
                type="url"
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-linkedin" className="flex items-center gap-2 text-sm">
                <FaLinkedin size={14} className="text-blue-700" />
                LinkedIn
              </Label>
              <Input
                id="edit-linkedin"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                type="url"
              />
            </div>

            {/* GitHub */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-github" className="flex items-center gap-2 text-sm">
                <FaGithub size={14} className="text-gray-800" />
                GitHub
              </Label>
              <Input
                id="edit-github"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/yourprofile"
                type="url"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
