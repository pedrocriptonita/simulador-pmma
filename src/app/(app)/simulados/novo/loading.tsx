import { Skeleton } from "@/components/ui/skeleton";

export default function NovoSimuladoLoading() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-[420px]" />
    </main>
  );
}
