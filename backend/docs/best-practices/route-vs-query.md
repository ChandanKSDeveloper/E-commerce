# Route Parameters vs. Query Parameters

Understanding when and how to use Route Parameters and Query Parameters is essential for building clean, RESTful APIs in Express.

## 1. Route Parameters (`req.params`)

Route parameters are named URL segments that are used to capture values at specific positions in the URL. They are typically used for **identifying a specific resource**.

- **Pattern**: `/:paramName`
- **Example Route**: `/api/v1/product/:id`
- **Example Call**: `/api/v1/product/69a874f7392044a858fab39a`
- **Access in Code**: `req.params.id`

### Why use Route Params?
Use them when the resource **cannot exist** or doesn't make sense without that piece of data. For example, getting a specific product or a specific user's posts.

---

## 2. Query Parameters (`req.query`)

Query parameters are key-value pairs that appear after a `?` in the URL. They are typically used for **filtering, sorting, or searching**.

- **Pattern**: `?key=value`
- **Example Route**: `/api/v1/product`
- **Example Call**: `/api/v1/product?category=Electronics&sort=price`
- **Access in Code**: `req.query.category`

### Why use Query Params?
Use them for **optional** data that modifies the result set but doesn't define the resource itself. For example, search terms, pagination (limit/page), and filters.

---

## 3. Why your request failed

**Your Request**: `{{domain}}/api/v1/product/?id=69a874f7392044a858fab39a`

### What happened:
1. Express looks at the path: `/api/v1/product/`.
2. It ignores everything after the `?` during the matching phase.
3. It finds the route `router.route('/').get(getProducts)`.
4. It executes `getProducts`, which returns **all** products.
5. The `id` you passed is sitting in `req.query.id`, but the `getProducts` controller doesn't look at `req.query.id`.

### The Correct Way:
To get a single product by ID, use the path defined in your routes:
`{{domain}}/api/v1/product/69a874f7392044a858fab39a`

---

## 4. Summary Table

| Feature | Route Parameters (`params`) | Query Parameters (`query`) |
| :--- | :--- | :--- |
| **URL Syntax** | `/product/123` | `/product?id=123` |
| **Definition** | Part of the URL path | After the `?` symbol |
| **Purpose** | Resource Identification | Filtering/Sorting/Searching |
| **In Express** | `/:id` | No special route syntax |
| **Mandatory?** | Usually Yes | Usually No (Optional) |
