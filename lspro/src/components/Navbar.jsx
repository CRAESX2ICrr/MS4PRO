'use client'

import React from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="bg-grey border-b-4 border-orange-500 px-10 py-0 flex items-center justify-between shadow-md">
      {/* Logo Section */}
      <div className="flex items-center space-x-3">
        <Image
          src="/logo.png"
          alt="CarRental Logo"
          width={150}
          height={100}
          className="rounded-full object-cover"
        />
        <Link href="/">
          <span className="text-2xl font-semibold tracking-wide text-white hover:text-orange-400 transition cursor-pointer">
            CarGO-A
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <div className="flex space-x-10 text-lg font-medium tracking-tight text-white">
        <Link href="/rental">
          <span className="hover:text-orange-400 transition duration-200 cursor-pointer">
            Rental
          </span>
        </Link>
        <Link href="/cart">
          <span className="hover:text-orange-400 transition duration-200 cursor-pointer">
            Cart
          </span>
        </Link>
        <Link href="/account">
          <span className="hover:text-orange-400 transition duration-200 cursor-pointer">
            My Account
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
