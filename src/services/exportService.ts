import type { Persona } from "../types"
import { logger } from "../utils/logger"
import * as PDFKit from "pdfkit" // Declare the PDFKit variable

class ExportService {
  async generatePersonaPDF(personas: Persona[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFKit.PDFDocument({ margin: 50 })
        const buffers: Buffer[] = []

        doc.on("data", buffers.push.bind(buffers))
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers)
          resolve(pdfBuffer)
        })

        // Title page
        doc.fontSize(24).text("PerzonAI - Customer Personas", { align: "center" })
        doc.moveDown()
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" })
        doc.moveDown(2)

        // Generate content for each persona
        personas.forEach((persona, index) => {
          if (index > 0) {
            doc.addPage()
          }

          this.addPersonaToPDF(doc, persona)
        })

        doc.end()
      } catch (error) {
        logger.error("Error generating PDF:", error)
        reject(error)
      }
    })
  }

  private addPersonaToPDF(doc: PDFKit.PDFDocument, persona: Persona): void {
    // Persona name and basic info
    doc.fontSize(20).fillColor("#e91e63").text(persona.name, { underline: true })
    doc.moveDown()

    // Demographics section
    doc.fontSize(16).fillColor("#000").text("Demographics", { underline: true })
    doc.fontSize(12).moveDown(0.5)
    doc.text(`Age: ${persona.demographics.age}`)
    doc.text(`Gender: ${persona.demographics.gender}`)
    doc.text(`Location: ${persona.demographics.location}`)
    doc.text(`Occupation: ${persona.demographics.occupation}`)
    doc.text(`Income: ${persona.demographics.income}`)
    doc.moveDown()

    // Traits section
    doc.fontSize(16).text("Key Traits", { underline: true })
    doc.fontSize(12).moveDown(0.5)
    persona.traits.forEach((trait) => {
      doc.text(`• ${trait}`)
    })
    doc.moveDown()

    // Pain Points section
    doc.fontSize(16).text("Pain Points", { underline: true })
    doc.fontSize(12).moveDown(0.5)
    persona.painPoints.forEach((point) => {
      doc.text(`• ${point}`)
    })
    doc.moveDown()

    // Goals section
    doc.fontSize(16).text("Goals & Motivations", { underline: true })
    doc.fontSize(12).moveDown(0.5)
    persona.goals.forEach((goal) => {
      doc.text(`• ${goal}`)
    })
    doc.moveDown()

    // Messaging section
    doc.fontSize(16).text("Messaging & Communication", { underline: true })
    doc.fontSize(12).moveDown(0.5)
    doc.text(`Preferred Tone: ${persona.messagingTone}`)
    doc.text(`Preferred Channels: ${persona.preferredChannels.join(", ")}`)
    doc.moveDown()

    // Buying Behavior section
    doc.fontSize(16).text("Buying Behavior", { underline: true })
    doc.fontSize(12).moveDown(0.5)
    doc.text(`Budget Range: ${persona.buyingBehavior.budgetRange}`)
    doc.text(`Purchase Frequency: ${persona.buyingBehavior.purchaseFrequency}`)
    doc.text(`Decision Factors: ${persona.buyingBehavior.decisionFactors.join(", ")}`)
    doc.moveDown()

    // Quotes section
    if (persona.quotes.length > 0) {
      doc.fontSize(16).text("Typical Quotes", { underline: true })
      doc.fontSize(12).moveDown(0.5)
      persona.quotes.forEach((quote) => {
        doc.text(`"${quote}"`, { italic: true })
      })
      doc.moveDown()
    }

    // Campaign Recommendations
    if (persona.campaigns.length > 0) {
      doc.fontSize(16).text("Campaign Recommendations", { underline: true })
      doc.fontSize(12).moveDown(0.5)
      persona.campaigns.forEach((campaign) => {
        doc.text(`• ${campaign}`)
      })
    }
  }

  generatePersonaText(personas: Persona[]): string {
    let text = "PerzonAI - Customer Personas\n"
    text += "================================\n\n"
    text += `Generated on: ${new Date().toLocaleDateString()}\n\n`

    personas.forEach((persona, index) => {
      text += `PERSONA ${index + 1}: ${persona.name}\n`
      text += "=".repeat(persona.name.length + 12) + "\n\n"

      text += "DEMOGRAPHICS:\n"
      text += `- Age: ${persona.demographics.age}\n`
      text += `- Gender: ${persona.demographics.gender}\n`
      text += `- Location: ${persona.demographics.location}\n`
      text += `- Occupation: ${persona.demographics.occupation}\n`
      text += `- Income: ${persona.demographics.income}\n\n`

      text += "KEY TRAITS:\n"
      persona.traits.forEach((trait) => {
        text += `- ${trait}\n`
      })
      text += "\n"

      text += "PAIN POINTS:\n"
      persona.painPoints.forEach((point) => {
        text += `- ${point}\n`
      })
      text += "\n"

      text += "GOALS & MOTIVATIONS:\n"
      persona.goals.forEach((goal) => {
        text += `- ${goal}\n`
      })
      text += "\n"

      text += "MESSAGING & COMMUNICATION:\n"
      text += `- Preferred Tone: ${persona.messagingTone}\n`
      text += `- Preferred Channels: ${persona.preferredChannels.join(", ")}\n\n`

      text += "BUYING BEHAVIOR:\n"
      text += `- Budget Range: ${persona.buyingBehavior.budgetRange}\n`
      text += `- Purchase Frequency: ${persona.buyingBehavior.purchaseFrequency}\n`
      text += `- Decision Factors: ${persona.buyingBehavior.decisionFactors.join(", ")}\n\n`

      if (persona.quotes.length > 0) {
        text += "TYPICAL QUOTES:\n"
        persona.quotes.forEach((quote) => {
          text += `- "${quote}"\n`
        })
        text += "\n"
      }

      if (persona.campaigns.length > 0) {
        text += "CAMPAIGN RECOMMENDATIONS:\n"
        persona.campaigns.forEach((campaign) => {
          text += `- ${campaign}\n`
        })
      }
      text += "\n\n" + "-".repeat(50) + "\n\n"
    })

    return text
  }

  generatePersonaJSON(personas: Persona[]): string {
    const exportData = {
      generatedAt: new Date().toISOString(),
      version: "1.0",
      totalPersonas: personas.length,
      personas: personas.map((persona) => ({
        ...persona,
        // Remove internal fields for export
        createdAt: persona.createdAt.toISOString(),
        updatedAt: persona.updatedAt.toISOString(),
      })),
    }

    return JSON.stringify(exportData, null, 2)
  }
}

export const exportService = new ExportService()
