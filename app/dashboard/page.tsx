"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, Share2, Settings, Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { PersonaCard } from "@/components/persona-card"
import { ChatInterface } from "@/components/chat-interface"
import { RefinementPanel } from "@/components/refinement-panel"

export default function DashboardPage() {
  const [personas, setPersonas] = useState<any[]>([])
  const [selectedPersona, setSelectedPersona] = useState<any | null>(null)
  const [showRefinement, setShowRefinement] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load personas from localStorage
    const storedPersonas = localStorage.getItem("generatedPersonas")
    if (storedPersonas) {
      setPersonas(JSON.parse(storedPersonas))
    }
  }, [])

  // The CORRECTED `handleRefinePersonas` function with a debugging line

const handleRefinePersonas = async (refinements: any) => {
  setIsRefining(true);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/personas/refine`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personas,
        refinements,
        original_context: {},
      }),
    });

    const result = await response.json();

    // ======================= THE DEBUGGING LINE =======================
    // This will show us exactly what the backend sent back.
    console.log("Response from /refine endpoint:", result);
    // ==================================================================

    if (result.success && result.personas) {
      // These lines update the UI. They will only run if the `result`
      // object has `success: true` and a `personas` array.
      setPersonas(result.personas);
      localStorage.setItem("generatedPersonas", JSON.stringify(result.personas));
      
      toast({
        title: "Personas refined successfully!",
        description: "Your personas have been updated with the new parameters.",
      });
    } else {
      // If the UI doesn't update, it means the code is coming here instead.
      console.error("Refinement failed or response was malformed. Result:", result);
      throw new Error(result.error || "Refinement failed: `result.success` was false or `result.personas` was missing.");
    }
  } catch (error) {
    toast({
      title: "Refinement failed",
      description: error instanceof Error ? error.message : "Failed to refine personas",
      variant: "destructive",
    });
  } finally {
    setIsRefining(false);
  }
};

  const handleExport = async (format: "json" | "csv") => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/export/personas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personas,
          format,
          include_charts: true,
        }),
      })

      if (format === "json" || format === "csv") {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `personas.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      toast({
        title: "Export successful!",
        description: `Personas exported as ${format.toUpperCase()} file.`,
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export personas",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personas,
          settings: {
            public_access: true,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        navigator.clipboard.writeText(result.share_url)
        toast({
          title: "Share link created!",
          description: "Link copied to clipboard. Valid for 30 days.",
        })
      } else {
        throw new Error(result.error || "Share failed")
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: error instanceof Error ? error.message : "Failed to create share link",
        variant: "destructive",
      })
    }
  }

  if (personas.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center bg-white/80 backdrop-blur-sm shadow-xl">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-pink-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Personas Found</h2>
          <p className="text-gray-600 mb-6">Generate some personas first to see them here.</p>
          <Link href="/generator">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">Generate Personas</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            PerzonAI
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setShowRefinement(!showRefinement)}
            className="border-pink-200 text-pink-600 hover:bg-pink-50"
            disabled={isRefining}
          >
            {isRefining ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
            {isRefining ? "Refining..." : "Refine"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("json")}
            className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-transparent"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Your AI Personas
              </h1>
              <p className="text-gray-600">Generated from your data • Ready to interact</p>
            </div>
            <Badge className="bg-green-100 text-green-700 px-4 py-2">{personas.length} Active Personas</Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personas Grid */}
          <div className="lg:col-span-2">
            <motion.div
              className="grid gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {personas.map((persona, index) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  index={index}
                  onClick={() => setSelectedPersona(persona)}
                />
              ))}
            </motion.div>
          </div>

          {/* Refinement Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {showRefinement ? (
                <RefinementPanel key="refinement" onRefine={handleRefinePersonas} isRefining={isRefining} />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-8 text-center bg-white/80 backdrop-blur-sm shadow-lg">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-8 h-8 text-pink-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Refine Your Personas</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Adjust parameters to fine-tune your personas in real-time
                    </p>
                    <Button
                      onClick={() => setShowRefinement(true)}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                    >
                      Open Refinement Panel
                    </Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Chat Interface Modal */}
      <AnimatePresence>
        {selectedPersona && <ChatInterface persona={selectedPersona} onClose={() => setSelectedPersona(null)} />}
      </AnimatePresence>
    </div>
  )
}
