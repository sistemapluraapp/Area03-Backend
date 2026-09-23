import type { Context } from 'hono'
import type { AppEnv } from '../types'

export async function convidarColaborador(c: Context<AppEnv>) {
  const supabase = c.get('supabase')
  const paginaId = c.req.param('id')
  const body = await c.req.json<{ email?: string }>().catch(() => null)

  if (!body?.email) {
    return c.json({ error: 'Campo obrigatório: email' }, 400)
  }

  const { data: govContaId, error: rpcError } = await supabase.rpc('gov_conta_id_por_email', { p_email: body.email })

  if (rpcError) return c.json({ error: rpcError.message }, 500)
  if (!govContaId) return c.json({ error: 'Nenhuma conta Gov encontrada com esse e-mail' }, 404)

  const { data, error } = await supabase
    .from('vinculos')
    .insert({ pagina_id: paginaId, gov_conta_id: govContaId, papel: 'colaborador' })
    .select('id, gov_conta_id, papel, created_at')
    .single()

  if (error) return c.json({ error: error.message }, 400)
  return c.json(data, 201)
}

export async function removerColaborador(c: Context<AppEnv>) {
  const supabase = c.get('supabase')
  const paginaId = c.req.param('id')
  const vinculoId = c.req.param('vinculoId')

  const { error } = await supabase.from('vinculos').delete().eq('id', vinculoId).eq('pagina_id', paginaId)

  if (error) return c.json({ error: error.message }, 400)
  return c.body(null, 204)
}
