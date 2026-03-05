/**
 * @description Global Error Middleware
 * Catches all errors passed via next() and sends a consistent JSON response.
 */
const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Handle Mongoose Validation Error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map(value => value.message);
        err.message = message;
        err.statusCode = 400;
    }

    // Handle Mongoose Duplicate Key Error
    if (err.code === 11000) {
        err.message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err.statusCode = 400;
    }

    // Handle CastError (Invalid ID)
    if (err.name === "CastError") {
        err.message = `Resource not found. Invalid: ${err.path}`;
        err.statusCode = 404;
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        // Include stack trace only in development
        stack: process.env.NODE_ENV === "DEVELOPMENT" ? err.stack : undefined
    });
};

export default errorMiddleware;
