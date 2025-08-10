import { Router } from "express"
import { trendsController } from "../controllers/trendsController"

const router = Router()

/**
 * @swagger
 * /api/trends:
 *   get:
 *     summary: Get marketing trends data
 *     tags: [Trends]
 *     parameters:
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by region
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 30d
 *         description: Time period for trends
 *     responses:
 *       200:
 *         description: Trends data retrieved successfully
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
 *                     trendingTopics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           topic:
 *                             type: string
 *                           mentions:
 *                             type: number
 *                           growth:
 *                             type: string
 *                           sentiment:
 *                             type: string
 *                             enum: [positive, negative, neutral]
 *                     contentPerformance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           format:
 *                             type: string
 *                           performance:
 *                             type: number
 *                           trend:
 *                             type: string
 *                             enum: [up, down, stable]
 *                     demographics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ageGroup:
 *                             type: string
 *                           percentage:
 *                             type: number
 *                           trend:
 *                             type: string
 *       500:
 *         description: Server error
 */
router.get("/", trendsController.getTrends)

export default router
