import { useState } from "react";
import { useNavigate } from "react-router";
import type { FormErrors, LoginFormType } from "../types/types";
import { loginSchema } from "../schema/loginSchema";
import { useAppDispatch } from "../../../store/hooks";
import { loginUser } from "../../../store/Slice/authSlice";

export function useLogin() {
  const [myForm, setMyForm] = useState<LoginFormType>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const performLogin = async (data: LoginFormType) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = loginSchema.safeParse(myForm);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }
    setErrors({});

    try {
      await performLogin(result.data);
      navigate("/dashboard");
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Login failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMyForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  return {
    handleChange,
    handleSubmit,
    myForm,
    errors,
  };
}
