"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, MessageSquare, Target, Sparkles, ArrowUp, ArrowDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import Link from "next/link"

const trendData = [
  { month: "Jan", engagement: 65, conversion: 12, reach: 45000 },
  { month: "Feb", engagement: 72, conversion: 15, reach: 52000 },
  { month: "Mar", engagement: 68, conversion: 18, reach: 48000 },
  { month: "Apr", engagement: 85, conversion: 22, reach: 61000 },
  { month: "May", engagement: 91, conversion: 28, reach: 67000 },
  { month: "Jun", engagement: 88, conversion: 25, reach: 64000 },
]

const demographicData = [
  { name: "18-24", value: 25, color: "#ec4899" },
  { name: "25-34", value: 35, color: "#a855f7" },
  { name: "35-44", value: 25, color: "#6366f1" },
  { name: "45+", value: 15, color: "#06b6d4" },
]

const contentFormats = [
  { format: "Video", performance: 92, trend: "up" },
  { format: "Interactive Posts", performance: 87, trend: "up" },
  { format: "Stories", performance: 78, trend: "down" },
  { format: "Carousel", performance: 85, trend: "up" },
  { format: "Live Streams", performance: 73, trend: "up" },
]

const trendingTopics = [
  { topic: "AI & Automation", mentions: 15420, growth: "+23%" },
  { topic: "Sustainability", mentions: 12890, growth: "+18%" },
  { topic: "Remote Work", mentions: 11250, growth: "+12%" },
  { topic: "Mental Health", mentions: 9870, growth: "+31%" },
  { topic: "Digital Privacy", mentions: 8640, growth: "+15%" },
]

export default function TrendsPage() {
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

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/generator" className="text-gray-600 hover:text-pink-600 transition-colors">
            Generator
          </Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-pink-600 transition-colors">
            Dashboard
          </Link>
          <Link href="/trends" className="text-pink-600 font-medium">
            Trends
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Marketing Trends
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Real-time insights into consumer behavior, trending topics, and content performance
          </p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {[
            { label: "Avg Engagement", value: "82%", change: "+12%", icon: TrendingUp, color: "pink" },
            { label: "Active Users", value: "64K", change: "+8%", icon: Users, color: "purple" },
            { label: "Conversion Rate", value: "21%", change: "+15%", icon: Target, color: "indigo" },
            { label: "Content Reach", value: "2.1M", change: "+25%", icon: MessageSquare, color: "cyan" },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r from-${metric.color}-400 to-${metric.color}-500 flex items-center justify-center`}
                  >
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-green-100 text-green-700">{metric.change}</Badge>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{metric.value}</h3>
                <p className="text-gray-600 text-sm">{metric.label}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Engagement Trends Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Engagement Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="url(#gradient1)"
                    strokeWidth={3}
                    dot={{ fill: "#ec4899", strokeWidth: 2, r: 6 }}
                  />
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Demographics Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Age Demographics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={demographicData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {demographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trending Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Trending Topics</h3>
              <div className="space-y-4">
                {trendingTopics.map((topic, index) => (
                  <motion.div
                    key={topic.topic}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-800">{topic.topic}</h4>
                      <p className="text-sm text-gray-600">{topic.mentions.toLocaleString()} mentions</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-700">{topic.growth}</Badge>
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Content Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Content Format Performance</h3>
              <div className="space-y-4">
                {contentFormats.map((format, index) => (
                  <motion.div
                    key={format.format}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-cyan-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-cyan-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{format.performance}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{format.format}</h4>
                        <p className="text-sm text-gray-600">Performance Score</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {format.trend === "up" ? (
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
