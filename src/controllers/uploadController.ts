import type { Request, Response } from "express"
import { fileService } from "../services/fileService"
import { logger } from "../utils/logger"
import type { ApiResponse } from "../types"

export class UploadController {
  async uploadFiles(req: Request, res: Response): Promise<void> {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({
          success: false,
          error: "No files uploaded",
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      const processedFiles = await Promise.all(req.files.map((file) => fileService.processFile(file)))

      logger.info(`Processed ${processedFiles.length} files`)

      res.status(200).json({
        success: true,
        data: {
          files: processedFiles,
          totalFiles: processedFiles.length,
        },
        message: "Files uploaded and processed successfully",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    } catch (error) {
      logger.error("Error in uploadFiles:", error)
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to process uploaded files",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    }
  }
}

export const uploadController = new UploadController()
