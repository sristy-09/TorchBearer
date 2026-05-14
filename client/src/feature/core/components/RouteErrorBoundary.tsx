import { useRouteError, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

interface RouteError {
  statusText?: string;
  message?: string;
  status?: number;
}

export default function RouteErrorBoundary() {
  const error = useRouteError() as RouteError;
  const navigate = useNavigate();

  console.error("Route error:", error);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {error?.status === 404 ? "Page Not Found" : "Route Error"}
            </h1>
            <p className="text-gray-600">
              {error?.status === 404
                ? "The page you're looking for doesn't exist"
                : "Something went wrong loading this page"}
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">
            {error?.statusText || error?.message || "Unknown error occurred"}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
            <Home size={16} />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
