import request from "supertest"
import app from "../server"

describe("Persona API", () => {
  describe("POST /api/personas/generate", () => {
    it("should generate personas successfully", async () => {
      const response = await request(app)
        .post("/api/personas/generate")
        .field("productPositioning", "A revolutionary AI-powered marketing tool")
        .field("industry", "technology")
        .field("targetRegion", "north-america")
        .field("productCategory", "saas")
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.personas).toHaveLength(3)
      expect(response.body.data.personas[0]).toHaveProperty("name")
      expect(response.body.data.personas[0]).toHaveProperty("demographics")
    })

    it("should return validation error for missing fields", async () => {
      const response = await request(app)
        .post("/api/personas/generate")
        .send({
          productPositioning: "Test",
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain("required")
    })
  })

  describe("POST /api/personas/chat", () => {
    it("should generate chat response", async () => {
      // First generate a persona
      const generateResponse = await request(app)
        .post("/api/personas/generate")
        .field("productPositioning", "A revolutionary AI-powered marketing tool")
        .field("industry", "technology")
        .field("targetRegion", "north-america")
        .field("productCategory", "saas")

      const personaId = generateResponse.body.data.personas[0].id

      const chatResponse = await request(app)
        .post("/api/personas/chat")
        .send({
          personaId,
          message: "What do you think about this product?",
        })
        .expect(200)

      expect(chatResponse.body.success).toBe(true)
      expect(chatResponse.body.data.response).toBeDefined()
      expect(typeof chatResponse.body.data.response).toBe("string")
    })
  })
})
