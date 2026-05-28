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
  const [loading, setLoading] = useState(false); // Added loading state support

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const performLogin = async (data: LoginFormType) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
    return result.payload;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // Disable buttons while sending request

    const result = loginSchema.safeParse(myForm);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      setLoading(false);
      return;
    }
    setErrors({});

    try {
      const response = await performLogin(result.data);
      
      // Check if user has completed their profile (has role)
      if (!response.data.user.role) {
        navigate("/complete-profile");
      } else {
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";

      // Dynamically display the error based on what failed
      if (errorMessage.toLowerCase().includes("email") || errorMessage.toLowerCase().includes("user not found")) {
        setErrors({ email: errorMessage });
      } else if (errorMessage.toLowerCase().includes("password")) {
        setErrors({ password: errorMessage });
      } else {
        // Fallback for general errors (like "Invalid credentials") - put it on password field or create a global one
        setErrors({ password: errorMessage });
      }
    } finally {
      setLoading(false);
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
    loading, // Make sure to return loading so your login button can show a "Logging in..." state
  };
}