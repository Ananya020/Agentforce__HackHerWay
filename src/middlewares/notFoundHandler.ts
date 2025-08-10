import type { Request, Response } from "express"
import type { ApiResponse } from "../types"

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  } as ApiResponse)
}
