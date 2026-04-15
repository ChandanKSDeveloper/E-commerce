# API Documentation

## Base URL
`/api/v1` (e.g., `http://localhost:4000/api/v1`)

## Authentication
Authentication is managed using JWT (JSON Web Tokens). Generally, tokens are sent via cookies or in the `Authorization` header as a Bearer Token. Endpoints requiring authentication will be marked accordingly. Admin endpoints require an authenticated user with an "admin" role.

---

## 1. Authentication & User Profile

#### POST /api/v1/register
| Property | Value |
|----------|-------|
| **Purpose** | Register a new user |
| **Authentication** | No |
| **Method** | POST |
| **Request Format** | JSON |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Full name of user |
| email | string | Yes | Valid email address |
| password | string | Yes | Account password |

**Success Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": { ... } 
}
```

**Error Responses:**
| Status Code | Meaning |
|-------------|---------|
| 400 | Missing required fields |

---

#### POST /api/v1/login
| Property | Value |
|----------|-------|
| **Purpose** | Authenticate user and get token |
| **Authentication** | No |
| **Method** | POST |
| **Request Format** | JSON |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email |
| password | string | Yes | Account password |

**Success Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

**Error Responses:**
| Status Code | Meaning |
|-------------|---------|
| 400 | Missing email or password |
| 401 | Invalid password |
| 404 | User not found with this email |

---

#### GET /api/v1/logout
| Property | Value |
|----------|-------|
| **Purpose** | Logout current user (clears cookie) |
| **Authentication** | No |
| **Method** | GET |
| **Request Format** | None |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### POST /api/v1/forgot-password
| Property | Value |
|----------|-------|
| **Purpose** | Request a password reset link |
| **Authentication** | No |
| **Method** | POST |
| **Request Format** | JSON |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email to send reset token |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Email sent to user@example.com successfully"
}
```

---

#### PUT /api/v1/password/reset/:token
| Property | Value |
|----------|-------|
| **Purpose** | Reset password using token |
| **Authentication** | No |
| **Method** | PUT |
| **Request Format** | JSON |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | Yes | The reset token sent via email |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| password | string | Yes | New password |
| confirmPassword | string | Yes | Confirmation of new password |

**Success Response (200 OK):**
```json
{
  "success": true,
  "token": "..."
}
```

---

#### GET /api/v1/me
| Property | Value |
|----------|-------|
| **Purpose** | Get logged-in user profile |
| **Authentication** | Yes |
| **Method** | GET |
| **Request Format** | None |

**Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "60a7c...",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

---

#### PUT /api/v1/password/update
| Property | Value |
|----------|-------|
| **Purpose** | Update logged-in user's password |
| **Authentication** | Yes |
| **Method** | PUT |
| **Request Format** | JSON |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| oldPassword | string | Yes | Current password |
| newPassword | string | Yes | New password |

**Success Response (200 OK):**
```json
{
  "success": true,
  "token": "..."
}
```

---

#### PUT /api/v1/me/update
| Property | Value |
|----------|-------|
| **Purpose** | Update user profile details |
| **Authentication** | Yes |
| **Method** | PUT |
| **Request Format** | JSON |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Updated full name |
| email | string | Yes | Updated email address |

**Success Response (200 OK):**
```json
{
  "success": true,
  "token": "..."
}
```


---

## 2. Products API

#### GET /api/v1/products
| Property | Value |
|----------|-------|
| **Purpose** | Get all products with filters, search, and pagination |
| **Authentication** | No |
| **Method** | GET |
| **Request Format** | Query Parameters |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| keyword | string | No | Search products by name (e.g., `?keyword=laptop`) |
| page | integer | No | Pagination page number |
| category | string | No | Filter by category |
| price[gte] | number | No | Minimum price |
| price[lte] | number | No | Maximum price |

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 10,
  "products": [ ... ],
  "productsCount": 50
}
```

---

#### GET /api/v1/product/:id
| Property | Value |
|----------|-------|
| **Purpose** | Get single product details by ID |
| **Authentication** | No |
| **Method** | GET |
| **Request Format** | URL Parameter |

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Product's unique ID |

**Success Response (200 OK):**
```json
{
  "success": true,
  "product": { ... }
}
```

---

#### POST /api/v1/admin/product/new
| Property | Value |
|----------|-------|
| **Purpose** | Create a new product |
| **Authentication** | Yes (Admin only) |
| **Method** | POST |
| **Request Format** | JSON |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name |
| price | number | Yes | Product price |
| description | string | Yes | Product description |
| category | string | Yes | Category |
| stock | integer | Yes | Stock count |

**Success Response (201 Created):**
```json
{
  "success": true,
  "product": { ... }
}
```

---

#### PUT /api/v1/admin/product/:id
| Property | Value |
|----------|-------|
| **Purpose** | Update an existing product |
| **Authentication** | Yes (Admin only) |
| **Method** | PUT |
| **Request Format** | JSON |

**Success Response (200 OK):**
```json
{
  "success": true,
  "product": { ... }
}
```

---

#### DELETE /api/v1/admin/product/:id
| Property | Value |
|----------|-------|
| **Purpose** | Delete a product |
| **Authentication** | Yes (Admin only) |
| **Method** | DELETE |
| **Request Format** | URL Parameter |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

#### PUT /api/v1/review
| Property | Value |
|----------|-------|
| **Purpose** | Create or update a product review |
| **Authentication** | Yes |
| **Method** | PUT |
| **Request Format** | JSON |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| productId | string | Yes | ID of the product being reviewed |
| rating | number | Yes | Rating out of 5 |
| comment | string | Yes | Review message |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Review added successfully"
}
```

