"use client";
console.log("Rendering articles Component");

import ArticleCard from "@/components/ArticleCard";

export default function Articles() {
  return (
    
    <div className="p-8">
      <h1 className="text-4xl font-bold text-center">Latest Articles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <ArticleCard title="The Benefits of a Plant-Based Diet" excerpt="Discover the health benefits of eating more plant-based foods." />
        <ArticleCard title="How to Meal Prep Like a Pro" excerpt="Save time and eat healthier with these meal prepping tips." />
      </div>
    </div>
  );
}