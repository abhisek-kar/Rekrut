"use client";

import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import Link from "next/link";
import { CheckCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const BenefitsSection = () => {
  const benefits = [
    "Reduce time-to-hire by up to 60%",
    "Improve candidate experience",
    "Centralize all recruitment data", 
    "Automate repetitive tasks",
    "Scale your hiring process",
    "Make data-driven decisions"
  ];

  const pipelineData = [
    { stage: "Job Posted", candidates: 150, color: "bg-blue-500" },
    { stage: "Applications", candidates: 120, color: "bg-purple-500" },
    { stage: "Screening", candidates: 45, color: "bg-orange-500" },
    { stage: "Interviews", candidates: 12, color: "bg-green-500" },
    { stage: "Offers", candidates: 3, color: "bg-red-500" }
  ];

  return (
    <section id="benefits" className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <Badge className="bg-purple-100 text-purple-800 mb-4">Benefits</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why choose Rekrut ATS?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our platform is designed to make hiring faster, smarter, and more efficient than ever before.
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
              asChild
            >
              <Link href="/login">
                Get Started Now
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Benefits Illustration */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Hiring Pipeline</h3>
                  <Badge className="bg-green-100 text-green-800">Optimized</Badge>
                </div>
                
                <div className="space-y-4">
                  {pipelineData.map((stage, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-3"
                    >
                      <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                          <span className="text-sm text-gray-600">{stage.candidates}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <motion.div 
                            className={`h-2 rounded-full ${stage.color}`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(stage.candidates / 150) * 100}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            viewport={{ once: true }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;