---

#### GET /api/v1/reviews
| Property | Value |
|----------|-------|
| **Purpose** | Get all reviews for a specific product |
| **Authentication** | No |
| **Method** | GET |
| **Request Format** | Query Parameters |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Product ID to fetch reviews for |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Review fetched successfully",
  "reviews": [ ... ]
}
```

---

#### DELETE /api/v1/reviews
| Property | Value |
|----------|-------|
| **Purpose** | Delete a specific product review |
| **Authentication** | Yes |
| **Method** | DELETE |
| **Request Format** | Query Parameters |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | Product ID |
| id | string | Yes | Review ID |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Review deleted successfully",
  "reviews": [...],
  "numberOfReviews": 0,
  "rating": 0
}
```

---

## 3. Orders API

#### POST /api/v1/order/new
| Property | Value |
|----------|-------|
| **Purpose** | Create a new order |
| **Authentication** | Yes |
| **Method** | POST |
| **Request Format** | JSON |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| orderItems | array | Yes | Array of product items being ordered |
| shippingInfo | object | Yes | Shipping details (address, city, etc.) |
| paymentInfo | object | Yes | Payment specifics |
| itemsPrice | number | Yes | Price of all items |
| taxPrice | number | Yes | Tax applied |
| shippingPrice | number | Yes | Shipping cost |
| totalPrice | number | Yes | Total cost |

**Success Response (201 Created):**
```json
{
  "success": true,
  "order": { ... }
}
```

---

#### GET /api/v1/order/:id
| Property | Value |
|----------|-------|
| **Purpose** | Get specific order details |
| **Authentication** | Yes |
| **Method** | GET |
| **Request Format** | URL Parameter |

**Success Response (200 OK):**
```json
{
  "success": true,
  "order": { ... }
}
```

---

#### GET /api/v1/orders/me
| Property | Value |
|----------|-------|
| **Purpose** | Get all orders of the logged-in user |
| **Authentication** | Yes |
| **Method** | GET |
| **Request Format** | None |

**Success Response (200 OK):**
```json
{
  "success": true,
  "orders": [ ... ]
}
```

---

#### GET /api/v1/admin/orders
| Property | Value |
|----------|-------|
| **Purpose** | Get all placed orders |
| **Authentication** | Yes (Admin only) |
| **Method** | GET |
| **Request Format** | None |

**Success Response (200 OK):**
```json
{
  "success": true,
  "orders": [ ... ]
}
```

---

#### PUT /api/v1/admin/order/:id
| Property | Value |
|----------|-------|
| **Purpose** | Update order status (e.g., Shipped, Delivered) |
| **Authentication** | Yes (Admin only) |
| **Method** | PUT |
| **Request Format** | JSON |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New order status |

**Success Response (200 OK):**
```json
{
  "success": true,
  "order": { ... }
}
```

---

#### DELETE /api/v1/admin/order/:id
| Property | Value |
|----------|-------|
| **Purpose** | Delete an order |
| **Authentication** | Yes (Admin only) |
| **Method** | DELETE |
| **Request Format** | URL Parameter |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

---

## 4. Admin Users API

#### GET /api/v1/users
| Property | Value |
|----------|-------|
| **Purpose** | Get all registered users |
| **Authentication** | Yes (Admin only) |
| **Method** | GET |
| **Request Format** | None |

**Success Response (200 OK):**
```json
{
  "success": true,
  "users": [ ... ]
}
```

---

#### GET /api/v1/user/:id
| Property | Value |
|----------|-------|
| **Purpose** | Get single user details by ID |
| **Authentication** | Yes (Admin only) |
| **Method** | GET |
| **Request Format** | URL Parameter |

**Success Response (200 OK):**
```json
{
  "success": true,
  "user": { ... }
}
```

---

#### DELETE /api/v1/user/:id
| Property | Value |
|----------|-------|
| **Purpose** | Delete user from the database |
| **Authentication** | Yes (Admin only) |
| **Method** | DELETE |
| **Request Format** | URL Parameter |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Standard Error Response Example
When validation fails, or another error strictly typed through `ErrorHandler` encounters, we follow this structure generally:
```json
{
  "success": false,
  "message": "Error details here"
}
```
*(Based on the global error `ErrorHandler` middleware.)*
