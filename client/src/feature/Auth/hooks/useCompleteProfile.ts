import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { completeUserProfile } from "../../../store/Slice/authSlice";
import type {
  CompleteProfileFormType,
  CompleteProfileErrors,
} from "../types/types";
import { completeProfileSchema } from "../schema/completeProfileSchema";

export function useCompleteProfile() {
  const [form, setForm] = useState<CompleteProfileFormType>({
    role: "",
    batchYear: "",
    registrationNumber: "",
    department: "",
    skills: [],
    interests: [],
  });

  const [skillInput, setSkillInput] = useState("");
  const [otherSkill, setOtherSkill] = useState("")
  const [interestInput, setInterestInput] = useState("");
  const [otherInterest, setOtherInterest] = useState("");
  const [errors, setErrors] = useState<CompleteProfileErrors>({});

  const predefinedInterests = [
    "Cyber Security",
    "Backend Development",
    "Frontend Development",
    "Flutter Development",
    "Designing",
    "AI/ML",
  ];

   const predefinedSkills = [
    "Cyber Security",
    "Backend Development",
    "Frontend Development",
    "Flutter Development",
    "Designing",
    "AI/ML",
  ];

  const { loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // ── Skills tag input ─────────────────────────────────────
  const addSkill = (raw: string) => {
    const val = raw.trim().replace(/,$/, "");
    if (val && !form.skills.includes(val)) {
      const updated = [...form.skills, val];
      setForm((prev) => ({ ...prev, skills: updated }));
      // Re-validate skills live
      const result = completeProfileSchema.shape.skills.safeParse(updated);
      setErrors((prev) => ({
        ...prev,
        skills: result.success ? undefined : result.error.issues[0].message,
      }));
    }
    setSkillInput("");
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const removeSkill = (skill: string) => {
    const updated = form.skills.filter((s) => s !== skill);
    setForm((prev) => ({ ...prev, skills: updated }));
    setErrors((prev) => ({ ...prev, skills: undefined }));
  };

  // ── Interests checkbox handling ──────────────────────────
  const handleInterestCheckbox = (interest: string) => {
    const updated = form.interests.includes(interest)
      ? form.interests.filter((i) => i !== interest)
      : [...form.interests, interest];

    setForm((prev) => ({ ...prev, interests: updated }));
    const result = completeProfileSchema.shape.interests.safeParse(updated);
    setErrors((prev) => ({
      ...prev,
      interests: result.success ? undefined : result.error.issues[0].message,
    }));
  };

  const addOtherInterest = () => {
    const val = otherInterest.trim();
    if (val && !form.interests.includes(val)) {
      const updated = [...form.interests, val];
      setForm((prev) => ({ ...prev, interests: updated }));
      const result = completeProfileSchema.shape.interests.safeParse(updated);
      setErrors((prev) => ({
        ...prev,
        interests: result.success ? undefined : result.error.issues[0].message,
      }));
    }
    setOtherInterest("");
  };

  const handleOtherInterestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addOtherInterest();
    }
  };

    // -skills checkbox handling ──────────────────────────
  const handleSkillCheckbox = (skill: string) => {
    const updated = form.skills.includes(skill)
      ? form.skills.filter((s) => s !== skill)
      : [...form.skills, skill];

    setForm((prev) => ({ ...prev, skills: updated }));
    const result = completeProfileSchema.shape.skills.safeParse(updated);
    setErrors((prev) => ({
      ...prev,
      skills: result.success ? undefined : result.error.issues[0].message,
    }));
  };

  const addOtherSkill = () => {
    const val = otherSkill.trim();
    if (val && !form.skills.includes(val)) {
      const updated = [...form.skills, val];
      setForm((prev) => ({ ...prev, skills: updated }));
      const result = completeProfileSchema.shape.skills.safeParse(updated);
      setErrors((prev) => ({
        ...prev,
        skills: result.success ? undefined : result.error.issues[0].message,
      }));
    }
    setOtherSkill("");
  };

  const handleOtherSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addOtherSkill();
    }
  };

  // ── Interests tag input (legacy - kept for backward compatibility) ──────────────────────────────────
  const addInterest = (raw: string) => {
    const val = raw.trim().replace(/,$/, "");
    if (val && !form.interests.includes(val)) {
      const updated = [...form.interests, val];
      setForm((prev) => ({ ...prev, interests: updated }));
      const result = completeProfileSchema.shape.interests.safeParse(updated);
      setErrors((prev) => ({
        ...prev,
        interests: result.success ? undefined : result.error.issues[0].message,
      }));
    }
    setInterestInput("");
  };

  const handleInterestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addInterest(interestInput);
    }
  };

  const removeInterest = (interest: string) => {
    const updated = form.interests.filter((i) => i !== interest);
    setForm((prev) => ({ ...prev, interests: updated }));
    setErrors((prev) => ({ ...prev, interests: undefined }));
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Zod parse — role is "" by default so cast for parse
    const result = completeProfileSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        role: fieldErrors.role?.[0],
        batchYear: fieldErrors.batchYear?.[0],
        registrationNumber: fieldErrors.registrationNumber?.[0],
        department: fieldErrors.department?.[0],
        skills: fieldErrors.skills?.[0],
        interests: fieldErrors.interests?.[0],
      });
      return;
    }

    const action = await dispatch(
      completeUserProfile({
        role: result.data.role,
        batchYear: result.data.batchYear,
        registrationNumber: result.data.registrationNumber,
        department: result.data.department,
        skills: result.data.skills,
        interests: result.data.interests,
      }),
    );

    if (completeUserProfile.fulfilled.match(action)) {
      navigate("/dashboard");
    } else {
      alert((action.payload as string) ?? "Failed to complete profile.");
    }
  };

  return {
    form,
    errors,
    loading,
    skillInput,
    interestInput,
    otherSkill,
    setOtherSkill,
    otherInterest,
    predefinedInterests,
    predefinedSkills,
    setSkillInput,
    setInterestInput,
    setOtherInterest,
    handleChange,
    handleSkillKeyDown,
    handleInterestKeyDown,
    handleInterestCheckbox,
    handleSkillCheckbox,
    handleOtherInterestKeyDown,
    handleOtherSkillKeyDown,
    removeSkill,
    removeInterest,
    handleSubmit,
  };
}
