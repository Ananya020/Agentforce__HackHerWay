import type { Persona, ShareableLink } from "../types"
import { logger } from "../utils/logger"
import { generateShareId } from "../utils/helpers"

class PersonaService {
  private personas: Map<string, Persona> = new Map()
  private shareableLinks: Map<string, ShareableLink> = new Map()
  private conversations: Map<string, any[]> = new Map()

  async storePersonas(personas: Persona[]): Promise<void> {
    personas.forEach((persona) => {
      this.personas.set(persona.id, persona)
    })
    logger.info(`Stored ${personas.length} personas`)
  }

  async getPersona(id: string): Promise<Persona | null> {
    return this.personas.get(id) || null
  }

  async getPersonas(ids: string[]): Promise<Persona[]> {
    return ids.map((id) => this.personas.get(id)).filter(Boolean) as Persona[]
  }

  async getAllPersonas(): Promise<Persona[]> {
    return Array.from(this.personas.values())
  }

  async updatePersona(id: string, updates: Partial<Persona>): Promise<Persona | null> {
    const persona = this.personas.get(id)
    if (!persona) return null

    const updatedPersona = {
      ...persona,
      ...updates,
      updatedAt: new Date(),
    }

    this.personas.set(id, updatedPersona)
    return updatedPersona
  }

  async deletePersona(id: string): Promise<boolean> {
    return this.personas.delete(id)
  }

  async createShareableLink(
    personaIds: string[],
    options: {
      expiresIn?: number // hours
      isPublic?: boolean
      password?: string
    } = {},
  ): Promise<ShareableLink> {
    const shareId = generateShareId()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + (options.expiresIn || 24 * 7)) // Default 7 days

    const shareableLink: ShareableLink = {
      id: shareId,
      personaIds,
      expiresAt,
      accessCount: 0,
      isPublic: options.isPublic ?? true,
      password: options.password,
    }

    this.shareableLinks.set(shareId, shareableLink)
    logger.info(`Created shareable link: ${shareId} for ${personaIds.length} personas`)

    return shareableLink
  }

  async getShareableLink(shareId: string): Promise<ShareableLink | null> {
    const link = this.shareableLinks.get(shareId)
    if (!link) return null

    // Check if expired
    if (new Date() > link.expiresAt) {
      this.shareableLinks.delete(shareId)
      return null
    }

    // Increment access count
    link.accessCount++
    this.shareableLinks.set(shareId, link)

    return link
  }

  async storeConversation(personaId: string, conversation: any[]): Promise<void> {
    this.conversations.set(personaId, conversation)
  }

  async getConversation(personaId: string): Promise<any[]> {
    return this.conversations.get(personaId) || []
  }

  // Analytics methods
  async getPersonaStats(): Promise<any> {
    const personas = Array.from(this.personas.values())
    const totalPersonas = personas.length
    const industries = [...new Set(personas.map((p) => p.demographics.occupation))]
    const avgAge = personas.reduce((sum, p) => sum + p.demographics.age, 0) / totalPersonas

    return {
      totalPersonas,
      industries: industries.length,
      averageAge: Math.round(avgAge),
      createdToday: personas.filter((p) => {
        const today = new Date()
        const created = new Date(p.createdAt)
        return created.toDateString() === today.toDateString()
      }).length,
    }
  }

  async searchPersonas(query: string): Promise<Persona[]> {
    const personas = Array.from(this.personas.values())
    const lowercaseQuery = query.toLowerCase()

    return personas.filter(
      (persona) =>
        persona.name.toLowerCase().includes(lowercaseQuery) ||
        persona.demographics.occupation.toLowerCase().includes(lowercaseQuery) ||
        persona.traits.some((trait) => trait.toLowerCase().includes(lowercaseQuery)) ||
        persona.painPoints.some((point) => point.toLowerCase().includes(lowercaseQuery)),
    )
  }
}

export const personaService = new PersonaService()
