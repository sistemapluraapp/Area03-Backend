# Area03-Backend

Backend da Área 03 (Gov) da Plura — Hono em Cloudflare Workers.

Repositório distinto da Área 02, mesmo com funções quase idênticas, por
isolamento de código-fonte entre B2B e Governo. A diferença estrutural é o
login: conta institucional própria (`gov_contas`), não o CPF pessoal.

Funções desta área:
- Criar Página institucional (tipo `publica`)
- Monitorar a própria Página institucional
- Participar de outras Páginas institucionais como colaborador
- Avaliar/responder comentários recebidos
- Buscar/consultar verificações
- Login e criação de conta institucional (`gov_contas`)

Banco de dados: Supabase `grupo.01` (`https://uoembacxxnkuwldmdgcu.supabase.co`) —
mesmo projeto das Áreas 01/02, tabela `gov_contas` separada de `usuarios`.

## Deploy
O workflow `.github/workflows/deploy.yml` roda `wrangler deploy` a cada push.
Precisa dos secrets do repositório: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

## Secrets do Worker (nunca no código)
```
wrangler secret put SUPABASE_ANON_KEY
```
