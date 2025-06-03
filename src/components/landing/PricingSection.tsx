import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import { Switch } from "@/components/shadcn-ui/switch";
import Link from "next/link";
import { CheckCircle, Crown, Zap, Building2, ArrowRight, Star, Sparkles, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import { useState } from "react";

function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  const pricingPlans = [
    {
      name: "Starter",
      icon: Zap,
      price: isAnnual ? "$24" : "$29",
      originalPrice: isAnnual ? "$29" : null,
      period: "per month",
      yearlyDiscount: "Save 20%",
      description: "Perfect for small teams getting started with modern recruitment",
      features: [
        "Up to 3 users",
        "10 active job postings",
        "Basic analytics dashboard",
        "Email support",
        "Standard integrations",
        "Mobile app access"
      ],
      highlighted: false,
      color: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      buttonStyle: "border-blue-200 hover:bg-blue-50 text-blue-700"
    },
    {
      name: "Professional",
      icon: Crown,
      price: isAnnual ? "$63" : "$79",
      originalPrice: isAnnual ? "$79" : null,
      period: "per month",
      yearlyDiscount: "Save 20%",
      description: "Best for growing recruitment teams that need advanced features",
      features: [
        "Up to 10 users",
        "Unlimited job postings",
        "Advanced analytics & reports",
        "Priority support (24/7)",
        "AI-powered candidate matching",
        "Custom workflows & automation",
        "Advanced integrations",
        "Team collaboration tools"
      ],
      highlighted: true,
      color: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      buttonStyle: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
    },
    {
      name: "Enterprise",
      icon: Building2,
      price: "Custom",
      originalPrice: null,
      period: "contact us",
      yearlyDiscount: null,
      description: "For large organizations with custom needs and compliance requirements",
      features: [
        "Unlimited users",
        "White-label solution",
        "Dedicated account manager",
        "Custom integrations & API",
        "Advanced security & compliance",
        "Training & onboarding",
        "SLA guarantee",
        "Custom reporting"
      ],
      highlighted: false,
      color: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      buttonStyle: "border-emerald-200 hover:bg-emerald-50 text-emerald-700"
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

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
            <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200 mb-6 px-4 py-2 text-sm font-medium">
              <Star className="w-4 h-4 mr-2" />
              Simple Pricing
            </Badge>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 bg-clip-text text-transparent">
            Choose the right plan for your team
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Start with our free trial and scale as you grow. No hidden fees, cancel anytime.
          </p>

          {/* Annual/Monthly Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex items-center justify-center space-x-4 bg-white rounded-2xl p-2 shadow-lg border border-gray-200 max-w-sm mx-auto"
          >
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-blue-600"
            />
            <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                Save 20%
              </Badge>
            )}
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg px-4 py-2 text-sm font-semibold">
                    <Crown className="w-4 h-4 mr-2" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Glow effect for highlighted plan */}
              {plan.highlighted && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 scale-105"></div>
              )}

              <Card className={`relative h-full transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2 ${
                plan.highlighted 
                  ? 'border-2 border-purple-200 shadow-2xl bg-gradient-to-br from-purple-50 to-pink-50' 
                  : `border-2 border-transparent hover:border-opacity-20 bg-gradient-to-br ${plan.bgGradient}`
              } backdrop-blur-sm overflow-hidden rounded-3xl`}>
                
                {/* Animated background effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${plan.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                <CardContent className="p-8 lg:p-10 relative z-10">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    {/* Icon */}
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <plan.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </motion.div>

                    {/* Plan Name */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                    
                    {/* Pricing */}
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center mb-2">
                        {plan.originalPrice && (
                          <span className="text-2xl text-gray-400 line-through mr-2">{plan.originalPrice}</span>
                        )}
                        <span className="text-4xl lg:text-5xl font-bold text-gray-900">{plan.price}</span>
                        {plan.price !== "Custom" && (
                          <span className="text-gray-600 ml-2 text-lg">/{plan.period}</span>
                        )}
                      </div>
                      {plan.yearlyDiscount && isAnnual && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {plan.yearlyDiscount}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed">{plan.description}</p>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={featureIndex} 
                        className="flex items-start space-x-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: featureIndex * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <CheckCircle className={`w-5 h-5 ${plan.highlighted ? 'text-purple-500' : 'text-green-500'}`} />
                        </div>
                        <span className="text-gray-700 font-medium leading-relaxed">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className={`w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 transform hover:shadow-lg ${
                        plan.highlighted 
                          ? plan.buttonStyle
                          : `${plan.buttonStyle} border-2`
                      } group/btn`}
                      asChild
                    >
                      <Link href="/login" className="flex items-center justify-center">
                        {plan.name === 'Enterprise' ? (
                          <>
                            <Shield className="w-5 h-5 mr-2" />
                            Contact Sales
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Start Free Trial
                          </>
                        )}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </motion.div>

                  {/* Money-back guarantee for highlighted plan */}
                  {plan.highlighted && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      viewport={{ once: true }}
                      className="text-center mt-4"
                    >
                      <span className="text-sm text-gray-600">
                        ✨ 30-day money-back guarantee
                      </span>
                    </motion.div>
                  )}
                </CardContent>

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need a custom solution?
            </h3>
            <p className="text-gray-600 mb-6">
              Contact our sales team to discuss enterprise pricing and custom features tailored to your organization.
            </p>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-gray-300 hover:bg-gray-50"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Talk to Sales
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
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
}

export default PricingSection;