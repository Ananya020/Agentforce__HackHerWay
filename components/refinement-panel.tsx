"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sliders, RefreshCw, Target, DollarSign, MessageSquare } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface RefinementPanelProps {
  onRefine: (refinements: any) => void
  isRefining: boolean
}

export function RefinementPanel({ onRefine, isRefining }: RefinementPanelProps) {
  const [budgetLevel, setBudgetLevel] = useState([50])
  const [customerFocus, setCustomerFocus] = useState([30])
  const [tone, setTone] = useState("friendly")
  const [includeDemographicVariations, setIncludeDemographicVariations] = useState(true)
  const [generateCampaignSuggestions, setGenerateCampaignSuggestions] = useState(true)
  const [includePainPointAnalysis, setIncludePainPointAnalysis] = useState(true)

  const handleRegenerate = () => {
    const refinements = {
      budgetLevel: budgetLevel[0],
      customerFocus: customerFocus[0],
      tone,
      includeDemographicVariations,
      generateCampaignSuggestions,
      includePainPointAnalysis,
    }
    onRefine(refinements)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="flex items-center space-x-2 mb-6">
          <Sliders className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-semibold text-gray-800">Refine Personas</h3>
        </div>

        <div className="space-y-6">
          {/* Budget Level */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="w-4 h-4 text-green-500" />
              <Label className="text-sm font-medium">Budget Level</Label>
            </div>
            <Slider value={budgetLevel} onValueChange={setBudgetLevel} max={100} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low Budget</span>
              <span>High Budget</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Current: {budgetLevel[0]}%</p>
          </div>

          {/* Customer Segment Focus */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-4 h-4 text-purple-500" />
              <Label className="text-sm font-medium">Customer Segment Focus</Label>
            </div>
            <Slider value={customerFocus} onValueChange={setCustomerFocus} max={100} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Broad Market</span>
              <span>Niche Focus</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Current: {customerFocus[0]}%</p>
          </div>

          {/* Messaging Tone */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <Label className="text-sm font-medium">Messaging Tone</Label>
            </div>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal & Professional</SelectItem>
                <SelectItem value="friendly">Friendly & Approachable</SelectItem>
                <SelectItem value="humorous">Humorous & Casual</SelectItem>
                <SelectItem value="authoritative">Authoritative & Expert</SelectItem>
                <SelectItem value="empathetic">Empathetic & Understanding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700">Advanced Options</h4>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Include demographic variations</Label>
              <Switch checked={includeDemographicVariations} onCheckedChange={setIncludeDemographicVariations} />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Generate campaign suggestions</Label>
              <Switch checked={generateCampaignSuggestions} onCheckedChange={setGenerateCampaignSuggestions} />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Include pain point analysis</Label>
              <Switch checked={includePainPointAnalysis} onCheckedChange={setIncludePainPointAnalysis} />
            </div>
          </div>

          {/* Regenerate Button */}
          <Button
            onClick={handleRegenerate}
            disabled={isRefining}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
          >
            {isRefining ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="mr-2"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isRefining ? "Regenerating..." : "Apply Changes"}
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
