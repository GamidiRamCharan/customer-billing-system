const express = require("express");
const logger = require("./utils/logger");
const cors = require("cors");
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const billRoutes = require("./routes/bills");
const itemRoutes = require("./routes/items");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/items", itemRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// MongoDB Connect
connectDB();

// Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server Running on Port ${PORT}`);
});

// Global error handler (must be after routes)
app.use(require('./middleware/errorHandler'));

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down');
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (err) {
    logger.error('Error closing MongoDB connection', err);
    process.exit(1);
  }
});