import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-busy="true" aria-label="Carregando projeto">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-8 h-10 w-2/3" />
      <Skeleton className="mt-4 h-5 w-1/2" />
      <Skeleton className="mt-10 aspect-[16/10] w-full rounded-xl" />
    </div>
  );
}
