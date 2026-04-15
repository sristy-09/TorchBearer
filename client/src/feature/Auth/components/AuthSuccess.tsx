import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../../store/hooks";
import {
  setTokenFromOAuth,
  fetchCurrentUser,
} from "../../../store/Slice/authSlice";

function AuthSuccess() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const isNew = params.get("isNew") === "true";

      if (!token) {
        navigate("/login");
        return;
      }

      // 1. Store token in Redux + localStorage + axios header
      dispatch(setTokenFromOAuth(token));

      // 2. Fetch the full user object
      const result = await dispatch(fetchCurrentUser());

      if (fetchCurrentUser.fulfilled.match(result)) {
        if (isNew) {
          navigate("/complete-profile");
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/login");
      }
    };

    handleAuth();
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h2 className="text-2xl">Logging In...</h2>
    </div>
  );
}

export default AuthSuccess;
