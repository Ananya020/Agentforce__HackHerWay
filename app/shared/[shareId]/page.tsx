"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Lock, Eye, Calendar, Users, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PersonaCard } from "@/components/persona-card"
import { apiClient } from "@/lib/api-client"
import Link from "next/link"

interface SharedPageProps {
  params: {
    shareId: string
  }
}

export default function SharedPersonasPage({ params }: SharedPageProps) {
  const [personas, setPersonas] = useState<any[]>([])
  const [metadata, setMetadata] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [needsPassword, setNeedsPassword] = useState(false)

  const loadSharedPersonas = async (pwd?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.getSharedPersonas(params.shareId, pwd)

      if (response.success) {
        setPersonas(response.personas)
        setMetadata(response.metadata)
        setNeedsPassword(false)
      } else {
        if (response.error === "Invalid password") {
          setNeedsPassword(true)
          setError("Invalid password. Please try again.")
        } else {
          setError(response.error || "Failed to load shared personas")
        }
      }
    } catch (err) {
      setError("Failed to load shared personas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSharedPersonas()
  }, [params.shareId])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.trim()) {
      loadSharedPersonas(password)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Shared Personas...</h2>
          <p className="text-gray-600">Please wait while we fetch the data</p>
        </motion.div>
      </div>
    )
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <Card className="p-8 text-center bg-white/80 backdrop-blur-sm shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-pink-500" />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">Password Required</h1>
            <p className="text-gray-600 mb-6">This shared content is password protected</p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center"
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                disabled={!password.trim()}
              >
                Access Personas
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (error && !needsPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load</h1>
            <p className="text-gray-600 mb-6">{error}</p>

            <Link href="/">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">Go to PerzonAI</Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Shared Personas
                </h1>
                <p className="text-sm text-gray-600">Generated with PerzonAI</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {metadata && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{personas.length} personas</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {new Date(metadata.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Badge variant="secondary">Viewed {metadata.accessCount} times</Badge>
                </div>
              )}

              <Link href="/">
                <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent">
                  Create Your Own
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Personas */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          className="grid gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {personas.map((persona, index) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              index={index}
              onClick={() => {}} // Disable chat in shared view
            />
          ))}
        </motion.div>

        {personas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No personas found in this share.</p>
          </div>
        )}
      </div>
    </div>
  )
}
