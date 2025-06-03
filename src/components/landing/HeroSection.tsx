"use client";

import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import Link from "next/link";
import { ArrowRight, Star, Play, CheckCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "../shadcn-ui/avatar";

const HeroSection = () => {
  const stats = [
    { number: "50K+", label: "Applications Processed" },
    { number: "500+", label: "Companies Trust Us" },
    { number: "95%", label: "Customer Satisfaction" },
    { number: "60%", label: "Faster Hiring Process" }
  ];

  const candidates = [
    {
        name: "Elon Jena",
        position: "Senior Developer",
        image: "https://randomuser.me/api/portraits/men/75.jpg"
    },
    {
        name: "Renuka Gawde",
        position: "Product Manager",
        image: "https://randomuser.me/api/portraits/women/75.jpg"
    },
    {
        name: "Jamuna Siri",
        position: "UX Designer",
        image: "https://randomuser.me/api/portraits/women/76.jpg"
    }
  ]

  return (
    <section className="pt-16 pb-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                🚀 Now with AI-Powered Matching
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Hiring Process</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Streamline recruitment with our modern ATS. From job posting to candidate hiring, 
                manage your entire talent pipeline with powerful automation and AI-driven insights.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
                asChild
              >
                <Link href="/login" className="group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="group">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                    {[
                        { name: "Satya Nadella", image: "https://randomuser.me/api/portraits/men/32.jpg" },
                        { name: "Sundar Pichai", image: "https://randomuser.me/api/portraits/men/45.jpg" },
                        { name: "Tim Cook", image: "https://randomuser.me/api/portraits/men/67.jpg" },
                        { name: "Jensen Huang", image: "https://randomuser.me/api/portraits/men/26.jpg" }
                    ].map((ceo, i) => (
                        <Avatar key={i} className="w-8 h-8 border-2 border-white">
                            <AvatarImage src={ceo.image} alt={ceo.name} />
                            <AvatarFallback className="text-xs bg-gradient-to-r from-blue-400 to-purple-400 text-white">
                                {ceo.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                </div>
                <span className="text-sm text-gray-600">500+ companies trust us</span>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-gray-600 ml-2">4.9/5 rating</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Hero Dashboard Preview */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-500 mx-4">
                  rekrut-ats.com/dashboard
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recruitment Dashboard</h3>
                  <Badge className="bg-green-100 text-green-800">Live</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Recent Applications</span>
                    <span className="text-blue-600">View all</span>
                  </div>
                  {candidates?.map((candidate, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <Avatar>
  <AvatarImage src={candidate?.image} />
  <AvatarFallback>{candidate?.name}</AvatarFallback>
</Avatar>

                      <div className="flex-1">
                        <div className="text-sm font-medium">{candidate?.name}</div>
                        <div className="text-xs text-gray-500">{candidate?.position}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">New</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Auto-matched candidate</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">95% faster screening</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;