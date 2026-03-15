# Express Middleware Troubleshooting

## 1. Request Body is Undefined (POST/PUT Requests)

### Problem

`req.body` returns `undefined` or product creation fails because the request data is not being parsed by Express.

This usually happens when the **body-parsing middleware is missing** in the main application file.

---

### Solution

Add body parsing middleware **before defining routes** in `app.js`.

```javascript
// app.js
import express from "express";

const app = express();

// MUST be defined before routes
app.use(express.json()); // parses JSON request body
app.use(express.urlencoded({ extended: true })); // parses URL encoded form data

// Routes
app.use("/api/v1/product", productRoutes);
```

---

### Why This Happens

Express **does not parse request bodies by default**.

So when a POST request sends data like:

```json
{
  "name": "iPhone 15",
  "price": 90000
}
```

Without middleware:

```
req.body === undefined
```

With middleware:

```
req.body = {
  name: "iPhone 15",
  price: 90000
}
```

---

## 2. Route Returns 404 Not Found

### Problem

An API endpoint exists in the code but returns **404 Not Found**.

This happens when the **base route path does not match the requested URL**.

---

### Example

In `app.js`:

```javascript
app.use("/api/v1/product", productRoutes);
```

In `product.route.js`:

```javascript
router.route("/new").post(newProduct);
```

---

### Final API URL

The complete endpoint becomes:

```
http://localhost:PORT/api/v1/product/new
```

Not:

```
http://localhost:PORT/new
```

---

### Common Mistake

Developers sometimes test:

```
POST http://localhost:5000/new
```

But the correct request should be:

```
POST http://localhost:5000/api/v1/product/new
```

---

## 3. Authentication Middleware Always Returning "Please Login"

### Problem

Even after logging in and receiving a token cookie, protected routes return:

```json
{
  "success": false,
  "message": "Please login to access this resource"
}
```

---

### Root Cause

Incorrect destructuring of cookies inside the authentication middleware.

---

### Buggy Code

```javascript
const { token } = req.cookies.token;
```

---

### Why This Fails

`req.cookies` returns an object like:

```javascript
{
  token: "JWT_TOKEN"
}
```

But the code tries to destructure a **string value**, not an object.

Example:

```javascript
const { token } = "JWT_TOKEN";
```

Result:

```
token = undefined
```

Since `token` becomes `undefined`, this condition always triggers:

```javascript
if (!token)
```

---

### Correct Fix

Access the cookie value directly.

```javascript
const token = req.cookies.token;
```

---

### Fixed Middleware

```javascript
const isAuthenticatedUser = asyncHandler(async (req, res, next) => {

  const token = req.cookies.token;

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id);

  next();
});
```

---

### Date of Issue

**15 March 2026**

---

### Project Phase

**Backend API Development – adding Authentication & Authorization to Protect Routes from Unauthorized Users**

---

### Key Learning

Correct destructuring should be done on objects:

✔ Correct

```javascript
const { token } = req.cookies;
```

✔ Also Correct

```javascript
const token = req.cookies.token;
```

❌ Incorrect

```javascript
const { token } = req.cookies.token;
```

---

## 4. Cookies Not Available in `req.cookies`

### Problem

`req.cookies` is empty or undefined.

---

### Solution

Install and use **cookie-parser** middleware.

```
npm install cookie-parser
```

Then register it in `app.js`.

```javascript
import cookieParser from "cookie-parser";

app.use(cookieParser());
```

---

## 5. Postman Not Sending Cookies

### Problem

Authentication works in browser but fails in Postman.

---

### Solution

After login, verify cookies in Postman.

Open:

```
Postman → Cookies → localhost
```

You should see:

```
token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

If not, ensure login API sets the cookie properly.

```javascript
res.cookie("token", token, {
  httpOnly: true,
  expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
});
```

---

# Summary

| Issue                   | Cause                   | Fix                       |
| ----------------------- | ----------------------- | ------------------------- |
| `req.body` undefined    | Missing body parser     | `express.json()`          |
| 404 route error         | Wrong base path         | Match `app.use()` path    |
| Auth middleware failing | Incorrect destructuring | `req.cookies.token`       |
| Cookies undefined       | Missing cookie-parser   | `app.use(cookieParser())` |
| Postman auth failing    | Cookies not sent        | Check Postman cookies     |

---

# Final Takeaway

Most Express backend issues occur due to **middleware order, incorrect destructuring, or route path mismatches**.

Always verify:

1. Middleware order
2. Route prefixes
3. Cookie parsing
4. Correct JavaScript object access
