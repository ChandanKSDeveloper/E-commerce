# API Features Utility (Search, Filter, Pagination)

This document explains how the **ApiFeatures utility class** works in a Node.js + Express + MongoDB API.

It is commonly used in **REST APIs** to implement:

* Searching
* Filtering
* Pagination

Instead of writing query logic inside controllers, we create a **reusable utility class**.

---

# Why Use ApiFeatures?

Without ApiFeatures, a controller might look like this:

```javascript
const products = await Product.find({
  price: { $gte: 5000 }
}).limit(10).skip(20);
```

If we add search, filter, pagination, sorting etc., the controller becomes messy.

ApiFeatures helps us keep controllers **clean and reusable**.

Example controller usage:

```javascript
const resultPerPage = 10;

const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

const products = await apiFeature.query;
```

---

# API Query Examples

### Search

```
GET /api/v1/products?keyword=iphone
```

### Filter

```
GET /api/v1/products?price[gte]=5000&price[lte]=20000
```

### Pagination

```
GET /api/v1/products?page=2
```

### Combined

```
GET /api/v1/products?keyword=iphone&price[gte]=5000&page=2
```

---

# Important Express Configuration

To allow nested query parameters like `price[gte]`, install **qs parser**.

### Install

```bash
npm install qs
```

### Configure Express

```javascript
import qs from "qs";

app.set("query parser", (str) => qs.parse(str, { allowDots: true }));
```

Without this configuration, Express will treat queries like:

```
price[gte]=5000
```

as:

```
"price[gte]": "5000"
```

instead of the correct nested object.

---

# Beginner Explanation

The ApiFeatures class does 3 main tasks:

| Feature    | Purpose                     |
| ---------- | --------------------------- |
| Search     | Find products by name       |
| Filter     | Filter by fields like price |
| Pagination | Split results into pages    |

---

# Full ApiFeatures Code (With Comments)

```javascript
class ApiFeatures {

    // Constructor receives:
    // query = mongoose query (Product.find())
    // queryStr = request query parameters (req.query)

    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }


    // SEARCH FEATURE
    // Example:
    // /api/v1/products?keyword=iphone
    // This will search products where name contains "iphone"

    search() {

        const keyword = this.queryStr.keyword
            ? {
                name: {
                    $regex: this.queryStr.keyword, // pattern match
                    $options: "i" // case insensitive search
                }
            }
            : {};

        // merge search query with existing mongoose query
        this.query = this.query.find({ ...keyword });

        return this; // allows method chaining
    }


    // FILTER FEATURE
    // Example:
    // /api/v1/products?price[gte]=5000&price[lte]=20000

    filter() {

        // Copy query object
        const queryCopy = { ...this.queryStr };


        // Remove fields that are not related to filtering
        const removeFields = ["keyword", "limit", "page"];

        removeFields.forEach((field) => delete queryCopy[field]);


        // Convert object to string
        let queryStr = JSON.stringify(queryCopy);


        // Replace operators with MongoDB operators
        // gte -> $gte
        // lte -> $lte
        // gt  -> $gt
        // lt  -> $lt

        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte)\b/g,
            (match) => `$${match}`
        );


        // Convert back to object
        const parsedQuery = JSON.parse(queryStr);


        // Convert price filters to numbers
        // because query params come as strings

        if (parsedQuery.price) {

            if (parsedQuery.price.$gte)
                parsedQuery.price.$gte = Number(parsedQuery.price.$gte);

            if (parsedQuery.price.$lte)
                parsedQuery.price.$lte = Number(parsedQuery.price.$lte);

            if (parsedQuery.price.$gt)
                parsedQuery.price.$gt = Number(parsedQuery.price.$gt);

            if (parsedQuery.price.$lt)
                parsedQuery.price.$lt = Number(parsedQuery.price.$lt);
        }


        // Apply filter query to mongoose
        this.query = this.query.find(parsedQuery);

        return this;
    }



    // PAGINATION FEATURE
    // Example:
    // /api/v1/products?page=2

    pagination(resultPerPage) {

        // convert page to number
        const currentPage = Number(this.queryStr.page) || 1;

        // calculate how many documents to skip
        const skip = (currentPage - 1) * resultPerPage;

        // apply limit and skip
        this.query = this.query
            .limit(resultPerPage)
            .skip(skip);

        return this;
    }

}

export default ApiFeatures;
```

---

# Method Chaining

Notice every function returns:

```
return this;
```

This allows chaining:

```javascript
new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(10);
```

---

# Advanced Explanation

## Regex Search

```
$regex
```

Allows partial matching.

Example:

```
keyword=iphone
```

Matches:

```
iphone
iphone 15
iphone charger
```

---

## MongoDB Operators

Our API supports operators like:

| Operator | Meaning            |
| -------- | ------------------ |
| gte      | greater than equal |
| gt       | greater than       |
| lte      | less than equal    |
| lt       | less than          |

Example:

```
price[gte]=5000
```

becomes:

```
price: { $gte: 5000 }
```

---

# Pagination Formula

```
skip = (page - 1) * resultPerPage
```

Example:

| Page | Skip | Limit |
| ---- | ---- | ----- |
| 1    | 0    | 10    |
| 2    | 10   | 10    |
| 3    | 20   | 10    |

---

# Best Practices

### 1 Use Utility Classes

Never put filtering logic directly inside controllers.

---

### 2 Always Sanitize Query Fields

Remove fields like:

```
keyword
page
limit
sort
```

before applying filters.

---

### 3 Convert Numbers

Query parameters are always strings:

```
"5000"
```

Convert them to numbers before querying MongoDB.

---

### 4 Debug Queries

Log parsed queries when debugging:

```javascript
console.log("Parsed Query:", parsedQuery);
```

---

### 5 Always Use Pagination

Never return all documents in production APIs.

---

# Suggested Future Improvements

You can extend ApiFeatures with:

### Sorting

```
/api/v1/products?sort=price
```

### Category Filtering

```
/api/v1/products?category=electronics
```

### Rating Filter

```
/api/v1/products?rating[gte]=4
```

### Field Selection

```
/api/v1/products?fields=name,price
```

---