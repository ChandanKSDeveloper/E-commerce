# Express Middleware Troubleshooting

## Common Issues & Solutions

### 1. Request Body is Undefined (POST/PUT Requests)

- **Problem** : `req.body` returns `undefined` or product creation fails because data is not being parsed.
- **Solution** : Add body-parsing middleware to your main application file (`app.js`) before defining routes.
  ```javascript
  // app.js
  const app = express();

  // MUST be defined before routes
  app.use(express.json()); // to parse json data
  app.use(express.urlencoded({ extended: true })); // to parse url encoded data

  // Routes
  app.use("/api/v1/product", productRoutes);
  ```

### 2. Route Returns 404 Not Found

- **Problem** : API endpoint exists in code but returns 404.
- **Solution** : Verify the base path in `app.js` matches the requested URL.
  - If `app.js` has `app.use("/api/v1/product", productRoutes)`
  - And `product.route.js` has `router.route("/new").post(newProduct)`
  - The final URL must be: `http://localhost:PORT/api/v1/product/new`
