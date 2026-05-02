# Bubble Soap Store

## Description

Bubble Soap Store is a full-stack web application for browsing and customizing handmade soaps.  
Customers can browse products, add items to cart, manage wishlist items, customize soap, apply discount codes, checkout, and view order history.

The system also includes:

| Role | Purpose |
|---|---|
| Customer | Browse, customize, cart, wishlist, checkout, order history |
| Admin | Manage products, inventory, orders, promotions, reviews, dashboard |
| Customer Service | Manage tickets and FAQ templates |

---

## Team Members

| Name | ID | Contributions |
|---|---|---|
| Fatimah Alshehab | 202278660 | Back End - Design |
| Raneem Alshahrani | 202277080 | Front End - Documentation |
| Wajd Alghamdi | 202262140 | Back End - Documentation |
| Yasmeen Alshehri | 202271660 | Front End - Design |

---

## Technologies Used

| Area | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| File Upload | multer, Cloudinary, multer-storage-cloudinary |
| Testing | Browser, Postman / Thunder Client |

---

## Features

### Customer Features

| Feature | Description |
|---|---|
| Browse Products | View available soap products |
| Product Details | View product information |
| Cart | Add, update, and remove cart items |
| Wishlist | Save products for later |
| Customize Soap | Select custom options |
| Discount Code | Apply valid promo codes |
| Checkout | Place orders |
| Order History | View previous orders |

### Admin Features

| Feature | Description |
|---|---|
| Dashboard | View sales, orders, customers, products, charts |
| Product Management | Add, edit, delete products |
| Inventory Management | View and update stock |
| Order Management | View orders and update order status |
| Promotion Management | Create and delete discount codes |
| Review Management | View and delete customer reviews |

### Customer Service Features

| Feature | Description |
|---|---|
| Ticket Management | View, search, filter, and update tickets |
| Refund Eligibility | Mark ticket refund status |
| Notes | Add internal support notes |
| FAQ Management | Add, edit, and delete FAQ templates |

---

## Project Structure

```txt
Bubble/
├── backend/
│   ├── config/
│   │   └── cloudinary.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Cart.js
│   │   ├── CurrencyService.js
│   │   ├── CustomOption.js
│   │   ├── Faq.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   ├── Promotion.js
│   │   ├── Review.js
│   │   ├── Ticket.js
│   │   ├── User.js
│   │   └── Wishlist.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── adminInventory.js
│   │   ├── adminOrders.js
│   │   ├── adminProducts.js
│   │   ├── adminPromotions.js
│   │   ├── adminReviews.js
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── customOptions.js
│   │   ├── faq.js
│   │   ├── orders.js
│   │   ├── products.js
│   │   ├── reviews.js
│   │   ├── ticket.js
│   │   └── wishlist.js
│   ├── uploads/
│   ├── .env
│   ├── create-all-users.js
│   ├── package.json
│   └── server.js
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── package.json
├── vite.config.js
└── README.md
````

---

## How to Run the Project

### 1. Frontend Setup

Run these commands from the main project folder:

```bash
npm install
npm install recharts
```

Start the frontend:

```bash
npm run dev
```

Open:

```txt
http://localhost:5173/
```

---

### 2. Backend Setup

Open a new terminal:

```bash
cd backend
```

Install backend dependencies:

```bash
npm install
npm install express mongoose cors dotenv multer bcryptjs jsonwebtoken express-validator cloudinary multer-storage-cloudinary
```

Create a `.env` file inside the `backend` folder:

```env
MONGO_URL=mongodb://USERNAME:PASSWORD@HOSTS/bubbleDB?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
PORT=5000
JWT_SECRET=bubble_secret_key_123
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:

```bash
node server.js
```

Expected output:

```txt
MongoDB connected ✅
Server running on port 5000
```

Test backend:

```txt
http://localhost:5000/
```

Expected response:

```txt
Backend is working 🚀
```

---

### 3. Windows Permission Error Fix

If PowerShell blocks npm commands, run:

```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

---

## Testing Accounts

| Role             | Email                                           | Password   |
| ---------------- | ----------------------------------------------- | ---------- |
| Admin            | [admin@bubble.com](mailto:admin@bubble.com)     | admin123   |
| Customer         | [user@bubble.com](mailto:user@bubble.com)       | user123    |
| Customer Service | [support@bubble.com](mailto:support@bubble.com) | support123 |

To create the test accounts, run from the backend folder:

```bash
node create-all-users.js
```

---

## Testing Notes (Common Mistakes)

### 1. 401 Unauthorized (Orders / Protected APIs)

If you get:
```txt
401 Unauthorized
````

