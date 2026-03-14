import express from 'express'
import qs from 'qs'

// import routes
import testRoutes from "./routes/test.routes.js"
import productRoutes from "./routes/product.route.js"
import errorMiddleware from "./middlewares/error.js"

// init
const app = express();

// Middleware
app.use(express.json()); // to parse json data
app.use(express.urlencoded({ extended: true })); // to parse url encoded data

// query parser
app.set("query parser", (str) => qs.parse(str, { allowDots: true }));

// Routes
app.use("/api/v1/test", testRoutes);
app.use("/api/v1", productRoutes);

// Error Middleware
app.use(errorMiddleware);

export default app;