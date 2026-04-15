import { Loader2 } from "lucide-react";

export default function PageTransitionLoader() {
    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-3 shadow-xl">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">Loading products...</span>
            </div>
        </div>
    );
}