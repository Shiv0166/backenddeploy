const { pool } = require("../db");
const { mapOrder, mapOrderItem } = require("../lib/mappers");

async function create(data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `INSERT INTO orders (
         order_number, user_id, user_email, subtotal, tax, delivery, total,
         customer_full_name, customer_email, customer_phone, customer_address, customer_notes,
         payment_card_last4, payment_expiry, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        data.orderNumber,
        data.userId || null,
        data.userEmail,
        data.subtotal,
        data.tax,
        data.delivery,
        data.total,
        data.customerInfo.fullName,
        data.customerInfo.email,
        data.customerInfo.phone,
        data.customerInfo.address,
        data.customerInfo.notes || "",
        data.payment?.cardLast4 || "",
        data.payment?.expiry || "",
        data.status || "placed",
      ]
    );

    const orderRow = orderResult.rows[0];
    const insertedItems = [];

    for (const item of data.items || []) {
      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, food_item_id, name, price, quantity, image, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          orderRow.id,
          Number(item.itemId ?? item.id ?? 0) || null,
          item.name,
          Number(item.price || 0),
          Number(item.quantity || 1),
          item.image || "",
          item.category || "General",
        ]
      );
      insertedItems.push(itemResult.rows[0]);
    }

    await client.query("COMMIT");
    return mapOrder(orderRow, insertedItems);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function find(options = {}) {
  const limit = options.limit || 100;
  const { rows } = await pool.query(
    `SELECT
       o.*,
       COALESCE(
         json_agg(
           json_build_object(
             'food_item_id', oi.food_item_id,
             'name', oi.name,
             'price', oi.price,
             'quantity', oi.quantity,
             'image', oi.image,
             'category', oi.category
           )
         ) FILTER (WHERE oi.id IS NOT NULL),
         '[]'
       ) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT $1`,
    [limit]
  );

  return rows.map((row) => {
    const items = Array.isArray(row.items) ? row.items : [];
    return mapOrder(row, items);
  });
}

module.exports = { create, find };
