import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase com a service role key — bypassa RLS.
 * USO EXCLUSIVO NO SERVIDOR (Storage: upload e signed URLs).
 * NUNCA importar em Client Components.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export const PDF_BUCKET = "pdfs";
