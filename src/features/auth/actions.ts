"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { formatRetryAfter, getClientIp, rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { ensureUser } from "@/services/users";

export type AuthActionState = {
  error?: string;
  success?: string;
};

/** Traduz os erros mais comuns do Supabase Auth para pt-BR. */
function translateAuthError(code: string | undefined, fallback: string): string {
  const map: Record<string, string> = {
    invalid_credentials: "E-mail ou senha incorretos.",
    email_not_confirmed: "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
    user_already_exists: "Este e-mail já está cadastrado. Faça login.",
    email_exists: "Este e-mail já está cadastrado. Faça login.",
    weak_password: "Senha muito fraca. Use pelo menos 8 caracteres.",
    same_password: "A nova senha precisa ser diferente da atual.",
    over_email_send_rate_limit:
      "Muitos e-mails enviados. Aguarde alguns minutos e tente novamente.",
    over_request_rate_limit: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    validation_failed: "Dados inválidos. Confira o e-mail informado.",
  };
  return (code && map[code]) || fallback || "Algo deu errado. Tente novamente.";
}

async function getOrigin() {
  const headerList = await headers();
  return headerList.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Sanitiza o destino pós-login para evitar open redirect. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

/** Rate limit por IP para conter bots/credential stuffing. */
async function checkRateLimit(
  action: string,
  limit: number,
  windowMs: number,
): Promise<string | null> {
  const ip = await getClientIp();
  const result = rateLimit(`${action}:${ip}`, limit, windowMs);
  if (result.ok) return null;
  return `Muitas tentativas. Tente novamente em ${formatRetryAfter(result.retryAfterSeconds)}.`;
}

export async function signUp(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Preencha nome, e-mail e senha." };
  }
  if (password.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }

  const limited = await checkRateLimit("signup", 5, 30 * 60_000);
  if (limited) return { error: limited };

  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { error: translateAuthError(error.code, error.message) };
  }

  // Supabase retorna user sem identities quando o e-mail já existe
  if (data.user && data.user.identities?.length === 0) {
    return { error: "Este e-mail já está cadastrado. Faça login." };
  }

  // Confirmação de e-mail desativada: sessão criada direto
  if (data.session && data.user) {
    await ensureUser(data.user);
    redirect("/dashboard");
  }

  return {
    success: "Cadastro criado! Enviamos um link de confirmação para o seu e-mail.",
  };
}

export async function signIn(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const limited = await checkRateLimit("signin", 10, 10 * 60_000);
  if (limited) return { error: limited };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: translateAuthError(error.code, error.message) };
  }

  await ensureUser(data.user);
  redirect(next);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Informe seu e-mail." };
  }

  const limited = await checkRateLimit("reset", 3, 30 * 60_000);
  if (limited) return { error: limited };

  const supabase = await createClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/atualizar-senha`,
  });

  if (error && error.code === "over_email_send_rate_limit") {
    return { error: translateAuthError(error.code, error.message) };
  }

  // Resposta neutra: não revela se o e-mail existe na base
  return {
    success: "Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.",
  };
}

export async function updatePassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { error: "As senhas não conferem." };
  }

  const limited = await checkRateLimit("update-password", 5, 10 * 60_000);
  if (limited) return { error: limited };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Solicite um novo link de redefinição." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: translateAuthError(error.code, error.message) };
  }

  redirect("/dashboard");
}
