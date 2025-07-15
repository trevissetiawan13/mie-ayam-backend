import { Hono } from 'hono'
import { authRoutes } from './routes/auth'
import { transactionsRoutes } from './routes/transactions'
import { cors } from 'hono/cors'

const app = new Hono()

// Middleware CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
}))

// Rute
app.route('/auth', authRoutes)
app.route('/transactions', transactionsRoutes)

// Tes root route
app.get('/', (c) => c.text('API Mie Ayam Bu Sumi berjalan!'))

export default app