You forgot the token.

Fix: 

1. Login:

```http
POST /api/auth/signin
```

2. Add header:

```txt
Authorization: Bearer YOUR_TOKEN
```

---

### 2. Wrong ID (404 or 500 errors)

If you get:

```txt
404 Not Found
or
500 Failed to update
```

You used a wrong ID.

Wrong: 

```txt
5a71ce3b
```

Fix: 

```http
GET /api/admin/products
GET /api/admin/orders
```

Then use real `_id`:

```txt
69f632b4d5c2385312f3182b
```

---

### 3. Inventory Update Not Working

If this fails:

```http
PUT /api/admin/inventory/:id
```

You used wrong ID.

Fix: 

```http
GET /api/admin/products
```

Then:

```http
PUT /api/admin/inventory/PRODUCT_ID
```

---

### 4. Order Status Update Not Working

If this fails:

```http
PUT /api/admin/orders/:id/status
```

Fix: 

```http
GET /api/admin/orders
```

Then:

```http
PUT /api/admin/orders/ORDER_ID/status
```

---

### 5. Cart Empty in Checkout

If checkout is empty:

Fix: 

```http
GET /api/cart/:userId
```

Make sure:

* cart has items
* same userId is used

---

### 6. Discount Not Working

If discount fails:

Fix: 

```http
POST /api/admin/promotions
```

Create promotion first.

---

## Frontend Routing Overview

| Role             | Page                 | Route                       |
| ---------------- | -------------------- | --------------------------- |
| Customer         | Home                 | `/home`                     |
| Customer         | Products             | `/products`                 |
| Customer         | Product Details      | `/product-details/:id`      |
| Customer         | Cart                 | `/cart`                     |
| Customer         | Checkout             | `/checkout`                 |
| Customer         | Profile              | `/profile`                  |
| Customer         | Order History        | `/order-history`            |
| Admin            | Dashboard            | `/admin-dashboard`          |
| Admin            | Product Management   | `/admin/products`           |
| Admin            | Inventory Management | `/admin/inventory`          |
| Admin            | Order Management     | `/admin/orders`             |
| Admin            | Review Management    | `/admin/reviews`            |
| Admin            | Promotion Management | `/admin/promotions`         |
| Customer Service | Ticket Management    | `/customer-service/tickets` |
| Customer Service | FAQ Management       | `/customer-service/faqs`    |

---

# API Documentation

Base URL:

```txt
http://localhost:5000
```

---

## Authentication APIs

| Method | Endpoint                    | Description                |
| ------ | --------------------------- | -------------------------- |
| POST   | `/api/auth/signup`          | Create a new user          |
| POST   | `/api/auth/signin`          | Login user                 |
| GET    | `/api/auth/profile`         | Get logged-in user profile |
| PUT    | `/api/auth/profile`         | Update user profile        |
| PUT    | `/api/auth/change-password` | Change password            |
| GET    | `/api/auth/verify`          | Verify token               |
| POST   | `/api/auth/logout`          | Logout                     |
| GET    | `/api/auth/users`           | Admin: get all users       |
| DELETE | `/api/auth/users/:userId`   | Admin: delete user         |

### Example: Sign Up

```http
POST /api/auth/signup
```

Request:

```json
{
  "fullName": "Regular User",
  "email": "user@bubble.com",
  "password": "user123",
  "role": "user",
  "phone": "5555555555",
  "address": "User Home"
}
```

Response:

```json
{
  "success": true,
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "fullName": "Regular User",
    "email": "user@bubble.com",
    "phone": "5555555555",
    "address": "User Home",
    "role": "user"
  }
}
```

### Example: Sign In

```http
POST /api/auth/signin
```

Request:

```json
{
  "email": "admin@bubble.com",
  "password": "admin123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "fullName": "Admin User",
    "email": "admin@bubble.com",
    "role": "admin"
  }
}
```

---

## Product APIs

| Method | Endpoint                  | Description                    |
| ------ | ------------------------- | ------------------------------ |
| GET    | `/api/products`           | Get all products for customers |
| GET    | `/api/products/:id`       | Get one product                |
| GET    | `/api/admin/products`     | Admin: get all products        |
| POST   | `/api/admin/products`     | Admin: add product             |
| PUT    | `/api/admin/products/:id` | Admin: update product          |
| DELETE | `/api/admin/products/:id` | Admin: delete product          |

