# Implementation Plan: Server Startup and Unhandled Rejection Fix

## Issue Analysis
The current implementation of `backend/server.js` has two main problems around server startup and error handling (starting from line 17):
1. **Asynchronous DB Connection not awaited:** `connectDB()` is called before `app.listen()`, but since it is asynchronous, the server goes live and binds to the port *before* the MongoDB connection is complete. This means requests could hit endpoints requiring the DB before it is ready.
2. **Scoping and graceful shutdown for `unhandledRejection`:** The `unhandledRejection` hook at the bottom of the file tries to call `server.close()`. This assumes the server has successfully started and the variable is always initialized. If a global rejection happens before the server starts, this could create another error.

## Proposed Changes

We will refactor `server.js` starting at line 14:
1. Define a global `let server;` variable before starting the DB.
2. We will start the express server **inside** a `.then()` block that resolves after `connectDB()` successfully connects. This ensures `server` only starts when the DB is ready.
3. Update the `process.on("unhandledRejection")` block to check if the `server` exists before calling `server.close()`. If not, it safely exits.
4. Also, optionally add a `process.on("uncaughtException")` at the very top to safely shut down if there are synchronous errors.

### Code Refactoring (backend/server.js)

```javascript
// ... [imports and config are unchanged] ...

let server;

// Connect to MongoDb database and start server
connectDB()
  .then(() => {
    // Start the server ONLY after DB is connected
    server = app.listen(PORT, () => {
      console.log(
        `🚀 Server running at http://localhost:${PORT} in ${environment} mode.`
      );

      if (environment === "DEVELOPMENT") {
        console.log("🔧 Debug mode ON - extra logging enabled");
        console.log(`📁 Environment: ${environment}`);
        console.log(`🔌 Port: ${PORT}`);
      } else if (environment === "PRODUCTION") {
        console.log("⚡ Production optimizations enabled");
        console.log(`📁 Environment: ${environment}`);
        console.log(`🔌 Port: ${PORT}`);
      }
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed: ", err);
    process.exit(1);
  });

// Handle unhandled Promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err.message}`);
  console.log("Shutting down the server due to unhandled Promise Rejection");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
```

## Verification Plan
1. **Automated Test / Execution Checks**: We will run `node backend/server.js` via command line to observe the logs. We should see the MongoDB connection success message *before* the server startup logging message.
2. **Simulating Unhandled Rejection**: Temporarily add an unhandled rejection, like `setTimeout(() => { Promise.reject(new Error("Test Error")); }, 2000);` right after the server starts, and verify that the app gracefully shuts down its server and stops the process when it crashes.
