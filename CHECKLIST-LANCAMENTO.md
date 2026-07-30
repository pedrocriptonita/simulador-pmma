# Checklist de Lançamento — Simulador PM MA 2026

As 7 fases do roadmap estão **implementadas e testadas automaticamente**. O que falta
abaixo é o que **depende de você** (contas externas, deploy, conteúdo) e a bateria de
testes manuais no ambiente real antes de subir o tráfego pago.

Legenda: `[ ]` a fazer · `[x]` feito · 🔴 bloqueia lançamento · 🟡 importante · 🟢 desejável

> Atualizado em **30/07/2026**. Infra de produção pronta: deploy, domínio próprio, Cakto e
> rastreamento GTM/Pixel. Faltam, para subir tráfego: a **compra real de teste**, o **AEM**
> e os **públicos de remarketing** no Meta. Prova: **11/10/2026**.

---

## 1. Pagamento — Cakto ✅

Provedor escolhido: **Cakto**. Ela não aceita campo de referência customizada no link de
checkout, então o comprador é identificado **pelo e-mail** (ver `features/billing/adapters/cakto.ts`).

- [x] 🔴 Conta criada e produto "Acesso até a Prova" configurado (pagamento único, Pix ativo).
- [x] 🔴 Variáveis em produção: `PAYMENT_PROVIDER=cakto`, `CHECKOUT_URL`,
      `CHECKOUT_WEBHOOK_SECRET` (o segredo é **gerado pela Cakto**, não escolhido por nós).
- [x] 🔴 Webhook apontando para `https://pmma.barvoxdigital.com.br/api/webhooks/checkout`
      com os eventos `purchase_approved`, `refund`, `chargeback`.
- [x] 🔴 Webhook validado em produção: `pix_gerado` → `{ignored: true}` e `purchase_approved`
      → `{reason: "user_not_found"}` (esperado com e-mail fictício). Secret e provider OK.
- [ ] 🟡 Conferir se o preço do plano no seed bate com o da Cakto. Se o payload vier sem
      `amount`, o código usa `plan.priceCents` como fallback — valores divergentes geram
      registro de compra com valor errado (e ROAS errado no Meta).
- [ ] 🟡 Avisar na `/planos` que o pagamento deve usar **o mesmo e-mail do cadastro** —
      e-mail diferente = acesso não liberado automaticamente.

## 2. Deploy (Vercel) ✅

- [x] 🔴 Repositório no GitHub (`pedrocriptonita/simulador-pmma`, branch `master`).
- [x] 🔴 Projeto na Vercel com deploy automático a cada push.
- [x] 🔴 Variáveis do `.env.example` cadastradas na Vercel.
- [x] 🔴 **Domínio próprio**: `pmma.barvoxdigital.com.br` (CNAME no Registro.br → Vercel),
      SSL válido. Subdomínio da agência, reaproveitável em projetos futuros.
- [ ] 🔴 `NEXT_PUBLIC_SITE_URL` = `https://pmma.barvoxdigital.com.br` **e redeploy sem build
      cache** — variável `NEXT_PUBLIC_` é embutida no build, editar sozinho não basta.
- [ ] 🟢 CI (GitHub Actions) já roda lint + typecheck + build em cada PR.

## 3. Supabase (produção)

- [ ] 🔴 **Authentication → URL Configuration**: Site URL = `https://pmma.barvoxdigital.com.br`
      e adicionar `https://pmma.barvoxdigital.com.br/**` nas Redirect URLs. Sem isso, a
      confirmação de e-mail e o login com Google quebram no domínio novo.
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

## 4. Rastreamento — GTM + Meta Pixel

Arquitetura: o site carrega **só o GTM** (`NEXT_PUBLIC_GTM_ID`, snippet em `app/layout.tsx`).
O Meta Pixel é uma tag **dentro** do container. O código empurra eventos para o `dataLayer`
via `lib/gtm.ts`; o GTM escuta e dispara as tags.

| Evento no dataLayer | Tag no GTM        | Onde dispara                        |
| ------------------- | ----------------- | ----------------------------------- |
| *(nenhum)*          | PageView          | All Pages + SPA nativo do pixel     |
| `cadastro_completo` | CompleteRegistration | `/dashboard?cadastro=sucesso`    |
| `compra_concluida`  | Purchase          | `/planos/sucesso` (com valor real)  |

- [x] 🔴 Container GTM (`GTM-TCFLFMMH`) instalado e **publicado**, com as 3 tags.
- [x] 🔴 Meta Pixel `1081791014277389` configurado nas 3 tags.
- [x] 🔴 `Purchase` mapeando `value` / `currency` / `transaction_id` via variáveis de camada
      de dados. O valor vem do banco (`purchase.amountCents`), não de um número fixo.
