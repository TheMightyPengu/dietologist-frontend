"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, sectionId: string) => {
    e.preventDefault();
    if (window.location.pathname !== "/") {
      router.push("/");
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }
    closeMenu();
  };

  const handleNewsletterClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    const scrollAndHighlight = () => {
      const newsletterSection = document.getElementById("newsletter");
      if (newsletterSection) {
        newsletterSection.scrollIntoView({ behavior: "smooth" });

        // Add animation class
        newsletterSection.classList.add("highlight");
        
        // Remove animation class after 2 seconds
        setTimeout(() => {
          newsletterSection.classList.remove("highlight");
        }, 2000);
      }
    };

    if (window.location.pathname !== "/") {
      router.push("/");
      setTimeout(scrollAndHighlight, 500);
    } else {
      scrollAndHighlight();
    }

    closeMenu();
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full px-6 py-4 z-50 backdrop-blur-lg transition-all ${
        isScrolled ? "bg-white/70 shadow-md" : "bg-white/40"
      }`}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-600">Biki Dietologist</h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          {/* Home Dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              setHomeDropdownOpen(true);
            }}
            onMouseLeave={() => {
              timeoutRef.current = setTimeout(() => {
                setHomeDropdownOpen(false);
              }, 500);
            }}
          >
            <button className="hover:text-green-500 flex items-center gap-1">
              Home <ChevronDown size={16} />
            </button>
            {homeDropdownOpen && (
              <div className="absolute left-0 mt-2 bg-white/50 backdrop-blur-lg shadow-md rounded-md py-2 w-40 z-50">
                <Link href="/" className="block px-4 py-2 hover:bg-white/40 rounded-md">About Us</Link>
                <a href="/" onClick={(e) => handleScrollToSection(e, "contact")} className="block px-4 py-2 hover:bg-white/40 rounded-md">Contact Us</a>
                <a href="/" onClick={handleNewsletterClick} className="block px-4 py-2 hover:bg-white/40 rounded-md">Newsletter</a>
              </div>
            )}
          </div>
          <Link href="/recipes" className="hover:text-green-500">Recipes</Link>
          <Link href="/ebooks" className="hover:text-green-500">Ebooks</Link>
          <Link href="/services" className="hover:text-green-500">Services</Link>
          <Link href="/articles" className="hover:text-green-500">Articles</Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button onClick={toggleMenu} className="md:hidden text-gray-700">
          {isOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white/90 shadow-lg flex flex-col items-center py-4 space-y-4 z-50">
          <Link href="/" onClick={closeMenu}>About Us</Link>
          <a href="/" onClick={(e) => handleScrollToSection(e, "contact")}>Contact Us</a>
          <a href="/" onClick={handleNewsletterClick}>Newsletter</a>
          <Link href="/recipes" onClick={closeMenu}>Recipes</Link>
          <Link href="/ebooks" onClick={closeMenu}>Ebooks</Link>
          <Link href="/services" onClick={closeMenu}>Services</Link>
          <Link href="/articles" onClick={closeMenu}>Articles</Link>
        </div>
      )}
    </nav>
  );
}