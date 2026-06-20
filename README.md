# E-commerce

A full-stack MERN e-commerce platform with user authentication, product catalog, shopping cart, Stripe payment processing, order management, reviews, and an admin dashboard.

## Tech Stack

**Backend:** Node.js, Express 5, MongoDB (Mongoose ODM), JWT, Bcryptjs, Stripe, Cloudinary, Nodemailer, Multer

**Frontend:** React 19, Vite 8, React Router DOM 7, Tailwind CSS 4, shadcn/ui, Zustand, Axios, Stripe Elements, React Hook Form, TanStack React Query, Sonner

## Features

### User Features
- Registration & login with JWT-based authentication
- Password management (forgot/reset via email)
- Profile management with avatar upload (Cloudinary)
- Product browsing with grid view, pagination (10/page)
- Search by keyword, filter by category & price range
- Product details with images, description, price, stock, reviews
- Shopping cart with quantity controls (persisted to localStorage)
- Checkout flow: Shipping info → Order confirmation → Payment
- Stripe payments (Card, UPI, Netbanking, Google Pay, Apple Pay) + mock/COD modes
- Order history with status tracking
- Product reviews with ratings

### Admin Features
- Dashboard with stats (total products, orders, users, revenue)
- Product management (create, edit, delete with image upload)
- Order management (view all, update status, auto-stock updates on delivery)
- User management (view all, update roles, delete)

## Project Structure

```
├── backend/
│   ├── server.js                     # Entry point
│   ├── src/
│   │   ├── app.js                    # Express app setup
│   │   ├── config/database.js        # MongoDB connection
│   │   ├── controllers/              # Route handlers
│   │   ├── models/                   # Mongoose schemas (User, Product, Order)
│   │   ├── routes/                   # API routes
│   │   ├── middlewares/              # Auth, error handling
│   │   ├── utils/                    # Helpers (ApiFeatures, JWT, email, upload)
│   │   └── data/                     # Seed data
│   └── docs/
├── frontend/
│   ├── src/
│   │   ├── main.jsx                  # React entry
│   │   ├── App.jsx                   # Routes & providers
│   │   ├── pages/                    # Page components
│   │   ├── components/               # Shared UI components
│   │   └── config/axios.js           # Axios instance
│   ├── store/                        # Zustand stores
│   └── public/
└── README.md
```

## API Endpoints

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/products` | No | List products (search, filter, paginate) |
| GET | `/api/v1/product/:id` | No | Get single product |
| POST | `/api/v1/admin/product/new` | Admin | Create product |
| PUT | `/api/v1/admin/product/:id` | Admin | Update product |
| DELETE | `/api/v1/admin/product/:id` | Admin | Delete product |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/api/v1/review` | User | Create/update review |
| GET | `/api/v1/reviews` | No | Get product reviews |
| DELETE | `/api/v1/reviews` | User | Delete review |

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register |
| POST | `/api/v1/auth/login` | No | Login |
| GET | `/api/v1/auth/logout` | User | Logout |
| POST | `/api/v1/auth/forgot-password` | No | Request reset |
| PUT | `/api/v1/auth/password/reset/:token` | No | Reset password |
| GET | `/api/v1/auth/me` | User | Get profile |
| PUT | `/api/v1/auth/password/update` | User | Update password |
| PUT | `/api/v1/auth/me/update` | User | Update profile |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/order/new` | User | Create order |
| GET | `/api/v1/order/:id` | User | Get order |
| GET | `/api/v1/orders/me` | User | My orders |
| GET | `/api/v1/admin/orders` | Admin | All orders |
| PUT | `/api/v1/admin/order/:id` | Admin | Update status |
| DELETE | `/api/v1/admin/order/:id` | Admin | Delete order |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/users` | Admin | All users |
| GET | `/api/v1/user/:id` | Admin | Single user |
| PUT | `/api/v1/user/:id` | Admin | Update user role |
| DELETE | `/api/v1/user/:id` | Admin | Delete user |
| GET | `/api/v1/admin/stats` | Admin | Dashboard stats |

### Payment
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/payment/process` | User | Create payment intent |
| GET | `/api/v1/payment/config` | User | Get Stripe key |

## Frontend Routes

| Path | Component | Auth | Admin |
|------|-----------|------|-------|
| `/` | Home | - | - |
| `/search` | SearchPage | - | - |
| `/product/:id` | ProductPage | - | - |
| `/login` | Login | - | - |
| `/register` | Register | - | - |
| `/forgot-password` | ForgotPassword | - | - |
| `/reset-password/:token` | ResetPassword | - | - |
| `/cart` | Cart | - | - |
| `/shipping` | Shipping | Yes | - |
| `/order/confirm` | ConfirmOrder | Yes | - |
| `/payment` | Payment | Yes | - |
| `/profile` | Profile | Yes | - |
| `/orders/me` | MyOrders | Yes | - |
| `/order/:id` | OrderDetails | Yes | - |
| `/admin/dashboard` | Dashboard | Yes | Yes |
| `/admin/products` | AdminProducts | Yes | Yes |
| `/admin/product/new` | NewProduct | Yes | Yes |
| `/admin/product/:id` | NewProduct (edit) | Yes | Yes |
| `/admin/orders` | AdminOrders | Yes | Yes |
| `/admin/users` | AdminUsers | Yes | Yes |

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB instance (Atlas or local)
- Cloudinary account
- Stripe account (test keys)
- Mailtrap account (or SMTP)

### Installation

```bash
# Backend
cd backend
npm install
npm run dev          # http://localhost:4000

# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### Seed Data

```bash
cd backend
node src/utils/data.seeder.js
```

### Environment Variables

Backend `.env`:
```
PORT=4000
NODE_ENV=DEVELOPMENT
FRONTEND_URL=http://localhost:5173
MONGODB_URL=<your-mongodb-uri>
DB_NAME=ecommerce
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_IN=7
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=<your-mailtrap-user>
MAILTRAP_PASS=<your-mailtrap-pass>
MAILTRAP_FROM_NAME="E-Commerce Support"
MAILTRAP_FROM_EMAIL=hello@demomailtrap.co
STRIPE_SECRET_KEY=<your-stripe-secret>
STRIPE_API_KEY=<your-stripe-publishable-key>
```

Frontend `.env`:
```
VITE_API_URL=http://localhost:4000/api/v1
VITE_API_PROXY_TARGET=http://localhost:4000
```

## Scripts

**Backend:**
- `npm start` — production start
- `npm run dev` — development with nodemon
- `npm run prod` — production mode start

**Frontend:**
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview build
- `npm run lint` — ESLint

## License

MIT — © Chandan Kumar Singh
