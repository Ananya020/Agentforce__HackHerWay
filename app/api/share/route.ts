import { type NextRequest, NextResponse } from "next/server"

interface ShareRequest {
  personas: any[]
  settings: {
    publicAccess: boolean
    expiresAt?: string
    password?: string
  }
}

// In-memory storage for demo - use a real database in production
const sharedPersonas = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body: ShareRequest = await request.json()

    if (!body.personas || body.personas.length === 0) {
      return NextResponse.json({ error: "No personas provided for sharing" }, { status: 400 })
    }

    // Generate unique share ID
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Set expiration (default 30 days)
    const expiresAt = body.settings.expiresAt
      ? new Date(body.settings.expiresAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // Store shared data
    const shareData = {
      id: shareId,
      personas: body.personas,
      settings: body.settings,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      accessCount: 0,
      lastAccessed: null,
    }

    sharedPersonas.set(shareId, shareData)

    // Generate share URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const shareUrl = `${baseUrl}/shared/${shareId}`

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      expiresAt: expiresAt.toISOString(),
      settings: body.settings,
    })
  } catch (error) {
    console.error("Error creating share link:", error)
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get("id")
    const password = searchParams.get("password")

    if (!shareId) {
      return NextResponse.json({ error: "Share ID required" }, { status: 400 })
    }

    const shareData = sharedPersonas.get(shareId)

    if (!shareData) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 })
    }

    // Check if expired
    if (new Date() > new Date(shareData.expiresAt)) {
      sharedPersonas.delete(shareId)
      return NextResponse.json({ error: "Share link has expired" }, { status: 410 })
    }

    // Check password if required
    if (shareData.settings.password && shareData.settings.password !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Update access tracking
    shareData.accessCount++
    shareData.lastAccessed = new Date().toISOString()

    return NextResponse.json({
      success: true,
      personas: shareData.personas,
      metadata: {
        createdAt: shareData.createdAt,
        expiresAt: shareData.expiresAt,
        accessCount: shareData.accessCount,
      },
    })
  } catch (error) {
    console.error("Error accessing shared personas:", error)
    return NextResponse.json({ error: "Failed to access shared personas" }, { status: 500 })
  }
}
