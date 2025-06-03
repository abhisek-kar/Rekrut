import { Briefcase, Mail, Phone, MapPin, ExternalLink, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/shadcn-ui/button'
import Link from 'next/link'

function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Security", href: "/security" },
        { name: "API", href: "/api" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Documentation", href: "/docs" },
        { name: "Contact Us", href: "/contact" },
        { name: "Status", href: "/status" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "GDPR", href: "/gdpr" }
      ]
    }
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100/[0.02] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.1))]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div 
                className="flex items-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300">
                    <Briefcase className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300 -z-10"></div>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Rekrut ATS
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">Hire Smarter, Grow Faster</p>
                </div>
              </motion.div>

              <motion.p 
                className="text-gray-300 leading-relaxed max-w-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                Transform your hiring process with our modern applicant tracking system. 
                Built for recruitment agencies and growing companies.
              </motion.p>

              {/* Contact Info */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group">
                  <Mail className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                  <span className="text-sm">support@rekrut-ats.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group">
                  <Phone className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group">
                  <MapPin className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                  <span className="text-sm">San Francisco, CA</span>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <Link href="/login" className="flex items-center">
                    Start Free Trial
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Footer Links */}
            <div className="lg:col-span-3">
              <div className="grid md:grid-cols-3 gap-8">
                {footerLinks.map((section, index) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    viewport={{ once: true }}
                  >
                    <h4 className="font-semibold text-white mb-6 text-lg">{section.title}</h4>
                    <ul className="space-y-3">
                      {section.links.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium hover:translate-x-1 transform transition-transform inline-block"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          className="border-t border-gray-700 py-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                © {currentYear} Rekrut ATS. All rights reserved.
              </p>
              
              {/* Codekart Attribution */}
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <span>A product by</span>
                <a 
                  href="https://codekart.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 flex items-center group"
                >
                  Codekart Solutions Pvt Ltd
                  <ExternalLink className="w-3 h-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </a>
              </div>
            </div>

            {/* Made with love */}
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 animate-pulse" fill="currentColor" />
              <span>for better hiring</span>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(148 163 184 / 0.05)'%3e%3cpath d='m0 .5h32m-32 32v-32'/%3e%3c/svg%3e");
        }
      `}</style>
    </footer>
  )
}

export default Footer