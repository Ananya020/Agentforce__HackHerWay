"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle } from "lucide-react"

export function MockupPreview() {
  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      {/* Dashboard Preview */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Generated Personas</h3>
            <Badge className="bg-green-100 text-green-700">3 Active</Badge>
          </div>

          <div className="space-y-4">
            {[
              { name: "Sarah Chen", role: "Tech Enthusiast", age: "28", location: "San Francisco" },
              { name: "Mike Rodriguez", role: "Budget Shopper", age: "35", location: "Austin" },
              { name: "Emma Thompson", role: "Luxury Seeker", age: "42", location: "New York" },
            ].map((persona, index) => (
              <motion.div
                key={persona.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-4 p-4 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 cursor-pointer"
              >
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}`} />
                  <AvatarFallback>
                    {persona.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{persona.name}</h4>
                  <p className="text-sm text-gray-600">
                    {persona.role} • {persona.age} • {persona.location}
                  </p>
                </div>
                <MessageCircle className="w-5 h-5 text-pink-500" />
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Chat Preview */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-xl">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b">
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah Chen" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-800">Sarah Chen</h3>
              <p className="text-sm text-green-600 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-4">
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-2 max-w-xs">
                <p className="text-sm text-gray-800">
                  Hi! I'm Sarah, a 28-year-old tech enthusiast from San Francisco. I love trying new gadgets and apps!
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl rounded-tr-md px-4 py-2 max-w-xs">
                <p className="text-sm">What's your biggest pain point with current tech products?</p>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-2 max-w-xs">
                <p className="text-sm text-gray-800">
                  Honestly, most apps are too complicated. I want something that just works without a learning curve!
                </p>
              </div>
            </div>
          </div>

          <motion.div
            className="flex items-center space-x-2 text-gray-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
            <span className="text-sm">Sarah is typing...</span>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  )
}
