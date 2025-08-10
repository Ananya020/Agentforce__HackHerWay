import { type NextRequest, NextResponse } from "next/server"

// Simulated trending data - in production, this would come from real APIs
const generateTrendingData = () => {
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

  return {
    trendingTopics: topics.slice(0, 8).map((topic) => ({
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
      trend: Math.random() > 0.3 ? "up" : "down",
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

    industryInsights: industries.map((industry) => ({
      industry,
      growthRate: `+${Math.floor(Math.random() * 25) + 5}%`,
      topChannels: ["Social Media", "Email", "Content Marketing", "Paid Ads"].slice(0, 3),
      avgBudget: `$${Math.floor(Math.random() * 50) + 20}K`,
      roi: `${Math.floor(Math.random() * 200) + 150}%`,
    })),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const industry = searchParams.get("industry")
    const region = searchParams.get("region")
    const timeframe = searchParams.get("timeframe") || "30d"

    // Generate trending data
    const trendData = generateTrendingData()

    // Filter by industry and region if specified
    const filteredData = { ...trendData }

    if (industry) {
      filteredData.trendingTopics = trendData.trendingTopics.filter((topic) => topic.industries.includes(industry))
    }

    if (region) {
      filteredData.trendingTopics = filteredData.trendingTopics.filter((topic) => topic.regions.includes(region))
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      filters: {
        industry,
        region,
        timeframe,
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching trends:", error)
    return NextResponse.json({ error: "Failed to fetch trends data" }, { status: 500 })
  }
}
