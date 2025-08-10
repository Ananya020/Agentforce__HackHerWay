"use client"

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  [key: string]: any
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/api${endpoint}`
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "API request failed")
      }

      return data
    } catch (error) {
      console.error("API request error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Persona generation
  async generatePersonas(data: {
    productPositioning: string
    industry: string
    targetRegion: string
    productCategory: string
    surveyData?: string
    reviewData?: string
  }) {
    return this.request("/personas/generate", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Chat with persona
  async chatWithPersona(data: {
    personaId: string
    message: string
    conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
    personaContext: any
  }) {
    return this.request("/personas/chat", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Refine personas
  async refinePersonas(data: {
    personas: any[]
    refinements: any
    originalContext: any
  }) {
    return this.request("/personas/refine", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Get trends data
  async getTrends(params?: {
    industry?: string
    region?: string
    timeframe?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.industry) searchParams.set("industry", params.industry)
    if (params?.region) searchParams.set("region", params.region)
    if (params?.timeframe) searchParams.set("timeframe", params.timeframe)

    const query = searchParams.toString()
    return this.request(`/trends${query ? `?${query}` : ""}`)
  }

  // Upload file
  async uploadFile(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    return fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json())
  }

  // Export personas
  async exportPersonas(data: {
    personas: any[]
    format: "json" | "csv" | "pdf"
    includeCharts: boolean
  }) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/export/personas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (data.format === "pdf") {
      return response.json()
    }

    // For CSV and JSON, return blob for download
    const blob = await response.blob()
    return { success: true, blob }
  }

  // Create share link
  async createShareLink(data: {
    personas: any[]
    settings: {
      publicAccess: boolean
      expiresAt?: string
      password?: string
    }
  }) {
    return this.request("/share", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Get shared personas
  async getSharedPersonas(shareId: string, password?: string) {
    const params = new URLSearchParams({ id: shareId })
    if (password) params.set("password", password)

    return this.request(`/share?${params.toString()}`)
  }

  // Get analytics
  async getAnalytics(params?: {
    timeframe?: string
    metric?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.timeframe) searchParams.set("timeframe", params.timeframe)
    if (params?.metric) searchParams.set("metric", params.metric)

    const query = searchParams.toString()
    return this.request(`/analytics${query ? `?${query}` : ""}`)
  }
}

export const apiClient = new ApiClient()
