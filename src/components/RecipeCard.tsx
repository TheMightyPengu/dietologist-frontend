"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface RecipeCardProps {
  title: string;
  image: string;
}

export default function RecipeCard({ title, image }: RecipeCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="bg-white shadow-lg rounded-2xl overflow-hidden"
    >
      <img src={image} alt={title} width={400} height={300} className="w-full h-48 object-cover" />
      <h3 className="text-lg font-semibold p-4 text-gray-800">{title}</h3>
    </motion.div>
  );
}