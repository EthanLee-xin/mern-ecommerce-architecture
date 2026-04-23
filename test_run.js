const OrderService = require('./src/modules/order/order.service')
const { OrderStatus } = require('./src/modules/order/order.constants')

async function runTest() {
    try {
        // 1. Normal transition: PENDING -> PROCESSING
        await OrderService.transitionStatus('ORD_1001', OrderStatus.PROCESSING)

        // 2. Normal trasitioon: PAID (Stripe webhook callback success)
        await OrderService.transitionStatus('ORD_1001', OrderStatus.PAID)

        // 3. Intercept for malicious modification: Attampt to change from PAID to PENDING
        console.log('Testing Malicious State Change ---')
        await OrderService.transitionStatus('ORD_1001', OrderStatus.PENDING)

    } catch (error) {
        console.error(error.message)
    }
}

runTest()

