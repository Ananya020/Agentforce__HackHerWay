"use client"

import { motion } from "framer-motion"
import { MessageCircle, MapPin, Briefcase, Target, Lightbulb } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PersonaCardProps {
  persona: {
    id: number
    name: string
    avatar: string
    demographics: {
      age: number
      gender: string
      location: string
      occupation: string
    }
    traits: string[]
    painPoints: string[]
    messagingTone: string
    campaigns: string[]
  }
  index: number
  onClick: () => void
}

export function PersonaCard({ persona, index, onClick }: PersonaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={persona.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {persona.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{persona.name}</h3>
              <div className="flex items-center text-gray-600 text-sm space-x-4">
                <span className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {persona.demographics.occupation}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {persona.demographics.location}
                </span>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2 text-pink-500" />
              Key Traits
            </h4>
            <div className="flex flex-wrap gap-2">
              {persona.traits.map((trait, i) => (
                <Badge key={i} variant="secondary" className="bg-pink-100 text-pink-700">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Lightbulb className="w-4 h-4 mr-2 text-purple-500" />
              Pain Points
            </h4>
            <ul className="space-y-1">
              {persona.painPoints.slice(0, 2).map((point, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Messaging Tone:</span>
              <span className="text-sm text-gray-600 ml-2">{persona.messagingTone}</span>
            </div>
            <motion.div whileHover={{ scale: 1.1 }} className="w-3 h-3 bg-green-400 rounded-full"></motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
