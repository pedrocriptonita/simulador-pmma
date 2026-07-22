import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUser } from "@/services/users";

/**
 * Callback de OAuth (Google) e dos links de e-mail (confirmação de
 * cadastro e redefinição de senha): troca o code por sessão e garante
 * o registro User com plano Free.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await ensureUser(data.user);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback`);
}
