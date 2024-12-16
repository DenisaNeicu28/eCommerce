const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const OrderItem = require('../models/OrderItem');
const router = express.Router();

// GET: cos utilizator
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const orders = await Order.findAll({ where: { userId, status: 'pending' }, include: [{ model: OrderItem, include: Product }] });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST: Adaugă produse în coș (order pending)
router.post('/user/:userId/cart', async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity, plus } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let order = await Order.findOne({ where: { userId, status: 'pending' } });
    if (!order) {
      order = await Order.create({ userId, status: 'pending', totalPrice: 0 });
    }

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.stock <= 0) {
      return res.status(400).json({ error: `Product ${product.name} is out of stock` });
    }

    const finalQuantity = Math.min(product.stock, quantity);
    const existingItem = await OrderItem.findOne({ where: { orderId: order.id, productId } });

    if (existingItem) {
      if (plus && existingItem.quantity + 1 <= product.stock) {
        existingItem.quantity += 1;
      } else if (plus && existingItem.quantity + 1 >= product.stock) {
        existingItem.quantity = existingItem.quantity
      }
      else {
        existingItem.quantity = finalQuantity;
      }
      await existingItem.save();
    } else {
      await OrderItem.create({ orderId: order.id, productId, quantity: finalQuantity, price: product.price });
    }

    const allItems = await OrderItem.findAll({ where: { orderId: order.id } });
    order.totalPrice = allItems.reduce((total, item) => {
      return total + item.quantity * item.price;
    }, 0);
    await order.save();

    res.status(200).json({ message: 'Product added to cart', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product to cart' });
  }
});

// PUT: Confirmă comanda (status completed)
router.put('/user/:userId/confirm', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const order = await Order.findOne({ where: { userId, status: 'pending' }, include: [OrderItem] });
    if (!order) return res.status(404).json({ error: 'No pending order found' });

    for (const item of order.OrderItems) {
      const product = await Product.findByPk(item.productId);
      if (!product || product.stock < item.quantity) {
        await OrderItem.destroy({ where: { id: item.id } });
        continue;
      }
      product.stock -= item.quantity;
      await product.save();
    }

    order.status = 'completed';
    await order.save();

    res.status(200).json({ message: 'Order confirmed', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm order' });
  }
});

// PUT: Anulează comanda (status canceled)
router.put('/user/:userId/cancel', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const order = await Order.findOne({ where: { userId, status: 'pending' } });
    if (!order) return res.status(404).json({ error: 'No pending order found' });

    order.status = 'canceled';
    await order.save();

    res.status(200).json({ message: 'Order canceled', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// DELETE: Șterge un produs din coș
router.delete('/user/:userId/cart/:productId', async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const order = await Order.findOne({ where: { userId, status: 'pending' } });
    if (!order) return res.status(404).json({ error: 'No pending order found' });

    const orderItem = await OrderItem.findOne({ where: { orderId: order.id, productId } });
    if (!orderItem) return res.status(404).json({ error: 'Product not found in cart' });

    order.totalPrice -= orderItem.quantity * orderItem.price;
    await orderItem.destroy();
    await order.save();

    res.status(200).json({ message: 'Product removed from cart', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove product from cart' });
  }
});

module.exports = router;
