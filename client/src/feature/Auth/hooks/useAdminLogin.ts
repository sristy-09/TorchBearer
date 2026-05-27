import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../../store/hooks";
import { loginAdmin } from "../../../store/Slice/authSlice";
import type { LoginFormType } from "../types/types";
import { loginSchema } from "../schema/loginSchema";

export const useAdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [myForm, setMyForm] = useState<LoginFormType>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<LoginFormType>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMyForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof LoginFormType]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    const result = loginSchema.safeParse(myForm);
    if (!result.success) {
      const fieldErrors: Partial<LoginFormType> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof LoginFormType;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const resultAction = await dispatch(loginAdmin(myForm));

      if (loginAdmin.fulfilled.match(resultAction)) {
        const user = resultAction.payload.data.user;

        // Check if user is actually an admin
        if (user.role !== "admin") {
          setErrors({ email: "Access denied. Admin credentials required." });
          return;
        }

        // Redirect to admin dashboard
        navigate("/admin/dashboard");
      } else {
        // Handle error from backend
        setErrors({
          email: resultAction.payload as string || "Login failed",
        });
      }
    } catch (error) {
      setErrors({ email: "An unexpected error occurred" });
    }
  };

  return {
    myForm,
    handleChange,
    handleSubmit,
    errors,
  };
};
