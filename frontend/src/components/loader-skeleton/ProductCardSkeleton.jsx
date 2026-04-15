import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="border rounded-xl p-3 hover:shadow-lg transition">
      <Skeleton className="w-full h-40 rounded-lg mb-3" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  );
}