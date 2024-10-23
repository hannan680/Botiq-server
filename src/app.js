const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const routes = require("./routes/index");
const { errorHandler } = require("./core/utils/errorHandler");
const path = require("path");

const app = express();

const corsOptions = {
  origin: "*", // Allow requests from this origin
};

// Security middlewares
app.use(express.json());
app.use(cors(corsOptions));
app.set("trust proxy", 1);
app.use(helmet());

// Body parser
app.use("/api/v1/bots", express.static(path.join(__dirname, "../bots")));

// Request logging
app.use(morgan("combined"));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.options("*", cors());
app.use("/api/v1", routes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
