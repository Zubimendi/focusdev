"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="block w-full text-left px-6 py-2 text-red-600 hover:bg-red-50"
    >
      Logout
    </button>
  );
}
