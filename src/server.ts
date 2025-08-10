import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"
import rateLimit from "express-rate-limit"
import swaggerUi from "swagger-ui-express"
import swaggerJsdoc from "swagger-jsdoc"
import dotenv from "dotenv"

import { logger } from "./utils/logger"
import { errorHandler } from "./middlewares/errorHandler"
import { notFoundHandler } from "./middlewares/notFoundHandler"

// Routes
import personaRoutes from "./routes/personaRoutes"
import trendsRoutes from "./routes/trendsRoutes"
import uploadRoutes from "./routes/uploadRoutes"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PerzonAI API",
      version: "1.0.0",
      description: "AI Marketing Persona Generation API",
    },
    servers: [
      {
        url: process.env.NODE_ENV === "production" ? "https://your-api-domain.com" : `http://localhost:${PORT}`,
        description: process.env.NODE_ENV === "production" ? "Production server" : "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

// Middleware
app.use(helmet())
app.use(compression())
app.use(limiter)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Routes
app.use("/api/personas", personaRoutes)
app.use("/api/trends", trendsRoutes)
app.use("/api/upload", uploadRoutes)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 PerzonAI Backend running on port ${PORT}`)
  logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`)
  logger.info(`🏥 Health check available at http://localhost:${PORT}/health`)
})

export default app
