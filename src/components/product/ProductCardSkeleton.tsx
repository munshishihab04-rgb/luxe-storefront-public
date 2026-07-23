import { Skeleton } from "@/components/ui/skeleton.tsx";

export default function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-square w-full rounded" />
      <div className="pt-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-8 rounded" />
          ))}
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}
