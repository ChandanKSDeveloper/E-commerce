import express from 'express'
import qs from 'qs'
import cookieParser from 'cookie-parser'
import cors from 'cors'

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

// cors
// Allowed origins: add all your frontend URLs here (dev + prod)
const allowedOrigins = [
    "http://localhost:5173",              // Vite dev server
    "http://localhost:4173",              // Vite preview
    process.env.FRONTEND_URL,             // local override via .env
    process.env.FRONTEND_PROD_URL,        // production frontend URL
].filter(Boolean); // remove undefined entries

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        const msg = `CORS: Origin "${origin}" is not allowed.`;
        return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))


// Routes
app.use("/api/v1/test", testRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1", orderRoutes);


// Error Middleware
app.use(errorMiddleware);

export default app;