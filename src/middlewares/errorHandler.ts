import type { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"
import type { ApiResponse } from "../types"

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
  logger.error("Unhandled error:", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  })

  // Multer file upload errors
  if (error.message.includes("File too large")) {
    res.status(413).json({
      success: false,
      error: "File too large. Maximum size is 10MB.",
      timestamp: new Date().toISOString(),
    } as ApiResponse)
    return
  }

  if (error.message.includes("Invalid file type")) {
    res.status(400).json({
      success: false,
      error: "Invalid file type. Only CSV, JSON, and TXT files are allowed.",
      timestamp: new Date().toISOString(),
    } as ApiResponse)
    return
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
    timestamp: new Date().toISOString(),
  } as ApiResponse)
}
