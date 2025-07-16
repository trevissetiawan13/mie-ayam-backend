import { Hono } from 'hono';
import { z } from 'zod';
import { sign } from 'hono/jwt';

type Bindings = {
	DB: D1Database;
	JWT_SECRET: string;
};

export const authRoutes = new Hono<{ Bindings: Bindings }>();

const userSchema = z.object({
	username: z.string().min(3).max(10),
	password: z.string().min(3).max(20),
});

// REGISTER
authRoutes.post('/register', async (c) => {
	const db = c.env.DB;
	const { username, password } = await c.req.json();

	const parsed = userSchema.safeParse({ username, password });
	if (!parsed.success) {
		return c.json({ error: 'Username dan password minimal 3 karakter' }, 400);
	}

	try {
		const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
		const result = await stmt.bind(username, password).run();

		return c.json({ success: true, message: 'Registrasi berhasil' });
	} catch (err: any) {
		if (err.message.includes('UNIQUE')) {
			return c.json({ error: 'Username sudah digunakan' }, 409);
		}
		return c.json({ error: 'Gagal registrasi' }, 500);
	}
});

// LOGIN
authRoutes.post('/login', async (c) => {
	const db = c.env.DB;
	const { username, password } = await c.req.json();

	console.log('[LOGIN] Attempt:', { username });

	const user = await db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').bind(username, password).first();

	if (!user) {
		console.warn('[LOGIN] Invalid credentials for:', username);
		return c.json({ error: 'Username atau password salah' }, 401);
	}

	const token = await sign({ id: user.id, username: user.username }, c.env.JWT_SECRET);

	console.log('[LOGIN] Login success:', { id: user.id });

	return c.json({ token });
});
