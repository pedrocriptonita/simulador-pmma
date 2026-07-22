import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AuthActionState } from "@/features/auth/actions";

export function AuthMessage({ state }: { state: AuthActionState }) {
  if (state.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertDescription>{state.error}</AlertDescription>
      </Alert>
    );
  }
  if (state.success) {
    return (
      <Alert>
        <CheckCircle2 />
        <AlertDescription>{state.success}</AlertDescription>
      </Alert>
    );
  }
  return null;
}
