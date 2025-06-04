import express from 'express';
import helmet, {contentSecurityPolicy} from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";
import {sql} from "./config/db.js";
import {aj} from "./lib/arcjet.js";
import path from "path";

const __dirname = path.resolve();
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(express.json()); // parse the incoming request as data
app.use(cors()); //
app.use(helmet({
  contentSecurityPolicy: false,
})); // security middleware that sets HTTP headers
app.use(morgan('dev'));

// apply arcjet rate-limit to all routes
app.use(async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {
      requested: 1, // specifies that each request consumes 1 token
      
    })
    
    if (decision.isDenied()) {
      if(decision.reason.isRateLimit()) {
        res.status(429).json({
          error: "Too Many Requests",
        })
      } else if (decision.reason.isBot()) {
        res.status(403).json({
          error: "Bot Access Denied",
        })
      } else {
        res.status(403).json({
          error: "Forbidden",
        })
      }
      return;
    }
  
    // check for spoofed bots
    if(decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
      res.status(403).json({
        error: "Spoofed Bot Detected",
      })
      return;
    }
    
    next();
  } catch (error) {
    console.log("Arcjet Error:", error);
    next(error);
  }
})

// routes
app.use("/api/products", productRoutes); // Product Routes

// server react app
app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("/{*splat}", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

// connect DB
async function initDB() {
  try {
    await sql`
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            image VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP
        )
    `;

    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initDB", error);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Listening to PORT:", PORT);
  });
})

