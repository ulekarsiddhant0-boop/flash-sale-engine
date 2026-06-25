<div align="center">

# ⚡ Flash Sale Engine

**A production-inspired high-concurrency flash sale system built to handle massive traffic without overselling.**

[![Live Demo](https://img.shields.io/badge/Frontend-Live%20Demo-6366f1?style=for-the-badge)](https://flash-sale-engine-two.vercel.app)
[![API](https://img.shields.io/badge/Backend-API-10b981?style=for-the-badge)](https://flash-sale-engine-api.onrender.com)
[![Health](https://img.shields.io/badge/API-Health%20Check-f59e0b?style=for-the-badge)](https://flash-sale-engine-api.onrender.com/api/health)

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)

> ⚠️ The backend is hosted on Render's free tier — it may take **30–60 seconds** to wake up after inactivity.

</div>

---

## 📸 Project Preview

| View | Description |
|------|-------------|
| 🛍️ Flash Sale Portal | Home page with live inventory counter |
| ✅ Successful Purchase | Real-time stock update after checkout |
| 🚦 Rate Limiter | Redis sliding-window protection in action |
| 📊 Admin Dashboard | Live operational monitoring |
| 📈 Load Test Results | Artillery performance report |
| 🏗️ Architecture Diagram | Complete system design |

> Add screenshots to a `/screenshots` folder and link them here for maximum impact.

---

## 🚀 Key Features

- ⚛️ **Atomic Inventory** — Redis `DECR` prevents overselling under concurrent load
- 🧠 **Cache-Aside Pattern** — Product data served from Redis, MongoDB as fallback
- 🚧 **Sliding Window Rate Limiter** — Redis ZSET-based, 3 requests per 10 seconds
- 🔴 **Sold-Out Protection** — Immediate rejection once stock hits zero, no DB hit
- 📊 **Admin Dashboard** — Live stats, order counts, and one-click stock reset
- ☁️ **Fully Deployed** — Vercel (frontend) + Render (backend) + Upstash Redis + MongoDB Atlas
- 🧪 **Load Tested** — Artillery simulation with 100 concurrent checkout requests

---

## 🏗️ System Architecture

```
                        User
                          │
                          ▼
              React Frontend (Vercel)
                          │
                          ▼
             Express REST API (Render)
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
   Redis (Upstash)                  MongoDB Atlas
 ┌─────────────────┐            ┌──────────────────┐
 │ • Atomic Stock  │            │ • Products       │
 │ • Product Cache │            │ • Orders         │
 │ • Rate Limiting │            │ • Persistence    │
 │ • Sold-Out Flag │            └──────────────────┘
 └─────────────────┘
                          │
                          ▼
                Admin Monitoring APIs
```

---

## ⚙️ Engineering Challenges Solved

### ✅ Preventing Overselling

Traditional systems can approve multiple purchases for the same item during simultaneous requests. This system stores inventory in Redis and uses atomic `DECR` operations — no race conditions, no overselling.

---

### ✅ Reducing Database Load — Cache-Aside Pattern

```
Client Request
      │
      ▼
 Redis Cache ──── Hit ──▶ Return Data
      │
     Miss
      │
      ▼
  MongoDB ──▶ Update Cache ──▶ Return Data
```

---

### ✅ Protecting Checkout APIs — Sliding Window Rate Limiter

Implemented using Redis Sorted Sets with the following config:

| Setting | Value |
|---------|-------|
| Max Requests | 3 |
| Time Window | 10 seconds |
| Excess Response | HTTP 429 |

---

### ✅ Sold-Out Protection

Once stock hits zero:
- Purchase requests are rejected **immediately**
- Sold-out state is cached in Redis
- MongoDB is never queried unnecessarily

---

## 📊 Admin Dashboard

### Endpoints

```http
GET  /api/admin/health       # Service health check
GET  /api/admin/stats        # Live system metrics
POST /api/admin/reset-stock  # Reset inventory for demo
```

### Monitored Metrics

- MongoDB Inventory vs Redis Inventory
- Total Orders Placed
- Successful Purchases
- Rate-Limited Requests

---

## 📈 Load Testing Results

Tested with **Artillery** — 100 simulated concurrent checkout requests.

| Metric | Result |
|--------|--------|
| ✅ Successful Requests | 57 |
| 🚦 Rate Limited (429) | 43 |
| ❌ Server Failures | 0 |

The system stayed **fully available** while correctly enforcing rate limits throughout the test.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Cache & Concurrency | Redis (Upstash), ioredis |
| Load Testing | Artillery |
| Deployment | Vercel, Render |

---

## 📁 Project Structure

```
flash-sale-engine/
│
├── client/              # React frontend
├── config/              # DB & Redis config
├── controllers/         # Route handlers
├── middleware/          # Rate limiter, auth
├── models/              # Mongoose schemas
├── routes/              # API route definitions
├── server.js            # Entry point
├── load-test.yml        # Artillery config
└── README.md
```

---

## 🔌 API Reference

### Product
```http
GET /api/products/:id
```
Returns product details via the Redis Cache-Aside Pattern.

### Checkout
```http
POST /api/orders/checkout
```
Processes a flash sale purchase using Redis atomic inventory management.

### Admin
```http
GET  /api/admin/health
GET  /api/admin/stats
POST /api/admin/reset-stock
```

---

## 🚀 Run Locally

### Backend
```bash
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |

---

## 🔐 Environment Variables

### Backend `.env`
```env
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_upstash_connection_string
PORT=5000
```

### Frontend `.env`

**Development:**
```env
VITE_API_URL=http://localhost:5000/api
```

**Production:**
```env
VITE_API_URL=https://flash-sale-engine-api.onrender.com/api
```

---

## 🎯 Roadmap

- [ ] BullMQ for async order processing
- [ ] WebSocket-based live inventory updates
- [ ] Performance analytics dashboard
- [ ] Docker deployment
- [ ] Distributed worker architecture

---

## 📚 What I Learned

Building this project gave me hands-on experience with:

- High-concurrency backend design patterns
- Redis atomic operations and data structures
- Cache-Aside architecture
- Sliding Window rate limiting
- Inventory consistency at scale
- Cloud deployment across Vercel, Render, and Upstash
- Load testing with Artillery
- Full-stack application development

---

<div align="center">

## 👨‍💻 Author

**Siddhant**

Built as a backend engineering and system design project to explore scalable flash-sale architectures inspired by modern e-commerce platforms.

⭐ If you found this useful, consider starring the repo!

</div>
