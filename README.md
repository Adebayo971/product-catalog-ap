# Product Catalog API

A backend API for product catalog with multiple image upload, JWT auth, and MongoDB Atlas.

**Live API:** https://product-catalog-ap.onrender.com

## Features

- JWT Authentication (Register / Login)
- Create product with up to 5 images (multiple upload)
- Cloudinary image upload (memory storage + base64 + Promise.all)
- Get all products, get single product, delete product
- MongoDB Atlas cloud database
- Deployed on Render

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose (Atlas)
- JWT (jsonwebtoken + bcryptjs)
- Multer (memoryStorage)
- Cloudinary
- CORS

## Setup Locally

```bash
npm install