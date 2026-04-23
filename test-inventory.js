const OrderService = require('./src/modules/order/order.service');

async function runHighConcurrencyTest() {
  console.log(
    'Flash Sale Starts! 3 users trying to buy a MacBook Pro (Only 2 in stock)...\n',
  );

  try {
    // userA buy 1
    await OrderService.createOrder('ORD_A01', 'PROD_APPLE', 1, 2000);

    // userB buy 1
    await OrderService.createOrder('ORD_B02', 'PROD_APPLE', 1, 2000);

    // userC buy 1 - It will trigger overselling defence
    await OrderService.createOrder('ORD_C03', 'PROD_APPLE', 1, 2000);
  } catch (error) {
    console.error(` System Interception: ${error.message}`);
  }
}

runHighConcurrencyTest()