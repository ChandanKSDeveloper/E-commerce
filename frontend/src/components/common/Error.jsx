import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";

export default function ErrorPage({ 
  error, 
  resetError,
  showHomeButton = true,
  showRetryButton = true,
  showBackButton = true
}) {
  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
            <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-500" />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Something went wrong!
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {error || "An unexpected error occurred. Please try again later."}
        </p>

        {/* Error Details (Optional - for development) */}
        {process.env.NODE_ENV === "development" && error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg text-left overflow-auto">
            <p className="text-sm font-mono text-red-700 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showBackButton && (
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          )}

          {showHomeButton && (
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Home Page
            </Button>
          )}

          {showRetryButton && (
            <Button
              onClick={handleRetry}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}