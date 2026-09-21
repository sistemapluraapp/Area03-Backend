import type { Context } from 'hono'
import { getAnonClient } from '../lib/supabase'
import type { AppEnv } from '../types'

interface SignupBody {
  token?: string
  nome?: string
  orgao?: string
  email?: string
  password?: string
}

export async function validarConvite(c: Context<AppEnv>) {
  const token = c.req.param('token')
  const anon = getAnonClient(c)

  const { data, error } = await anon.rpc('validar_convite_gov', { p_token: token })
  if (error) return c.json({ error: error.message }, 500)

  const linha = Array.isArray(data) ? data[0] : null
  if (!linha) return c.json({ error: 'Link de cadastro inválido ou expirado' }, 404)

  return c.json({ cidade: linha.cidade })
}

export async function signup(c: Context<AppEnv>) {
  const body = await c.req.json<SignupBody>().catch(() => null)
  if (!body?.token || !body.nome || !body.orgao || !body.email || !body.password) {
    return c.json({ error: 'Campos obrigatórios: token, nome, orgao, email, password' }, 400)
  }

  const anon = getAnonClient(c)

  const { data: convite, error: conviteError } = await anon.rpc('validar_convite_gov', { p_token: body.token })
  if (conviteError) {
    return c.json({ error: conviteError.message }, 500)
  }
  const linhaConvite = Array.isArray(convite) ? convite[0] : null
  if (!linhaConvite) {
    return c.json({ error: 'Link de cadastro inválido ou expirado' }, 404)
  }

  const { data: signUpData, error: signUpError } = await anon.auth.signUp({
    email: body.email,
    password: body.password,
    options: { data: { tipo: 'gov', nome: body.nome, orgao: body.orgao, convite_token: body.token } },
  })

  if (signUpError || !signUpData.user) {
    return c.json({ error: signUpError?.message ?? 'Não foi possível criar a conta' }, 400)
  }

  if (!signUpData.session) {
    return c.json(
      { message: 'Conta criada. Confirme seu e-mail para poder fazer login.', pending_email_confirmation: true },
      201,
    )
  }

  return c.json(
    {
      user: { id: signUpData.user.id, email: body.email, nome: body.nome },
      access_token: signUpData.session.access_token,
      refresh_token: signUpData.session.refresh_token,
    },
    201,
  )
}

export async function login(c: Context<AppEnv>) {
  const body = await c.req.json<{ email?: string; password?: string }>().catch(() => null)
  if (!body?.email || !body.password) {
    return c.json({ error: 'Campos obrigatórios: email, password' }, 400)
  }

  const anon = getAnonClient(c)
  const { data, error } = await anon.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  })

  if (error || !data.session) {
    return c.json({ error: 'E-mail ou senha inválidos' }, 401)
  }

  return c.json({
    user: { id: data.user.id, email: data.user.email },
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  })
}
