"use client";

import { Badge } from "@/components/shadcn-ui/badge";
import { motion } from "framer-motion";
import { Card, CardContent } from "../shadcn-ui/card";
import { Star } from "lucide-react";

function TestimonialsSection() {
    const testimonials = [
        {
          name: "Sarah Johnson",
          role: "HR Director",
          company: "TechCorp Inc.",
          content: "Rekrut ATS transformed our hiring process. We've reduced our time-to-hire by 50% and improved candidate satisfaction significantly."
        },
        {
          name: "Michael Chen",
          role: "Recruitment Manager", 
          company: "Growth Ventures",
          content: "The AI-powered matching feature is incredible. It saves us hours of manual screening and helps us find the perfect candidates faster."
        },
        {
          name: "Emily Davis",
          role: "Talent Acquisition Lead",
          company: "Innovation Labs",
          content: "User-friendly interface, powerful features, and excellent support. Rekrut ATS is everything we needed in one platform."
        }
      ];
  return (
    <section id="testimonials" className="py-24 bg-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <Badge className="bg-green-100 text-green-800 mb-4">Testimonials</Badge>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Loved by recruitment teams
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          See how companies are transforming their hiring process with Rekrut ATS.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 h-full">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>  )
}

export default TestimonialsSection