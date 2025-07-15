import { Hono } from 'hono';
import { z } from 'zod';
import { jwtMiddleware } from '../middleware/authMiddleware';

type Bindings = {
	DB: D1Database;
};

type Variables = {
	user: {
		id: number;
		username: string;
	};
};

export const transactionsRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

transactionsRoutes.use('*', jwtMiddleware);

const transactionSchema = z.object({
	type: z.enum(['income', 'expense']),
	description: z.string().min(1),
	amount: z.preprocess((val) => Number(val), z.number().positive()),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});

// GET /transactions?date=yyyy-mm-dd
transactionsRoutes.get('/', async (c) => {
	const user = c.get('user');
	const date = c.req.query('date');
	const db = c.env.DB;

	let query = 'SELECT * FROM transactions WHERE user_id = ?';
	const params: any[] = [user.id];

	if (date?.trim()) {
		query += ' AND date = ?';
		params.push(date);
	}

	query += ' ORDER BY date DESC, id DESC';
	const result = await db
		.prepare(query)
		.bind(...params)
		.all();
	return c.json(result.results);
});

// POST /transactions
transactionsRoutes.post('/', async (c) => {
	const body = await c.req.json();
	const parsed = transactionSchema.safeParse(body);
	const user = c.get('user');
	const db = c.env.DB;

	if (!parsed.success) {
		return c.json({ error: 'Data transaksi tidak valid' }, 400);
	}

	const { type, description, amount, date } = parsed.data;

	const stmt = db.prepare('INSERT INTO transactions (user_id, type, description, amount, date) VALUES (?, ?, ?, ?, ?)');

	const result = (await stmt.bind(user.id, type, description, amount, date).run()) as any;

	return c.json({ success: true, id: result.lastRowId });
});

// DELETE /transactions/:id
transactionsRoutes.delete('/:id', async (c) => {
	const id = c.req.param('id');
	const user = c.get('user');
	const db = c.env.DB;

	const result = (await db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').bind(id, user.id).run()) as any;

	if (result.changes === 0) {
		return c.json({ error: 'Transaksi tidak ditemukan atau bukan milik Anda' }, 404);
	}

	return c.json({ success: true });
});
