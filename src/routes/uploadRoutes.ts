import { Router } from "express"
import { uploadController } from "../controllers/uploadController"
import { fileService } from "../services/fileService"

const router = Router()

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload and process files
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload (CSV, JSON, TXT)
 *     responses:
 *       200:
 *         description: Files uploaded and processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           filename:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [csv, json, txt]
 *                           processedData:
 *                             type: object
 *                     totalFiles:
 *                       type: number
 *       400:
 *         description: No files uploaded or invalid file type
 *       500:
 *         description: Server error
 */
router.post("/", fileService.upload.array("files", 10), uploadController.uploadFiles)

export default router
