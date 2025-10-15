"use client";
console.log("Rendering RecipeCard Component");

import RecipeCard from "@/components/RecipeCard";

export default function Recipes() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-center">Recipes</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <RecipeCard title="Avocado Toast" image="/images/avocado-toast.jpg" />
        <RecipeCard title="Green Smoothie" image="/images/green-smoothie.jpg" />
        <RecipeCard title="Chickpea Salad" image="/images/chickpea-salad.jpg" />
      </div>
    </div>
  );
}