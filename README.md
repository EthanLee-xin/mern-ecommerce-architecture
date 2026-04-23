# MERN Architecture: Modular Monolith & DDD Patterns

A blueprint for building scalable E-commerce backends. It demonstrates a robust **Modular Monolith**, heavily inspired by Domain-Driven Design (DDD) principles.

## Core Architectural Patterns Showcased

### 1. Strict Order State Machine (Domain Layer)
In high-concurrency systems, order states cannot be arbitrary strings. This project implements a strict State Transition Matrix (`PENDING` -> `PROCESSING` -> `PAID`), guaranteeing that illegal state changes (e.g., reverting a `PAID` order back to `PENDING`) are forcefully blocked at the domain service layer. 

### 2. Payment Webhook Idempotency (Application Layer)
When integrating with gateways like Stripe, network retries can cause double-charging. This architecture decouples the HTTP webhook intake from the domain logic, using an Idempotency Service (simulating Redis locks) to intercept duplicate events before they reach the Order Service.

### 3. Separation of Concerns
- **`/order`**: Manages the truth of the transaction state.
- **`/payment`**: Manages external gateway interactions and idempotency.
- They communicate purely through well-defined Service methods, laying the groundwork for a future microservices split.

### 4. High-Concurrency Inventory Reservation (Lock-then-Buy)
To prevent catastrophic overselling during traffic spikes (e.g., Flash Sales), the system implements an Inventory Reservation pattern. 
- **On Order Creation:** Stock is temporarily locked in a fast-access cache (simulated). 
- **On Payment Success:** The physical database inventory is permanently deducted.
- **On Payment Failure/Timeout:** The locked stock is released back to the pool.

## Tech Stack
- Node.js & Express
- Event-Driven & State Machine Patterns