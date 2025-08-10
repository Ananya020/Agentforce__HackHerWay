"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, Sparkles, ArrowRight, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UploadedFile {
  id: string
  filename: string
  fileType: string
  processedData: any
}

export default function GeneratorPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [formData, setFormData] = useState({
    productPositioning: "",
    industry: "",
    targetRegion: "",
    productCategory: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setUploadedFiles((prev) => [...prev, result])
        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been processed and is ready to use.`,
        })
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      })
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const handleGenerate = async () => {
    if (!formData.productPositioning || !formData.industry || !formData.targetRegion || !formData.productCategory) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields before generating personas.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Prepare data for API
      const requestData = {
        product_positioning: formData.productPositioning,
        industry: formData.industry,
        target_region: formData.targetRegion,
        product_category: formData.productCategory,
        survey_data: uploadedFiles.find((f) => f.fileType === "text/csv")?.processedData?.content || null,
        review_data: uploadedFiles.find((f) => f.fileType === "text/plain")?.processedData?.content || null,
      }

      const response = await fetch("http://localhost:8000/api/personas/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const result = await response.json()

      if (result.success) {
        // Store personas in localStorage for the dashboard
        localStorage.setItem("generatedPersonas", JSON.stringify(result.personas))
        localStorage.setItem("sessionId", result.session_id)

        toast({
          title: "Personas generated successfully!",
          description: "Your AI personas are ready. Redirecting to dashboard...",
        })

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        throw new Error(result.error || "Generation failed")
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate personas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Generate AI Personas
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your data and let AI create detailed customer personas that understand your market
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isLoading ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* File Upload Section */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Data</h2>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="survey-data">Survey Data (CSV/JSON)</Label>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="mt-2 border-2 border-dashed border-pink-200 rounded-lg p-6 text-center cursor-pointer hover:border-pink-300 transition-colors relative"
                        >
                          <input
                            type="file"
                            accept=".csv,.json"
                            onChange={(e) => handleFileUpload(e, "survey")}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Drop CSV or JSON files here</p>
                          <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                        </motion.div>
                      </div>

                      <div>
                        <Label htmlFor="customer-reviews">Customer Reviews (TXT)</Label>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="mt-2 border-2 border-dashed border-purple-200 rounded-lg p-6 text-center cursor-pointer hover:border-purple-300 transition-colors relative"
                        >
                          <input
                            type="file"
                            accept=".txt"
                            onChange={(e) => handleFileUpload(e, "reviews")}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <FileText className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Upload review data</p>
                          <p className="text-xs text-gray-400 mt-1">TXT files supported</p>
                        </motion.div>
                      </div>

                      {/* Uploaded Files Display */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <Label>Uploaded Files</Label>
                          {uploadedFiles.map((file) => (
                            <motion.div
                              key={file.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                            >
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium text-green-800">{file.filename}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(file.id)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form Section */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Details</h2>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="positioning">Product Positioning Statement *</Label>
                        <Textarea
                          id="positioning"
                          placeholder="Describe your product's unique value proposition and target market..."
                          className="mt-2 min-h-[120px]"
                          value={formData.productPositioning}
                          onChange={(e) => setFormData({ ...formData, productPositioning: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="industry">Industry *</Label>
                          <Select
                            value={formData.industry}
                            onValueChange={(value) => setFormData({ ...formData, industry: value })}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="entertainment">Entertainment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="region">Target Region *</Label>
                          <Select
                            value={formData.targetRegion}
                            onValueChange={(value) => setFormData({ ...formData, targetRegion: value })}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="north-america">North America</SelectItem>
                              <SelectItem value="europe">Europe</SelectItem>
                              <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                              <SelectItem value="latin-america">Latin America</SelectItem>
                              <SelectItem value="global">Global</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="category">Product Category *</Label>
                        <Select
                          value={formData.productCategory}
                          onValueChange={(value) => setFormData({ ...formData, productCategory: value })}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="saas">SaaS</SelectItem>
                            <SelectItem value="mobile-app">Mobile App</SelectItem>
                            <SelectItem value="e-commerce">E-commerce</SelectItem>
                            <SelectItem value="physical-product">Physical Product</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="platform">Platform</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div className="mt-8 text-center" whileHover={{ scale: 1.02 }}>
                  <Button
                    onClick={handleGenerate}
                    size="lg"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Sparkles className="mr-2 w-5 h-5" />
                    Generate Personas
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-12 text-center bg-white/80 backdrop-blur-sm shadow-xl">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-6"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </motion.div>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">AI is thinking...</h2>
                <p className="text-gray-600 mb-6">Analyzing your data and generating detailed personas</p>

                <motion.div
                  className="flex justify-center space-x-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                >
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </motion.div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
