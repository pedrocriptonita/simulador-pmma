import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPdfDownloadUrl } from "@/services/pdfs";

/**
 * Download seguro de PDF: valida sessão + gate premium no servidor e
 * redireciona para uma signed URL de curta duração. O bucket é privado —
 * a URL nunca é exposta na página.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { origin } = new URL(_request.url);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login?next=/materiais`);
  }

  const result = await getPdfDownloadUrl(user.id, id);
  if (!result.ok) {
    if (result.reason === "blocked_premium") {
      return NextResponse.redirect(`${origin}/planos?motivo=premium`);
    }
    return NextResponse.redirect(`${origin}/materiais?erro=indisponivel`);
  }

  return NextResponse.redirect(result.url);
}
