const OrderService = require('./src/modules/order/order.service');
const { OrderStatus } = require('./src/modules/order/order.constants');
const PaymentController = require('./src/modules/payment/payment.controller');

async function runFullLifecycle() {
  console.log('Full Order Lifecycle Starts...\n');

  try {
    // 1. User click 'Buy' Botton(trigger pre-deduct stock)
    const order = await OrderService.createOrder(
      'ORD_888',
      'PROD_APPLE',
      1,
      2000,
    );

    // 2. Order Status is PROCESSING(prevent user click 'Pay' duplicated)
    await OrderService.transitionStatus(order.id, OrderStatus.PROCESSING);

    // 3. Stripe send webhook callback(Payment success)
    console.log('Stripe Webhook arriving...');

    const mockReq = { body: { id: 'evt_stripe_777', orderId: order.id } };
    const mockRes = {
      status: (code) => ({
        json: (data) => console.log(`[HTTP Response] ${code}:`, data),
      }),
    };

    // Trigger Payment Controller
    await PaymentController.handleStripeWebhook(mockReq, mockRes);
  } catch (error) {
    console.error(` Error: ${error.message}`);
  }
}

runFullLifecycle();
