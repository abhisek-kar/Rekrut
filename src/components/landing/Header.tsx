"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import Link from "next/link";
import { Briefcase, Menu, X, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "../atoms/logo";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigationItems = [
    { href: "#features", label: "Features" },
    { href: "#benefits", label: "Benefits" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#pricing", label: "Pricing" },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to section
  const handleSmoothScroll = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 text-center text-sm">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span className="font-medium">🎉 New Feature: AI-Powered Candidate Matching is now live!</span>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-6 px-2">
            Learn More
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </motion.div>
      </div>

      {/* Main Header */}
      <motion.header 
        className={`relative z-40 transition-all duration-300 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200" 
            : "bg-white/80 backdrop-blur-sm"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Enhanced Logo */}
            <motion.div 
              className="flex items-center group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                  <Logo showText={false}/>
              <div className="ml-3">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Rekrut ATS
                </h1>
                <p className="text-xs text-gray-500 font-medium">H!re Smarter</p>
              </div>
            </motion.div>

            {/* Enhanced Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item, index) => (
                <motion.button
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleSmoothScroll(item.href)}
                  className="group relative px-4 py-2 rounded-xl text-gray-600 hover:text-gray-900 transition-all duration-300 hover:bg-gray-50"
                >
                  <span className="font-medium">{item.label}</span>
                  {/* Underline effect */}
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-8 group-hover:left-1/2 group-hover:-translate-x-1/2 transition-all duration-300"></div>
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </motion.button>
              ))}
            </nav>

            {/* Enhanced Desktop CTA */}
            <motion.div 
              className="hidden md:flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button 
                variant="ghost" 
                className="font-medium hover:bg-gray-50 transition-all duration-300"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                asChild
              >
                <Link href="/login" className="flex items-center">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </motion.div>

            {/* Enhanced Mobile Menu Button */}
            <motion.div 
              className="lg:hidden"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative w-12 h-12 rounded-xl hover:bg-gray-50 transition-all duration-300"
                aria-label="Toggle mobile menu"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg"
            >
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <motion.div 
                  className="flex flex-col space-y-1"
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {navigationItems.map((item, index) => (
                    <motion.button
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => handleSmoothScroll(item.href)}
                      className="group flex items-center justify-between p-4 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 text-left"
                    >
                      <span className="font-medium text-lg">{item.label}</span>
                      <ChevronDown className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>
                  ))}
                  
                  {/* Mobile CTA Buttons */}
                  <motion.div 
                    className="flex flex-col space-y-3 pt-6 border-t border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full font-medium border-2 hover:bg-gray-50"
                      asChild
                    >
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button 
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg group"
                      asChild
                    >
                      <Link href="/login" className="flex items-center justify-center">
                        Get Started Free
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </Button>
                    
                    {/* Mobile-only features */}
                    <div className="text-center pt-4">
                      <Badge className="bg-green-100 text-green-800 px-3 py-1">
                        <Sparkles className="w-3 h-3 mr-1" />
                        14-day free trial
                      </Badge>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Header;