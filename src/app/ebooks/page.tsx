"use client";



console.log("Rendering Ebooks Component");

export default function Ebooks() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-center">Ebooks Store</h1>
      <p className="text-lg text-gray-700 text-center mt-4">
        Browse and purchase our exclusive nutrition ebooks.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold">Healthy Eating Guide</h3>
          <p className="text-gray-600 mt-2">A step-by-step guide to a balanced diet.</p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">Buy Now</button>
        </div>
      </div>
    </div>
  );
}