import Database from 'better-sqlite3';

const db = new Database('data.db');

// Tabela de usuários
db.prepare(
    `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
  )
`
).run();

// Tabela de pedidos
db.prepare(
    `
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    order_date INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`
).run();

// Tabela de produtos com associação aos pedidos, como os product_id não são únicos, foi criado um outro id para gerenciamento
db.prepare(
    `
  CREATE TABLE IF NOT EXISTS order_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_price REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  )
`
).run();

export default db;
