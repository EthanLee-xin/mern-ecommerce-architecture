/* 
    Order Core Status Dict
*/

const OrderStatus = {
  PENDING: "PENDING", // Waiting for payment
  PROCESSING: "PROCESSING", // Payment Confirming(middle status, provent concurrency)
  PAID: "PAID", // Payment success
  FAILED: "FAILED", // Payment failed
  CANCELLED: "CANCELLED", // User or System cancelled
  REFUNDED: "REFUNDED", // User refunded
};

/* 
    State Transition Matrix
    Key: Current State
    Value: Array allowed to transit to next state
*/

const AllowedTransition = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.PAID, OrderStatus.FAILED],
  // Terminal States - not allowed to transit
  [OrderStatus.PAID]: [OrderStatus.REFUNDED],
  [OrderStatus.FAILED]: [OrderStatus.PENDING], // Allowed to restart to pay
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

module.exports = {
  OrderStatus,
  AllowedTransition,
};
