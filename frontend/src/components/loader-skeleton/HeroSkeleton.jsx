import { Skeleton } from "@/components/ui/skeleton";

export default function HeroSkeleton() {
    return (
        <div className="bg-gradient-to-r from-primary/60 to-primary/40 rounded-2xl p-6 md:p-10 mb-8">
            <Skeleton className="h-8 md:h-10 w-64 bg-white/20 mb-3" />
            <Skeleton className="h-4 md:h-5 w-96 bg-white/20 mb-4" />
            <Skeleton className="h-10 w-32 rounded-md bg-white/20" />
        </div>
    );
}