# Checklist de Lançamento — Simulador PM MA 2026

As 7 fases do roadmap estão **implementadas e testadas automaticamente**. O que falta
abaixo é o que **depende de você** (contas externas, deploy, conteúdo) e a bateria de
testes manuais no ambiente real antes de subir o tráfego pago.

Legenda: `[ ]` a fazer · `[x]` feito · 🔴 bloqueia lançamento · 🟡 importante · 🟢 desejável

---

## 1. Contas e serviços externos

- [ ] 🔴 **Provedor de pagamento**: criar conta (Kirvano / Cakto / Mercado Pago) e o produto
      "Acesso até a Prova" (R$ 39,90, pagamento único).
- [ ] 🔴 Definir `CHECKOUT_URL` (link do produto) e `CHECKOUT_WEBHOOK_SECRET` (segredo do
      provedor) nas variáveis de ambiente de produção.
- [ ] 🔴 Configurar no painel do provedor: URL do webhook
      `https://SEU_DOMINIO/api/webhooks/checkout`, o segredo (header `x-webhook-secret`
      ou `?secret=`), o **external_reference** (para ecoar o `userId`) e a **success URL**
      apontando para `/planos/sucesso`.
- [ ] 🟡 Se escolher **Mercado Pago** (usa HMAC no header `x-signature`, não segredo
      simples): pedir o adapter de assinatura — o código atual usa segredo compartilhado
      (padrão Kirvano/Cakto).
- [ ] 🟡 Confirmar que o payload do provedor bate com o contrato canônico do webhook; se
      não, adicionar o adapter de tradução (rápido).

## 2. Deploy (Vercel)

- [ ] 🔴 Criar repositório no GitHub e dar `git push` (o repo local está pronto, 8 commits).
- [ ] 🔴 Importar o repositório na Vercel (deploy automático em push na main).
- [ ] 🔴 Cadastrar **todas** as variáveis do `.env.example` no painel da Vercel
      (DATABASE_URL, DIRECT_URL, chaves Supabase, CHECKOUT_*, NEXT_PUBLIC_SITE_URL).
- [ ] 🔴 `NEXT_PUBLIC_SITE_URL` = domínio real da Vercel (usado em SEO/sitemap/e-mails).
- [ ] 🟢 CI (GitHub Actions) já roda lint + typecheck + build em cada PR.

## 3. Supabase (produção)

- [ ] 🔴 **Authentication → URL Configuration**: trocar Site URL para o domínio da Vercel e
      adicionar `https://SEU_DOMINIO/**` nas Redirect URLs.
- [ ] 🔴 **Rodar as migrations em produção** se usar um projeto Supabase separado do de dev
      (`npx prisma migrate deploy`) e o seed (`npx prisma db seed`).
- [ ] 🟡 **Google OAuth**: criar credenciais no Google Cloud e habilitar o provider no
      Supabase (ver conversa anterior). Sem isso, o botão Google dá erro tratado — o login
      por e-mail/senha funciona normalmente. **Isso resolve o Google login no celular.**
- [ ] 🟡 **SMTP próprio** (ex.: Resend): o SMTP embutido do Supabase envia só ~2 e-mails/h.
      Hoje a confirmação de e-mail está **desativada** (`mailer_autoconfirm=true`), então
      cadastro é instantâneo. Se quiser religar a confirmação em produção, configure SMTP
      próprio antes.
- [ ] 🟢 Rotacionar a senha do banco e as chaves de API (passaram pelo chat durante o dev).

## 4. Conteúdo

- [ ] 🔴 **Revisar as 56 questões** geradas por IA em `/admin/questoes` (gabaritos e
      explicações). Qualquer item pode ser editado ou despublicado.
- [ ] 🟡 Ampliar o banco: meta de ~20–30 questões por matéria prioritária (Português, RLM,
      Legislação) para não repetir questão em simulados seguidos. Use o **Importar JSON**.
- [ ] 🟡 Subir os primeiros **PDFs de resumo** em `/admin/materiais` (a biblioteca mostra
      empty state até ter conteúdo).
- [ ] 🟢 Revisar preço do plano no seed/admin se mudar de R$ 39,90.

## 5. Testes manuais no ambiente publicado (antes dos ads)

### Fluxo do candidato (fazer num celular real — mobile-first)

- [ ] Landing carrega, contador de dias aparece, CTAs funcionam.
- [ ] Cadastro por e-mail/senha → cai direto no dashboard (sem e-mail).
- [ ] (Se OAuth configurado) Login com Google no **celular** funciona.
- [ ] Criar simulado (misto e por matéria), responder com cronômetro, recarregar a página
      **não zera o cronômetro**, finalizar → nota líquida correta + gabarito comentado.
- [ ] Dashboard mostra cards, gráfico por matéria (barra vermelha = mais fraca) e evolução.
- [ ] Segundo simulado grátis na mesma semana → **bloqueado** com oferta (`/planos`).
- [ ] Bottom nav funciona em todas as telas; nenhuma tela quebrada em 375px.

### Billing (compra real de baixo valor)

- [ ] 🔴 Fazer **uma compra real** (ou sandbox) → webhook libera acesso **sem passo manual**
      → `/planos/sucesso` mostra "acesso liberado" → simulados ilimitados destravados.
- [ ] Testar **estorno** (sandbox) → acesso volta para free.
- [ ] Verificar nos logs da Vercel que o webhook logou o evento (`scope: checkout_webhook`).

### Gating premium

- [ ] PDF free baixa no plano free; PDF premium bloqueia free (→ `/planos`) e libera pago.

### Saúde e segurança

- [ ] `GET /api/health` retorna `{"status":"ok","db":"up"}`.
- [ ] `robots.txt` e `sitemap.xml` acessíveis; área logada fora do sitemap.

## 6. Performance e qualidade (antes de escalar)

- [ ] 🟡 **Lighthouse mobile ≥ 85** na landing (rodar no Chrome DevTools ou PageSpeed
      Insights com a URL de produção).
- [ ] 🟢 Conferir Open Graph (compartilhar o link no WhatsApp e ver o preview).
- [ ] 🟢 Sentry ou similar para monitorar erros (opcional; os logs da Vercel já cobrem o MVP).

---

## Comandos úteis (scripts já prontos no repo)

```bash
npx tsx scripts/audit-rls.ts        # auditoria de isolamento (RLS)
npx tsx scripts/test-phase3.ts      # correção Cebraspe / gate free
npx tsx scripts/test-phase4.ts      # agregações do dashboard + fixtures PDF
BASE_URL=<url> npx tsx scripts/test-phase6.ts   # billing (servidor no ar)
npx tsx scripts/confirm-user.ts <email> [senha] # confirmar usuário manualmente
npx tsx scripts/set-plan.ts paid|free           # alternar plano de um usuário de teste
```

## Status das fases (todas testadas)

| Fase | Entrega                          | Status |
| ---- | -------------------------------- | ------ |
| 1    | Setup, CI, estrutura             | ✅     |
| 2    | Auth (Supabase + Prisma + RLS)   | ✅     |
| 3    | Simulados + correção Cebraspe    | ✅     |
| 4    | Dashboard + biblioteca de PDFs   | ✅     |
| 5    | UI shell + landing               | ✅     |
| 6    | Billing (webhook idempotente)    | ✅     |
| 7    | Polimento (segurança, SEO, perf) | ✅     |

**Contas de teste (dev):** `admin@simuladorpmma.dev` / `AdminPMMA-2026!` (admin) ·
`teste-fase2@simuladorpmma.dev` / `TesteFase2-2026!` (usuário comum).
