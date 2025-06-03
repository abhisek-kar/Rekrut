"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";

const stats = [
  { number: 50000, suffix: "+", label: "Applications Processed" },
  { number: 500, suffix: "+", label: "Companies Trust Us" },
  { number: 95, suffix: "%", label: "Customer Satisfaction" },
  { number: 60, suffix: "%", label: "Faster Hiring Process" },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                <CountUp
                  end={stat.number}
                  duration={1.5}
                  separator=","
                  decimals={stat.suffix === "%" ? 1 : 0}
                />
                {stat.suffix}
              </div>
              <div className="text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;