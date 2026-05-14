import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackUI?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: "app" | "page" | "component";
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you could send this to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback UI if provided
      if (this.props.fallbackUI) {
        return this.props.fallbackUI;
      }

      // Default fallback UI based on error level
      const { level = "component" } = this.props;
      const { error, errorInfo } = this.state;

      // App-level error (critical)
      if (level === "app") {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Application Error
                  </h1>
                  <p className="text-gray-600">
                    Something went wrong with the application
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-red-800 mb-2">
                  Error Details:
                </p>
                <p className="text-sm text-red-700 font-mono">
                  {error?.message || "Unknown error"}
                </p>
              </div>

              {import.meta.env.DEV && errorInfo && (
                <details className="mb-6">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
                    Stack Trace (Development Only)
                  </summary>
                  <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={this.handleReload}
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Reload Application
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
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

      // Page-level error
      if (level === "page") {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Page Error
                  </h2>
                  <p className="text-sm text-gray-600">
                    This page encountered an error
                  </p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
                <p className="text-sm text-orange-800">
                  {error?.message || "Unable to load this page"}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={this.handleReset}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Home size={14} />
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        );
      }

      // Component-level error (minimal)
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                Component Error
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                {error?.message || "This component failed to load"}
              </p>
              <Button
                onClick={this.handleReset}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
