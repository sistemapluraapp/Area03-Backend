# Area03-Backend

Backend da **Área 03 (Gov — Institucional)** da Plura — Hono 4 em Cloudflare Workers.
Atende `gov.plura.app.br` (Area03-Frontend). Edita só páginas `tipo = publica`.

Repositório separado da Área 02 por isolamento de código entre B2B e Governo,
mesmo com funções quase idênticas. A diferença estrutural é o login: conta
institucional (`gov_contas`) criada **só a partir de um convite** gerado no ADM.

## Funções
- Cadastro institucional pelo token do convite (`/convites/:token`, `/auth/signup`)
- Login de conta Gov ou de usuário CPF que colabore em página Gov / tenha convite pendente
- Criar e editar páginas institucionais (mesmo editor por abas da Área 02)
- Equipe: contas Gov **e** usuários Plura podem colaborar em páginas Gov
- Responder avaliações, eventos, experiências, galeria
- Certificações: inscrição e preenchimento
- Conteúdo pós-confirmação e termos (`/conteudo/:chave`, `/termos/:chave`)

## Stack e estrutura
Mesma organização do Area02-Backend. Diferenças:
```
src/lib/areaConfig.ts   tipoPagina 'publica', escopo 'b2g', aceitaContaGov true
src/routes/auth.ts      signup por convite, validarConvite, login gov/colaborador
src/routes/conteudo.ts  páginas pós-confirmação e termos (públicas)
```
Não há pasta de migrations aqui: o banco é o mesmo `grupo.01`, versionado em
`Area02-Backend/db/migrations` e `Area04-Backend/db/migrations`.

## Rodar localmente
```
npm install
npm run dev          # wrangler dev → http://localhost:8787
npm run typecheck
```

## Configuração
| Nome | Tipo | Descrição |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | var | Projeto `grupo.01` (publishable key) |
| `AREA`, `FRONTEND_URL`, `EMAIL_REMETENTE` | var | `"03"`, `https://gov.plura.app.br`, remetente |
| `CERTIFICACOES` | binding R2 | Arquivos das inscrições |
| `LIMITE` | binding ratelimit | 20/min por IP em cadastro, login, senha, convites e convite de equipe |
| `RESEND_API_KEY` | secret | E-mail |
| `CSC_API_KEY` | secret (opcional) | Localidades fora do Brasil |

## Segurança
- Rotas públicas: `/health`, `/auth/*`, `/convites/*`, `/conteudo/*`, `/termos/*`; as demais exigem login.
- `/paginas/:id/*` confere tipo da página, vínculo ativo e permissão da aba (também no RLS).
- Limite por IP nas rotas públicas de autenticação/convite e no convite de equipe: `429 limite_tentativas`.

## Deploy
Push em `main`/`claude/great-franklin-kisti3` → Worker `area03-backend`;
branches de teste → `area03-backend-teste`.
Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `RESEND_API_KEY`, `CSC_API_KEY` (opcional).
