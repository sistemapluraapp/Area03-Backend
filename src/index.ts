import { Hono } from 'hono'
import { requireAuth } from './middleware/auth'
import { validarConvite, signup, login } from './routes/auth'
import { criarPagina, minhasPaginas, obterPagina, atualizarPagina } from './routes/paginas'
import { convidarColaborador, removerColaborador } from './routes/colaboradores'
import { responderAvaliacao } from './routes/avaliacoes'
import { solicitarCertificado, listarCertificados } from './routes/certificados'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

app.get('/health', (c) => c.json({ status: 'ok', area: c.env.AREA, service: 'backend' }))

// Login institucional (sempre disponível) e cadastro (só via link de convite válido)
app.get('/convites/:token', validarConvite)
app.post('/auth/signup', signup)
app.post('/auth/login', login)

app.use('*', async (c, next) => {
  const publicas = ['/health', '/auth/login', '/auth/signup']
  if (publicas.includes(c.req.path) || c.req.path.startsWith('/convites/')) return next()
  return requireAuth(c, next)
})

app.post('/paginas', criarPagina)
app.get('/minhas-paginas', minhasPaginas)
app.get('/paginas/:id', obterPagina)
app.put('/paginas/:id', atualizarPagina)

app.post('/paginas/:id/colaboradores', convidarColaborador)
app.delete('/paginas/:id/colaboradores/:vinculoId', removerColaborador)

app.patch('/avaliacoes/:id/resposta', responderAvaliacao)

app.post('/paginas/:id/certificados', solicitarCertificado)
app.get('/paginas/:id/certificados', listarCertificados)

export default app
