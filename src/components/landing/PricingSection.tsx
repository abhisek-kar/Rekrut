
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../shadcn-ui/card";

function PricingSection() {
    const pricingPlans = [
        {
          name: "Starter",
          price: "$29",
          period: "per month",
          description: "Perfect for small teams getting started",
          features: [
            "Up to 3 users",
            "10 active job postings",
            "Basic analytics",
            "Email support",
            "Standard integrations"
          ],
          highlighted: false
        },
        {
          name: "Professional",
          price: "$79",
          period: "per month",
          description: "Best for growing recruitment teams",
          features: [
            "Up to 10 users",
            "Unlimited job postings",
            "Advanced analytics",
            "Priority support",
            "AI-powered matching",
            "Custom workflows"
          ],
          highlighted: true
        },
        {
          name: "Enterprise",
          price: "Custom",
          period: "contact us",
          description: "For large organizations with custom needs",
          features: [
            "Unlimited users",
            "White-label solution",
            "Dedicated support",
            "Custom integrations",
            "Advanced security",
            "Training & onboarding"
          ],
          highlighted: false
        }
      ];
  return (
    <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <Badge className="bg-orange-100 text-orange-800 mb-4">Pricing</Badge>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Choose the right plan for your team
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Start with our free trial and scale as you grow. No hidden fees, cancel anytime.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className={`p-8 h-full relative ${plan.highlighted ? 'border-2 border-blue-500 shadow-xl' : ''}`}>
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${
                    plan.highlighted 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                      : ''
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  asChild
                >
                  <Link href="/login">
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)
}

export default PricingSection