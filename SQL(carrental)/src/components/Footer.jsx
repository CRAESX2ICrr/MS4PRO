'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-grey border-t-4 border-orange-500 px-10 py-6 shadow-md">
      <div className="flex flex-col items-center justify-center h-24 space-y-2">
        {/* Centered Logo */}
        <Image
          src="/logo.png"
          alt="CarRental Logo"
          width={100}
          height={60}
          className="object-contain"
        />

        {/* Footer Links */}
        <div className="flex space-x-8 text-sm mb-12 font-medium tracking-tight text-white">
          <Link href="/faq">
            <span className="hover:text-orange-400 transition duration-200 cursor-pointer">
              FAQ
            </span>
          </Link>
          <Link href="/contact">
            <span className="hover:text-orange-400 transition duration-200 cursor-pointer">
              Contact
            </span>
          </Link>
          <span className="text-gray-400">© 2025 CarRental</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
