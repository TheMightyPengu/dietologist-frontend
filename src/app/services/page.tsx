"use client";
console.log("Rendering ServiceCard Component");

import ServiceCard from "@/components/ServiceCard";

const services = [
  { category: "Group Therapy", duration: "1 Hour", price: "€50", interval: "Weekly", description: "Join a guided group session to improve your nutrition habits." },
  { category: "One-on-One Coaching", duration: "45 mins", price: "€70", interval: "Bi-Weekly", description: "Personalized coaching tailored to your needs." }
];

export default function Services() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-center">Our Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {services.map((service, index) => (
          <ServiceCard key={index} {...service} />
        ))}
      </div>
    </div>
  );
}