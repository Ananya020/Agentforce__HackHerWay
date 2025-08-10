import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["text/csv", "text/plain", "application/json"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only CSV, TXT, and JSON files are allowed." },
        { status: 400 },
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 })
    }

    // Read file content
    const content = await file.text()

    // Process different file types
    let processedData: any = {}

    if (file.type === "text/csv") {
      // Simple CSV parsing
      const lines = content.split("\n")
      const headers = lines[0]?.split(",").map((h) => h.trim())
      const rows = lines
        .slice(1)
        .map((line) => {
          const values = line.split(",").map((v) => v.trim())
          const row: any = {}
          headers?.forEach((header, index) => {
            row[header] = values[index]
          })
          return row
        })
        .filter((row) => Object.values(row).some((val) => val))

      processedData = {
        type: "csv",
        headers,
        rows,
        summary: {
          totalRows: rows.length,
          columns: headers?.length || 0,
        },
      }
    } else if (file.type === "application/json") {
      try {
        const jsonData = JSON.parse(content)
        processedData = {
          type: "json",
          data: jsonData,
          summary: {
            keys: Object.keys(jsonData),
            dataType: Array.isArray(jsonData) ? "array" : "object",
          },
        }
      } catch (parseError) {
        return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 })
      }
    } else {
      // Plain text
      processedData = {
        type: "text",
        content,
        summary: {
          wordCount: content.split(/\s+/).length,
          lineCount: content.split("\n").length,
          charCount: content.length,
        },
      }
    }

    // Generate file ID for tracking
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      fileId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      processedData,
      uploadedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error processing file upload:", error)
    return NextResponse.json({ error: "Failed to process file upload" }, { status: 500 })
  }
}
