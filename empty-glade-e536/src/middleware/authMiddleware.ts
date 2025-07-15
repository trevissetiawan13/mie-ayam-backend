import { MiddlewareHandler } from 'hono'
import { verify } from 'hono/jwt'

export const jwtMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Token tidak ditemukan' }, 401)
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = await verify(token, c.env.JWT_SECRET)
    c.set('user', payload) // simpan user info ke context
    await next()
  } catch (err) {
    return c.json({ error: 'Unauthorized: Token tidak valid' }, 401)
  }
}
