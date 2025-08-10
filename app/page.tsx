"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles, MessageCircle, TrendingUp, Users, Zap, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ParticleBackground } from "@/components/particle-background"
import { AnimatedText } from "@/components/animated-text"
import { FeatureCard } from "@/components/feature-card"
import { MockupPreview } from "@/components/mockup-preview"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
      <ParticleBackground />

      {/* Navigation */}
      <motion.nav
        className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            PerzonAI
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/generator" className="text-gray-600 hover:text-pink-600 transition-colors">
            Generator
          </Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-pink-600 transition-colors">
            Dashboard
          </Link>
          <Link href="/trends" className="text-gray-600 hover:text-pink-600 transition-colors">
            Trends
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <motion.div className="text-center" variants={staggerContainer} initial="initial" animate="animate">
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-medium mb-8">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Marketing Intelligence
            </span>
          </motion.div>

          <AnimatedText
            text="PerzonAI – AI Marketing Co-Pilot"
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
          />

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Transform your marketing strategy with AI-generated customer personas that think, speak, and engage like
            real customers
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/generator">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-pink-200 text-pink-600 hover:bg-pink-50 px-8 py-4 rounded-full text-lg font-semibold group bg-transparent"
            >
              <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to create, interact with, and optimize customer personas
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <FeatureCard
            icon={Users}
            title="Generate Personas"
            description="Upload survey data, reviews, and positioning to create detailed AI personas"
            gradient="from-pink-400 to-rose-500"
          />
          <FeatureCard
            icon={MessageCircle}
            title="Chat with Personas"
            description="Interactive conversations with personas that respond in their unique voice"
            gradient="from-purple-400 to-indigo-500"
          />
          <FeatureCard
            icon={TrendingUp}
            title="AI Campaign Ideas"
            description="Get personalized campaign recommendations and messaging strategies"
            gradient="from-indigo-400 to-cyan-500"
          />
        </motion.div>
      </section>

      {/* Mockup Preview Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            See It In Action
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the power of AI-driven persona generation and interaction
          </p>
        </motion.div>

        <MockupPreview />
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="p-12 text-center bg-gradient-to-r from-pink-500 to-purple-600 border-0 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Marketing?</h2>
            <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
              Join thousands of marketers who are already using AI to create more effective campaigns
            </p>
            <Link href="/generator">
              <Button
                size="lg"
                className="bg-white text-pink-600 hover:bg-gray-50 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Creating Personas
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </Card>
        </motion.div>
      </section>
    </div>
  )
}
