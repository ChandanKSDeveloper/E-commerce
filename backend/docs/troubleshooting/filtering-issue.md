# Express API Filtering Troubleshooting

## Common Issues & Solutions

### 1. Query Filters Not Working (Advanced Filtering)

* **Problem** : API filtering using operators like `gte`, `lte`, `gt`, `lt` returns no results even though matching documents exist in the database.

Example API request:

```http
/api/v1/products?keyword=reliance&price[gte]=5000&price[lte]=26000
```

But the API returns:

```json
{
  "success": true,
  "count": 0,
  "products": []
}
```

---

## Root Cause

Express **does not automatically parse nested query parameters** like:

```http
price[gte]=5000
price[lte]=26000
```

Instead of converting them into a nested object:

```javascript
{
  price: {
    gte: "5000",
    lte: "26000"
  }
}
```

Express returns **flat keys**:

```javascript
{
  "price[gte]": "5000",
  "price[lte]": "26000"
}
```

Because of this, MongoDB receives an invalid query and filtering fails.

---

# Solution

Use the **qs query parser** so Express correctly parses nested query parameters.

## Step 1 — Install `qs`

```bash
npm install qs
```

---

## Step 2 — Configure Express Query Parser

In your main application file (`app.js` or `server.js`):

```javascript
import qs from "qs";

app.set("query parser", (str) => qs.parse(str, { allowDots: true }));
```

Now this request:

```http
/api/v1/products?price[gte]=5000&price[lte]=26000
```

Will correctly parse into:

```javascript
{
  price: {
    gte: "5000",
    lte: "26000"
  }
}
```

---

# Filter Method Implementation

After enabling `qs`, the filter logic can correctly transform query operators into MongoDB operators.

```javascript
filter(){
    const queryCopy = {...this.queryStr};

    const removeFields = ["keyword", "limit", "page"];
    removeFields.forEach(ele => delete queryCopy[ele]);

    let queryStr = JSON.stringify(queryCopy);

    // Convert gte -> $gte etc.
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    const parsedQuery = JSON.parse(queryStr);

    // Convert price filters to numbers
    if(parsedQuery.price){
        if(parsedQuery.price.$gte) parsedQuery.price.$gte = Number(parsedQuery.price.$gte);
        if(parsedQuery.price.$lte) parsedQuery.price.$lte = Number(parsedQuery.price.$lte);
        if(parsedQuery.price.$gt) parsedQuery.price.$gt = Number(parsedQuery.price.$gt);
        if(parsedQuery.price.$lt) parsedQuery.price.$lt = Number(parsedQuery.price.$lt);
    }

    this.query = this.query.find(parsedQuery);

    return this;
}
```

---

# Final MongoDB Query Example

API request:

```http
/api/v1/products?price[gte]=5000&price[lte]=26000
```

After transformation:

```javascript
{
  price: {
    $gte: 5000,
    $lte: 26000
  }
}
```

MongoDB query:

```javascript
Product.find({
  price: { $gte: 5000, $lte: 26000 }
});
```

Now the API correctly returns matching products.

---

# Best Practices

✔ Always log query objects when debugging filters

```javascript
console.log("Parsed Query:", parsedQuery);
```

✔ Use a dedicated **API features utility class** to handle:

* search
* filter
* pagination
* sorting

✔ Keep filtering logic reusable across controllers.

---
