import { Skeleton } from "@/components/ui/skeleton";

export default function ResultadoLoading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <Skeleton className="h-56" />
      <Skeleton className="h-24" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
    </main>
  );
}
