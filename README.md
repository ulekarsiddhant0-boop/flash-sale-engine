⚡ Flash Sale Engine
A high-concurrency flash sale system inspired by Flipkart Big Billion Days and limited-stock product drops.

Built to handle multiple users attempting to purchase the same product simultaneously without overselling inventory.

🚀 Highlights
✅ Atomic inventory management using Redis

✅ Prevents overselling during concurrent purchases

✅ Redis cache-aside pattern for ultra-fast product retrieval

✅ Sliding-window rate limiter using Redis ZSETs

✅ MongoDB Atlas for persistent order storage

✅ React frontend with live inventory tracking

✅ Instant sold-out lockout protection

🖥️ Preview
(Add screenshots here)

Example:

text

screenshots/homepage.png
screenshots/purchase-success.png
screenshots/sold-out.png
🏗️ Architecture
text

User
  │
  ▼
React Frontend
  │
  ▼
Express API
  │
  ├── Redis Cache
  ├── Redis Atomic Stock Control
  └── Redis Rate Limiter
  │
  ▼
MongoDB Atlas
🔥 Core Engineering Concepts
Atomic Stock Management
When multiple users try to buy simultaneously:

text

Stock = 1

User A ✅
User B ❌
User C ❌
Redis DECR ensures inventory never goes below zero.

Cache-Aside Strategy
text

Request Product
      │
      ▼
 Redis Cache?
   │      │
 Yes      No
 │         │
Return   MongoDB
          │
          ▼
      Update Cache
Rate Limiting
Protects checkout APIs from:

Bots
Spam requests
Excessive clicking
Implemented using Redis Sorted Sets (ZSET).

🛠 Tech Stack
Frontend

React
Vite
Lucide Icons
Backend

Node.js
Express
Database

MongoDB Atlas
Caching & Concurrency

Redis (Upstash)
ioredis
📊 What This Project Demonstrates
High-concurrency inventory handling
Race condition prevention
Redis caching strategies
API protection mechanisms
Full-stack application development
System design fundamentals
🎯 Future Improvements
BullMQ for asynchronous order processing
WebSocket-based live inventory updates
Load testing with Artillery/k6
Admin analytics dashboard
