const { OrderStatus, AllowedTransition } = require('./order.constants');
const InventoryService = require('../inventory/inventory.service')

// Order table from Datebase
const mockOrderDB = new Map();

class OrderService {

  /**
   * Create Order with Inventory Defence
   */
  static async createOrder (orderId, productId, quantity, amount) {
    console.log(`---Starting Order Creation for ${orderId} ---`)

    // 1. Apply pre-deduct stock from Inventory Service
    const isReserved = await InventoryService.reserveStock(productId, quantity)

    if (!isReserved) {
      throw new Error(`Order ${orderId} failed: Insufficient stock for ${productId}`)
    }

    // 2. creating PENDING state order, only when stock locked successfully
    const newOrder = {
      id: orderId,
      productId,
      quantity,
      amount,
      status: OrderStatus.PENDING
    }
    mockOrderDB.set(orderId, newOrder)

    console.log(`[Order Created] Order ${orderId} is now PENDING`)
    return newOrder

  }

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

    // 1. Defence: Intercept illeagl status transition
    const validNextStates = AllowedTransition[currentStatus] || [];
    if (!validNextStates.includes(targetStatus)) {
      throw new Error(
        `[Security Block] Invalid transition from ${currentStatus} to ${targetStatus}`,
      );
    }

    // 2. Trigger Inventory module based on order status
    if ( targetStatus === OrderStatus.PAID) {
      // Payment Success: Deduct physical stock
      await InventoryService.confirmStock(order.productId, order.quantity)
    } else if (targetStatus === OrderStatus.CANCELLED) {
      // Order Cancelled: Release Locked Stock
      await InventoryService.releaseStock(order.productId, order.quantity)
    }

    // 3. Order Status Update
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