### Example: Get Products

```http
GET /api/products
```

Response:

```json
[
  {
    "_id": "product_id",
    "name": "Sakura Bliss",
    "price": 10,
    "description": "Handmade sakura soap",
    "image": "image_url",
    "stock": 20,
    "scent": "Sakura",
    "skinType": ["Normal", "Dry"],
    "ingredients": ["sakura", "milk", "oil"],
    "isCustomizable": false,
    "theme": "pink"
  }
]
```

### Example: Add Product

```http
POST /api/admin/products
```

Body type:

```txt
form-data
```

Request:

| Key            | Value                |
| -------------- | -------------------- |
| name           | Sakura Bliss         |
| price          | 10                   |
| description    | Handmade sakura soap |
| stock          | 20                   |
| ingredients    | sakura, milk, oil    |
| scent          | Sakura               |
| skinType       | Normal,Dry           |
| theme          | pink                 |
| isCustomizable | false                |
| image          | file upload          |

Response:

```json
{
  "_id": "product_id",
  "name": "Sakura Bliss",
  "price": 10,
  "description": "Handmade sakura soap",
  "stock": 20,
  "theme": "pink"
}
```

---

## Cart APIs

| Method | Endpoint            | Description           |
| ------ | ------------------- | --------------------- |
| POST   | `/api/cart`         | Add item to cart      |
| GET    | `/api/cart/:userId` | Get user cart         |
| PUT    | `/api/cart/:id`     | Update item quantity  |
| DELETE | `/api/cart/:id`     | Remove item from cart |

### Example: Add to Cart

```http
POST /api/cart
```

Request:

```json
{
  "userId": "user_id",
  "productId": "product_id",
  "quantity": 2
}
```

Response:

```json
{
  "_id": "cart_item_id",
  "userId": "user_id",
  "productId": "product_id",
  "quantity": 2
}
```

### Example: Get User Cart

```http
GET /api/cart/user_id
```

Response:

```json
[
  {
    "_id": "cart_item_id",
    "userId": "user_id",
    "productId": {
      "_id": "product_id",
      "name": "Sakura Bliss",
      "price": 10,
      "stock": 20
    },
    "quantity": 2
  }
]
```

---

## Wishlist APIs

| Method | Endpoint                | Description                   |
| ------ | ----------------------- | ----------------------------- |
| POST   | `/api/wishlist`         | Add item to wishlist          |
| GET    | `/api/wishlist/:userId` | Get user wishlist             |
| PUT    | `/api/wishlist/:id`     | Update wishlist item quantity |
| DELETE | `/api/wishlist/:id`     | Remove wishlist item          |

### Example: Add to Wishlist

```http
POST /api/wishlist
```

Request:

```json
{
  "userId": "user_id",
  "productId": "product_id",
  "quantity": 1
}
```

Response:

```json
{
  "_id": "wishlist_item_id",
  "userId": "user_id",
  "productId": "product_id",
  "quantity": 1
}
```

---

## Order APIs

| Method | Endpoint                       | Description                |
| ------ | ------------------------------ | -------------------------- |
| POST   | `/api/orders`                  | Create order               |
| GET    | `/api/orders`                  | Get all orders             |
| GET    | `/api/orders/user/:userId`     | Get user orders            |
| GET    | `/api/orders/:id`              | Get one order              |
| PUT    | `/api/orders/:id/status`       | Update order status        |
| GET    | `/api/admin/orders`            | Admin: get all orders      |
| PUT    | `/api/admin/orders/:id/status` | Admin: update order status |

### Example: Create Order

```http
POST /api/orders
```

Request:

```json
{
  "userId": "user_id",
  "items": [
    {
      "productId": "product_id",
      "name": "Sakura Bliss",
      "price": 10,
      "quantity": 2,
      "customization": {
        "scent": "Lavender",
        "color": "Pink",
        "ingredients": ["Shea Butter", "Aloe Vera"]
      }
    }
  ],
  "totalPrice": 20
}
```

Response:

```json
{
  "_id": "order_id",
  "userId": "user_id",
  "items": [
    {
      "productId": "product_id",
      "name": "Sakura Bliss",
      "price": 10,
      "quantity": 2
    }
  ],
  "totalPrice": 20,
  "status": "Processing"
}
```

### Example: Admin Update Order Status

```http
PUT /api/admin/orders/order_id/status
```

Request:

```json
{
  "status": "Shipped"
}
```

