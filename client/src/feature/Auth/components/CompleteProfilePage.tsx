import { Button } from "../../core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../core/components/ui/card";
import { Input } from "../../core/components/ui/input";
import { Label } from "../../core/components/ui/label";
import { useCompleteProfile } from "../hooks/useCompleteProfile";
import { useAppSelector } from "../../../store/hooks";
import { X } from "lucide-react";

function CompleteProfilePage() {
  const {
    form,
    errors,
    loading,
    skillInput,
    interestInput,
    setSkillInput,
    setInterestInput,
    handleChange,
    handleSkillKeyDown,
    handleInterestKeyDown,
    removeSkill,
    removeInterest,
    handleSubmit,
  } = useCompleteProfile();

  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="flex justify-center items-center my-20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete your profile</CardTitle>
          <CardDescription>
            Welcome, {user?.name}! Just a few more details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
              {/* Role */}
              <div className="grid gap-2">
                <Label htmlFor="role">I am a</Label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  disabled={loading}
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select role...</option>
                  <option value="student">Student</option>
                  <option value="alumni">Alumni</option>
                </select>
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role}</p>
                )}
              </div>

              {/* Batch Year */}
              <div className="grid gap-2">
                <Label htmlFor="batchYear">Batch year</Label>
                <Input
                  id="batchYear"
                  name="batchYear"
                  type="number"
                  placeholder="e.g. 2022"
                  value={form.batchYear}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.batchYear && (
                  <p className="text-sm text-red-500">{errors.batchYear}</p>
                )}
              </div>

              {/* Registration Number */}
              <div className="grid gap-2">
                <Label htmlFor="registrationNumber">Registration number</Label>
                <Input
                  id="registrationNumber"
                  name="registrationNumber"
                  type="number"
                  placeholder="e.g. 12345"
                  value={form.registrationNumber}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.registrationNumber && (
                  <p className="text-sm text-red-500">
                    {errors.registrationNumber}
                  </p>
                )}
              </div>

              {/* Department */}
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={form.department}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.department && (
                  <p className="text-sm text-red-500">{errors.department}</p>
                )}
              </div>

              {/* Skills */}
              <div className="grid gap-2">
                <Label htmlFor="skillInput">Skills</Label>
                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-500"
                          aria-label={`Remove ${skill}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <Input
                  id="skillInput"
                  type="text"
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  disabled={loading}
                />
                {errors.skills ? (
                  <p className="text-sm text-red-500">{errors.skills}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Press Enter or comma after each skill
                  </p>
                )}
              </div>

              {/* Interests */}
              <div className="grid gap-2">
                <Label htmlFor="interestInput">Interests</Label>
                {form.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.interests.map((interest) => (
                      <span
                        key={interest}
                        className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="hover:text-red-500"
                          aria-label={`Remove ${interest}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <Input
                  id="interestInput"
                  type="text"
                  placeholder="Type an interest and press Enter"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={handleInterestKeyDown}
                  disabled={loading}
                />
                {errors.interests ? (
                  <p className="text-sm text-red-500">{errors.interests}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Press Enter or comma after each interest
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Complete profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CompleteProfilePage;
