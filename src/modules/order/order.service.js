const { OrderStatus, AllowedTransition } = require('./order.constants');

// Order table from Datebase
const mockOrderDB = new Map([
  ['ORD_1001', { id: 'ORD_1001', amount: 5000, status: OrderStatus.PENDING }],
]);

class OrderService {
  /**
   *
   * @param {string} orderId
   * @param {string} targetStatus
   * @returns
   */
  static async transitionStatus(orderId, targetStatus) {
    console.log(
      `[OrderService] Attempting to change ${orderId} to ${targetStatus}...`,
    );

    const order = mockOrderDB.get(orderId);
    if (!orderId) {
      throw new Error(`Order ${orderId} not found.`);
    }

    const currentStatus = order.status;

    // Defence: Intercept illeagl status transition
    const validNextStates = AllowedTransition[currentStatus] || [];
    if (!validNextStates.includes(targetStatus)) {
      throw new Error(
        `[Security Block] Invalid transition from ${currentStatus} to ${targetStatus}`,
      );
    }

    // Database transaction changed
    order.status = targetStatus;
    mockOrderDB.set(orderId, order);

    console.log(
      `[Success] Order ${orderId} successfully transitioned to ${targetStatus}.`,
    );

    return order;
  }

  // Get Order Details
  static getOrder(orderId) {
    return mockOrderDB.get(orderId);
  }
}

module.exports = OrderService;
