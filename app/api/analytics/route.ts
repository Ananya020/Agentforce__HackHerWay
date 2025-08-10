import { type NextRequest, NextResponse } from "next/server"

// Simulated analytics data - in production, this would come from your analytics database
const generateAnalyticsData = (timeframe: string) => {
  const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90

  return {
    overview: {
      totalPersonas: Math.floor(Math.random() * 1000) + 500,
      totalSessions: Math.floor(Math.random() * 5000) + 2000,
      avgSessionDuration: `${Math.floor(Math.random() * 10) + 5}m ${Math.floor(Math.random() * 60)}s`,
      conversionRate: `${(Math.random() * 5 + 2).toFixed(1)}%`,
    },

    usage: Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      personasGenerated: Math.floor(Math.random() * 50) + 10,
      chatInteractions: Math.floor(Math.random() * 200) + 50,
      exports: Math.floor(Math.random() * 20) + 5,
      shares: Math.floor(Math.random() * 15) + 2,
    })),

    topIndustries: [
      { industry: "Technology", count: Math.floor(Math.random() * 200) + 100, percentage: 25 },
      { industry: "Healthcare", count: Math.floor(Math.random() * 150) + 80, percentage: 20 },
      { industry: "Finance", count: Math.floor(Math.random() * 120) + 60, percentage: 18 },
      { industry: "Retail", count: Math.floor(Math.random() * 100) + 50, percentage: 15 },
      { industry: "Education", count: Math.floor(Math.random() * 80) + 40, percentage: 12 },
      { industry: "Other", count: Math.floor(Math.random() * 60) + 30, percentage: 10 },
    ],

    regionDistribution: [
      { region: "North America", count: Math.floor(Math.random() * 300) + 200, percentage: 40 },
      { region: "Europe", count: Math.floor(Math.random() * 200) + 150, percentage: 30 },
      { region: "Asia Pacific", count: Math.floor(Math.random() * 150) + 100, percentage: 20 },
      { region: "Latin America", count: Math.floor(Math.random() * 50) + 30, percentage: 7 },
      { region: "Other", count: Math.floor(Math.random() * 30) + 20, percentage: 3 },
    ],

    featureUsage: {
      personaGeneration: Math.floor(Math.random() * 30) + 85,
      chatInteractions: Math.floor(Math.random() * 25) + 70,
      refinement: Math.floor(Math.random() * 20) + 45,
      export: Math.floor(Math.random() * 15) + 35,
      sharing: Math.floor(Math.random() * 10) + 25,
      trendsAnalysis: Math.floor(Math.random() * 20) + 40,
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "30d"
    const metric = searchParams.get("metric")

    // Validate timeframe
    if (!["7d", "30d", "90d"].includes(timeframe)) {
      return NextResponse.json({ error: "Invalid timeframe. Use 7d, 30d, or 90d" }, { status: 400 })
    }

    const analyticsData = generateAnalyticsData(timeframe)

    // If specific metric requested, return only that
    if (metric) {
      const metricData = (analyticsData as any)[metric]
      if (!metricData) {
        return NextResponse.json({ error: "Invalid metric" }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        metric,
        data: metricData,
        timeframe,
      })
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
      timeframe,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
