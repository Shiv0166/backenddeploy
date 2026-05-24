function mapUser(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    username: row.username,
    password: row.password,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapFoodItem(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    image: row.image,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrderItem(row) {
  return {
    itemId: row.food_item_id ?? row.itemId ?? 0,
    name: row.name,
    price: Number(row.price),
    quantity: row.quantity,
    image: row.image || "",
    category: row.category || "General",
  };
}

function mapOrder(row, items = []) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    userEmail: row.user_email,
    items: items.map(mapOrderItem),
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    delivery: Number(row.delivery),
    total: Number(row.total),
    customerInfo: {
      fullName: row.customer_full_name,
      email: row.customer_email,
      phone: row.customer_phone,
      address: row.customer_address,
      notes: row.customer_notes || "",
    },
    payment: {
      cardLast4: row.payment_card_last4 || "",
      expiry: row.payment_expiry || "",
    },
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCart(row, items = []) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    items: items.map(mapOrderItem),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapUserPublic(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

module.exports = {
  mapUser,
  mapUserPublic,
  mapFoodItem,
  mapOrder,
  mapOrderItem,
  mapCart,
};
