import { Router } from "express"
import { personaController } from "../controllers/personaController"
import { fileService } from "../services/fileService"

const router = Router()

/**
 * @swagger
 * /api/personas/generate:
 *   post:
 *     summary: Generate AI personas
 *     tags: [Personas]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productPositioning:
 *                 type: string
 *                 description: Product positioning statement
 *               industry:
 *                 type: string
 *                 description: Industry category
 *               targetRegion:
 *                 type: string
 *                 description: Target geographical region
 *               productCategory:
 *                 type: string
 *                 description: Product category
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional data files (CSV, JSON, TXT)
 *     responses:
 *       200:
 *         description: Personas generated successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post("/generate", fileService.upload.array("files", 5), personaController.generatePersonas)

/**
 * @swagger
 * /api/personas/refine:
 *   post:
 *     summary: Refine existing personas
 *     tags: [Personas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personaIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               budgetLevel:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               customerFocus:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               tone:
 *                 type: string
 *                 enum: [formal, friendly, humorous, authoritative, empathetic]
 *               includeDemographicVariations:
 *                 type: boolean
 *               generateCampaignSuggestions:
 *                 type: boolean
 *               includePainPointAnalysis:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Personas refined successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Personas not found
 *       500:
 *         description: Server error
 */
router.post("/refine", personaController.refinePersonas)

/**
 * @swagger
 * /api/personas/chat:
 *   post:
 *     summary: Chat with a persona
 *     tags: [Personas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personaId:
 *                 type: string
 *               message:
 *                 type: string
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       200:
 *         description: Chat response generated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Persona not found
 *       500:
 *         description: Server error
 */
router.post("/chat", personaController.chatWithPersona)

/**
 * @swagger
 * /api/personas/export/pdf:
 *   get:
 *     summary: Export personas as PDF
 *     tags: [Personas]
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated persona IDs
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Personas not found
 *       500:
 *         description: Server error
 */
router.get("/export/pdf", personaController.exportPersonasPDF)

/**
 * @swagger
 * /api/personas/export/text:
 *   get:
 *     summary: Export personas as text
 *     tags: [Personas]
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated persona IDs
 *     responses:
 *       200:
 *         description: Text file
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Personas not found
 *       500:
 *         description: Server error
 */
router.get("/export/text", personaController.exportPersonasText)

/**
 * @swagger
 * /api/personas/export/json:
 *   get:
 *     summary: Export personas as JSON
 *     tags: [Personas]
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated persona IDs
 *     responses:
 *       200:
 *         description: JSON file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Personas not found
 *       500:
 *         description: Server error
 */
router.get("/export/json", personaController.exportPersonasJSON)

/**
 * @swagger
 * /api/personas/share:
 *   post:
 *     summary: Create shareable link for personas
 *     tags: [Personas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personaIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               expiresIn:
 *                 type: number
 *                 description: Hours until expiration (default 168 = 7 days)
 *               isPublic:
 *                 type: boolean
 *                 default: true
 *               password:
 *                 type: string
 *                 description: Optional password protection
 *     responses:
 *       200:
 *         description: Shareable link created successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Personas not found
 *       500:
 *         description: Server error
 */
router.post("/share", personaController.createShareableLink)

/**
 * @swagger
 * /api/personas/share/{shareId}:
 *   get:
 *     summary: Get shared personas
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: shareId
 *         required: true
 *         schema:
 *           type: string
 *         description: Share ID
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         description: Password if required
 *     responses:
 *       200:
 *         description: Shared personas retrieved successfully
 *       401:
 *         description: Invalid password
 *       404:
 *         description: Share not found or expired
 *       500:
 *         description: Server error
 */
router.get("/share/:shareId", personaController.getSharedPersonas)

/**
 * @swagger
 * /api/personas/stats:
 *   get:
 *     summary: Get persona statistics
 *     tags: [Personas]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/stats", personaController.getPersonaStats)

/**
 * @swagger
 * /api/personas/search:
 *   get:
 *     summary: Search personas
 *     tags: [Personas]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Invalid query
 *       500:
 *         description: Server error
 */
router.get("/search", personaController.searchPersonas)

export default router
