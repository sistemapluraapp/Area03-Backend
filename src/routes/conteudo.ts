import type { Context } from 'hono'
import { getAnonClient } from '../lib/supabase'
import type { AppEnv } from '../types'

// Endereço para onde o link de confirmação do e-mail leva depois de validar
export function urlContaConfirmada(c: Context<AppEnv>) {
  return `${c.env.FRONTEND_URL}/conta-confirmada`
}

// Conteúdo das páginas de boas-vindas, editado no ADM (E-mails e boas-vindas)
export async function obterConteudoPagina(c: Context<AppEnv>) {
  const chave = c.req.param('chave') as string
  if (!/^pagina_[a-z0-9_]+$/.test(chave)) return c.json({ error: 'Conteúdo não encontrado' }, 404)
  const { data, error } = await getAnonClient(c)
    .from('modelos_comunicacao')
    .select('chave, titulo, corpo_html, botao_texto, imagem_url, imagem_link, imagem_posicao')
    .eq('chave', chave)
    .maybeSingle()
  if (error) return c.json({ error: error.message }, 500)
  if (!data) return c.json({ error: 'Conteúdo não encontrado' }, 404)
  c.header('Cache-Control', 'public, max-age=60')
  return c.json(data)
}

// Reenvia o e-mail de confirmação (link expirado ou perdido). A resposta é a
// mesma exista ou não a conta, para não revelar quais e-mails estão cadastrados.
export async function reenviarConfirmacao(c: Context<AppEnv>) {
  const body = await c.req.json<{ email?: string }>().catch(() => null)
  const email = body?.email?.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.json({ error: 'Informe um e-mail válido' }, 400)
  const { error } = await getAnonClient(c).auth.resend({ type: 'signup', email, options: { emailRedirectTo: urlContaConfirmada(c) } })
  if (error && /rate|seconds|limit/i.test(error.message)) {
    return c.json({ error: 'Aguarde um minuto antes de pedir outro e-mail.' }, 429)
  }
  return c.json({ message: 'Se houver um cadastro pendente para este e-mail, enviamos um novo link de confirmação.' })
}

// Termos e condições editados no ADM (Comunicação → Termos e condições)
export async function obterTermo(c: Context<AppEnv>) {
  const chave = c.req.param('chave') as string
  if (!/^termos_[a-z0-9_]+$/.test(chave)) return c.json({ error: 'Termo não encontrado' }, 404)
  const { data, error } = await getAnonClient(c).from('termos').select('chave, titulo, conteudo_html, atualizado_em').eq('chave', chave).maybeSingle()
  if (error) return c.json({ error: error.message }, 500)
  if (!data) return c.json({ error: 'Termo não encontrado' }, 404)
  c.header('Cache-Control', 'public, max-age=60')
  return c.json(data)
}
