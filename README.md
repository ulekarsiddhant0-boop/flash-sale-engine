⚡ Flash Sale Engine
A high-concurrency Flash Sale Engine inspired by large-scale e-commerce platforms such as Flipkart Big Billion Days and limited-inventory product launches.

The system is designed to handle concurrent purchase requests while preventing overselling, reducing database load through Redis caching, and protecting checkout APIs with rate limiting. The application is fully deployed with a React frontend, Express backend, MongoDB Atlas, and Upstash Redis.

Live Demo:
https://flash-sale-engine-two.vercel.app

Backend API: https://flash-sale-engine-api.onrender.com

Problem Statement
During flash sales, thousands of users may attempt to purchase the same product simultaneously.

A traditional application can suffer from:

Race conditions leading to oversold inventory
Heavy database traffic
Slow response times
Checkout abuse from repeated requests
This project demonstrates how these challenges can be addressed using Redis-backed concurrency control and caching strategies.

Features
Atomic inventory management using Redis
Cache-aside pattern for product retrieval
Sliding-window rate limiter using Redis Sorted Sets (ZSET)
One-click admin stock reset
Live operational monitoring dashboard
Cloud deployment using Render and Vercel
MongoDB Atlas for persistent storage
Redis-based sold-out protection
Artillery load testing
System Architecture
text

                    User
                      │
                      ▼
          React Frontend (Vercel)
                      │
                      ▼
          Express REST API (Render)
                      │
      ┌───────────────┴────────────────┐
      │                                │
      ▼                                ▼
Redis (Upstash)                 MongoDB Atlas

• Atomic Stock                  • Products
• Product Cache                 • Orders
• Rate Limiter                  • Persistence
• Sold-out State

                      │
                      ▼
             Admin Monitoring APIs
Key Engineering Concepts
Atomic Inventory Management
Inventory is maintained in Redis and updated using atomic DECR operations to prevent race conditions during simultaneous purchase attempts.

Cache-Aside Pattern
Product information is first retrieved from Redis.



Request
   │
   ▼
Redis Cache
   │
 ┌─┴───────────┐
 │             │
Hit          Miss
 │             │
 ▼             ▼
Return     MongoDB
               │
               ▼
         Update Cache
Sliding Window Rate Limiter
Checkout endpoints are protected using Redis Sorted Sets.

Current configuration:

Maximum requests: 3
Time window: 10 seconds
This prevents excessive purchase attempts and automated abuse.

Sold-Out Protection
When inventory reaches zero:

Redis marks the product as sold out.
Future checkout requests are rejected immediately.
Unnecessary database operations are avoided.
Admin Operations
The project includes operational endpoints for monitoring and demonstration purposes.

Available APIs:



GET  /api/admin/health
GET  /api/admin/stats
POST /api/admin/reset-stock
These endpoints expose:

MongoDB stock
Redis stock
Total orders
Successful purchases
Rate-limited requests
Load Testing
The application was tested using Artillery.

Configuration:

100 simulated checkout requests
Observed Results:

Successful requests: 57
Rate-limited requests: 43
Server failures: 0
The system remained responsive throughout the test while correctly enforcing rate limits.

Tech Stack
Frontend

React
Vite
Lucide React
Backend

Node.js
Express.js
Database

MongoDB Atlas
Mongoose
Caching & Concurrency

Redis (Upstash)
ioredis
Testing

Artillery
Deployment

Vercel
Render
Project Structure
text

flash-sale-engine
│
├── client
├── config
├── controllers
├── middleware
├── models
├── routes
├── server.js
└── load-test.yml
Running Locally
Backend

Bash

npm install
npm run dev
Frontend

Bash

cd client
npm install
npm run dev
Environment Variables
Backend

env

MONGO_URI=your_mongodb_uri

REDIS_URL=your_upstash_redis_url

PORT=5000
Frontend

env

VITE_API_URL=http://localhost:5000/api
Production

env

VITE_API_URL=https://flash-sale-engine-api.onrender.com/api

Future Enhancements
Background order processing using BullMQ
WebSocket-based live inventory updates
Distributed queue workers
Performance dashboard
Containerized deployment using Docker


What I Learned
This project helped me gain practical experience with:

Redis atomic operations
High-concurrency backend design
Cache-aside architecture
API rate limiting
MongoDB Atlas
Cloud deployment
Load testing
Full-stack application development
