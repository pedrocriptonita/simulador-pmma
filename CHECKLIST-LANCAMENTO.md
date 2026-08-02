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
- [ ] 🔴 Meta Pixel **`1535969941543053`** ("Simulador PMMA 26") nas 3 tags do GTM e na
      `META_PIXEL_ID` da Vercel.
      ⚠️ O pixel original (`1081791014277389`) foi criado **fora** do portfólio Barvox
      Digital. Consequência: não dava para gerar token da CAPI nem configurar o AEM,
      porque o domínio verificado está no portfólio e o pixel não. Regra para os próximos
      projetos: **crie o pixel dentro do portfólio** e atribua controle total a si mesmo
      logo na criação.
- [x] 🔴 `Purchase` mapeando `value` / `currency` / `transaction_id` via variáveis de camada
      de dados. O valor vem do banco (`purchase.amountCents`), não de um número fixo.
- [x] 🔴 Correspondência Avançada: `user_email` no dataLayer + ativado nas tags de conversão.
      O pixel aplica hash antes de enviar — nada em texto puro sai do navegador.
- [x] 🟡 Domínio `barvoxdigital.com.br` verificado no Meta (registro TXT no Registro.br).
      **Não remova esse TXT** — o Meta revalida periodicamente. Verificar o domínio raiz
      cobre todos os subdomínios, inclusive projetos futuros da agência.
- [~] 🟢 **AEM** (Eventos Agregados) — a tela de configuração manual **não existe** nesta
      conta (30/07/2026); o Meta passou a gerenciar a priorização automaticamente em parte
      das contas. Se reaparecer, a ordem desejada é `Purchase` → `CompleteRegistration` →
      `PageView`. Afeta só atribuição de iOS sem consentimento — não bloqueia campanha.
      ⚠️ Se for configurar depois, cada alteração congela a otimização por 72h: mexer com
      campanha no ar dói, mexer sem campanha rodando é de graça.
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

- [x] 🔴 **Revisar as questões** em `/admin/questoes`. Banco em **379 questões ativas**,
      100% com gabarito comentado. Qualquer item pode ser editado ou despublicado.
- [x] 🟡 Ampliar o banco. Todas as 8 matérias cobertas — a menor tem 26 questões:
      Legislação 130 · Informática 50 · Português 47 · RLM 33 · Hist. MA 32 ·
      Geo. BR 31 · Hist. BR 30 · Geo. MA 26. Fontes em `docs/questoes-lote-*.json`.
- [x] 🟡 Subir os **PDFs de resumo** em `/admin/materiais`. **9 publicados**, sendo 1
      gratuito (Mapa de Pegadinhas). Fontes editáveis em `docs/materiais/src/`;
      regerar com `npx tsx scripts/build-materiais.ts`.
- [ ] 🟡 **Legislação é o gargalo de repetição**: 18 questões por simulado misto de 30,
      então ~7 simulados distintos antes de esgotar as 130. Suficiente para as
      primeiras semanas; engrossar com a campanha rodando.
- [x] 🔴 **Preço definido: R$ 39,90** (âncora R$ 97). Banco, seed e `/planos` já conferem
      (`priceCents: 3990`).
- [ ] 🔴 Conferir se o produto **na Cakto** também está R$ 39,90 — se o payload vier sem
      `amount`, o código usa `plan.priceCents` como fallback, e valores divergentes
      registram compra com valor errado (e ROAS errado no Meta).

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

**Estado em 02/08/2026:** a única compra do banco é de 30/07 (R$ 8,97), anterior a todas
as correções — checkout, normalização de e-mail e painel de órfãos. Ou seja: o caminho do
dinheiro **nunca rodou na versão que vai receber tráfego pago**. É o último bloqueador.

Rede de proteção já instalada, caso o e-mail do pagamento divergir do cadastro:
`/admin/pagamentos` registra o pagamento órfão para vinculação manual, em vez de o
webhook responder 200 e o dinheiro sumir do sistema.

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
