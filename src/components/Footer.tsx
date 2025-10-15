"use client";

import Link from "next/link";
import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-800 py-10 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        
        {/* Newsletter */}
        <div>
          <h3 className="font-bold text-lg">Subscribe to our newsletter</h3>
          <p className="text-gray-600">Get nutrition tips and healthy recipes delivered to your inbox.</p>
          <div className="mt-4 flex items-center">
            <input type="email" placeholder="Enter your email" className="border p-2 rounded-l w-full" />
            <button className="bg-green-500 text-white px-4 py-2 rounded-r hover:bg-green-600">
              Subscribe
            </button>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h3 className="font-bold text-lg">Explore More</h3>
          <ul className="text-gray-600 space-y-2">
            <li><Link href="/recipes" className="hover:text-green-500">Recipes</Link></li>
            <li><Link href="/articles" className="hover:text-green-500">Articles</Link></li>
            <li><Link href="/ebooks" className="hover:text-green-500">Ebooks</Link></li>
            <li><Link href="/services" className="hover:text-green-500">Services</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="font-bold text-lg">Follow us</h3>
          <div className="flex justify-center gap-4 mt-4 text-gray-700">
            <a href="https://instagram.com" className="hover:text-green-500">
              <FaInstagram size={24} />
            </a>
            <a href="https://facebook.com" className="hover:text-green-500">
              <FaFacebook size={24} />
            </a>
            <a href="https://twitter.com" className="hover:text-green-500">
              <FaTwitter size={24} />
            </a>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-500 mt-8 text-sm">
        © 2025 Biki Dietologist. All rights reserved.
      </div>
    </footer>
  );
}