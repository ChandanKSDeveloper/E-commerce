import { Navigate, useLocation } from "react-router-dom";
import useUserStore from "../../store/useUserStore";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading, authChecked } = useUserStore();
    const location = useLocation();

    // Show loading spinner while initial auth check is in progress
    if (!authChecked || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                        Verifying your session...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
}