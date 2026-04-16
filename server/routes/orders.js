const express = require('express');
const router = express.Router();
const { getOrders, getOrder, createOrder, getSalesSummary, getTopProducts } = require('../controllers/orderController');

router.get('/', getOrders);
router.get('/summary', getSalesSummary);
router.get('/top-products', getTopProducts);
router.get('/:id', getOrder);
router.post('/', createOrder);

module.exports = router;
