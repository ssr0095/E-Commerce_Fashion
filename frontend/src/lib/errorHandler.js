import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { X } from "lucide-react";

class ErrorHandler {
  constructor() {
    this.errorCounts = new Map(); // Track error frequency
    this.lastErrorTime = new Map();
  }

  /**
   * Main error handling method
   * @param {Error} error - The error object
   * @param {Object} context - Additional context (component name, action, etc.)
   */
  handle(error, context = {}) {
    const errorData = this.parseError(error, context);

    // Log error (different behavior for dev/prod)
    this.logError(errorData);

    // Show user-friendly message
    this.notifyUser(errorData);

    // Handle specific error types
    this.handleSpecificErrors(errorData);

    // Track error patterns
    this.trackError(errorData);
  }

  parseError(error, context) {
    const isAxiosError = error.response !== undefined;

    return {
      message: isAxiosError
        ? error.response?.data?.message || error.message
        : error.message,
      code: isAxiosError ? error.response?.data?.code : error.code,
      status: error.response?.status,
      timestamp: new Date().toISOString(),
      context: {
        component: context.component || "Unknown",
        action: context.action || "Unknown",
        userId: context.userId,
        ...context,
      },
      stack: error.stack,
      isNetworkError: error.message === "Network Error" || !error.response,
    };
  }

  logError(errorData) {
    if (process.env.NODE_ENV === "production") {
      // Send to monitoring service (Sentry, LogRocket, etc.)
      this.sendToMonitoring(errorData);
    } else {
      // Detailed console logging in development
      console.group(`🚨 Error in ${errorData.context.component}`);
      console.error("Message:", errorData.message);
      console.error("Code:", errorData.code);
      console.error("Context:", errorData.context);
      console.error("Stack:", errorData.stack);
      console.groupEnd();
    }
  }

  notifyUser(errorData) {
    const userMessage = this.getUserMessage(errorData);

    // Don't spam user with duplicate errors
    if (this.shouldShowToast(errorData)) {
      const toastOptions = {
        autoClose: this.getToastDuration(errorData),
        toastId: errorData.code || errorData.message, // Prevent duplicates
        // cancel: (
        //   <Button variant="secondary" className="p-1 rounded-full">
        //     <X />
        //   </Button>
        // ),
      };

      if (errorData.status >= 500) {
        toast.error(userMessage, toastOptions);
      } else if (errorData.status >= 400) {
        toast.warning(userMessage, toastOptions);
      } else {
        toast.error(userMessage, toastOptions);
      }
    }
  }

  getUserMessage(errorData) {
    // User-friendly error messages
    const messages = {
      // Authentication errors
      TOKEN_EXPIRED: "Your session expired. Refreshing...",
      INVALID_TOKEN: "Please log in again",
      SESSION_EXPIRED: "Your session has ended. Please log in.",
      NO_TOKEN: "Authentication required",

      // Authorization errors
      INSUFFICIENT_PERMISSIONS: "You don't have permission for this action",
      ACCOUNT_DISABLED: "Your account has been disabled",
      ACCOUNT_INACTIVE: "Please activate your account",

      // Network errors
      NETWORK_ERROR: "Connection problem. Check your internet.",
      TIMEOUT_ERROR: "Request timed out. Please try again.",

      // Validation errors
      VALIDATION_ERROR: "Please check your input",
      DUPLICATE_ENTRY: "This already exists",

      // Server errors
      SERVER_ERROR: "Something went wrong. Please try again.",
      SERVICE_UNAVAILABLE: "Service temporarily unavailable",
    };

    // Check for network errors
    if (errorData.isNetworkError) {
      return messages["NETWORK_ERROR"];
    }

    // Return custom message or fallback
    return (
      messages[errorData.code] || errorData.message || messages["SERVER_ERROR"]
    );
  }

  shouldShowToast(errorData) {
    const errorKey = `${errorData.code}-${errorData.message}`;
    const lastTime = this.lastErrorTime.get(errorKey);
    const now = Date.now();

    // Don't show same error within 3 seconds
    if (lastTime && now - lastTime < 3000) {
      return false;
    }

    this.lastErrorTime.set(errorKey, now);
    return true;
  }

  getToastDuration(errorData) {
    // Longer duration for important errors
    if (errorData.status === 401 || errorData.status === 403) {
      return 5000;
    }
    return 3000;
  }

  handleSpecificErrors(errorData) {
    switch (errorData.code) {
      case "TOKEN_EXPIRED":
      case "SESSION_EXPIRED":
        // Token refresh is handled by axios interceptor
        break;

      case "INVALID_TOKEN":
      case "NO_TOKEN":
        // Clear auth and redirect
        this.handleAuthError();
        break;

      case "INSUFFICIENT_PERMISSIONS":
        // Redirect to appropriate page
        window.location.href = "/";
        break;

      case "NETWORK_ERROR":
        // Could implement offline mode
        this.handleNetworkError();
        break;

      default:
        break;
    }
  }

  handleAuthError() {
    // Clear local storage
    localStorage.removeItem("accessToken");

    // Redirect to login
    const currentPath = window.location.pathname;
    if (currentPath !== "/login") {
      window.location.href = `/login?redirect=${encodeURIComponent(
        currentPath
      )}`;
    }
  }

  handleNetworkError() {
    // You could show an offline banner
    console.warn("Network error detected");
  }

  trackError(errorData) {
    const errorKey = `${errorData.code}-${errorData.context.action}`;
    const count = (this.errorCounts.get(errorKey) || 0) + 1;
    this.errorCounts.set(errorKey, count);

    // Alert if same error happens too frequently
    if (count >= 5) {
      console.error(`Error "${errorKey}" occurred ${count} times`);
      // Could send alert to monitoring
    }
  }

  sendToMonitoring(errorData) {
    // Integration with Sentry, LogRocket, etc.
    if (window.Sentry) {
      window.Sentry.captureException(new Error(errorData.message), {
        level: "error",
        extra: errorData,
      });
    }

    // Or send to your own logging endpoint
    // fetch('/api/logs/error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData),
    // }).catch(() => {
    //   // Silently fail if logging fails
    // });
  }

  // Clear error tracking (useful for testing)
  clearTracking() {
    this.errorCounts.clear();
    this.lastErrorTime.clear();
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();
export default errorHandler;
