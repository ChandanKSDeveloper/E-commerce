import express from 'express'

// import routes
import testRoutes from "./routes/test.routes.js"

// init
const app = express();


app.use("/api/v1/test", testRoutes);
export default app;