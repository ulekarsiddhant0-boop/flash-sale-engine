Flash Sale Engine
A high-concurrency Flash Sale Engine built using React, Node.js, Express, Redis, and MongoDB. The system is designed to handle flash-sale scenarios by preventing overselling, reducing database load, and protecting checkout endpoints from abuse.

Features
Atomic inventory management using Redis
Prevents overselling during concurrent purchases
Redis cache-aside pattern for faster product retrieval
Sliding-window rate limiting using Redis Sorted Sets (ZSET)
MongoDB Atlas for persistent data storage
React frontend with live stock tracking
Express REST APIs for product and checkout operations
Sold-out lockout mechanism to reject excess purchase requests instantly
Tech Stack
Frontend:

React
Vite
Lucide React
Backend:

Node.js
Express.js
Database:

MongoDB Atlas
Mongoose
Caching & Concurrency:

Redis (Upstash)
ioredis
System Architecture
User
↓
React Frontend
↓
Express API
↓
Redis (Atomic Stock Control + Rate Limiting + Cache)
↓
MongoDB Atlas (Persistent Storage)

Key Concepts Implemented
Atomic Inventory Management
Stock is stored in Redis and updated using atomic DECR operations. This prevents race conditions and ensures inventory cannot be oversold during flash-sale traffic spikes.

Cache-Aside Pattern
Product details are first checked in Redis.

Cache Hit → Return data from Redis
Cache Miss → Fetch from MongoDB and update Redis cache
Sliding Window Rate Limiting
Redis Sorted Sets (ZSET) are used to:

Track request timestamps
Limit excessive checkout attempts
Protect the backend from abuse and bots
API Endpoints
Health Check
GET

text

/api/health
Product Details
GET

text

/api/products/:id
Checkout
POST

text

/api/orders/checkout
Request Body:

JSON

{
  "productId": "PRODUCT_ID"
}
Installation
Clone the repository:

Bash

git clone https://github.com/YOUR_USERNAME/flash-sale-engine.git
cd flash-sale-engine
Install backend dependencies:

Bash

npm install
Install frontend dependencies:

Bash

cd client
npm install
Environment Variables
Create a .env file in the backend directory:

env

PORT=5000

MONGO_URI=your_mongodb_connection_string

REDIS_URL=your_redis_connection_string
Running the Project
Backend:

Bash

npm run dev
Frontend:

Bash

cd client
npm run dev
Learning Outcomes
Through this project I gained hands-on experience with:

Redis atomic operations
Race condition prevention
Inventory consistency
Cache-aside architecture
Rate limiting strategies
MongoDB Atlas integration
Full-stack application development
High-concurrency system design
Future Improvements
BullMQ-based asynchronous order processing
Real-time updates using WebSockets
Load testing with Artillery or k6
Admin analytics dashboard
Distributed deployment architecture
Author
Siddhant
