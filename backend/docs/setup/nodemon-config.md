# Nodemon Installation and Setup

## Installation

1. Install as **dev dependency** : `npm install -D nodemon ` or `npm install --save-dev nodemon`

2. Add to package.json

```json
    {
    "scripts": {
        "dev": "nodemon server.js",
        "start": "node server.js"
    }
    }
```

    - "dev": "nodemon server.js" => for development with auto-restart
    - "start": "node server.js" => for production


## Why Dev Dependencies?
- Nodemon only needed in development
- Keeps production lightweight