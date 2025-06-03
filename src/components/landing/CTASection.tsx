import React from 'react';
import { Card, CardContent } from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        >
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Ready to transform your hiring process?
        </h2>
        <p className="text-xl mb-8 text-blue-100">
          Join hundreds of companies already using Rekrut ATS to hire better, faster, and smarter.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
            <Link href="/login">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
            Schedule Demo
          </Button>
        </div>
        <p className="text-sm text-blue-100 mt-4">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </motion.div>
    </div>
  </section>
)
}

export default CTASection