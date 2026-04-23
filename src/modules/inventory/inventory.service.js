/**
 *  Simulate real inventory in Database
 */
const mockInventoryDB = new Map([
  ['PROD_APPLE', { name: 'MacBook Pro', totalStock: 2 }], // only 2 left
]);

/**
 *  Simulate Pre-stock(Locked Stock) in Redis cache
 */

const mockRedisLockStock = new Map();

class InventoryService {
  /**
   * Pre-deduct Atomically(Resever Stock)
   * Callback when user Click "Buy" button, preventing overselling
   */

  static async reserveStock(productId, quantity) {
    console.log(
      `[Inventory] Attempting to reserve ${quantity} units of ${productId}...`,
    );
    const product = mockInventoryDB.get(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // get current Locked stock(if no one Locked, it's 0)
    const currentlyLocked = mockRedisLockStock.get(productId) || 0;

    // calculate available stock (total_stock - locked_stock)
    const availableStock = product.totalStock - currentlyLocked;

    if (availableStock < quantity) {
      console.log(
        `[Out of stock] Reservation failed. Available: ${availableStock}, Requested: ${quantity}`,
      );
      return false; // stock not enough, making order reject
    }

    // locking stock(Redis INCRBY simulation)
    mockRedisLockStock.set(productId, currentlyLocked + quantity);
    console.log(
      `[Reserved] Successfully locked ${quantity} units. Total locked for ${productId}: ${currentlyLocked + quantity}`,
    );
    return true;
  }

  /**
   * Compensation machenism: Release pre-deduct stock
   * Scenario: User does not do the payment for 15mins, order cancelled, return stock
   */
  static async releaseStock(productId, quantity) {
    const currentlyLocked = mockRedisLockStock.get(productId || 0);
    const newLocked = Math.max(0, currentlyLocked - quantity); // prevent negative
    mockRedisLockStock.set(productId, newLocked);
    console.log(
      `[Released] Restored ${quantity} units of ${productId} back to pool`,
    );
  }

  /**
   * Final confirm: Deduct Database Stock(confirm stock)
   * Scenario: Stripe webhook payment success confirm, deduct stock from Database
   */

  static async confirmStock(productId, quantity) {
    const product = mockInventoryDB.get(productId);

    // physic stock deduction
    product.totalStock -= quantity;

    // Release Redis locked state
    const currentlyLocked = mockRedisLockStock.get(productId) || 0;
    mockRedisLockStock.set(productId, Math.max(0, currentlyLocked - quantity));

    console.log(
      `[DB update] Physical stock for ${productId} permanently reduced to ${product.totalStock}`,
    );
  }
}

module.exports = InventoryService;
