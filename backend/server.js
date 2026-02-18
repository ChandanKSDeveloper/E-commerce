// Imports
import app from "./src/app.js";
import dotenv from "dotenv";

// config
dotenv.config();

// initialize
const PORT = process.env.PORT || 5501;
const environment = process.env.NODE_ENV;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running at http://localhost:${PORT} in ${environment} mode.`,
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
