import db from '../db';
import { Order } from '../types/Order';
import { Product } from '../types/Product';
import { Row } from '../types/Row';
import { User } from '../types/User';
import { formatDate, formatPrice } from './dataUtils';

//Faz a inserção dos dados nas respectivas tabelas
export function importRecord(record: Row) {
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)
    `);
    insertUser.run(record.user_id, record.user_name);

    const insertOrder = db.prepare(`
      INSERT OR IGNORE INTO orders (id, user_id, order_date) VALUES (?, ?, ?)
    `);
    insertOrder.run(record.order_id, record.user_id, record.order_date);

    const insertOrderProduct = db.prepare(`
      INSERT OR IGNORE INTO order_products (order_id, product_id, product_price) VALUES (?, ?, ?)
    `);
    insertOrderProduct.run(
        record.order_id,
        record.product_id,
        record.product_price
    );
}

//Filtra as pedidos por data e os retorna no formato padrão
export function getOrdersBetweenDates(start: number, end: number) {
    const ordersByUserInRange = db
        .prepare(
            `
      SELECT * FROM orders 
      WHERE order_date >= ? 
      AND order_date <= ?
    `
        )
        .all(start, end) as Order[];

    const userIds = [
        ...new Set(ordersByUserInRange.map((order) => order.user_id)),
    ];
    const users = db
        .prepare(
            `SELECT * FROM users WHERE id IN (${userIds.map(() => '?').join(',')})`
        )
        .all(...userIds) as User[];

    const productsByOrder = db
        .prepare(
            `
      SELECT id, product_price, product_id, order_id
      FROM order_products
    `
        )
        .all();

    const result = users.map((user) => {
        const orders = ordersByUserInRange.map((order) => {
            let total = 0;
            const products = (productsByOrder as Product[])
                .filter((p) => p.order_id == order.id)
                .map((product) => {
                    total += product.product_price;
                    return {
                        product_id: product.product_id,
                        value: formatPrice(product.product_price),
                    };
                });
            return {
                order_id: order.id,
                date: formatDate(order.order_date),
                total: formatPrice(total),
                products,
            };
        });

        return {
            user_id: user.id,
            name: user.name,
            orders,
        };
    });

    return result;
}

//Busca todos os pedidos e os retorna no formato padrão
export function getAllOrders() {
    const users = db.prepare(`SELECT * FROM users`).all() as User[];

    const ordersByUser = db
        .prepare(
            `
      SELECT * FROM orders
    `
        )
        .all();

    const productsByOrder = db
        .prepare(
            `
      SELECT id, product_price, product_id
      FROM order_products
    `
        )
        .all();

    const result = users.map((user) => {
        const orders = (ordersByUser as Order[])
            .filter((o) => o.user_id == user.id)
            .map((order) => {
                let total = 0;
                const products = (productsByOrder as Product[])
                    .filter((p) => p.order_id == order.id)
                    .map((product) => {
                        total += product.product_price;
                        return {
                            product_id: product.product_id,
                            value: formatPrice(product.product_price),
                        };
                    });
                return {
                    order_id: order.id,
                    total: formatPrice(total),
                    date: formatDate(order.order_date),
                    products,
                };
            });

        return {
            user_id: user.id,
            name: user.name,
            orders,
        };
    });
    return result;
}

//Busca o pedido por id e o retorna no formato padrão
export function getOrderById(id: number) {
    const order = db
        .prepare(
            `
        SELECT * FROM orders 
        WHERE id = ?
      `
        )
        .get(id) as Order;
    if (!order) return null;

    const user = db
        .prepare(`SELECT * FROM users WHERE id = ?`)
        .get(order.user_id) as User;

    const productsByOrder = db.prepare(`
        SELECT id, product_price, product_id
        FROM order_products
        WHERE order_id = ?
      `);

    let total = 0;
    const products = (productsByOrder.all(order.id) as Product[]).map(
        (product) => {
            total += product.product_price;
            return {
                product_id: product.product_id,
                value: formatPrice(product.product_price),
            };
        }
    );
    const result = {
        user_id: user.id,
        name: user.name,
        orders: {
            order_id: order.id,
            date: formatDate(order.order_date),
            total: formatPrice(total),
            products,
        },
    };

    return result;
}
