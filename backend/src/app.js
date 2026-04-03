import express from 'express'
import qs from 'qs'
import cookieParser from 'cookie-parser'

// import routes
import testRoutes from "./routes/test.routes.js"
import productRoutes from "./routes/product.route.js"
import errorMiddleware from "./middlewares/error.js"
import authRoutes from "./routes/auth.route.js"
import adminRoutes from "./routes/admin.route.js"
import orderRoutes from "./routes/order.route.js"

// init
const app = express();

// Middleware
app.use(express.json()); // to parse json data
app.use(express.urlencoded({ extended: true })); // to parse url encoded data

// query parser
app.set("query parser", (str) => qs.parse(str, { allowDots: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1/test", testRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1", orderRoutes);

// Error Middleware
app.use(errorMiddleware);

export default app;