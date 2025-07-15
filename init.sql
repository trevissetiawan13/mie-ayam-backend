-- Tabel users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE CHECK(length(username) <= 10),
  password TEXT NOT NULL CHECK(length(password) <= 20)
);

-- Tabel transactions
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL CHECK(length(description) <= 100),
  amount REAL NOT NULL CHECK (amount >= 0),
  date TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
