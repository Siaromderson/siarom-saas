# Edge Functions — Chat interativo (Siarom AI)

Infraestrutura de **envio de mensagens de WhatsApp** usada pelo CRM (tela
_Chat interativo_) e pelo seu fluxo **n8n**. Duas funções:

| Função            | O que faz                                             |
| ----------------- | ----------------------------------------------------- |
| `enviar-mensagem` | Dispara mensagem de **texto** para o WhatsApp (UAZAPI) |
| `enviar-midia`    | Transmite **imagem / vídeo / áudio / documento**       |

Ambas: enviam pela UAZAPI **e** persistem a mensagem na tabela `public.mensagens`.
Nenhuma credencial fica no código — tudo vem de **Supabase Secrets**.

---

## 1) Secrets (Supabase → Edge Functions → Secrets)

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são injetados automaticamente.
Defina os demais:

```bash
supabase secrets set UAZAPI_SERVER_URL="https://siaromai.uazapi.com"
supabase secrets set CHAT_API_SECRET="<gere: openssl rand -hex 32>"
```

- **UAZAPI_SERVER_URL** — URL base do servidor UAZAPI (o mesmo do app).
- **CHAT_API_SECRET** — segredo compartilhado exigido no header `x-api-key`.
  Use o **mesmo valor** na env `CHAT_API_SECRET` do Next.js e no n8n.

> O token/instância da UAZAPI **por empresa** já ficam em `empresas.uazapi_token`
> / `empresas.uazapi_instance` — as funções leem de lá via service role.

## 2) Migration

Rode `supabase/migrations/009_chat_interativo.sql` (SQL Editor) — cria a tabela
`mensagens`, o bucket `chat-midias`, as policies (RLS) e o Realtime.

## 3) Deploy

Cada função é um **arquivo único** (`index.ts`) — não depende de mais nada.

**Pelo painel (sem instalar nada):**
1. Dashboard → **Edge Functions** → **Create a function** → **Via Editor**.
2. Nome: `enviar-mensagem`. Apague o exemplo e **cole todo o conteúdo** de
   `enviar-mensagem/index.ts`. Clique **Deploy**.
3. Nas configurações da função, **desligue "Verify JWT"** (a autorização é o
   `x-api-key`).
4. Repita para `enviar-midia`.

**Ou pelo CLI:**
```bash
supabase functions deploy enviar-mensagem --no-verify-jwt
supabase functions deploy enviar-midia    --no-verify-jwt
```

`--no-verify-jwt` / "Verify JWT" desligado: a autorização é feita pelo
`x-api-key` (permite chamar do app e do n8n sem sessão de usuário).

---

## 4) Endpoints HTTP (para refletir no n8n)

Base: `https://<PROJECT_REF>.supabase.co/functions/v1`
No projeto atual: `https://mwyjpvxjythfjcmwrcxn.supabase.co/functions/v1`

### `enviar-mensagem` — texto

```
POST https://mwyjpvxjythfjcmwrcxn.supabase.co/functions/v1/enviar-mensagem
Headers:
  Content-Type: application/json
  x-api-key: <CHAT_API_SECRET>
Body:
{
  "chat_id": "uuid-do-chat",          // opcional: deriva empresa_id + telefone
  "empresa_id": "uuid-da-empresa",    // obrigatório se não enviar chat_id
  "telefone": "5511999999999",        // obrigatório se não enviar chat_id
  "texto": "Olá! Tudo bem?",          // obrigatório
  "remetente": "atendente"            // opcional: atendente | alice
}
```

### `enviar-midia` — imagem / vídeo / áudio / documento

```
POST https://mwyjpvxjythfjcmwrcxn.supabase.co/functions/v1/enviar-midia
Headers:
  Content-Type: application/json
  x-api-key: <CHAT_API_SECRET>
Body:
{
  "chat_id": "uuid-do-chat",          // opcional: deriva empresa_id + telefone
  "empresa_id": "uuid-da-empresa",    // obrigatório se não enviar chat_id
  "telefone": "5511999999999",        // obrigatório se não enviar chat_id
  "url": "https://.../arquivo.pdf",   // obrigatório: link público da mídia
  "tipo": "documento",                // imagem | video | audio | documento
  "legenda": "Segue o material",      // opcional
  "nome": "catalogo.pdf",             // opcional (nome exibido no documento)
  "remetente": "atendente"            // opcional: atendente | alice
}
```

### Resposta (ambas)

```json
// 200 OK
{
  "ok": true,
  "wa_message_id": "ABCD1234...",
  "mensagem": { "id": "...", "chat_id": "...", "tipo": "texto", "...": "..." },
  "provider": { /* resposta crua da UAZAPI */ }
}

// 401 { "error": "Não autorizado." }              → x-api-key ausente/errado
// 400 { "error": "..." }                           → payload inválido
// 502 { "ok": false, "error": "Falha no envio...", "mensagem": {...} }
```

---

## 5) Recebimento (entrada) — seu n8n

O envio (saída) é coberto por estas funções. Para as mensagens **recebidas**
aparecerem no Chat interativo em tempo real, o seu fluxo n8n (webhook da UAZAPI)
deve **inserir** uma linha em `public.mensagens` com:

```json
{
  "empresa_id": "uuid",
  "chat_id": "uuid",           // ou resolva pelo telefone
  "direcao": "entrada",
  "tipo": "texto",
  "conteudo": "mensagem recebida",
  "remetente": "contato",
  "status": "recebida"
}
```

Use a **service role key** ou o endpoint REST do Supabase (`/rest/v1/mensagens`).
O Realtime já está ligado nessa tabela — a mensagem aparece na tela na hora.
