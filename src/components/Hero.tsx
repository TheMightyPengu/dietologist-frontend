"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <motion.section 
      className="hero-section relative flex flex-col items-center justify-center h-[80vh] text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="bg-green-600/80 p-10 rounded-2xl shadow-lg">
        <h1 className="text-5xl text-white font-extrabold drop-shadow-lg">
          Nourish Your Body, Transform Your Life
        </h1>
        <p className="text-xl text-gray-100 mt-4">
          Discover easy, delicious, and nutritious meal plans tailored for you.
        </p>
        <button className="mt-6 px-6 py-3 bg-white text-green-600 font-bold rounded-lg transition duration-300 hover:bg-gray-100 hover:shadow-md">
          Explore Recipes
        </button>
      </div>
    </motion.section>
  );
}