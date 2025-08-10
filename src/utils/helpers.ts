import { v4 as uuidv4 } from "uuid"

export function generatePersonaId(): string {
  return `persona_${uuidv4()}`
}

export function generateShareId(): string {
  return `share_${uuidv4()}`
}

export function generateAvatarUrl(name: string): string {
  const encodedName = encodeURIComponent(name)
  const backgroundColors = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"]
  const randomBg = backgroundColors[Math.floor(Math.random() * backgroundColors.length)]

  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodedName}&backgroundColor=${randomBg}&radius=50`
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9.-]/gi, "_").toLowerCase()
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength - 3) + "..."
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function generateRandomColor(): string {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
