import { type NextRequest, NextResponse } from "next/server"

interface ExportRequest {
  personas: any[]
  format: "json" | "csv" | "pdf"
  includeCharts: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json()

    if (!body.personas || body.personas.length === 0) {
      return NextResponse.json({ error: "No personas provided for export" }, { status: 400 })
    }

    const { personas, format, includeCharts } = body

    let exportData: any
    let contentType: string
    let filename: string

    switch (format) {
      case "json":
        exportData = JSON.stringify(
          {
            personas,
            exportedAt: new Date().toISOString(),
            version: "1.0",
          },
          null,
          2,
        )
        contentType = "application/json"
        filename = `personas_${Date.now()}.json`
        break

      case "csv":
        // Convert personas to CSV format
        const csvHeaders = [
          "Name",
          "Age",
          "Gender",
          "Location",
          "Occupation",
          "Income",
          "Traits",
          "Pain Points",
          "Motivations",
          "Messaging Tone",
          "Preferred Channels",
          "Budget Range",
        ]

        const csvRows = personas.map((persona) => [
          persona.name,
          persona.demographics.age,
          persona.demographics.gender,
          persona.demographics.location,
          persona.demographics.occupation,
          persona.demographics.income,
          persona.traits.join("; "),
          persona.painPoints.join("; "),
          persona.motivations.join("; "),
          persona.messagingTone,
          persona.preferredChannels.join("; "),
          persona.buyingBehavior.budgetRange,
        ])

        exportData = [csvHeaders, ...csvRows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

        contentType = "text/csv"
        filename = `personas_${Date.now()}.csv`
        break

      case "pdf":
        // For PDF, we'll return structured data that the frontend can use to generate PDF
        exportData = JSON.stringify({
          personas,
          includeCharts,
          exportedAt: new Date().toISOString(),
          metadata: {
            totalPersonas: personas.length,
            generatedBy: "PerzonAI",
            version: "1.0",
          },
        })
        contentType = "application/json"
        filename = `personas_pdf_data_${Date.now()}.json`
        break

      default:
        return NextResponse.json({ error: "Invalid export format" }, { status: 400 })
    }

    // Create response with appropriate headers
    const response = new NextResponse(exportData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    })

    return response
  } catch (error) {
    console.error("Error exporting personas:", error)
    return NextResponse.json({ error: "Failed to export personas" }, { status: 500 })
  }
}
