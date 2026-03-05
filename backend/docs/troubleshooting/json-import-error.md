# Troubleshooting: JSON Import Error in ES Modules

## Problem
When working with Node.js ES Modules (`"type": "module"` in `package.json`), you might encounter an error like this when trying to import a JSON file:

```text
TypeError [ERR_IMPORT_ASSERTION_TYPE_MISSING]: Module "file:///path/to/data.json" needs an import assertion of type "json"
```

Or in newer Node.js versions:
```text
TypeError [ERR_IMPORT_ATTRIBUTE_TYPE_MISSING]: Module "file:///path/to/data.json" needs an import attribute of type "json"
```

## Why it happens
ES Modules (ESM) require explicit attributes or assertions when importing non-JavaScript files like JSON for security and performance reasons. This prevents a web browser or Node.js from accidentally executing a file that was expected to be data.

## Solution

### 1. Using Import Attributes (Modern Node.js)
The standard way to import JSON in modern Node.js (v18.20.0+, v20.10.0+, and v22.0.0+) is using the `with` keyword:

```javascript
import data from "./data.json" with { type: "json" };
```

> [!NOTE]
> Older versions of Node.js used the `assert` keyword (e.g., `assert { type: "json" }`), but this is now deprecated in favor of `with`.

### 2. Using `fs` Module (Alternative)
If you don't want to use import attributes, you can read the file manually using the built-in `fs` module:

```javascript
import fs from "fs";
const data = JSON.parse(fs.readFileSync(new URL("./data.json", import.meta.url)));
```

### 3. Using `createRequire` (Alternative)
You can also use the CommonJS `require` function within an ES module:

```javascript
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const data = require("./data.json");
```
