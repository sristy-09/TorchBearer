import { useState } from "react";
import type { FormErrors, SignUpFormType } from "../types/types";
import { useNavigate } from "react-router";
import { signupSchema } from "../schema/signupSchema";
import { useAppDispatch } from "../../../store/hooks";
import { registerUser } from "../../../store/Slice/authSlice";

export function useSignup() {
  const [myForm, setMyForm] = useState<SignUpFormType>({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const performRegister = async (data: SignUpFormType) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const result = signupSchema.safeParse(myForm);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      setLoading(false);
      return;
    }
    setErrors({});

    try {
      await performRegister(result.data);
      navigate("/complete-profile");
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setMyForm((prev) => ({ ...prev, [name]: value }));
  };

  return {
    handleChange,
    handleSubmit,
    myForm,
    loading,
    errors,
  };
}
