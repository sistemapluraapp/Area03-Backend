import type { Context, Next } from 'hono'
import type { AppEnv } from '../types'

// Limite de tentativas por IP (Workers Rate Limiting, binding LIMITE no
// wrangler.toml). Protege login, cadastro e as rotas que revelam se uma conta
// existe (cpf_em_uso, conta_por_email) contra tentativa em massa. Sem o
// binding (ex.: wrangler dev antigo) não limita.
export function limitarPorIp(grupo: string) {
  return async (c: Context<AppEnv>, next: Next) => {
    const limite = c.env.LIMITE
    if (limite) {
      const ip = c.req.header('cf-connecting-ip') ?? 'desconhecido'
      const { success } = await limite.limit({ key: `${grupo}:${ip}` })
      if (!success) {
        return c.json({ error: 'Muitas tentativas em pouco tempo. Aguarde um minuto e tente de novo.', codigo: 'limite_tentativas' }, 429)
      }
    }
    await next()
  }
}