Response:

```json
{
  "_id": "order_id",
  "status": "Shipped"
}
```

---

## Inventory APIs

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| GET    | `/api/admin/inventory`     | Get product inventory |
| PUT    | `/api/admin/inventory/:id` | Update stock          |

### Example: Update Stock

```http
PUT /api/admin/inventory/product_id
```

Request:

```json
{
  "stock": 50
}
```

Response:

```json
{
  "_id": "product_id",
  "name": "Sakura Bliss",
  "stock": 50
}
```

---

## Promotion APIs

| Method | Endpoint                    | Description      |
| ------ | --------------------------- | ---------------- |
| GET    | `/api/admin/promotions`     | Get promotions   |
| POST   | `/api/admin/promotions`     | Create promotion |
| PUT    | `/api/admin/promotions/:id` | Update promotion |
| DELETE | `/api/admin/promotions/:id` | Delete promotion |

### Example: Create Promotion

```http
POST /api/admin/promotions
```

Request:

```json
{
  "code": "SALE20",
  "expiry": "2026-12-31",
  "type": "All Products",
  "value": 20
}
```

Response:

```json
{
  "_id": "promotion_id",
  "code": "sale20",
  "expiry": "2026-12-31T00:00:00.000Z",
  "type": "All Products",
  "value": 20,
  "active": true
}
```

---

## Review APIs

| Method | Endpoint                 | Description          |
| ------ | ------------------------ | -------------------- |
| GET    | `/api/admin/reviews`     | Admin: get reviews   |
| DELETE | `/api/admin/reviews/:id` | Admin: delete review |

### Example: Get Reviews

```http
GET /api/admin/reviews
```

Response:

```json
[
  {
    "_id": "review_id",
    "userName": "Raneem",
    "text": "Amazing soap!",
    "rating": 5,
    "productId": {
      "_id": "product_id",
      "name": "Sakura Bliss",
      "image": "image_url"
    }
  }
]
```

---

## Admin Dashboard API

| Method | Endpoint               | Description              |
| ------ | ---------------------- | ------------------------ |
| GET    | `/api/admin/dashboard` | Get dashboard statistics |

Response:

```json
{
  "totalSales": 120,
  "totalOrders": 5,
  "totalCustomers": 3,
  "totalProducts": 8,
  "recentOrders": [],
  "topProducts": [],
  "salesChartData": [],
  "activityData": []
}
```

---

## Ticket APIs

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| GET    | `/api/tickets`     | Get tickets   |
| POST   | `/api/tickets`     | Create ticket |
| PUT    | `/api/tickets/:id` | Update ticket |
| DELETE | `/api/tickets/:id` | Delete ticket |

### Example: Create Ticket

```http
POST /api/tickets
```

Request:

```json
{
  "userId": "user_id",
  "subject": "Refund Request",
  "message": "I want to request a refund."
}
```

Response:

```json
{
  "_id": "ticket_id",
  "userId": "user_id",
  "subject": "Refund Request",
  "message": "I want to request a refund.",
  "status": "Open"
}
```

---

## FAQ APIs

| Method | Endpoint        | Description |
| ------ | --------------- | ----------- |
| GET    | `/api/faqs`     | Get FAQs    |
| POST   | `/api/faqs`     | Create FAQ  |
| PUT    | `/api/faqs/:id` | Update FAQ  |
| DELETE | `/api/faqs/:id` | Delete FAQ  |

### Example: Create FAQ

```http
POST /api/faqs
```

Request:

```json
{
  "question": "How long does shipping take?",
  "answer": "Shipping usually takes 3-5 business days."
}
```

Response:

```json
{
  "_id": "faq_id",
  "question": "How long does shipping take?",
  "answer": "Shipping usually takes 3-5 business days."
}
```

---

## Error Handling

| Status Code | Meaning                      |
| ----------- | ---------------------------- |
| 200         | Request successful           |
| 201         | Resource created             |
| 400         | Invalid request data         |
| 401         | Unauthorized / missing token |
| 403         | Forbidden / invalid role     |
| 404         | Resource not found           |
| 500         | Server error                 |

---

## Notes

* MongoDB Atlas is used for database storage.
* Environment variables are stored in `.env`.
* `.env` must not be pushed to GitHub.
* `node_modules` must not be pushed to GitHub.
* Product images are uploaded through the backend.
* Cart, wishlist, checkout, and orders use backend APIs.
* Admin and Customer Service pages are separate from customer pages.