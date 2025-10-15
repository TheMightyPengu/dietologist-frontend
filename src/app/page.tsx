"use client";

import Image from "next/image";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center h-[80vh] text-center bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-background.jpg')" }}>
        <div className="bg-black/60 p-8 rounded-xl shadow-lg">
          <h1 className="text-5xl text-white font-extrabold drop-shadow-lg">
            Welcome to Biki Dietologist
          </h1>
          <p className="text-xl text-gray-300 mt-4">
            Personalized nutrition guidance for a healthier life.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 px-6 text-center">
        <h2 className="text-3xl font-bold text-green-600">Meet Our Dietologist</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-8">
          <Image src="/images/dietologist.jpg" alt="Dietologist" width={400} height={400} className="rounded-lg shadow-lg" />
          <p className="text-lg text-gray-700 max-w-lg">
            Our expert dietologist provides tailored nutrition plans to help you achieve your health goals. 
            Whether you're looking to lose weight, improve digestion, or build muscle, we're here to guide you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 px-6 text-center bg-gray-100">
        <h2 className="text-3xl font-bold text-gray-800">Contact Us</h2>
        <p className="text-gray-600">Have any questions? Reach out to us.</p>
        <div className="flex flex-col items-center mt-4">
          <input type="email" placeholder="Your Email" className="border p-3 rounded w-2/3 md:w-1/3 mb-3" />
          <textarea placeholder="Your Message" className="border p-3 rounded w-2/3 md:w-1/3 h-32"></textarea>
          <button className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Send Message
          </button>
        </div>
      </section>

    </div>
  );
}