# Password Reset & Mongoose Troubleshooting

## 1. Mongoose `pre('save')` Hook Throws "next is not a function"

### Problem

When calling `user.save({ validateBeforeSave: false })` or similar document save operations, the request fails with a 500 error and the following message:

```json
{
    "success": false,
    "message": "next is not a function",
    "stack": "TypeError: next is not a function\n    at model.<anonymous> (file:///G:/CHANDAN/Project/E-commerce/backend/src/models/user.model.js:49:12)\n    at Kareem.execPre (G:\CHANDAN\Project\E-commerce\backend\node_modules\kareem\index.js:68:39)\n..."
}
```

This usually happens when there is a mix-up between **callback-based** and **promise-based** (`async/await`) middleware definitions in Mongoose.

---

### Root Cause

Mongoose supports two different styles for defining pre-save hooks:
1. **Callback style**: The function takes `next` as an argument and calls `next()` when it finishes.
2. **Promise style (`async/await`)**: The function is marked as `async`, returns a Promise naturally, and does **not** need the `next` argument.

The bug occurs when a hook uses the `async` keyword but still declares and tries to call the `next` parameter. Because Mongoose understands the hook returns a Promise (thanks to `async`), it does not reliably pass the `next` callback function when `save()` is executed with certain arguments (like `validateBeforeSave: false`). Calling `next()` then causes a `TypeError` because `next` is `undefined`.

---

### Buggy Code

```javascript
// src/models/user.model.js

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // ❌ next is undefined when using async function
  }
  this.password = await bcrypt.hash(this.password, 10);
  next(); // ❌ next is undefined when using async function
});
```

---

### Correct Fix

Since we are using `async/await` inside the hook and it returns a Promise, we must **remove the `next` argument entirely** and just `return` to exit the hook early.

---

### Fixed Middleware

```javascript
// src/models/user.model.js

// Hash the password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return; // ✅ Just return to exit early
  }
  this.password = await bcrypt.hash(this.password, 10);
  // ✅ No need to call next() at the end; Mongoose automatically waits for the promise to resolve
});
```

---

### Date of Issue

**26 March 2026**

---

### Project Phase

**Backend API Development – Forgot Password / User Authentication Flow**

---

### Key Learning

Do not mix callbacks with Promises in Mongoose Middleware.

✔ Correct (Async/Await)

```javascript
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});
```

✔ Also Correct (Callback)

```javascript
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  bcrypt.hash(this.password, 10).then(hash => {
    this.password = hash;
    next();
  });
});
```

❌ Incorrect (Mixed)

```javascript
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

---

## 2. Forgot Password Email "Sent" but Not Received

### Problem

The API returns `{"success": true, "message": "Email sent..."}` but the email is never actually delivered to the real user's email address (e.g. `user@example.com`).

---

### Root Cause

The project is using **Mailtrap Sandbox** credentials instead of **Mailtrap Email Sending** (Production) credentials.

Mailtrap Sandbox is a "fake" SMTP server designed only for development. It catches all outgoing emails and displays them in your Mailtrap Dashboard so you can legitimately inspect the templates and flow. **It deliberately does not deliver emails to real email addresses** to prevent accidentally spamming users during testing.

Additionally, the `.env` file might be missing the `from` email and name variables, causing the email to show up as from `undefined <undefined>` in your testing inbox.

---

### Fix 1: Add Missing "From" Variables

Ensure your `backend/.env` file has the appropriate sender variables explicitly defined. Mongoose or Nodemailer will crash or default to bad values if `undefined` is passed.

```env
# In backend/.env
MAILTRAP_FROM_NAME="E-Commerce Support"
MAILTRAP_FROM_EMAIL="hello@demomailtrap.co"
```

---

### Fix 2: Switch to Real Email Sending (Production)

If you actually want the emails to be delivered to real users' inboxes:
1. Open your [Mailtrap Dashboard](https://mailtrap.io).
2. Go to **Email Sending** -> **Sending Domains**.
3. **If using "demomailtrap.co"**: You can only send emails *to* the exact email address you used to sign up for Mailtrap itself.
4. **If using your own domain (e.g., `fabaos.com`)**: You must verify the domain by adding the DNS records provided by Mailtrap to your domain registrar. Once verified, you can send to any arbitrary email address.
5. Finally, replace the Sandbox credentials in your `.env` (`sandbox.smtp.mailtrap.io` etc.) with the real **Email Sending** SMTP credentials (`live.smtp.mailtrap.io` or `send.smtp.mailtrap.io`).

---

### Key Learning

- **Mailtrap Sandbox (`sandbox.smtp.mailtrap.io`)** = Emails go to your Mailtrap Inbox exclusively (Testing only).
- **Mailtrap Email Sending (`live.smtp.mailtrap.io`)** = Emails go out to the real world (Production).
