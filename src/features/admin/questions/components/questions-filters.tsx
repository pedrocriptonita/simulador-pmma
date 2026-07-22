"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SubjectOption = { slug: string; name: string };

export function QuestionsFilters({ subjects }: { subjects: SubjectOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "todas") params.delete(key);
    else params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Matéria</Label>
        <Select
          defaultValue={searchParams.get("materia") ?? "todas"}
          onValueChange={(value) => setParam("materia", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.slug} value={subject.slug}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Status</Label>
        <Select
          defaultValue={searchParams.get("status") ?? "todas"}
          onValueChange={(value) => setParam("status", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos</SelectItem>
            <SelectItem value="publicadas">Publicadas</SelectItem>
            <SelectItem value="rascunhos">Rascunhos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Dificuldade</Label>
        <Select
          defaultValue={searchParams.get("dificuldade") ?? "todas"}
          onValueChange={(value) => setParam("dificuldade", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="FACIL">Fácil</SelectItem>
            <SelectItem value="MEDIO">Médio</SelectItem>
            <SelectItem value="DIFICIL">Difícil</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
