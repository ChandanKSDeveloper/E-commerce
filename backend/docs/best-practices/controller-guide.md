# Backend Best Practices: Controllers & Error Handling

Modern Node.js (Express) applications should be built to be scalable, readable, and consistent. One of the most common areas for "beginner mistakes" is in controller logic and error handling.

## 1. Eliminate Repetitive Try-Catch blocks

### The Problem (Beginner)
In a beginner project, you often see `try-catch` blocks in every single controller function. This leads to code duplication and makes maintenance difficult.

```javascript
const myController = async (req, res) => {
    try {
        // Logic
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
```

### The Solution (Professional)
Use an `asyncHandler` wrapper. This wrapper catches any rejected promises and passes the error to the `next()` middleware automatically.

```javascript
import asyncHandler from "../utils/asyncHandler.js";

const myController = asyncHandler(async (req, res, next) => {
    // Logic here without try-catch
    // If an error happens, it goes to the global error handler
});
```

---

## 2. Centralized Error Handling

### The Problem
Manually sending `res.status(404).json(...)` everywhere results in inconsistent error responses.

### The Solution
Create a custom `ErrorHandler` class and a global `errorMiddleware`.

1. **ErrorHandler Class**: Standardizes how you "throw" errors.
2. **Error Middleware**: A single place to format all error responses (including Mongoose validation errors, duplicate keys, etc.).

**Professional Usage:**
```javascript
if (!item) {
    return next(new ErrorHandler("Item not found", 404));
}
```

---

## 3. Clean Object Status Checks

### The Problem
```javascript
if (!product || product === null || product === "") { ... }
```
In JavaScript, if `findById` doesn't find a document, it returns `null`. Simply `if (!product)` is sufficient and cleaner.

---

## 4. Consistent API Responses

Always follow a standard structure for your responses so the frontend team knows what to expect.

- **Success**: `{ success: true, data: ... }`
- **Error**: `{ success: false, message: "Explict error message" }`

---

## 5. Mongoose Best Practices

When updating a document using `findByIdAndUpdate`, always set `runValidators: true` to ensure your schema's validation rules are checked during the update.

```javascript
await Product.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });
```
