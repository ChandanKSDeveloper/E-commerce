# Node.js ES Modules Setup Notes

## Common Issues & Solutions

### 1. Import Path Error

- **Problem** : `ERR_MODULE_NOT_FOUND`
- **Solution** : Use `./` for relative path
  ```javascript
  //Wrong
  import app from "app.js";

  // Correct
  import app from "./app.js";
  ```
