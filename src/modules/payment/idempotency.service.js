// Simulate Redis
const processedEvent = new Set();

class IdempotencyService {
  /**
   *
   * @param {string} key Idempotency Key
   * @returns {boolean}  true - New request; false - Duplicate request
   */
  static async checkAndLock(key) {
    if (processedEvent.has(key)) {
      return false;
    }
    processedEvent.add(key);
    return true;
  }
}

module.exports = IdempotencyService