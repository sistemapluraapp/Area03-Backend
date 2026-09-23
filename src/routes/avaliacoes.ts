import type { Context } from 'hono'
import { enviarEmail } from '../lib/email'
import type { AppEnv } from '../types'

export async function responderAvaliacao(c: Context<AppEnv>) {
  const supabase = c.get('supabase')
  const id = c.req.param('id')
  const body = await c.req.json<{ resposta?: string }>().catch(() => null)

  if (!body?.resposta) {
    return c.json({ error: 'Campo obrigatório: resposta' }, 400)
  }

  const { data, error } = await supabase
    .from('avaliacoes')
    .update({ resposta: body.resposta })
    .eq('id', id)
    .select('id, pagina_id, nota, comentario, resposta, respondido_em')
    .single()

  if (error) return c.json({ error: error.message }, 400)

  try {
    const { data: email, error: rpcError } = await supabase.rpc('notificar_resposta_avaliacao', {
      p_avaliacao_id: id,
      p_resposta: body.resposta,
    })

    if (!rpcError && email) {
      const trecho = body.resposta.length > 200 ? `${body.resposta.slice(0, 200)}…` : body.resposta
      await enviarEmail(
        c.env.RESEND_API_KEY,
        email,
        '[Plura] Você recebeu uma resposta à sua avaliação',
        `<p>Olá,</p><p>A página que você avaliou respondeu à sua avaliação:</p><p>"${trecho}"</p><p>Atenciosamente,<br/>Equipe Plura</p>`
      )
    } else if (rpcError) {
      console.error('Erro ao notificar resposta de avaliação:', rpcError.message)
    }
  } catch (err) {
    console.error('Erro ao processar notificação de resposta de avaliação:', err)
  }

  return c.json(data)
}
