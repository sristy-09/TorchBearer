import { Button } from "../../core/components/ui/button";
import { Input } from "../../core/components/ui/input";
import { Label } from "../../core/components/ui/label";
import { Checkbox } from "../../core/components/ui/checkbox";
import { useCompleteProfile } from "../hooks/useCompleteProfile";
import { useAppSelector } from "../../../store/hooks";
import { X, UserCircle } from "lucide-react";

function CompleteProfilePage() {
  const {
    form,
    errors,
    loading,
    otherSkill,
    otherInterest,
    predefinedInterests,
    predefinedSkills,
    setOtherInterest,
    setOtherSkill,
    handleChange,
    handleInterestCheckbox,
    handleSkillCheckbox,
    handleOtherInterestKeyDown,
    handleOtherSkillKeyDown,
    removeSkill,
    removeInterest,
    handleSubmit,
  } = useCompleteProfile();

  const { user } = useAppSelector((state) => state.auth);

  return (
    <div
      className="min-h-screen py-12 px-6"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--secondary)" }}
          >
            <UserCircle size={28} style={{ color: "var(--primary)" }} />
          </div>

          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Complete your profile
          </h1>

          <p className="text-muted-foreground text-sm mt-1">
            Welcome,{" "}
            <span className="font-medium text-foreground">
              {user?.name}
            </span>
            ! Just a few more details to get started.
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-7 border"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role */}
            <div className="space-y-1.5">
              <Label
                htmlFor="role"
                className="text-sm font-medium text-foreground"
              >
                I am a
              </Label>

              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl h-11 px-3 text-sm border outline-none transition-colors"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                <option value="">Select role...</option>
                <option value="student">Student</option>
                <option value="alumni">Alumni</option>
              </select>

              {errors.role && (
                <p className="text-xs text-red-500">{errors.role}</p>
              )}
            </div>

            {/* Batch Year */}
            <div className="space-y-1.5">
              <Label
                htmlFor="batchYear"
                className="text-sm font-medium text-foreground"
              >
                Batch year
              </Label>

              <Input
                id="batchYear"
                name="batchYear"
                type="number"
                placeholder="e.g. 2076"
                value={form.batchYear}
                onChange={handleChange}
                disabled={loading}
                className="rounded-xl h-11"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border)",
                }}
              />

              {errors.batchYear && (
                <p className="text-xs text-red-500">
                  {errors.batchYear}
                </p>
              )}
            </div>

            {/* Registration Number */}
            <div className="space-y-1.5">
              <Label
                htmlFor="registrationNumber"
                className="text-sm font-medium text-foreground"
              >
                Registration number
              </Label>

              <Input
                id="registrationNumber"
                name="registrationNumber"
                type="text"
                placeholder="e.g. 5-2-48-213-2022"
                value={form.registrationNumber}
                onChange={handleChange}
                disabled={loading}
                className="rounded-xl h-11"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border)",
                }}
              />

              {errors.registrationNumber && (
                <p className="text-xs text-red-500">
                  {errors.registrationNumber}
                </p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <Label
                htmlFor="department"
                className="text-sm font-medium text-foreground"
              >
                Department
              </Label>

              <Input
                id="department"
                name="department"
                type="text"
                placeholder="e.g. Computer Science"
                value={form.department}
                onChange={handleChange}
                disabled={loading}
                className="rounded-xl h-11"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border)",
                }}
              />

              {errors.department && (
                <p className="text-xs text-red-500">
                  {errors.department}
                </p>
              )}
            </div>

            {/* Show Skills only if Alumni */}
            {form.role === "alumni" && (
              <div className="space-y-2">
                <Label
                  htmlFor="skillInput"
                  className="text-sm font-medium text-foreground"
                >
                  Skills
                </Label>

                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                          background: "var(--secondary)",
                          color: "var(--primary)",
                        }}
                      >
                        {skill}

                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:opacity-70 transition-opacity"
                          aria-label={`Remove ${skill}`}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div
                  className="grid grid-cols-2 gap-2.5 p-4 rounded-xl"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {predefinedSkills.map((skill) => (
                    <Checkbox
                      key={skill}
                      id={`skill-${skill}`}
                      label={skill}
                      checked={form.skills.includes(skill)}
                      onChange={() => handleSkillCheckbox(skill)}
                      disabled={loading}
                    />
                  ))}
                </div>

                 <div className="space-y-1.5">
                  <Label
                    htmlFor="otherSkill"
                    className="text-xs text-muted-foreground"
                  >
                    Other (specify)
                  </Label>

                  <Input
                    id="otherSkill"
                    type="text"
                    placeholder="Type other skills and press Enter"
                    value={otherSkill}
                    onChange={(e) => setOtherSkill(e.target.value)}
                    onKeyDown={handleOtherSkillKeyDown}
                    disabled={loading}
                    className="rounded-xl h-10"
                    style={{
                      background: "var(--background)",
                      borderColor: "var(--border)",
                    }}
                  />
                </div>

                {errors.skills ? (
                  <p className="text-xs text-red-500">
                    {errors.skills}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Select from options or add your own
                  </p>
                )}
              </div>
            )}

            {/* Show Interests only if Student */}
            {form.role === "student" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Interests
                </Label>

                {form.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.interests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                          background: "var(--secondary)",
                          color: "var(--primary)",
                        }}
                      >
                        {interest}

                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="hover:opacity-70 transition-opacity"
                          aria-label={`Remove ${interest}`}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div
                  className="grid grid-cols-2 gap-2.5 p-4 rounded-xl"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {predefinedInterests.map((interest) => (
                    <Checkbox
                      key={interest}
                      id={`interest-${interest}`}
                      label={interest}
                      checked={form.interests.includes(interest)}
                      onChange={() => handleInterestCheckbox(interest)}
                      disabled={loading}
                    />
                  ))}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="otherInterest"
                    className="text-xs text-muted-foreground"
                  >
                    Other (specify)
                  </Label>

                  <Input
                    id="otherInterest"
                    type="text"
                    placeholder="Type other interest and press Enter"
                    value={otherInterest}
                    onChange={(e) => setOtherInterest(e.target.value)}
                    onKeyDown={handleOtherInterestKeyDown}
                    disabled={loading}
                    className="rounded-xl h-10"
                    style={{
                      background: "var(--background)",
                      borderColor: "var(--border)",
                    }}
                  />
                </div>

                {errors.interests ? (
                  <p className="text-xs text-red-500">
                    {errors.interests}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Select from options or add your own
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold text-white shadow-sm"
              style={{ background: "var(--primary)" }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Complete profile"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CompleteProfilePage;