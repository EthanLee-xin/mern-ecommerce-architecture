const axios = require('axios');

async function runSimulation() {
  const webhookUrl = 'http://localhost:3000/webhooks/stripe';
  const testOrderId = 'ORD_1001';
  const testEventId = 'evt_unique_999';

  console.log('Starting Payment Flow Simulation');

  // First: Simulate order state into PROCESSING(Assuming triggered by route before)
  // For test, we change OrderService manually
  const OrderService = require('./src/modules/order/order.service');
  const { OrderStatus } = require('./src/modules/order/order.constants');
  await OrderService.transitionStatus(testOrderId, OrderStatus.PROCESSING);

  // Second: Simulate Stripe sends first webhook(paid successfully)
  console.log('Stripe sends payment_success webhook...');
  await axios.post(webhookUrl, { id: testEventId, orderId: testOrderId });

  // Third: Simulate network Jitter, Stripe sends the same webhook again
  console.log('Stripe retries the same webhook due to network lag...');
  await axios.post(webhookUrl, { id: testEventId, orderId: testOrderId });

  // Fourth: check Final order state
  const finalOrder = OrderService.getOrder(testOrderId);
  console.log(`Final order state in DB: ${finalOrder.status}`);
}

runSimulation().catch((err) => {
  console.error(err.response?.data || err.message);
});
