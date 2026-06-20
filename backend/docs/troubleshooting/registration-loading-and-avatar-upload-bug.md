# Registration Infinite Loading & Avatar Upload Troubleshooting

## 1. Registering a New Account Shows Infinite Loading Icon

### Problem

When filling out the registration form and clicking the "Create Account" button, the page hangs and displays an infinite loading spinner/icon. No success toast is shown, and the user is not redirected, even if the user is successfully created in the database.

---

### Root Cause

The issue is located in the `registerUser` action inside the frontend Zustand store `frontend/store/useUserStore.js`.

During a registration request, the action checks if the user data is an instance of `FormData` (used for file/avatar uploads). In both conditional paths, the Axios call is assigned directly to the variable `data` instead of destructuring it:

```javascript
// From store/useUserStore.js
data = await api.post('/auth/register', userData, config);
```

Because Axios returns a full response wrapper containing headers, status, and config, the actual response body lies at `response.data`.
By assigning the response wrapper directly to a variable named `data`, the subsequent check:

```javascript
if (data.token) { ... }
```

fails since `token` is nested inside `data.data` (i.e. `response.data.token`).

Because the block inside the `if` statement never executes, the Zustand store's `loading` state is never set back to `false` and the auth credentials are not stored in state or LocalStorage. Thus, the frontend loader spins indefinitely.

---

### Buggy Code

```javascript
// frontend/store/useUserStore.js

registerUser: async (userData) => {
    set({ loading: true, error: null });
    try {
        const isFormData = userData instanceof FormData;
        let config = {};
        let data; // ❌ Declaring a variable to hold the full response

        if (isFormData) {
            config = { headers: { 'Content-Type': 'multipart/form-data' } };
            data = await api.post('/auth/register', userData, config); // ❌ Assigns response wrapper
        } else {
            data = await api.post('/auth/register', userData); // ❌ Assigns response wrapper
        }

        if (data.token) { // ❌ Evaluates to undefined (should be data.data.token)
            localStorage.setItem('token', data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            set({
                user: data.user,
                isAuthenticated: true,
                loading: false, // ❌ Never reached
                error: null,
                message: data.message
            });
        }
        return { success: true, data };
    } catch (error) {
        ...
    }
}
```

---

### Correct Fix

Assign the Axios response to a `response` variable and destructure the actual `{ data }` body from it, ensuring correct access to `data.token`, `data.user`, and `data.message`. Also, add a fallback to disable `loading` if no token is returned.

```javascript
// frontend/store/useUserStore.js

registerUser: async (userData) => {
    set({ loading: true, error: null });
    try {
        const isFormData = userData instanceof FormData;
        let config = {};
        let response;

        if (isFormData) {
            config = { headers: { 'Content-Type': 'multipart/form-data' } };
            response = await api.post('/auth/register', userData, config);
        } else {
            response = await api.post('/auth/register', userData);
        }

        const { data } = response; // ✅ Destructure to access actual data payload

        if (data.token) {
            localStorage.setItem('token', data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            set({
                user: data.user,
                isAuthenticated: true,
                loading: false, // ✅ Correctly stops loading state
                error: null,
                message: data.message || 'Registration successful'
            });
        } else {
            set({ loading: false }); // ✅ Safe fallback
        }
        return { success: true, data };
    } catch (error) {
        ...
    }
}
```

---

## 2. Avatar Image Upload Logs "undefined" and Falls Back to Default Avatar

### Problem

When registering an account with an avatar image, the console logs `image not uploaded: undefined` and the account is created using the default avatar image instead of the uploaded one.

---

### Root Cause

There is a mismatch between the **multer middleware** configuration in the route and the **request access pattern** in the controller:

1. **In the Route (`backend/src/routes/auth.route.js`)**:
   Multer is configured to parse fields:
   ```javascript
   router.post("/register", upload.fields([{ name: "avatar", maxCount: 1 }]), registerUser);
   ```
   This configuration tells multer to store files in `req.files` (plural) as an object mapping keys to arrays of file objects. For example: `req.files.avatar[0]`.

2. **In the Controller (`backend/src/controllers/auth.controller.js`)**:
   The controller expects a single file upload stored in `req.file` (singular):
   ```javascript
   if (req.file) { ... }
   ```
   Because `upload.fields` was used, `req.file` remains `undefined`, triggering the fallback statement and logging `image not uploaded: undefined`.

---

### Correct Fix

Since the registration route only accepts a single avatar, change the route's multer middleware from `upload.fields` to `upload.single("avatar")`. This populates `req.file` correctly and aligns with the controller logic.

```javascript
// backend/src/routes/auth.route.js

// Before:
router.post("/register", upload.fields([{ name: "avatar", maxCount: 1 }]), registerUser);

// After:
router.post("/register", upload.single("avatar"), registerUser); // ✅ Populates req.file
```

---

### Date of Issue

**12 June 2026**

---

### Project Phase

**Frontend/Backend Integration – User Registration & Media Upload Flow**

---

### Key Learning

- **`upload.single('fieldname')`** populates **`req.file`** (singular object) and is ideal for one-file uploads.
- **`upload.fields([{ name: 'fieldname', maxCount: N }])`** populates **`req.files`** (plural object/arrays) and is required when uploading files for multiple separate fields.
- Keep the route parser and controller request parameter references matching.
