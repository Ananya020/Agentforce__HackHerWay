export interface PersonaRequest {
  productPositioning: string
  industry: string
  targetRegion: string
  productCategory: string
  surveyData?: string
  reviewData?: string
  uploadedFiles?: UploadedFile[]
}

export interface UploadedFile {
  filename: string
  content: string
  type: "csv" | "json" | "txt"
  processedData?: any
}

export interface Persona {
  id: string
  name: string
  avatar: string
  demographics: {
    age: number
    gender: string
    location: string
    occupation: string
    income: string
  }
  psychographics: {
    personality: string[]
    values: string[]
    interests: string[]
    lifestyle: string
  }
  traits: string[]
  painPoints: string[]
  motivations: string[]
  goals: string[]
  messagingTone: string
  preferredChannels: string[]
  campaigns: string[]
  buyingBehavior: {
    decisionFactors: string[]
    purchaseFrequency: string
    budgetRange: string
    researchHabits: string[]
  }
  quotes: string[]
  createdAt: Date
  updatedAt: Date
}

export interface RefinementRequest {
  personaIds: string[]
  budgetLevel: number
  customerFocus: number
  tone: string
  includeDemographicVariations: boolean
  generateCampaignSuggestions: boolean
  includePainPointAnalysis: boolean
}

export interface ChatRequest {
  personaId: string
  message: string
  conversationHistory?: ChatMessage[]
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface ChatResponse {
  personaId: string
  message: string
  timestamp: Date
  conversationId: string
}

export interface TrendData {
  trendingTopics: Array<{
    topic: string
    mentions: number
    growth: string
    sentiment: "positive" | "negative" | "neutral"
    regions: string[]
    industries: string[]
  }>
  contentPerformance: Array<{
    format: string
    performance: number
    trend: "up" | "down" | "stable"
    engagement: number
    reach: number
  }>
  demographics: Array<{
    ageGroup: string
    percentage: number
    trend: "up" | "down" | "stable"
  }>
  engagementMetrics: Array<{
    month: string
    engagement: number
    conversion: number
    reach: number
    clicks: number
  }>
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

export interface ShareableLink {
  id: string
  personaIds: string[]
  expiresAt: Date
  accessCount: number
  isPublic: boolean
  password?: string
}
