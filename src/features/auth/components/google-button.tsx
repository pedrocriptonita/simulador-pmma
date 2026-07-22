"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function GoogleButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) {
      setError("Não foi possível entrar com o Google. Tente novamente.");
      setLoading(false);
    }
    // Em caso de sucesso o navegador é redirecionado ao Google
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleClick}
        disabled={loading}
      >
        <svg viewBox="0 0 24 24" aria-hidden className="size-4">
          <path
            fill="currentColor"
            d="M21.35 11.1H12v2.9h5.35c-.5 2.5-2.6 3.9-5.35 3.9a6 6 0 1 1 0-12c1.5 0 2.9.55 3.95 1.55l2.15-2.15A9 9 0 1 0 12 21c5.2 0 8.85-3.65 8.85-8.85 0-.35-.05-.7-.1-1.05Z"
          />
        </svg>
        {loading ? "Redirecionando..." : "Continuar com Google"}
      </Button>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
