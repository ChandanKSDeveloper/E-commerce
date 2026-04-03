# Update Password & Mongoose Troubleshooting

## 1. bcrypt.compare Throws "Illegal arguments: string, undefined"

### Problem

When calling the `/api/v1/password/update` route to change the user's password, the request fails with a 500 server error and the following message:

```json
{
    "success": false,
    "message": "Illegal arguments: string, undefined",
    "stack": "Error: Illegal arguments: string, undefined\n    at _async (file:///G:/CHANDAN/Project/E-commerce/backend/node_modules/bcryptjs/index.js:252:11)\n..."
}
```

This usually happens when `bcrypt.compare()` receives `undefined` for one of its arguments, commonly because the hashed password field was not retrieved from the database.

---

### Root Cause

In Mongoose, fields can be configured with `select: false` so that they are excluded from query results by default. This is a common security practice for sensitive fields like `password`.

When `User.findById(req.user.id)` is called to retrieve the user document for a password update, Mongoose fetches the document but omits the `password` field. Because `user.password` is `undefined`, passing it directly into `user.comparePassword(oldPassword)` causes `bcrypt.compare` to throw an error since it requires both a plain-text string and the hashed string to compare against.

---

### Buggy Code

```javascript
// src/controllers/auth.controller.js

const updatePassword = asyncHandler(async (req, res, next) => {
    // ❌ The 'password' field is not selected
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // ❌ user.password is undefined here
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    
    // ...
});
```

---

### Correct Fix

Since the `password` field has `select: false` in the Mongoose schema, you must explicitly tell Mongoose to include the password field for this specific query by chaining `.select("+password")`.

---

### Fixed Code

```javascript
// src/controllers/auth.controller.js

const updatePassword = asyncHandler(async (req, res, next) => {
    // ✅ Explicitly select the disabled password field
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // ✅ user.password is now populated and bcrypt works correctly
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    
    // ...
});
```

---

### Date of Issue

**31 March 2026**

---

### Project Phase

**Backend API Development – Update User Password Flow**

---

### Key Learning

When a Mongoose field is defined with `select: false` in the schema, it will always be excluded from queries. If you need to perform logic or validation that depends on that field (like comparing passwords), you must explicitly chain `.select("+<fieldname>")` to your query.