- [x] 🔴 Correspondência Avançada: `user_email` no dataLayer + ativado nas tags de conversão.
      O pixel aplica hash antes de enviar — nada em texto puro sai do navegador.
- [x] 🟡 Domínio `barvoxdigital.com.br` verificado no Meta (registro TXT no Registro.br).
      **Não remova esse TXT** — o Meta revalida periodicamente. Verificar o domínio raiz
      cobre todos os subdomínios, inclusive projetos futuros da agência.
- [ ] 🔴 **AEM** (Eventos Agregados), prioridade: `Purchase` → `CompleteRegistration` →
      `PageView`. Define o que o Meta contabiliza em iOS sem consentimento de rastreio.
- [ ] 🔴 **Criar os 3 públicos** de remarketing **antes** de ligar os anúncios (eles só
      acumulam gente a partir da criação):
      quente (visitou 30d, não cadastrou) · morno (cadastrou, não comprou) ·
      compradores (exclusão + semente de lookalike).
- [ ] 🟡 Validar no **Events Manager → Testar eventos** que os 3 eventos chegam em produção,
      com o `Purchase` trazendo `value` e `currency: BRL`.
- [ ] 🟢 **Conversions API** server-side (no webhook, que já recebe a confirmação de
      pagamento) para recuperar os ~15–30% de eventos perdidos por ad blocker / Safari ITP.
      A tag do Purchase já está com a integração CAPI da Meta ativada.

### Armadilhas já encontradas (não repetir)

- O snippet do GTM usa `event:'gtm.js'` — **não** `gtm.start`. O acionador "All Pages"
  filtra por `_event = gtm.js`; com o nome errado, **nenhuma tag dispara** e o sintoma é
  "container encontrado, 0 tags disparadas".
- O PageView de navegação SPA é do **próprio Meta Pixel** (History Event Tracking do
  template). Empurrar um `page_view` customizado além disso **duplica** o evento.
- Efeito de conversão precisa de trava (`useRef` / `sessionStorage`): o React StrictMode
  roda `useEffect` duas vezes em dev e duplica o evento.

## 5. Conteúdo

- [ ] 🔴 **Revisar as 56 questões** geradas por IA em `/admin/questoes` (gabaritos e
      explicações). Qualquer item pode ser editado ou despublicado.
- [ ] 🟡 Ampliar o banco: meta de ~20–30 questões por matéria prioritária (Português, RLM,
      Legislação) para não repetir questão em simulados seguidos. Use o **Importar JSON**.
- [ ] 🟡 Subir os primeiros **PDFs de resumo** em `/admin/materiais` (a biblioteca mostra
      empty state até ter conteúdo).
- [ ] 🔴 **Alinhar o preço**: a oferta de mídia trabalha com **R$ 37** (âncora R$ 97). Conferir
      se o seed, a `/planos` e o produto na Cakto batem — divergência confunde o comprador e
      registra valor errado no `Purchase` do pixel.

## 6. Testes manuais no ambiente publicado (antes dos ads)

### Fluxo do candidato (fazer num celular real — mobile-first)

- [ ] Landing carrega, contador de dias aparece, CTAs funcionam.
- [ ] Cadastro por e-mail/senha → cai direto no dashboard (sem e-mail).
- [ ] (Se OAuth configurado) Login com Google no **celular** funciona.
- [ ] Criar simulado (misto e por matéria), responder com cronômetro, recarregar a página
      **não zera o cronômetro**, finalizar → nota líquida correta + gabarito comentado.
- [ ] Dashboard mostra cards, gráfico por matéria (barra vermelha = mais fraca) e evolução.
- [ ] Segundo simulado grátis na mesma semana → **bloqueado** com oferta (`/planos`).
- [ ] Bottom nav funciona em todas as telas; nenhuma tela quebrada em 375px.

### Billing — o teste que falta ⚠️

O webhook já foi validado com os eventos de teste da Cakto, mas o caminho que **libera
acesso** ainda não foi exercitado (os testes usam e-mail fictício → `user_not_found`).

- [ ] 🔴 **Compra real ponta a ponta**: cupom de 100% na Cakto → cadastrar conta com um
      e-mail seu → comprar com **exatamente o mesmo e-mail**. Conferir os 4 sinais:
      log da Vercel `{ok: true, action: "granted"}` · `/planos/sucesso` mostra
      **"Acesso liberado!"** · simulados ilimitados destravados · evento `Purchase` no
      Test Events do Meta com `value` e `currency: BRL`.
- [ ] 🟡 Testar **estorno** → acesso volta para free (`refund` → `REFUNDED`).
- [ ] 🟡 Conferir no banco: `purchases.status = PAID` e `users.accessExpiresAt = 2026-10-11`.

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
