"use client";

export default function NewsletterForm() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-lg mx-auto border border-green-300">
      <h2 className="text-2xl font-bold text-green-600 text-center">Join Our Newsletter</h2>
      <p className="text-md text-gray-700 text-center mt-2">
        Get delicious recipes, nutrition tips, and exclusive updates straight to your inbox!
      </p>

      <input 
        type="email" 
        placeholder="Enter your email" 
        className="border border-green-400 p-3 rounded-lg w-full mt-4 focus:ring-2 focus:ring-green-500 focus:outline-none"
      />

      <button className="mt-6 w-full px-4 py-3 bg-green-500 text-white font-bold rounded-lg transition duration-300 hover:bg-green-600 hover:shadow-md">
        Subscribe Now
      </button>
    </div>
  );
}