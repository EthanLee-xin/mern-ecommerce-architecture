const express = require('express');
const PaymentController = require('./src/modules/payment/payment.controller');

const app = express();

app.use(express.json());

// Webhook route
app.post('/webhooks/stripe', PaymentController.handleStripeWebhook);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`
            Order State Machine: Ready
            Idempotency Shield: Enabled
            Endpoint: http://localhost:${PORT}/webhooks/stripe
        `);
});
