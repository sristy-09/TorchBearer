/**
 * Global error handler to catch unhandled errors and promise rejections
 * This prevents the entire app from crashing when errors occur
 */

let errorListenersInitialized = false;

export function initializeGlobalErrorHandlers() {
  // Prevent multiple initializations
  if (errorListenersInitialized) {
    return;
  }

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);

    // Prevent the default behavior (which would crash the app)
    event.preventDefault();

    // You can send this to an error reporting service
    // Example: logErrorToService(event.reason);

    // Show a user-friendly notification (optional)
    if (import.meta.env.DEV) {
      console.warn(
        "An unhandled promise rejection was caught. Check the console for details."
      );
    }
  });

  // Handle global errors
  window.addEventListener("error", (event) => {
    console.error("Global error:", event.error || event.message);

    // Prevent the default behavior for non-critical errors
    if (event.error && !isCriticalError(event.error)) {
      event.preventDefault();
    }

    // You can send this to an error reporting service
    // Example: logErrorToService(event.error);
  });

  errorListenersInitialized = true;
  console.log("Global error handlers initialized");
}

/**
 * Determine if an error is critical and should crash the app
 */
function isCriticalError(error: Error): boolean {
  // Add logic to determine critical errors
  // For now, we'll consider syntax errors and reference errors as critical
  const criticalErrorTypes = ["SyntaxError", "ReferenceError"];
  return criticalErrorTypes.includes(error.name);
}

/**
 * Optional: Send errors to an error reporting service
 * Uncomment and configure when you have an error reporting service
 */
// function logErrorToService(error: any) {
//   // Example: Sentry, LogRocket, etc.
//   // Sentry.captureException(error);
// }

/**
 * Clean up error handlers (useful for testing)
 */
export function cleanupGlobalErrorHandlers() {
  // Note: This is a simplified cleanup
  // In production, you'd want to store references to the handlers
  errorListenersInitialized = false;
}
