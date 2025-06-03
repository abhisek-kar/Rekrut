"use client";

import { Card, CardContent } from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
import { Users, Briefcase, TrendingUp, Shield, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";

const FeaturesSection = () => {
  const features = [
    {
      icon: Users,
      title: "Smart Candidate Management",
      description: "Streamline your hiring process with intelligent candidate tracking and automated workflows."
    },
    {
      icon: Briefcase,
      title: "Job Posting & Distribution",
      description: "Create and distribute job postings across multiple channels with a single click."
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Get insights into your recruitment performance with detailed analytics and reporting."
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Secure your data with granular permissions and role-based access control."
    },
    {
      icon: Zap,
      title: "AI-Powered Matching",
      description: "Leverage AI to match the best candidates with your job requirements automatically."
    },
    {
      icon: Target,
      title: "Customizable Workflows",
      description: "Adapt the system to your unique hiring process with custom fields and workflows."
    }
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-blue-100 text-blue-800 mb-4">Features</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to hire better
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From posting jobs to making offers, our comprehensive platform covers every step of your recruitment process.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;