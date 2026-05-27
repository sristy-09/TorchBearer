import { useCallback, useState } from "react";

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorMessage: string | null;
}

/**
 * Custom hook for handling errors in async operations
 * Prevents unhandled promise rejections from crashing the app
 */
export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorMessage: null,
  });

  const handleError = useCallback((error: unknown) => {
    console.error("Error caught by useErrorHandler:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "An unexpected error occurred";

    setErrorState({
      hasError: true,
      error: error instanceof Error ? error : new Error(errorMessage),
      errorMessage,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorMessage: null,
    });
  }, []);

  /**
   * Wraps an async function with error handling
   */
  const withErrorHandler = useCallback(
    <T extends (...args: any[]) => Promise<any>>(fn: T) => {
      return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
        try {
          clearError();
          return await fn(...args);
        } catch (error) {
          handleError(error);
          return null;
        }
      };
    },
    [handleError, clearError]
  );

  return {
    ...errorState,
    handleError,
    clearError,
    withErrorHandler,
  };
}
