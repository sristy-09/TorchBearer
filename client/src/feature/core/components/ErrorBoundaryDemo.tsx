import { useState } from "react";
import { Button } from "./ui/button";
import ErrorBoundary from "./ErrorBoundary";

/**
 * Demo component to test error boundaries
 * This component is for testing purposes only
 */

// Component that throws an error
function ErrorThrowingComponent() {
  throw new Error("This is a test error from ErrorThrowingComponent");
  return <div>This will never render</div>;
}

// Component that throws an async error
function AsyncErrorComponent() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error("This is a test async error");
  }

  return (
    <div className="p-4 border rounded">
      <p className="mb-2">This component will throw an error when you click the button:</p>
      <Button onClick={() => setShouldError(true)}>
        Trigger Async Error
      </Button>
    </div>
  );
}

// Main demo component
export default function ErrorBoundaryDemo() {
  const [showError, setShowError] = useState(false);
  const [showAsyncError, setShowAsyncError] = useState(false);

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Error Boundary Demo</h1>

      {/* Test 1: Component-level error */}
      <div className="border rounded-lg p-6 bg-white shadow">
        <h2 className="text-xl font-semibold mb-4">Test 1: Component-Level Error</h2>
        <p className="text-gray-600 mb-4">
          This demonstrates how a component-level error boundary prevents the entire app from crashing.
        </p>
        <Button onClick={() => setShowError(!showError)} className="mb-4">
          {showError ? "Hide Error Component" : "Show Error Component"}
        </Button>

        {showError && (
          <ErrorBoundary level="component">
            <ErrorThrowingComponent />
          </ErrorBoundary>
        )}
      </div>

      {/* Test 2: Async error */}
      <div className="border rounded-lg p-6 bg-white shadow">
        <h2 className="text-xl font-semibold mb-4">Test 2: Async Error</h2>
        <p className="text-gray-600 mb-4">
          This demonstrates how error boundaries catch errors that occur after user interaction.
        </p>
        <Button onClick={() => setShowAsyncError(!showAsyncError)} className="mb-4">
          {showAsyncError ? "Hide Async Component" : "Show Async Component"}
        </Button>

        {showAsyncError && (
          <ErrorBoundary level="component">
            <AsyncErrorComponent />
          </ErrorBoundary>
        )}
      </div>

      {/* Test 3: Promise rejection */}
      <div className="border rounded-lg p-6 bg-white shadow">
        <h2 className="text-xl font-semibold mb-4">Test 3: Unhandled Promise Rejection</h2>
        <p className="text-gray-600 mb-4">
          This demonstrates how the global error handler catches unhandled promise rejections.
          Check the browser console to see the error being caught.
        </p>
        <Button
          onClick={() => {
            Promise.reject(new Error("Unhandled promise rejection test"));
          }}
        >
          Trigger Promise Rejection
        </Button>
      </div>

      {/* Instructions */}
      <div className="border rounded-lg p-6 bg-blue-50 border-blue-200">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">How to Use</h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Click the buttons above to trigger different types of errors</li>
          <li>Notice how the app continues to work even when errors occur</li>
          <li>Each error is isolated to its component boundary</li>
          <li>Check the browser console to see error logs</li>
          <li>Try the "Try Again" buttons in the error messages</li>
        </ol>
      </div>
    </div>
  );
}
