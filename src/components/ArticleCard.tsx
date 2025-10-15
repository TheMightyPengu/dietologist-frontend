"use client";

import { motion } from "framer-motion";

interface ArticleCardProps {
  title: string;
  excerpt: string;
}

export default function ArticleCard({ title, excerpt }: ArticleCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="bg-white shadow-lg rounded-xl p-6 border border-gray-200"
    >
      <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-600 mt-2">{excerpt}</p>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">Read More</button>
    </motion.div>
  );
}