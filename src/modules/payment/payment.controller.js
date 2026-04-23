const IdempotencyService = require('./idempotency.service');
const OrderService = require('../order/order.service');
const { OrderStatus } = require('../order/order.constants');

class PaymentController {
  /**
   * Stripe Callback handling
   */

  static async handleStripeWebhook(req, res) {
    const { id: eventId, orderId } = req.body;

    console.log(`\n[Webhook] Received event ${eventId} for order ${orderId}`);

    // 1. Idempotency check
    const isNewEvent = await IdempotencyService.checkAndLock(eventId);
    if (!isNewEvent) {
      console.log(
        `[Warning] Duplicate webhook detected: ${eventId}. Skipping.`,
      );
      return res.status(200).json({ status: 'duplicate_ignored' });
    }

    try {
        // 2. Order transition: Order state transiton through OrderService
        // When current state is suitable, AllowedTransition can succeed
        await OrderService.transitionStatus(orderId, OrderStatus.PAID)

        console.log(`[Payment] Successful! Order ${orderId} is now PAID `)
        res.status(200).json({status: 'success'})
    } catch (error) {
        console.log(`[Error] Webhook processing failed: ${error.message}`)
        res.status(400).json({error: error.message})
    }
  }
}

module.exports = PaymentController
