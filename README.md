# Product Catalog API — E-commerce Backend

A complete E-commerce backend built with Node.js, 【entity-Express¦canonical_name=Express】, 【entity-MongoDB¦canonical_name=MongoDB】 (Atlas), and Cloudinary.  
Built while learning backend development + QA — with understanding, not copying.

Live API: https://product-catalog-ap.onrender.com

## Features

- **Auth** — Register, Login with JWT (7 days expiry)
- **Products** — Create with multiple images (Cloudinary), Get all, Get single
- **Search / Filter / Pagination** — `?search=nike&category=shoes&minPrice=10000&maxPrice=100000&page=1&limit=10`
- **Cart** — Add to cart, Get cart, Remove from cart, Quantity `+=` logic, Total with `reduce`
- **Orders** — Checkout from cart, Snapshot price, Clear cart, Reduce stock, Status: pending / shipped / delivered / cancelled

## Tech Stack

- Node.js + 【entity-Express¦canonical_name=Express】
- 【entity-MongoDB¦canonical_name=MongoDB】 Atlas + Mongoose
- Cloudinary (image upload)
- JWT Auth + bcrypt
- Render (deployment)
- Postman (testing + automation)

## Setup

```bash
git clone <your-repo-url>
cd product-catalog-api
npm install

## Create `.env`:
PORT=5000
MONGO_URI=your_atlas_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret


Run:
```bash
npm run dev

## API Endpoints

# Auth

Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login, get token

#Products
Method	Endpoint	Description
POST	/api/products/create	Create product (auth, form-data with images)
GET	/api/products	Get all products with search/filter/pagination
GET	/api/products/:id	Get single product

# cart
Method	Endpoint	Description
POST	/api/cart/add	Add product to cart
GET	/api/cart	Get my cart + total
DELETE	/api/cart/remove/:productId	Remove product from cart

# order

Method	Endpoint	Description
POST	/api/orders/create	Checkout from cart → create order
GET	/api/orders/my-orders	Get my orders
GET	/api/orders/:id	Get single order

## Postman Collection
Collection: Product Catalog API

Folders: Auth, Products, Cart, Orders
Environment: Product API with variables token, productId, orderId
Auto-save: Login auto-saves token, Create Product auto-saves productId, Create Order auto-saves orderId

# Tests script (Login)
const res = pm.response.json();
if (res.token) pm.environment.set("token", res.token);

## Key Learnings
Cart logic: If product already in cart, existingItem.quantity += quantity — don't duplicate, add quantity.
Snapshot price: Order stores copy of price at time of purchase. If product price changes later, order receipt stays correct.
Clear cart: After order, clear cart so user doesn't reorder same items by mistake.
Reduce stock: product.stock -= quantity — prevent overselling.
Debugging 401: When Not authorized, token failed, create fresh user + fresh token, check port (5000 vs 4444).