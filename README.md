# Siarom AI — Site + Checkout

Site institucional e de vendas da **Siarom AI**: agentes de Inteligência Artificial para
WhatsApp, Instagram e Facebook, com CRM e marketing integrados.

Feito em **Next.js 15 (App Router) + TypeScript + Tailwind CSS**, com checkout via **Stripe**
e deploy na **Vercel**.

> ℹ️ Projeto reconstruído do zero após perda na migração Windows → Linux. A identidade visual
> (cores/tipografia/logo) é provisória — ajuste em `tailwind.config.ts` e `components/Header.tsx`
> quando tiver a logo oficial.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha as chaves
npm run dev                  # http://localhost:3000
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variável | Onde pegar |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL do site (em produção, seu domínio) |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | mesma página (chave publicável) |
| `STRIPE_WEBHOOK_SECRET` | ao criar o webhook (ver abaixo) |
| `NEXT_PUBLIC_SUPABASE_*` | painel do Supabase (usado na fase 2 – CRM) |

## Estrutura

```
app/
  page.tsx            # landing (monta todas as seções)
  sucesso/            # página pós-pagamento
  api/checkout/       # cria a sessão de checkout do Stripe
  api/webhook/        # recebe confirmações do Stripe
components/           # Header, Hero, ComoFunciona, Planos, FAQ, Personalizado, Footer, WhatsAppFloat
lib/
  plans.ts            # PLANOS E PREÇOS (fonte única da verdade)
  constants.ts        # WhatsApp, textos, URL
  stripe.ts           # cliente Stripe (servidor)
```

Para alterar **preços ou recursos dos planos**, edite apenas `lib/plans.ts`.

## Webhook do Stripe

1. Em dashboard.stripe.com → Developers → Webhooks → **Add endpoint**
2. URL: `https://SEU_DOMINIO/api/webhook`
3. Eventos: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
4. Copie o **Signing secret** (`whsec_...`) para `STRIPE_WEBHOOK_SECRET`

Para testar local: `stripe listen --forward-to localhost:3000/api/webhook`

## Deploy na Vercel

```bash
# 1. Versionar (opcional, mas recomendado)
git init && git add -A && git commit -m "Site Siarom AI"

# 2a. Via CLI
npm i -g vercel && vercel

# 2b. Ou conecte o repositório em vercel.com (importa e faz deploy automático)
```

Depois, em **Vercel → Project → Settings → Environment Variables**, adicione todas as
variáveis do `.env.local`. O domínio é configurado em **Settings → Domains**.

## Próximos passos (fase 2 — CRM)

- Geração de chave de ativação após o pagamento (no `api/webhook`)
- Envio do email com a chave
- Autenticação (Supabase) e acesso ao CRM Siarom
- Painel do cliente e área administrativa
