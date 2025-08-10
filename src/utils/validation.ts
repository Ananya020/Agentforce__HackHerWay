import Joi from "joi"

export const personaRequestSchema = Joi.object({
  productPositioning: Joi.string().required().min(10).max(1000),
  industry: Joi.string()
    .required()
    .valid(
      "technology",
      "healthcare",
      "finance",
      "retail",
      "education",
      "entertainment",
      "manufacturing",
      "consulting",
      "other",
    ),
  targetRegion: Joi.string()
    .required()
    .valid("north-america", "europe", "asia-pacific", "latin-america", "middle-east", "africa", "global"),
  productCategory: Joi.string()
    .required()
    .valid("saas", "mobile-app", "e-commerce", "physical-product", "service", "platform", "other"),
  surveyData: Joi.string().optional().max(10000),
  reviewData: Joi.string().optional().max(10000),
  uploadedFiles: Joi.array().optional(),
})

export const refinementRequestSchema = Joi.object({
  personaIds: Joi.array().items(Joi.string()).required().min(1),
  budgetLevel: Joi.number().required().min(0).max(100),
  customerFocus: Joi.number().required().min(0).max(100),
  tone: Joi.string().required().valid("formal", "friendly", "humorous", "authoritative", "empathetic"),
  includeDemographicVariations: Joi.boolean().default(true),
  generateCampaignSuggestions: Joi.boolean().default(true),
  includePainPointAnalysis: Joi.boolean().default(true),
})

export const chatRequestSchema = Joi.object({
  personaId: Joi.string().required(),
  message: Joi.string().required().min(1).max(1000),
  conversationHistory: Joi.array()
    .items(
      Joi.object({
        role: Joi.string().valid("user", "assistant").required(),
        content: Joi.string().required(),
        timestamp: Joi.date().optional(),
      }),
    )
    .optional(),
})

export function validatePersonaRequest(data: any) {
  return personaRequestSchema.validate(data)
}

export function validateRefinementRequest(data: any) {
  return refinementRequestSchema.validate(data)
}

export function validateChatRequest(data: any) {
  return chatRequestSchema.validate(data)
}
