"use client";

import { Card, CardContent } from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
import { Button } from "@/components/shadcn-ui/button";
import { Users, Briefcase, TrendingUp, Shield, Zap, Target, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const FeaturesSection = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      icon: Users,
      title: "Smart Candidate Management",
      description: "Streamline your hiring process with intelligent candidate tracking and automated workflows.",
      color: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      hoverBg: "hover:from-blue-100 hover:to-cyan-100",
      benefits: ["AI-powered screening", "Automated workflows", "Real-time tracking"],
      isPopular: false
    },
    {
      icon: Briefcase,
      title: "Job Posting & Distribution",
      description: "Create and distribute job postings across multiple channels with a single click.",
      color: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      hoverBg: "hover:from-purple-100 hover:to-pink-100",
      benefits: ["Multi-channel posting", "SEO optimization", "Brand customization"],
      isPopular: true
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Get insights into your recruitment performance with detailed analytics and reporting.",
      color: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      hoverBg: "hover:from-emerald-100 hover:to-teal-100",
      benefits: ["Real-time dashboards", "Custom reports", "Performance metrics"],
      isPopular: false
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Secure your data with granular permissions and role-based access control.",
      color: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      hoverBg: "hover:from-orange-100 hover:to-red-100",
      benefits: ["Enterprise security", "GDPR compliance", "Audit trails"],
      isPopular: false
    },
    {
      icon: Zap,
      title: "AI-Powered Matching",
      description: "Leverage AI to match the best candidates with your job requirements automatically.",
      color: "from-yellow-500 to-amber-500",
      bgGradient: "from-yellow-50 to-amber-50",
      hoverBg: "hover:from-yellow-100 hover:to-amber-100",
      benefits: ["Smart matching", "Auto-ranking", "Bias reduction"],
      isPopular: true
    },
    {
      icon: Target,
      title: "Customizable Workflows",
      description: "Adapt the system to your unique hiring process with custom fields and workflows.",
      color: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-50 to-purple-50",
      hoverBg: "hover:from-indigo-100 hover:to-purple-100",
      benefits: ["Custom fields", "Workflow automation", "Integration APIs"],
      isPopular: false
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 mb-4 px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Everything you need to hire better
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From posting jobs to making offers, our comprehensive platform covers every step of your recruitment process with cutting-edge technology.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative"
            >
              {/* Popular badge */}
              {feature.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 shadow-lg px-3 py-1 text-xs font-semibold">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <Card className={`relative h-full transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2 border-2 border-transparent group-hover:border-opacity-20 ${feature.hoverBg} bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm shadow-lg group-hover:shadow-2xl overflow-hidden`}>
                {/* Animated background effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Gradient border effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-500 -z-10`}></div>

                <CardContent className="p-8 relative z-10">
                  {/* Icon with enhanced styling */}
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
                    whileHover={{ rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                    
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10`}></div>
                  </motion.div>

                  {/* Title and description */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>

                  {/* Benefits list */}
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ 
                      opacity: hoveredCard === index ? 1 : 0, 
                      height: hoveredCard === index ? "auto" : 0 
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 mb-6">
                      {feature.benefits.map((benefit, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ 
                            x: hoveredCard === index ? 0 : -20, 
                            opacity: hoveredCard === index ? 1 : 0 
                          }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                          className="flex items-center space-x-2"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.color}`}></div>
                          <span className="text-sm text-gray-600 font-medium">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Learn more button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: hoveredCard === index ? 1 : 0, 
                      y: hoveredCard === index ? 0 : 20 
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <Button 
                      variant="ghost" 
                      className={`group/btn w-full bg-gradient-to-r ${feature.color} bg-opacity-10 hover:bg-opacity-20 border-0 transition-all duration-300`}
                    >
                      <span className="font-medium">Learn More</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </motion.div>

                  {/* Floating particles effect */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full animate-pulse`}></div>
                  </div>
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className={`w-1 h-1 bg-gradient-to-r ${feature.color} rounded-full animate-ping`}></div>
                  </div>
                </CardContent>

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <span className="font-semibold">Explore All Features</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>

      <style jsx>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(148 163 184 / 0.05)'%3e%3cpath d='m0 .5h32m-32 32v-32'/%3e%3c/svg%3e");
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;