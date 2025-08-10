import multer from "multer"
import csv from "csv-parser"
import { Readable } from "stream"
import { logger } from "../utils/logger"
import type { UploadedFile } from "../types"
import type { Express } from "express"

class FileService {
  private storage = multer.memoryStorage()

  public upload = multer({
    storage: this.storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["text/csv", "application/json", "text/plain"]
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new Error("Invalid file type. Only CSV, JSON, and TXT files are allowed."))
      }
    },
  })

  async processFile(file: Express.Multer.File): Promise<UploadedFile> {
    const content = file.buffer.toString("utf-8")
    let processedData: any = {}

    try {
      switch (file.mimetype) {
        case "text/csv":
          processedData = await this.processCsvFile(content)
          break
        case "application/json":
          processedData = this.processJsonFile(content)
          break
        case "text/plain":
          processedData = this.processTextFile(content)
          break
        default:
          throw new Error(`Unsupported file type: ${file.mimetype}`)
      }

      const uploadedFile: UploadedFile = {
        filename: file.originalname,
        content,
        type: this.getFileType(file.mimetype),
        processedData,
      }

      logger.info(`Processed file: ${file.originalname} (${file.mimetype})`)
      return uploadedFile
    } catch (error) {
      logger.error(`Error processing file ${file.originalname}:`, error)
      throw error
    }
  }

  private async processCsvFile(content: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const results: any[] = []
      const headers: string[] = []
      let isFirstRow = true

      const stream = Readable.from([content])

      stream
        .pipe(csv())
        .on("headers", (headerList) => {
          headers.push(...headerList)
        })
        .on("data", (data) => {
          if (isFirstRow) {
            isFirstRow = false
          }
          results.push(data)
        })
        .on("end", () => {
          resolve({
            type: "csv",
            headers,
            rows: results,
            summary: {
              totalRows: results.length,
              columns: headers.length,
              sampleData: results.slice(0, 3), // First 3 rows as sample
            },
          })
        })
        .on("error", (error) => {
          reject(error)
        })
    })
  }

  private processJsonFile(content: string): any {
    try {
      const jsonData = JSON.parse(content)
      return {
        type: "json",
        data: jsonData,
        summary: {
          keys: Array.isArray(jsonData) ? [] : Object.keys(jsonData),
          dataType: Array.isArray(jsonData) ? "array" : "object",
          itemCount: Array.isArray(jsonData) ? jsonData.length : 1,
          sampleData: Array.isArray(jsonData) ? jsonData.slice(0, 3) : jsonData,
        },
      }
    } catch (error) {
      throw new Error("Invalid JSON format")
    }
  }

  private processTextFile(content: string): any {
    const lines = content.split("\n").filter((line) => line.trim())
    const words = content.split(/\s+/).filter((word) => word.trim())

    return {
      type: "text",
      content,
      summary: {
        lineCount: lines.length,
        wordCount: words.length,
        charCount: content.length,
        sampleLines: lines.slice(0, 5), // First 5 lines as sample
      },
    }
  }

  private getFileType(mimetype: string): "csv" | "json" | "txt" {
    switch (mimetype) {
      case "text/csv":
        return "csv"
      case "application/json":
        return "json"
      case "text/plain":
        return "txt"
      default:
        return "txt"
    }
  }

  async extractInsights(files: UploadedFile[]): Promise<string> {
    let insights = ""

    for (const file of files) {
      switch (file.type) {
        case "csv":
          insights += this.extractCsvInsights(file)
          break
        case "json":
          insights += this.extractJsonInsights(file)
          break
        case "txt":
          insights += this.extractTextInsights(file)
          break
      }
    }

    return insights
  }

  private extractCsvInsights(file: UploadedFile): string {
    const data = file.processedData
    let insights = `\nCSV File Analysis (${file.filename}):\n`
    insights += `- ${data.summary.totalRows} rows with ${data.summary.columns} columns\n`
    insights += `- Column headers: ${data.headers.join(", ")}\n`

    if (data.summary.sampleData.length > 0) {
      insights += `- Sample data patterns detected\n`
    }

    return insights
  }

  private extractJsonInsights(file: UploadedFile): string {
    const data = file.processedData
    let insights = `\nJSON File Analysis (${file.filename}):\n`
    insights += `- Data type: ${data.summary.dataType}\n`

    if (data.summary.keys.length > 0) {
      insights += `- Keys: ${data.summary.keys.join(", ")}\n`
    }

    if (data.summary.itemCount) {
      insights += `- Items: ${data.summary.itemCount}\n`
    }

    return insights
  }

  private extractTextInsights(file: UploadedFile): string {
    const data = file.processedData
    let insights = `\nText File Analysis (${file.filename}):\n`
    insights += `- ${data.summary.lineCount} lines, ${data.summary.wordCount} words\n`
    insights += `- Content appears to be: ${this.analyzeTextContent(file.content)}\n`

    return insights
  }

  private analyzeTextContent(content: string): string {
    const lowerContent = content.toLowerCase()

    if (lowerContent.includes("review") || lowerContent.includes("rating") || lowerContent.includes("feedback")) {
      return "Customer reviews/feedback"
    } else if (
      lowerContent.includes("survey") ||
      lowerContent.includes("response") ||
      lowerContent.includes("question")
    ) {
      return "Survey responses"
    } else if (lowerContent.includes("comment") || lowerContent.includes("opinion")) {
      return "Comments/opinions"
    } else {
      return "General text content"
    }
  }
}

export const fileService = new FileService()
