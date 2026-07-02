"use client";

import { FaEnvelope, FaFacebookF, FaInstagram } from "react-icons/fa";
import { SiZalo } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* TOP */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          {/* BRAND */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              My Store
            </h2>

            <p className="text-sm text-zinc-500">
              Simple commerce experience built with Next.js
            </p>
          </div>

          {/* SOCIAL */}
          <div className="flex items-center gap-3">
            <p className="text-sm text-zinc-500">
              Thông tin liên hệ:
            </p>

            {/* <a
              href="mailto:nhat200901@gmail.com"
              aria-label="Email"
              className="cursor-pointer rounded-full border border-zinc-200 p-3 text-zinc-600 transition hover:border-black hover:text-black"
            >
              <FaEnvelope size={18} />
            </a>


            <a
              href="https://www.facebook.com/znmarlik"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="cursor-pointer rounded-full border border-zinc-200 p-3 text-zinc-600 transition hover:border-black hover:text-black"
            >
              <FaFacebookF size={18} />
            </a>

            <a
              href="https://www.instagram.com/znmarlikbb/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="cursor-pointer rounded-full border border-zinc-200 p-3 text-zinc-600 transition hover:border-black hover:text-black"
            >
              <FaInstagram size={18} />
            </a> */}

            <a
              href="https://zalo.me/0985627061"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Zalo"
              className="cursor-pointer rounded-full border border-zinc-200 p-3 text-zinc-600 transition hover:border-black hover:text-black"
            >
              <SiZalo size={18} />
            </a>

          </div>

        </div>

        {/* DIVIDER */}
        <div className="my-6 h-px bg-zinc-100" />

        {/* BOTTOM */}
        <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} My Store. All rights reserved.
          </p>

          <p className="text-xs text-zinc-400">
            Built with Next.js + Firebase
          </p>

        </div>

      </div>
    </footer>
  );
}