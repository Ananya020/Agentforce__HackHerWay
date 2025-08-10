import type { Request, Response } from "express"
import { aiService } from "../services/aiService"
import { personaService } from "../services/personaService"
import { fileService } from "../services/fileService"
import { exportService } from "../services/exportService"
import { logger } from "../utils/logger"
import type { PersonaRequest, RefinementRequest, ChatRequest, ApiResponse } from "../types"
import { validatePersonaRequest, validateRefinementRequest, validateChatRequest } from "../utils/validation"

export class PersonaController {
  async generatePersonas(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validatePersonaRequest(req.body)
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      const personaRequest: PersonaRequest = value

      // Process uploaded files if any
      if (req.files && Array.isArray(req.files)) {
        const uploadedFiles = await Promise.all(req.files.map((file) => fileService.processFile(file)))

        // Extract insights from files
        const fileInsights = await fileService.extractInsights(uploadedFiles)
        personaRequest.surveyData = (personaRequest.surveyData || "") + fileInsights
        personaRequest.uploadedFiles = uploadedFiles
      }

      // Generate personas using AI
      const personas = await aiService.generatePersonas(personaRequest)

      // Store personas
      await personaService.storePersonas(personas)

      logger.info(`Generated ${personas.length} personas for ${personaRequest.industry} industry`)

      res.status(200).json({
        success: true,
        data: {
          personas,
          sessionId: `session_${Date.now()}`,
          generatedAt: new Date().toISOString(),
        },
        message: "Personas generated successfully",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    } catch (error) {
      logger.error("Error in generatePersonas:", error)
      res.status(500).json({
        success: false,
        error: "Failed to generate personas",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    }
  }

  async refinePersonas(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateRefinementRequest(req.body)
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      const refinementRequest: RefinementRequest = value

      // Get existing personas
      const existingPersonas = await personaService.getPersonas(refinementRequest.personaIds)
      if (existingPersonas.length === 0) {
        res.status(404).json({
          success: false,
          error: "No personas found with the provided IDs",
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      // Refine personas using AI
      const refinedPersonas = await aiService.refinePersonas(refinementRequest, existingPersonas)

      // Update stored personas
      await personaService.storePersonas(refinedPersonas)

      logger.info(`Refined ${refinedPersonas.length} personas`)

      res.status(200).json({
        success: true,
        data: {
          personas: refinedPersonas,
          refinedAt: new Date().toISOString(),
        },
        message: "Personas refined successfully",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    } catch (error) {
      logger.error("Error in refinePersonas:", error)
      res.status(500).json({
        success: false,
        error: "Failed to refine personas",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    }
  }

  async chatWithPersona(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateChatRequest(req.body)
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      const chatRequest: ChatRequest = value

      // Get persona
      const persona = await personaService.getPersona(chatRequest.personaId)
      if (!persona) {
        res.status(404).json({
          success: false,
          error: "Persona not found",
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      // Generate chat response
      const response = await aiService.generatePersonaChat(chatRequest, persona)

      // Store conversation
      const conversation = await personaService.getConversation(chatRequest.personaId)
      conversation.push(
        { role: "user", content: chatRequest.message, timestamp: new Date() },
        { role: "assistant", content: response, timestamp: new Date() },
      )
      await personaService.storeConversation(chatRequest.personaId, conversation)

      logger.info(`Generated chat response for persona: ${persona.name}`)

      res.status(200).json({
        success: true,
        data: {
          response,
          personaId: chatRequest.personaId,
          conversationId: `conv_${Date.now()}`,
        },
        message: "Chat response generated successfully",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    } catch (error) {
      logger.error("Error in chatWithPersona:", error)
      res.status(500).json({
        success: false,
        error: "Failed to generate chat response",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    }
  }

  async exportPersonasPDF(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.query
      const personaIds = typeof ids === "string" ? ids.split(",") : []

      if (personaIds.length === 0) {
        res.status(400).json({
          success: false,
          error: "No persona IDs provided",
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      const personas = await personaService.getPersonas(personaIds)
      if (personas.length === 0) {
        res.status(404).json({
          success: false,
          error: "No personas found",
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      const pdfBuffer = await exportService.generatePersonaPDF(personas)

      res.setHeader("Content-Type", "application/pdf")
      res.setHeader("Content-Disposition", 'attachment; filename="personas.pdf"')
      res.send(pdfBuffer)

      logger.info(`Exported ${personas.length} personas as PDF`)
    } catch (error) {
      logger.error("Error in exportPersonasPDF:", error)
      res.status(500).json({
        success: false,
        error: "Failed to export personas as PDF",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    }
  }

  async exportPersonasText(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.query
      const personaIds = typeof ids === "string" ? ids.split(",") : []

      if (personaIds.length === 0) {
        res.status(400).json({
          success: false,
          error: "No persona IDs provided",
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      const personas = await personaService.getPersonas(personaIds)
      if (personas.length === 0) {
        res.status(404).json({
          success: false,
          error: "No personas found",
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      const textContent = exportService.generatePersonaText(personas)

      res.setHeader("Content-Type", "text/plain")
      res.setHeader("Content-Disposition", 'attachment; filename="personas.txt"')
      res.send(textContent)

      logger.info(`Exported ${personas.length} personas as text`)
    } catch (error) {
      logger.error("Error in exportPersonasText:", error)
      res.status(500).json({
        success: false,
        error: "Failed to export personas as text",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    }
  }

  async exportPersonasJSON(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.query
      const personaIds = typeof ids === "string" ? ids.split(",") : []

      if (personaIds.length === 0) {
        res.status(400).json({
          success: false,
          error: "No persona IDs provided",
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      const personas = await personaService.getPersonas(personaIds)
      if (personas.length === 0) {
        res.status(404).json({
          success: false,
          error: "No personas found",
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      const jsonContent = exportService.generatePersonaJSON(personas)

      res.setHeader("Content-Type", "application/json")
      res.setHeader("Content-Disposition", 'attachment; filename="personas.json"')
      res.send(jsonContent)

      logger.info(`Exported ${personas.length} personas as JSON`)
    } catch (error) {
      logger.error("Error in exportPersonasJSON:", error)
      res.status(500).json({
        success: false,
        error: "Failed to export personas as JSON",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    }
  }

  async createShareableLink(req: Request, res: Response): Promise<void> {
    try {
      const { personaIds, expiresIn, isPublic, password } = req.body

      if (!personaIds || !Array.isArray(personaIds) || personaIds.length === 0) {
        res.status(400).json({
          success: false,
          error: "Invalid persona IDs provided",
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      // Verify personas exist
      const personas = await personaService.getPersonas(personaIds)
      if (personas.length !== personaIds.length) {
        res.status(404).json({
          success: false,
          error: "Some personas not found",
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      const shareableLink = await personaService.createShareableLink(personaIds, {
        expiresIn,
        isPublic,
        password,
      })

      const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000"
      const shareUrl = `${baseUrl}/shared/${shareableLink.id}`

      logger.info(`Created shareable link: ${shareableLink.id}`)

      res.status(200).json({
        success: true,
        data: {
          shareId: shareableLink.id,
          shareUrl,
          expiresAt: shareableLink.expiresAt,
          isPublic: shareableLink.isPublic,
        },
        message: "Shareable link created successfully",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    } catch (error) {
      logger.error("Error in createShareableLink:", error)
      res.status(500).json({
        success: false,
        error: "Failed to create shareable link",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    }
  }

  async getSharedPersonas(req: Request, res: Response): Promise<void> {
    try {
      const { shareId } = req.params
      const { password } = req.query

      const shareableLink = await personaService.getShareableLink(shareId)
      if (!shareableLink) {
        res.status(404).json({
          success: false,
          error: "Shareable link not found or expired",
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      // Check password if required
      if (shareableLink.password && shareableLink.password !== password) {
        res.status(401).json({
          success: false,
          error: "Invalid password",
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      const personas = await personaService.getPersonas(shareableLink.personaIds)

      logger.info(`Accessed shared personas: ${shareId}`)

      res.status(200).json({
        success: true,
        data: {
          personas,
          shareInfo: {
            accessCount: shareableLink.accessCount,
            expiresAt: shareableLink.expiresAt,
            isPublic: shareableLink.isPublic,
          },
        },
        message: "Shared personas retrieved successfully",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    } catch (error) {
      logger.error("Error in getSharedPersonas:", error)
      res.status(500).json({
        success: false,
        error: "Failed to retrieve shared personas",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    }
  }

  async getPersonaStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await personaService.getPersonaStats()

      res.status(200).json({
        success: true,
        data: stats,
        message: "Persona statistics retrieved successfully",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    } catch (error) {
      logger.error("Error in getPersonaStats:", error)
      res.status(500).json({
        success: false,
        error: "Failed to retrieve persona statistics",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    }
  }

  async searchPersonas(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query

      if (!q || typeof q !== "string") {
        res.status(400).json({
          success: false,
          error: "Search query is required",
          timestamp: new Date().toISOString(),
        } as ApiResponse)
        return
      }

      const personas = await personaService.searchPersonas(q)

      res.status(200).json({
        success: true,
        data: {
          personas,
          query: q,
          resultCount: personas.length,
        },
        message: "Search completed successfully",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    } catch (error) {
      logger.error("Error in searchPersonas:", error)
      res.status(500).json({
        success: false,
        error: "Failed to search personas",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    }
  }
}

export const personaController = new PersonaController()
