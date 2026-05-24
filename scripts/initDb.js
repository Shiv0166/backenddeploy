require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { pool, connectDB } = require("../db");
const { menuItems } = require("./data");

async function seedFoodItems() {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS count FROM food_items`);
  if (rows[0].count > 0) {
    console.log(`food_items already has ${rows[0].count} rows — skipping seed`);
    return;
  }

  for (const item of menuItems) {
    await pool.query(
      `INSERT INTO food_items (id, name, description, price, category, image)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [item.id, item.name, item.description, item.price, item.category, item.image]
    );
  }

  await pool.query(
    `SELECT setval(pg_get_serial_sequence('food_items', 'id'), (SELECT MAX(id) FROM food_items))`
  );
  console.log(`Seeded ${menuItems.length} food items`);
}

async function initDb() {
  const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  await connectDB();
  await pool.query(schema);
  console.log("Schema applied");
  await seedFoodItems();
}

initDb()
  .then(() => {
    console.log("Database ready");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Database init failed:", err.message);
    process.exit(1);
  });
