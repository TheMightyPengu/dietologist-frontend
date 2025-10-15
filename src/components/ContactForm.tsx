"use client";

export default function ContactForm() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-lg mx-auto border border-green-300">
      <h2 className="text-2xl font-bold text-green-600 text-center">Get in Touch</h2>
      <p className="text-md text-gray-700 text-center mt-2">
        Have a question? Send us a message and we’ll get back to you soon!
      </p>

      <div className="mt-6">
        <label className="block text-gray-700 font-semibold">Your Name</label>
        <input 
          type="text" 
          placeholder="John Doe" 
          className="border border-green-400 p-3 rounded-lg w-full mt-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      <div className="mt-4">
        <label className="block text-gray-700 font-semibold">Your Email</label>
        <input 
          type="email" 
          placeholder="johndoe@example.com" 
          className="border border-green-400 p-3 rounded-lg w-full mt-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      <div className="mt-4">
        <label className="block text-gray-700 font-semibold">Your Message</label>
        <textarea 
          placeholder="Write your message here..." 
          className="border border-green-400 p-3 rounded-lg w-full mt-2 h-32 resize-none focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      <button className="mt-6 w-full px-4 py-3 bg-green-500 text-white font-bold rounded-lg transition duration-300 hover:bg-green-600 hover:shadow-md">
        Send Message
      </button>
    </div>
  );
}