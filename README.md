# Bubble Deployment

## Live Application

- Frontend: https://your-frontend-link.vercel.app  
- Backend API: https://your-backend-link.onrender.com  

---

## Demo Video

- Video Link: https://your-video-link.com  

---

## Team Members

| Name | ID | Contributions |
|---|---|---|
| Fatimah Alshehab | 202278660 | Back End - Design |
| Raneem Alshahrani | 202277080 | Front End - Documentation |
| Wajd Alghamdi | 202262140 | Back End - Documentation |
| Yasmeen Alshehri | 202271660 | Front End - Design |

---

## Description

This is the deployed version of the **Bubble Soap Store** application.  
The system includes a fully integrated front-end and back-end with MongoDB Atlas.

Users can:
- Browse products
- Add items to cart and wishlist
- Customize soaps
- Apply discount codes
- Checkout and place orders

Admin can:
- Manage products
- Manage inventory
- Manage orders
- Manage promotions
- Manage reviews
- View dashboard analytics

Customer Service can:
- Manage tickets
- Manage FAQ templates

---

## Deployment Setup

### Frontend Deployment (Vercel)

1. Push project to GitHub
2. Go to https://vercel.com
3. Import project
4. Set root directory:
```txt
/
````

5. Build settings:

```txt
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

6. Add environment variable:

```env
VITE_API_URL=https://your-backend-link.onrender.com
```

---

### Backend Deployment (Render)

1. Go to [https://render.com](https://render.com)
2. Create new **Web Service**
3. Connect GitHub repository
4. Set:

```txt
Root Directory: backend
Build Command: npm install
Start Command: node server.js
```

5. Add environment variables:

```env
MONGO_URL=your_mongodb_connection
JWT_SECRET=bubble_secret_key_123
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

### Database (MongoDB Atlas)

* Database hosted on MongoDB Atlas
* Connected via `MONGO_URL`
* Collections used:

| Collection |
| ---------- |
| users      |
| products   |
| orders     |
| carts      |
| wishlists  |
| promotions |
| reviews    |
| tickets    |
| faqs       |

---

## API Configuration

Frontend communicates with backend using:

```js
const API = import.meta.env.VITE_API_URL;
```

Example:

```js
fetch(`${API}/api/products`)
```

---

## Security

| Feature               | Status              |
| --------------------- | ------------------- |
| JWT Authentication    | Implemented         |
| Role-based access     | Implemented         |
| Environment variables | Secured             |
| MongoDB Atlas         | Secured             |
| HTTPS                 | Enabled via hosting |

---

## Testing

The deployed application has been tested for:

| Feature               | Status |
| --------------------- | ------ |
| Product browsing      | ✅      |
| Cart functionality    | ✅      |
| Wishlist              | ✅      |
| Checkout              | ✅      |
| Orders                | ✅      |
| Admin dashboard       | ✅      |
| Promotions            | ✅      |
| Reviews               | ✅      |
| Tickets & FAQ         | ✅      |
| Mobile responsiveness | ✅      |

---

## Demo Accounts

| Role             | Email                                           | Password   |
| ---------------- | ----------------------------------------------- | ---------- |
| Admin            | [admin@bubble.com](mailto:admin@bubble.com)     | admin123   |
| User             | [user@bubble.com](mailto:user@bubble.com)       | user123    |
| Customer Service | [support@bubble.com](mailto:support@bubble.com) | support123 |

---

## Known Issues

| Issue               | Description                    | Solution                    |
| ------------------- | ------------------------------ | --------------------------- |
| Cart sync delay     | Cart may require refresh       | Add real-time state sync    |
| Order status update | Occasionally fails on wrong ID | Use valid MongoDB `_id`     |
| Auth header errors  | Missing token in API requests  | Ensure Bearer token is sent |

---

## Responsiveness

* Fully responsive for:

  * Desktop
  * Tablet
  * Mobile

---

## Notes

* Backend and frontend are deployed separately
* MongoDB Atlas used for persistent data
* Images handled via Cloudinary
* `.env` variables are not exposed in repository
