# 🚀 Nodemon & Cross-Env Complete Setup Guide

## Installation

### Basic Installation

1.  Install as **dev dependency** :

    ```javascript
        npm install -D nodemon
    ```

    **or**

    ```javascript
       npm install --save-dev nodemon
    ```

2.  Install cross-env for cross-platform compatibility

    ```javascript
       npm install -D cross-env
    ```

3.  Add to package.json

- basic script

  ```json
  {
    "scripts": {
      "dev": "nodemon server.js",
      "start": "node server.js"
    }
  }
  ```

- **Advanced Scripts with Environment Variables**

  ```json
  {
    "scripts": {
      // Development with auto-reload
      "dev": "cross-env NODE_ENV=development nodemon server.js",

      // Production (no auto-reload)
      "prod": "cross-env NODE_ENV=production node server.js",

      // Staging environment
      "staging": "cross-env NODE_ENV=staging node server.js",

      // Default start
      "start": "cross-env NODE_ENV=production node server.js",

      // With custom port
      "dev:custom": "cross-env NODE_ENV=development PORT=5000 nodemon server.js"
    }
  }
  ```

### 🌍 Environment Variables Syntax - Cross Platform

- ❌ Platform-Specific (Not Recommended)

  ```json
  {
    "scripts": {
      // Windows only
      "dev:win": "SET NODE_ENV=development&& nodemon server.js",

      // Mac/Linux only
      "dev:mac": "export NODE_ENV=development&& nodemon server.js"
    }
  }
  ```

- ✅ Cross-Platform with cross-env (Recommended)

  ```json
  {
    "scripts": {
      "dev": "cross-env NODE_ENV=development nodemon server.js",
      "prod": "cross-env NODE_ENV=production node server.js",
      "dev:custom": "cross-env NODE_ENV=development PORT=3000 nodemon server.js"
    }
  }
  ```

  - "dev": "nodemon server.js" => for development with auto-restart
  - "start": "node server.js" => for production

## Why Dev Dependencies?

- Nodemon only needed in development
- Keeps production lightweight

## 🚦 How to Run

    ``` console

        # Development mode (with auto-reload)

        npm run dev

        # Production mode

        npm run prod

        # Staging mode

        npm run staging

        # Default start

        npm start

        # With custom port

        npm run dev:custom

    ```
