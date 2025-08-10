import type { Request, Response } from "express"
import { logger } from "../utils/logger"
import type { TrendData, ApiResponse } from "../types"

export class TrendsController {
  async getTrends(req: Request, res: Response): Promise<void> {
    try {
      const { industry, region, timeframe } = req.query

      // Generate mock trend data (in production, this would come from real APIs)
      const trendData: TrendData = this.generateMockTrendData(
        industry as string,
        region as string,
        (timeframe as string) || "30d",
      )

      logger.info(`Retrieved trends data for industry: ${industry}, region: ${region}`)

      res.status(200).json({
        success: true,
        data: trendData,
        filters: {
          industry,
          region,
          timeframe: timeframe || "30d",
        },
        message: "Trends data retrieved successfully",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    } catch (error) {
      logger.error("Error in getTrends:", error)
      res.status(500).json({
        success: false,
        error: "Failed to retrieve trends data",
        timestamp: new Date().toISOString(),
      } as ApiResponse)
    }
  }

  private generateMockTrendData(industry?: string, region?: string, timeframe?: string): TrendData {
    const topics = [
      "AI & Automation",
      "Sustainability",
      "Remote Work",
      "Mental Health",
      "Digital Privacy",
      "Personalization",
      "Voice Commerce",
      "Social Commerce",
      "Micro-Influencers",
      "Interactive Content",
      "Augmented Reality",
      "Subscription Models",
      "Community Building",
      "Data Analytics",
      "Customer Experience",
    ]

    const contentFormats = [
      "Video Content",
      "Interactive Posts",
      "Stories",
      "Carousel Posts",
      "Live Streams",
      "Podcasts",
      "User-Generated Content",
      "Infographics",
      "Webinars",
      "Email Newsletters",
    ]

    const regions = ["North America", "Europe", "Asia Pacific", "Latin America", "Global"]
    const industries = ["Technology", "Healthcare", "Finance", "Retail", "Education", "Entertainment"]

    // Filter topics based on industry if provided
    let filteredTopics = topics
    if (industry) {
      filteredTopics = topics.filter((topic) => {
        if (industry.toLowerCase() === "technology") {
          return ["AI & Automation", "Digital Privacy", "Data Analytics"].includes(topic)
        } else if (industry.toLowerCase() === "healthcare") {
          return ["Mental Health", "Personalization", "Data Analytics"].includes(topic)
        }
        return true
      })
    }

    return {
      trendingTopics: filteredTopics.slice(0, 8).map((topic) => ({
        topic,
        mentions: Math.floor(Math.random() * 20000) + 5000,
        growth: `+${Math.floor(Math.random() * 30) + 5}%`,
        sentiment: Math.random() > 0.3 ? "positive" : Math.random() > 0.5 ? "neutral" : "negative",
        regions: regions.slice(0, Math.floor(Math.random() * 3) + 2),
        industries: industries.slice(0, Math.floor(Math.random() * 4) + 2),
      })),

      contentPerformance: contentFormats.slice(0, 6).map((format) => ({
        format,
        performance: Math.floor(Math.random() * 40) + 60,
        trend: Math.random() > 0.3 ? "up" : Math.random() > 0.5 ? "stable" : "down",
        engagement: Math.floor(Math.random() * 30) + 40,
        reach: Math.floor(Math.random() * 50) + 30,
      })),

      demographics: [
        { ageGroup: "18-24", percentage: Math.floor(Math.random() * 15) + 20, trend: "up" },
        { ageGroup: "25-34", percentage: Math.floor(Math.random() * 15) + 30, trend: "up" },
        { ageGroup: "35-44", percentage: Math.floor(Math.random() * 10) + 20, trend: "stable" },
        { ageGroup: "45-54", percentage: Math.floor(Math.random() * 10) + 15, trend: "down" },
        { ageGroup: "55+", percentage: Math.floor(Math.random() * 8) + 10, trend: "up" },
      ],

      engagementMetrics: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString("en-US", { month: "short" }),
        engagement: Math.floor(Math.random() * 30) + 60,
        conversion: Math.floor(Math.random() * 15) + 10,
        reach: Math.floor(Math.random() * 30000) + 40000,
        clicks: Math.floor(Math.random() * 5000) + 2000,
      })),
    }
  }
}

export const trendsController = new TrendsController()
