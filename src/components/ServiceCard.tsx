"use client";

import { motion } from "framer-motion";

interface ServiceCardProps {
  category: string;
  duration: string;
  description: string;
  price: string;
  interval: string;
}

export default function ServiceCard({ category, duration, description, price, interval }: ServiceCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="bg-white shadow-lg rounded-xl p-6 border border-gray-200"
    >
      <h3 className="text-2xl font-semibold text-gray-800">{category}</h3>
      <p className="text-gray-600 mt-2">{description}</p>
      <div className="mt-4 text-gray-700">
        <p><strong>Duration:</strong> {duration}</p>
        <p><strong>Price:</strong> {price}</p>
        <p><strong>Interval:</strong> {interval}</p>
      </div>
    </motion.div>
  );
}